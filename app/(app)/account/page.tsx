"use client";

import React, { FormEvent, useEffect, useState } from "react";
import { signOut } from "next-auth/react";
import toast, { Toaster } from "react-hot-toast";

type AccountData = {
   id: string;
   name?: string;
   email: string;
   hasPassword: boolean;
   createdAt?: string;
};

export default function AccountPage() {
   const [account, setAccount] = useState<AccountData | null>(null);
   const [isLoading, setIsLoading] = useState(true);
   const [email, setEmail] = useState("");
   const [emailPassword, setEmailPassword] = useState("");
   const [currentPassword, setCurrentPassword] = useState("");
   const [newPassword, setNewPassword] = useState("");
   const [confirmPassword, setConfirmPassword] = useState("");
   const [deletePassword, setDeletePassword] = useState("");
   const [deleteConfirmation, setDeleteConfirmation] = useState("");
   const [isSubmitting, setIsSubmitting] = useState(false);

   useEffect(() => {
      async function loadAccount() {
         try {
            const response = await fetch("/api/account");
            const data = await response.json();

            if (!response.ok) {
               throw new Error(data.error || data.msg || "Could not load account data");
            }

            setAccount(data);
            setEmail(data.email || "");
         } catch (error: any) {
            toast.error(error.message || "Could not load account data");
         } finally {
            setIsLoading(false);
         }
      }

      loadAccount();
   }, []);

   async function handleEmailUpdate(event: FormEvent<HTMLFormElement>) {
      event.preventDefault();
      if (!account) return;

      try {
         setIsSubmitting(true);
         const response = await fetch("/api/account/email", {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, currentPassword: emailPassword }),
         });
         const data = await response.json();

         if (!response.ok) {
            throw new Error(data.error || data.msg || "Could not update email");
         }

         toast.success("Email updated. Please sign in again.");
         setTimeout(() => signOut({ callbackUrl: "/auth/login" }), 1200);
      } catch (error: any) {
         toast.error(error.message || "Could not update email");
      } finally {
         setIsSubmitting(false);
      }
   }

   async function handlePasswordUpdate(event: FormEvent<HTMLFormElement>) {
      event.preventDefault();

      if (newPassword !== confirmPassword) {
         return toast.error("Passwords do not match");
      }

      try {
         setIsSubmitting(true);
         const response = await fetch("/api/account/password", {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ currentPassword, newPassword }),
         });
         const data = await response.json();

         if (!response.ok) {
            throw new Error(data.error || data.msg || "Could not update password");
         }

         setCurrentPassword("");
         setNewPassword("");
         setConfirmPassword("");
         toast.success("Password updated");
      } catch (error: any) {
         toast.error(error.message || "Could not update password");
      } finally {
         setIsSubmitting(false);
      }
   }

   async function handleDeleteAccount(event: FormEvent<HTMLFormElement>) {
      event.preventDefault();

      if (deleteConfirmation !== "DELETE") {
         return toast.error("Type DELETE to confirm account deletion");
      }

      try {
         setIsSubmitting(true);
         const response = await fetch("/api/account", {
            method: "DELETE",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ currentPassword: deletePassword }),
         });
         const data = await response.json();

         if (!response.ok) {
            throw new Error(data.error || data.msg || "Could not delete account");
         }

         toast.success("Account deleted");
         setTimeout(() => signOut({ callbackUrl: "/auth/login" }), 800);
      } catch (error: any) {
         toast.error(error.message || "Could not delete account");
      } finally {
         setIsSubmitting(false);
      }
   }

   return (
      <div className="min-h-[calc(100vh-86px)] bg-neutral-300 px-4 py-24">
         <h1 className="mb-4 text-center text-3xl font-bold">Account</h1>

         <section className="mx-auto grid max-w-5xl gap-4 text-white md:grid-cols-2">
            <div className="rounded-sm bg-zinc-600 p-5 shadow-xl md:col-span-2">
               <h2 className="mb-4 text-center text-lg">Account Overview</h2>
               {isLoading ? (
                  <p className="text-center">Loading account data...</p>
               ) : account ? (
                  <div className="grid gap-3 sm:grid-cols-2">
                     <div>
                        <p className="text-sm text-neutral-300">Name</p>
                        <p className="font-bold">{account.name || "Not set"}</p>
                     </div>
                     <div>
                        <p className="text-sm text-neutral-300">Email</p>
                        <p className="font-bold">{account.email}</p>
                     </div>
                     <div>
                        <p className="text-sm text-neutral-300">Account Type</p>
                        <p className="font-bold">{account.hasPassword ? "Email and password" : "OAuth provider"}</p>
                     </div>
                     <div>
                        <p className="text-sm text-neutral-300">Created</p>
                        <p className="font-bold">{account.createdAt ? new Date(account.createdAt).toLocaleDateString() : "Not available"}</p>
                     </div>
                  </div>
               ) : (
                  <p className="text-center">No account data available.</p>
               )}
            </div>

            <form onSubmit={handleEmailUpdate} className="rounded-sm bg-zinc-600 p-5 shadow-xl">
               <h2 className="mb-4 text-center text-lg">Change Email</h2>
               {isLoading ? (
                  <p className="text-sm text-neutral-200">Loading...</p>
               ) : account?.hasPassword ? (
                  <>
                     <label className="mb-3 block text-sm">
                        New Email
                        <input className="mt-1 w-full rounded-sm px-3 py-2 text-gray-800 outline-none" type="email" value={email} onChange={(event) => setEmail(event.target.value)} required />
                     </label>
                     <label className="mb-4 block text-sm">
                        Current Password
                        <input className="mt-1 w-full rounded-sm px-3 py-2 text-gray-800 outline-none" type="password" value={emailPassword} onChange={(event) => setEmailPassword(event.target.value)} required />
                     </label>
                     <button disabled={isSubmitting || isLoading} className="rounded-md bg-green-700 px-4 py-2 text-white hover:bg-green-600 disabled:cursor-not-allowed disabled:opacity-60">
                        Update Email
                     </button>
                  </>
               ) : (
                  <p className="text-sm text-neutral-200">Your sign-in email is managed by your OAuth provider.</p>
               )}
            </form>

            <form onSubmit={handlePasswordUpdate} className="rounded-sm bg-zinc-600 p-5 shadow-xl">
               <h2 className="mb-4 text-center text-lg">Change Password</h2>
               {isLoading ? (
                  <p className="text-sm text-neutral-200">Loading...</p>
               ) : account?.hasPassword ? (
                  <>
                     <label className="mb-3 block text-sm">
                        Current Password
                        <input className="mt-1 w-full rounded-sm px-3 py-2 text-gray-800 outline-none" type="password" value={currentPassword} onChange={(event) => setCurrentPassword(event.target.value)} required />
                     </label>
                     <label className="mb-3 block text-sm">
                        New Password
                        <input className="mt-1 w-full rounded-sm px-3 py-2 text-gray-800 outline-none" type="password" minLength={8} value={newPassword} onChange={(event) => setNewPassword(event.target.value)} required />
                     </label>
                     <label className="mb-4 block text-sm">
                        Confirm Password
                        <input className="mt-1 w-full rounded-sm px-3 py-2 text-gray-800 outline-none" type="password" minLength={8} value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} required />
                     </label>
                     <button disabled={isSubmitting || isLoading} className="rounded-md bg-green-700 px-4 py-2 text-white hover:bg-green-600 disabled:cursor-not-allowed disabled:opacity-60">
                        Update Password
                     </button>
                  </>
               ) : (
                  <p className="text-sm text-neutral-200">Password changes are only available for email/password accounts.</p>
               )}
            </form>

            <form onSubmit={handleDeleteAccount} className="rounded-sm bg-zinc-700 p-5 shadow-xl md:col-span-2">
               <h2 className="mb-4 text-center text-lg">Danger Zone</h2>
               <p className="mb-4 text-sm text-neutral-200">Deleting your account removes your user profile, portfolios, watchlists, and saved company data. This cannot be undone.</p>
               {account?.hasPassword && (
                  <label className="mb-4 block text-sm">
                     Current Password
                     <input className="mt-1 w-full rounded-sm px-3 py-2 text-gray-800 outline-none" type="password" value={deletePassword} onChange={(event) => setDeletePassword(event.target.value)} required />
                  </label>
               )}
               <label className="mb-4 block text-sm">
                  Type DELETE to confirm
                  <input className="mt-1 w-full rounded-sm px-3 py-2 text-gray-800 outline-none" type="text" value={deleteConfirmation} onChange={(event) => setDeleteConfirmation(event.target.value)} />
               </label>
               <button disabled={isSubmitting || deleteConfirmation !== "DELETE"} className="rounded-md bg-red-700 px-4 py-2 text-white hover:bg-red-600 disabled:cursor-not-allowed disabled:opacity-60">
                  Delete Account
               </button>
            </form>
         </section>

         <Toaster />
      </div>
   );
}
