import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { connectDB } from "@/libs/connectDB";
import User from "@/models/User";
import bcrypt from "bcrypt";
import { getServerSession } from "next-auth";

async function getAuthenticatedUserId() {
   const session = await getServerSession(authOptions);

   if (!session || !session.user?.id) {
      return null;
   }

   return session.user.id;
}

type MongoDuplicateError = {
   code?: number;
};

export async function PATCH(request: Request) {
   try {
      await connectDB();

      const userId = await getAuthenticatedUserId();
      if (!userId) {
         return Response.json({ error: "Not authenticated" }, { status: 401 });
      }

      const { email, currentPassword } = await request.json();
      const normalizedEmail = String(email || "").trim().toLowerCase();

      if (!normalizedEmail) {
         return Response.json({ error: "Email is required" }, { status: 400 });
      }

      const user = await User.findById(userId);
      if (!user) {
         return Response.json({ error: "User not found" }, { status: 404 });
      }

      if (!user.password) {
         return Response.json({ error: "Email changes are only available for email/password accounts" }, { status: 400 });
      }

      if (!currentPassword) {
         return Response.json({ error: "Current password is required" }, { status: 400 });
      }

      const isValidPassword = await bcrypt.compare(currentPassword, user.password);
      if (!isValidPassword) {
         return Response.json({ error: "Current password is incorrect" }, { status: 403 });
      }

      const existingUser = await User.findOne({ email: normalizedEmail, _id: { $ne: userId } });
      if (existingUser) {
         return Response.json({ error: "Email is already in use" }, { status: 409 });
      }

      user.email = normalizedEmail;
      await user.save({ validateModifiedOnly: true });

      return Response.json({ message: "Email updated successfully", email: user.email }, { status: 200 });
   } catch (error: unknown) {
      console.log(error);

      if ((error as MongoDuplicateError)?.code === 11000) {
         return Response.json({ error: "Email is already in use" }, { status: 409 });
      }

      return Response.json({ msg: "Server error!" }, { status: 500 });
   }
}
