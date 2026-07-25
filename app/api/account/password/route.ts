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

export async function PATCH(request: Request) {
   try {
      await connectDB();

      const userId = await getAuthenticatedUserId();
      if (!userId) {
         return Response.json({ error: "Not authenticated" }, { status: 401 });
      }

      const { currentPassword, newPassword } = await request.json();

      if (!currentPassword || !newPassword) {
         return Response.json({ error: "Current and new password are required" }, { status: 400 });
      }

      if (newPassword.length < 8) {
         return Response.json({ error: "New password must be at least 8 characters" }, { status: 400 });
      }

      const user = await User.findById(userId);
      if (!user) {
         return Response.json({ error: "User not found" }, { status: 404 });
      }

      if (!user.password) {
         return Response.json({ error: "Password changes are only available for email/password accounts" }, { status: 400 });
      }

      const isValidPassword = await bcrypt.compare(currentPassword, user.password);
      if (!isValidPassword) {
         return Response.json({ error: "Current password is incorrect" }, { status: 403 });
      }

      user.password = await bcrypt.hash(newPassword, 12);
      await user.save();

      return Response.json({ message: "Password updated successfully" }, { status: 200 });
   } catch (error) {
      console.log(error);
      return Response.json({ msg: "Server error!" }, { status: 500 });
   }
}
