"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { isDisposableDomain } from "@/lib/email-validator";
import { AlertCircle } from "lucide-react";

export default function AuthCallbackPage() {
  const router = useRouter();
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function handleAuthCallback() {
      try {
        const validateEmailAllowed = (session: any): boolean => {
          const userEmail = (session?.user?.email || "").trim().toLowerCase();
          if (userEmail && isDisposableDomain(userEmail)) {
            supabase.auth.signOut();
            if (isMounted) {
              setErrorMsg("Access restricted: Disposable or temporary email domains are not permitted on EnvOS.");
              setTimeout(() => router.replace("/login?error=disposable_email"), 2000);
            }
            return false;
          }
          return true;
        };

        // 1. Check if Supabase client already picked up the session
        const { data: sessionData } = await supabase.auth.getSession();

        if (sessionData?.session) {
          if (!validateEmailAllowed(sessionData.session)) return;
          window.location.replace("/dashboard");
          return;
        }

        // 2. Check if a PKCE code exists in the URL search params
        const params = new URLSearchParams(window.location.search);
        const code = params.get("code");

        if (code) {
          const { data, error } = await supabase.auth.exchangeCodeForSession(code);
          if (error) {
            throw error;
          }

          if (data?.session) {
            if (!validateEmailAllowed(data.session)) return;
            window.location.replace("/dashboard");
            return;
          }
        }

        // 3. Fallback: Listen to onAuthStateChange for OAuth token delivery
        const {
          data: { subscription },
        } = supabase.auth.onAuthStateChange((event, session) => {
          if (session) {
            if (!validateEmailAllowed(session)) return;
            window.location.replace("/dashboard");
          }
        });

        // 4. Fallback redirect
        const timer = setTimeout(() => {
          if (isMounted && !errorMsg) {
            window.location.replace("/dashboard");
          }
        }, 1200);

        return () => {
          subscription.unsubscribe();
          clearTimeout(timer);
        };
      } catch (err: any) {
        if (isMounted) {
          console.error("[OAuth Callback Error]", err);
          setErrorMsg(err.message || "Failed to complete authentication.");
          setTimeout(() => router.replace("/login?error=auth_failed"), 2000);
        }
      }
    }

    handleAuthCallback();

    return () => {
      isMounted = false;
    };
  }, [router, errorMsg]);

  // If there's an error, show a clean error dialog; otherwise render pure clean dark background with zero interstitial screen
  if (errorMsg) {
    return (
      <div className="min-h-screen w-screen bg-[#05060A] text-white font-manrope flex flex-col items-center justify-center p-4">
        <div className="max-w-sm w-full p-8 rounded-3xl bg-white/[0.03] border border-white/10 backdrop-blur-2xl shadow-2xl flex flex-col items-center text-center space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-rose-500/15 border border-rose-500/30 flex items-center justify-center text-rose-400">
            <AlertCircle className="w-7 h-7 text-rose-400" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white tracking-tight">Authentication Failed</h2>
            <p className="text-xs text-rose-300 mt-1">{errorMsg}</p>
          </div>
        </div>
      </div>
    );
  }

  return <div className="min-h-screen w-screen bg-[#05060A]" />;
}

