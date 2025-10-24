// app/(public)/signup/page.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import Link from "next/link";
import { TrendingUp, Mail, Lock, User, ArrowRight, Eye, EyeOff, AlertCircle } from "lucide-react";

export default function RegisterPage() {
   const router = useRouter();
   const [name, setName] = useState("");
   const [email, setEmail] = useState("");
   const [password, setPassword] = useState("");
   const [confirmPassword, setConfirmPassword] = useState("");
   const [msg, setMsg] = useState("");
   const [showPassword, setShowPassword] = useState(false);
   const [showConfirmPassword, setShowConfirmPassword] = useState(false);
   const [acceptTerms, setAcceptTerms] = useState(false);
   const [isLoading, setIsLoading] = useState(false);

   async function submit(e: React.FormEvent) {
      e.preventDefault();
      setMsg("");

      // Client-side validation
      if (password !== confirmPassword) {
         setMsg("Passwords do not match");
         return;
      }

      if (!acceptTerms) {
         setMsg("You must accept the terms and conditions");
         return;
      }

      setIsLoading(true);

      try {
         const res = await fetch(`/api/auth/register`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name, email, password }),
         });
         const data = await res.json();
         if (res.ok) {
            setMsg("Registered successfully");
            router.push("/dashboard"); // Redirect to dashboard after successful registration
         } else {
            setMsg(data.error || "Registration failed");
         }
      } catch (error) {
         setMsg(String(error));
      } finally {
         setIsLoading(false);
      }
   }

   // In your signup page, add these handlers:
   const handleGoogleSignUp = async () => {
      setIsLoading(true);
      await signIn("google", { callbackUrl: "/dashboard" });
   };

   const handleGitHubSignUp = async () => {
      setIsLoading(true);
      await signIn("github", { callbackUrl: "/dashboard" });
   };

   // And update the buttons to call these functions

   return (
      <div className="min-h-screen bg-[#161616] text-white">
         {/* Navigation */}
         <nav className="bg-[#33313c] border-b border-[#212224]">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
               <div className="flex justify-between items-center h-16">
                  <Link href="/" className="flex items-center gap-2">
                     <TrendingUp className="w-8 h-8 text-[#facc15]" />
                     <span className="text-2xl font-bold">Stockfolio</span>
                  </Link>
                  <div className="flex gap-4 items-center">
                     <span className="text-sm text-gray-400">Already have an account?</span>
                     <Link
                        href="/auth/login"
                        className="px-6 py-2 bg-[#facc15] text-[#33313c] rounded-lg text-sm font-semibold hover:bg-[#fcd34d] transition-all hover:scale-105"
                     >
                        Log In
                     </Link>
                  </div>
               </div>
            </div>
         </nav>

         {/* Sign Up Form */}
         <div className="flex items-center justify-center px-4 sm:px-6 lg:px-8 py-12">
            <div className="w-full max-w-md">
               {/* Header */}
               <div className="text-center mb-8">
                  <h1 className="text-4xl font-bold mb-2">Create Account</h1>
                  <p className="text-gray-400">Start making smarter investment decisions</p>
               </div>

               {/* Form Card */}
               <div className="bg-[#212224] rounded-xl border border-[#33313c] p-8 shadow-2xl">
                  <form onSubmit={submit} className="space-y-5">
                     {/* Name Field */}
                     <div>
                        <label htmlFor="name" className="block text-sm font-medium mb-2">
                           Full Name
                        </label>
                        <div className="relative">
                           <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                              <User className="h-5 w-5 text-gray-500" />
                           </div>
                           <input
                              id="name"
                              type="text"
                              required
                              value={name}
                              onChange={(e) => setName(e.target.value)}
                              className="block w-full pl-10 pr-3 py-3 bg-[#161616] border border-[#33313c] rounded-lg focus:outline-none focus:border-[#facc15] transition-colors text-white placeholder-gray-500"
                              placeholder="John Doe"
                           />
                        </div>
                     </div>

                     {/* Email Field */}
                     <div>
                        <label htmlFor="email" className="block text-sm font-medium mb-2">
                           Email Address
                        </label>
                        <div className="relative">
                           <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                              <Mail className="h-5 w-5 text-gray-500" />
                           </div>
                           <input
                              id="email"
                              type="email"
                              required
                              value={email}
                              onChange={(e) => setEmail(e.target.value)}
                              className="block w-full pl-10 pr-3 py-3 bg-[#161616] border border-[#33313c] rounded-lg focus:outline-none focus:border-[#facc15] transition-colors text-white placeholder-gray-500"
                              placeholder="you@example.com"
                           />
                        </div>
                     </div>

                     {/* Password Field */}
                     <div>
                        <label htmlFor="password" className="block text-sm font-medium mb-2">
                           Password
                        </label>
                        <div className="relative">
                           <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                              <Lock className="h-5 w-5 text-gray-500" />
                           </div>
                           <input
                              id="password"
                              type={showPassword ? "text" : "password"}
                              required
                              value={password}
                              onChange={(e) => setPassword(e.target.value)}
                              className="block w-full pl-10 pr-10 py-3 bg-[#161616] border border-[#33313c] rounded-lg focus:outline-none focus:border-[#facc15] transition-colors text-white placeholder-gray-500"
                              placeholder="••••••••"
                           />
                           <button
                              type="button"
                              onClick={() => setShowPassword(!showPassword)}
                              className="absolute inset-y-0 right-0 pr-3 flex items-center"
                           >
                              {showPassword ? (
                                 <EyeOff className="h-5 w-5 text-gray-500 hover:text-gray-300 transition-colors" />
                              ) : (
                                 <Eye className="h-5 w-5 text-gray-500 hover:text-gray-300 transition-colors" />
                              )}
                           </button>
                        </div>
                     </div>

                     {/* Confirm Password Field */}
                     <div>
                        <label htmlFor="confirmPassword" className="block text-sm font-medium mb-2">
                           Confirm Password
                        </label>
                        <div className="relative">
                           <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                              <Lock className="h-5 w-5 text-gray-500" />
                           </div>
                           <input
                              id="confirmPassword"
                              type={showConfirmPassword ? "text" : "password"}
                              required
                              value={confirmPassword}
                              onChange={(e) => setConfirmPassword(e.target.value)}
                              className="block w-full pl-10 pr-10 py-3 bg-[#161616] border border-[#33313c] rounded-lg focus:outline-none focus:border-[#facc15] transition-colors text-white placeholder-gray-500"
                              placeholder="••••••••"
                           />
                           <button
                              type="button"
                              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                              className="absolute inset-y-0 right-0 pr-3 flex items-center"
                           >
                              {showConfirmPassword ? (
                                 <EyeOff className="h-5 w-5 text-gray-500 hover:text-gray-300 transition-colors" />
                              ) : (
                                 <Eye className="h-5 w-5 text-gray-500 hover:text-gray-300 transition-colors" />
                              )}
                           </button>
                        </div>
                     </div>

                     {/* Terms & Conditions */}
                     <div>
                        <div className="flex items-start">
                           <input
                              id="terms"
                              type="checkbox"
                              checked={acceptTerms}
                              onChange={(e) => setAcceptTerms(e.target.checked)}
                              className="h-4 w-4 mt-1 bg-[#161616] border-[#33313c] rounded text-[#facc15] focus:ring-[#facc15] focus:ring-offset-0"
                           />
                           <label htmlFor="terms" className="ml-2 block text-sm text-gray-400">
                              I agree to the{" "}
                              <Link href="/terms" className="text-[#facc15] hover:text-[#fcd34d]">
                                 Terms of Service
                              </Link>{" "}
                              and{" "}
                              <Link href="/privacy" className="text-[#facc15] hover:text-[#fcd34d]">
                                 Privacy Policy
                              </Link>
                           </label>
                        </div>
                     </div>

                     {/* Error/Success Message */}
                     {msg && (
                        <div
                           className={`flex items-center gap-2 p-3 rounded-lg ${
                              msg.includes("successfully")
                                 ? "bg-green-500/10 border border-green-500/20"
                                 : "bg-red-500/10 border border-red-500/20"
                           }`}
                        >
                           <AlertCircle
                              className={`h-5 w-5 ${
                                 msg.includes("successfully") ? "text-green-500" : "text-red-500"
                              }`}
                           />
                           <p
                              className={`text-sm ${
                                 msg.includes("successfully") ? "text-green-500" : "text-red-500"
                              }`}
                           >
                              {msg}
                           </p>
                        </div>
                     )}

                     {/* Submit Button */}
                     <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full flex items-center justify-center gap-2 px-8 py-3 bg-[#facc15] text-[#33313c] rounded-lg font-semibold hover:bg-[#fcd34d] transition-all hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 group"
                     >
                        {isLoading ? (
                           <div className="w-5 h-5 border-2 border-[#33313c] border-t-transparent rounded-full animate-spin" />
                        ) : (
                           <>
                              Create Account
                              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                           </>
                        )}
                     </button>
                  </form>

                  {/* Divider */}
                  <div className="relative my-6">
                     <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-[#33313c]"></div>
                     </div>
                     <div className="relative flex justify-center text-sm">
                        <span className="px-2 bg-[#212224] text-gray-500">Or sign up with</span>
                     </div>
                  </div>

                  {/* Social Sign Up */}
                  <div className="grid grid-cols-2 gap-4">
                     <button
                        type="button"
                        className="flex items-center justify-center gap-2 px-4 py-3 bg-[#161616] border border-[#33313c] rounded-lg hover:border-[#facc15] transition-all hover:scale-105"
                        onClick={handleGoogleSignUp}
                     >
                        <svg className="w-5 h-5" viewBox="0 0 24 24">
                           <path
                              fill="currentColor"
                              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                           />
                           <path
                              fill="currentColor"
                              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                           />
                           <path
                              fill="currentColor"
                              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                           />
                           <path
                              fill="currentColor"
                              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                           />
                        </svg>
                        <span className="text-sm font-medium">Google</span>
                     </button>
                     <button
                        type="button"
                        className="flex items-center justify-center gap-2 px-4 py-3 bg-[#161616] border border-[#33313c] rounded-lg hover:border-[#facc15] transition-all hover:scale-105"
                        onClick={handleGitHubSignUp}
                     >
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                           <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                        </svg>
                        <span className="text-sm font-medium">GitHub</span>
                     </button>
                  </div>
               </div>

               {/* Login Link */}
               <p className="mt-8 text-center text-sm text-gray-400">
                  Already have an account?{" "}
                  <Link
                     href="/auth/login"
                     className="text-[#facc15] hover:text-[#fcd34d] font-medium transition-colors"
                  >
                     Log in
                  </Link>
               </p>
            </div>
         </div>
      </div>
   );
}
