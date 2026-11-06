import type { Metadata } from "next";
import { TwistingRibbon } from "@/components/ui/twisting-ribbon";
import { AuthCard } from "@/components/auth/auth-card";

export const metadata: Metadata = {
  title: "Sign In — EnvOS",
  description: "Sign in to your EnvOS cloud operating system workspace and private compute nodes.",
};

export default function LoginPage() {
  return (
    <main className="relative min-h-screen w-full bg-black text-white selection:bg-blue-600/30 selection:text-white flex flex-col items-center justify-center p-4 sm:p-6 overflow-hidden">
      {/* Dynamic Twisting Ribbon Background */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <TwistingRibbon
          className="w-full h-full"
          segments={400}
          waveSpeed={0.016}
          twistCycles={6}
          darkColors={{
            face: "#ff3c0a",
            foldA: "#b4ff00",
            foldB: "#3c50ff",
            foldC: "#00dcff",
          }}
        />
        {/* Ambient vignette for optimal contrast */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(0,0,0,0.45)_0%,rgba(0,0,0,0.88)_100%)] pointer-events-none" />
      </div>

      {/* Main Liquid Glass Auth Tile */}
      <AuthCard defaultMode="login" />
    </main>
  );
}
