import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { connectDB } from "@/libs/connectDB";
import { fetchLatestEconomics } from "@/libs/economicsRefresh";
import EconomicsModel from "@/models/Economics";
import { getServerSession } from "next-auth";

const GLOBAL_SCOPE = "global";
const REFRESH_RETRY_INTERVAL_MS = 24 * 60 * 60 * 1000;
const REFRESH_LOCK_TIMEOUT_MS = 5 * 60 * 1000;

function isOlderThanOneMonth(date: Date) {
    const refreshCutoff = new Date();
    refreshCutoff.setUTCMonth(refreshCutoff.getUTCMonth() - 1);
    return date <= refreshCutoff;
}

function hasCompleteEconomicsData(economics: {
    inflation?: unknown[];
    cpi?: unknown[];
    unemployment?: unknown[];
    interest?: unknown[];
}) {
    return Boolean(
        economics.inflation?.length &&
        economics.cpi?.length &&
        economics.unemployment?.length &&
        economics.interest?.length
    );
}

export async function GET(){
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) {
            return Response.json({ error: "Not authenticated" }, { status: 401 });
        }

        await connectDB();

        let economics = await EconomicsModel.findOne().sort({ createdAt: 1 });

        if (economics) {
            await EconomicsModel.updateOne(
                { _id: economics._id, scope: { $exists: false } },
                { $set: { scope: GLOBAL_SCOPE } },
                { timestamps: false }
            );
        } else {
            economics = await EconomicsModel.findOneAndUpdate(
                { scope: GLOBAL_SCOPE },
                {
                    $setOnInsert: {
                        inflation: [],
                        cpi: [],
                        unemployment: [],
                        interest: [],
                    },
                },
                { new: true, upsert: true, setDefaultsOnInsert: true }
            );
        }

        const hasData = hasCompleteEconomicsData(economics);
        const needsRefresh = !hasData || !economics.updatedAt || isOlderThanOneMonth(economics.updatedAt);
        const retryCutoff = new Date(Date.now() - REFRESH_RETRY_INTERVAL_MS);
        const canRetry = !economics.lastRefreshAttemptAt || economics.lastRefreshAttemptAt <= retryCutoff;

        if (needsRefresh && canRetry) {
            const lockCutoff = new Date(Date.now() - REFRESH_LOCK_TIMEOUT_MS);
            const refreshStartedAt = new Date();
            const claimedRefresh = await EconomicsModel.findOneAndUpdate(
                {
                    _id: economics._id,
                    $and: [
                        {
                            $or: [
                                { refreshStartedAt: { $exists: false } },
                                { refreshStartedAt: null },
                                { refreshStartedAt: { $lte: lockCutoff } },
                            ],
                        },
                        {
                            $or: [
                                { lastRefreshAttemptAt: { $exists: false } },
                                { lastRefreshAttemptAt: null },
                                { lastRefreshAttemptAt: { $lte: retryCutoff } },
                            ],
                        },
                    ],
                },
                {
                    $set: {
                        refreshStartedAt,
                        lastRefreshAttemptAt: refreshStartedAt,
                    },
                },
                { new: true, timestamps: false }
            );

            if (claimedRefresh) {
                try {
                    const latestEconomics = await fetchLatestEconomics();

                    economics = await EconomicsModel.findByIdAndUpdate(
                        economics._id,
                        {
                            $set: latestEconomics,
                            $unset: { refreshStartedAt: "" },
                        },
                        { new: true, runValidators: true }
                    );
                } catch (refreshError) {
                    console.error("Could not refresh economics data:", refreshError);
                    await EconomicsModel.updateOne(
                        { _id: economics._id, refreshStartedAt },
                        { $unset: { refreshStartedAt: "" } },
                        { timestamps: false }
                    );
                }
            }
        }

        if (!hasCompleteEconomicsData(economics)) {
            return Response.json(
                { error: "Economics data is temporarily unavailable" },
                { status: 503 }
            );
        }

        return Response.json({ response: [economics] }, { status: 200 });
    } catch (error) {
        console.log(error);
        return Response.json({ msg: "Server error!" }, { status: 500 });
    }
}
