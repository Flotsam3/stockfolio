import { NextResponse, NextRequest } from "next/server";
import { verifyToken } from "@/libs/auth";
import { connectDB } from "@/libs/connectDB";
import User from "@/models/User";

export async function GET(req: NextRequest) {
  try {
    const token = req.cookies.get("token")?.value || "";
    if (!token) return NextResponse.json({ user: null }, { status: 200 });

    const payload = verifyToken(token);
    if (!payload?.id) return NextResponse.json({ user: null }, { status: 200 });

    await connectDB();
    const user = await User.findById(payload.id).select("name email");
    return NextResponse.json({ user });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ user: null }, { status: 200 });
  }
}
