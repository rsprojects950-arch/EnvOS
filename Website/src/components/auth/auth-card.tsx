"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  User,
  ArrowLeft,
  CheckCircle2,
  ArrowRight,
  AlertCircle,
  RotateCw,
  Send,
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { supabase } from "@/lib/supabase";
import { validateEmail } from "@/lib/email-validator";

interface AuthCardProps {
  defaultMode?: "login" | "register";
}

export function AuthCard({ defaultMode = "login" }: AuthCardProps) {
  const [mode, setMode] = useState<"login" | "register">(defaultMode);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Verification sent state
  const [verificationSent, setVerificationSent] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);

  // Form states
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [rememberMe, setRememberMe] = useState(true);

  // Check URL query parameters for verified=true
  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      if (params.get("verified") === "true") {
        setSuccessMessage("Your email has been verified successfully! You can now sign in.");
        setMode("login");
      }
      if (params.get("error") === "disposable_email") {
        setErrorMessage("Access restricted: Disposable or temporary burner email addresses are not permitted on EnvOS.");
      }
      if (params.get("email")) {
        setEmail(params.get("email") || "");
      }
    }
  }, []);

  // Handle countdown for resend cooldown
  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => setResendCooldown((prev) => prev - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCooldown]);

  // 1. Google OAuth Flow
  const handleGoogleSignIn = async () => {
    try {
      setIsLoading(true);
      setErrorMessage(null);

      const redirectOrigin = typeof window !== "undefined" ? window.location.origin : "http://localhost:3000";
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${redirectOrigin}/auth/callback`,
        },
      });

      if (error) {
        setErrorMessage(error.message);
        setIsLoading(false);
      }
    } catch (err: any) {
      setErrorMessage(err.message || "Failed to initiate Google sign in.");
      setIsLoading(false);
    }
  };

  // 2. Form Submission (Login or Register)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    // Client-side anti-burner & syntax validation
    const validation = validateEmail(email);
    if (!validation.isValid) {
      setErrorMessage(validation.error || "Please enter a valid personal or company email address.");
      setIsLoading(false);
      return;
    }

    const normalizedEmail = validation.normalizedEmail;

    if (mode === "register") {
      // REGISTER FLOW: Call Next.js API route that registers user & dispatches Resend verification email
      try {
        const response = await fetch("/api/auth/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name, email: normalizedEmail, password }),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || "Failed to register account.");
        }

        setVerificationSent(true);
        setResendCooldown(60);
      } catch (err: any) {
        setErrorMessage(err.message || "Registration failed. Please try again.");
      } finally {
        setIsLoading(false);
      }
    } else {
      // LOGIN FLOW: Authenticate using Supabase with password credentials
      try {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: normalizedEmail,
          password,
        });

        if (error) {
          if (error.message.toLowerCase().includes("email not confirmed")) {
            setErrorMessage("Please verify your email address before signing in. Check your inbox for the link.");
          } else {
            setErrorMessage(error.message);
          }
          setIsLoading(false);
          return;
        }

        // Successfully authenticated - redirect immediately
        window.location.href = "/dashboard";
      } catch (err: any) {
        setErrorMessage(err.message || "Sign in failed. Please check your credentials.");
        setIsLoading(false);
      }
    }
  };

  // 3. Resend Verification Email Action
  const handleResendEmail = async () => {
    if (resendCooldown > 0) return;
    const validation = validateEmail(email);
    if (!validation.isValid) {
      setErrorMessage(validation.error || "Please enter a valid email address.");
      return;
    }
    const normalizedEmail = validation.normalizedEmail;
    try {
      setIsLoading(true);
      const res = await fetch("/api/auth/resend", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: normalizedEmail, name }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to resend email.");

      setSuccessMessage("Verification email re-sent via Resend!");
      setResendCooldown(60);
      setTimeout(() => setSuccessMessage(null), 4000);
    } catch (err: any) {
      setErrorMessage(err.message || "Failed to resend email.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-[460px] relative z-10 flex flex-col items-center">
      {/* Top Navigation: Back to Overview */}
      <motion.div
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="w-full flex items-center justify-start mb-5 px-1"
      >
        <Link
          href="/"
          className="group inline-flex items-center gap-2 text-xs font-manrope text-zinc-400 hover:text-white transition-colors duration-200"
        >
          <div className="w-7 h-7 rounded-full bg-white/[0.04] border border-white/10 flex items-center justify-center group-hover:border-white/25 group-hover:bg-white/[0.08] transition-all">
            <ArrowLeft className="w-3.5 h-3.5" />
          </div>
          <span>Back to overview</span>
        </Link>
      </motion.div>

      {/* Main Liquid Glass Auth Tile */}
      <motion.div
        initial={{ opacity: 0, scale: 0.94, y: 24 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
        className={cn(
          "relative isolate w-full overflow-hidden rounded-[28px] p-7 sm:p-9 text-left transform-gpu",
          "liquid-glass-tile"
        )}
        style={{ transform: "translateZ(0)" }}
      >
        {/* Border Mask and Radial Glow */}
        <div className="absolute inset-0 z-10 rounded-[28px] overflow-hidden pointer-events-none liquid-glass-border-mask">
          <div className="absolute inset-0 liquid-glass-border-gradient" />
        </div>
        <div className="absolute inset-0 z-10 rounded-[28px] pointer-events-none border border-white/25 [mask-image:linear-gradient(to_bottom,white,transparent_75%)]" />
        <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_50%_0%,rgba(255,255,255,0.08),transparent_65%)]" />

        {/* Content */}
        <div className="relative z-20 flex flex-col h-full pointer-events-auto">
          {/* Logo & Mode Switcher */}
          <div className="flex items-center justify-between gap-4 pb-5 border-b border-white/10">
            <Link href="/" className="flex items-center hover:opacity-85 transition-opacity">
              <Image
                src="/envos-clean.png"
                alt="EnvOS Logo"
                width={110}
                height={24}
                className="h-6 w-auto object-contain brightness-100 drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)]"
                priority
              />
            </Link>

            {/* Mode Switcher */}
            {!verificationSent && (
              <div className="flex items-center p-1 rounded-full bg-black/40 border border-white/10 text-xs font-manrope">
                <button
                  type="button"
                  onClick={() => {
                    setMode("login");
                    setErrorMessage(null);
                  }}
                  className={cn(
                    "relative px-3.5 py-1 rounded-full transition-colors duration-200 cursor-pointer select-none",
                    mode === "login" ? "text-white font-medium" : "text-zinc-400 hover:text-zinc-200"
                  )}
                >
                  {mode === "login" && (
                    <motion.div
                      layoutId="auth-tab-pill"
                      className="absolute inset-0 rounded-full bg-white/15 border border-white/20 shadow-sm"
                      transition={{ type: "spring", stiffness: 400, damping: 30 }}
                    />
                  )}
                  <span className="relative z-10">Sign In</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setMode("register");
                    setErrorMessage(null);
                  }}
                  className={cn(
                    "relative px-3.5 py-1 rounded-full transition-colors duration-200 cursor-pointer select-none",
                    mode === "register" ? "text-white font-medium" : "text-zinc-400 hover:text-zinc-200"
                  )}
                >
                  {mode === "register" && (
                    <motion.div
                      layoutId="auth-tab-pill"
                      className="absolute inset-0 rounded-full bg-white/15 border border-white/20 shadow-sm"
                      transition={{ type: "spring", stiffness: 400, damping: 30 }}
                    />
                  )}
                  <span className="relative z-10">Register</span>
                </button>
              </div>
            )}
          </div>

          {/* Feedback Banners (Error / Success) */}
          <AnimatePresence>
            {errorMessage && (
              <motion.div
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                className="mt-4 p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs font-manrope flex items-start gap-2.5"
              >
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                <span className="leading-relaxed">{errorMessage}</span>
              </motion.div>
            )}

            {successMessage && (
              <motion.div
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                className="mt-4 p-3 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-manrope flex items-start gap-2.5"
              >
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span className="leading-relaxed">{successMessage}</span>
              </motion.div>
            )}
          </AnimatePresence>

          {/* VIEW A: VERIFICATION SENT (Check Your Inbox via Resend) */}
          {verificationSent ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
              className="py-6 flex flex-col items-center text-center space-y-4 font-manrope"
            >
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-cyan-500/20 to-blue-600/20 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shadow-xl">
                <Mail className="w-8 h-8 animate-pulse" />
              </div>

              <div>
                <h2 className="text-xl font-bold text-white tracking-tight">Check your email</h2>
                <p className="text-xs text-zinc-400 mt-1 max-w-xs mx-auto leading-relaxed">
                  We sent an account verification link via <strong>Resend</strong> to:
                </p>
                <div className="mt-2 inline-block px-3 py-1 rounded-full bg-white/[0.06] border border-white/10 font-mono text-xs text-cyan-300">
                  {email}
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-white/[0.03] border border-white/10 text-left text-xs text-zinc-300 space-y-1 w-full">
                <div className="font-semibold text-white flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Next Step:</span>
                </div>
                <p className="text-zinc-400 text-[11px] leading-relaxed">
                  Open your inbox and click <strong>&quot;Verify Email & Launch Workspace&quot;</strong> to activate your cloud operating system.
                </p>
              </div>

              <div className="pt-2 w-full flex flex-col gap-2">
                <button
                  type="button"
                  disabled={resendCooldown > 0 || isLoading}
                  onClick={handleResendEmail}
                  className={cn(
                    "w-full py-2.5 rounded-xl border text-xs font-semibold font-manrope transition-all cursor-pointer flex items-center justify-center gap-2",
                    resendCooldown > 0
                      ? "bg-white/[0.02] text-zinc-500 border-white/5 cursor-not-allowed"
                      : "bg-white/[0.06] hover:bg-white/[0.12] text-white border-white/15"
                  )}
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>
                    {resendCooldown > 0 ? `Resend email in ${resendCooldown}s` : "Resend verification email"}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setVerificationSent(false);
                    setMode("login");
                  }}
                  className="text-xs text-zinc-400 hover:text-white transition-colors cursor-pointer pt-1"
                >
                  ← Back to Sign In
                </button>
              </div>
            </motion.div>
          ) : (
            /* VIEW B: MAIN LOGIN & REGISTRATION FORMS */
            <>
              {/* Heading */}
              <div className="pt-6 relative min-h-[44px]">
                <div className="grid grid-cols-1 grid-rows-1 items-center">
                  <AnimatePresence initial={false}>
                    {mode === "login" ? (
                      <motion.div
                        key="heading-login"
                        className="col-start-1 row-start-1"
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -6 }}
                        transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
                      >
                        <h1 className="font-instrument italic text-3xl sm:text-4xl text-white font-normal leading-tight">
                          Welcome back.
                        </h1>
                      </motion.div>
                    ) : (
                      <motion.div
                        key="heading-register"
                        className="col-start-1 row-start-1"
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -6 }}
                        transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
                      >
                        <h1 className="font-instrument italic text-3xl sm:text-4xl text-white font-normal leading-tight">
                          Create your workspace.
                        </h1>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>

              {/* Google OAuth Button */}
              <div className="mt-6 w-full">
                <button
                  type="button"
                  disabled={isLoading}
                  onClick={handleGoogleSignIn}
                  className="w-full flex items-center justify-center gap-3 px-4 py-2.5 rounded-xl border border-white/10 bg-white/[0.03] hover:bg-white/[0.08] hover:border-white/20 transition-all duration-200 font-manrope text-xs sm:text-[13px] text-zinc-200 cursor-pointer active:scale-[0.98] disabled:opacity-50"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24">
                    <path
                      fill="#EA4335"
                      d="M12 5c1.6 0 3 .6 4.1 1.7l3.1-3.1C17.3 1.8 14.8 1 12 1 7.5 1 3.7 3.6 1.9 7.3l3.7 2.9C6.5 7.3 9 5 12 5z"
                    />
                    <path
                      fill="#4285F4"
                      d="M23.5 12.3c0-.8-.1-1.7-.2-2.3H12v4.6h6.5c-.3 1.5-1.1 2.8-2.4 3.7l3.7 2.9c2.2-2 3.7-5 3.7-8.9z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.6 14.8c-.2-.7-.4-1.5-.4-2.3 0-.8.2-1.6.4-2.3L1.9 7.3C.7 9.7 0 10.8 0 12s.7 2.3 1.9 4.7l3.7-2.9z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c3.2 0 6-1.1 8-3l-3.7-2.9c-1.1.7-2.5 1.2-4.3 1.2-3 0-5.5-2.3-6.4-5.2L1.9 16C3.7 19.7 7.5 23 12 23z"
                    />
                  </svg>
                  <span>Continue with Google</span>
                </button>
              </div>

              {/* Divider */}
              <div className="relative my-6 flex items-center justify-center">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-white/10" />
                </div>
                <span className="relative z-10 bg-[#090a0d] px-3 text-[11px] font-mono text-zinc-500 uppercase tracking-widest">
                  or continue with email
                </span>
              </div>

              {/* Credentials Form */}
              <form onSubmit={handleSubmit} className="flex flex-col">
                {/* Full Name Field (Register only) */}
                <AnimatePresence initial={false}>
                  {mode === "register" && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
                      className="overflow-hidden"
                    >
                      <div className="flex flex-col gap-1.5 pb-4">
                        <label className="text-xs font-manrope text-zinc-300 font-medium text-left">
                          Full Name
                        </label>
                        <div className="relative flex items-center">
                          <User className="absolute left-3.5 w-4 h-4 text-zinc-500 pointer-events-none" />
                          <input
                            type="text"
                            required={mode === "register"}
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="Alex Mercer"
                            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-white/10 bg-white/[0.04] text-white text-sm font-manrope placeholder:text-zinc-500 focus:outline-none focus:border-cyan-500/80 focus:bg-white/[0.06] transition-all duration-200"
                          />
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Email Field */}
                <div className="flex flex-col gap-1.5 text-left mb-4">
                  <label className="text-xs font-manrope text-zinc-300 font-medium">Email Address</label>
                  <div className="relative flex items-center">
                    <Mail className="absolute left-3.5 w-4 h-4 text-zinc-500 pointer-events-none" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="name@company.com or you@gmail.com"
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-white/10 bg-white/[0.04] text-white text-sm font-manrope placeholder:text-zinc-500 focus:outline-none focus:border-cyan-500/80 focus:bg-white/[0.06] transition-all duration-200"
                    />
                  </div>
                </div>

                {/* Password Field */}
                <div className="flex flex-col gap-1.5 text-left">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-manrope text-zinc-300 font-medium">Password</label>
                  </div>
                  <div className="relative flex items-center">
                    <Lock className="absolute left-3.5 w-4 h-4 text-zinc-500 pointer-events-none" />
                    <input
                      type={showPassword ? "text" : "password"}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••••••"
                      className="w-full pl-10 pr-11 py-2.5 rounded-xl border border-white/10 bg-white/[0.04] text-white text-sm font-manrope placeholder:text-zinc-500 focus:outline-none focus:border-cyan-500/80 focus:bg-white/[0.06] transition-all duration-200"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 text-zinc-500 hover:text-zinc-300 transition-colors p-0.5 cursor-pointer"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Submit Button */}
                <div className="mt-6">
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="group relative w-full h-11 rounded-xl bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-600 p-[1px] font-manrope text-sm font-semibold text-white shadow-[0_10px_25px_-5px_rgba(37,99,235,0.4)] transition-all duration-200 hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 cursor-pointer overflow-hidden"
                  >
                    <div className="w-full h-full rounded-[11px] bg-black/40 hover:bg-transparent flex items-center justify-center gap-2 transition-colors">
                      {isLoading ? (
                        <RotateCw className="w-4 h-4 animate-spin text-white" />
                      ) : (
                        <>
                          <span>
                            {mode === "login" ? "Sign In to Workspace" : "Provision New Workspace"}
                          </span>
                          <ArrowRight className="w-4 h-4 text-zinc-300 group-hover:translate-x-0.5 transition-transform" />
                        </>
                      )}
                    </div>
                  </button>
                </div>
              </form>

              {/* Mode Toggle Footer */}
              <div className="mt-6 pt-5 border-t border-white/10 text-center font-manrope text-xs text-zinc-400">
                {mode === "login" ? (
                  <p>
                    Don&apos;t have a workspace account?{" "}
                    <button
                      type="button"
                      onClick={() => {
                        setMode("register");
                        setErrorMessage(null);
                      }}
                      className="text-white hover:text-cyan-400 font-medium underline underline-offset-4 transition-colors cursor-pointer"
                    >
                      Create one now
                    </button>
                  </p>
                ) : (
                  <p>
                    Already have an account?{" "}
                    <button
                      type="button"
                      onClick={() => {
                        setMode("login");
                        setErrorMessage(null);
                      }}
                      className="text-white hover:text-cyan-400 font-medium underline underline-offset-4 transition-colors cursor-pointer"
                    >
                      Sign in here
                    </button>
                  </p>
                )}
              </div>
            </>
          )}
        </div>
      </motion.div>
    </div>
  );
}

export default AuthCard;
