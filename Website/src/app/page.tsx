import { AnimatedRays } from "@/components/ui/animated-rays";
import { Navbar } from "@/components/navbar";
import { HeroCta } from "@/components/hero-cta";
import { BentoGrid } from "@/components/bento-grid";
import { ArchitectureTiers } from "@/components/architecture-tiers";
import { FeaturesSection } from "@/components/features-section";
import { Footer } from "@/components/footer";

export default function Page() {
  return (
    <main className="relative min-h-screen w-full bg-black text-white selection:bg-blue-600/30 selection:text-white flex flex-col justify-between">
      {/* Floating Scroll-Activated Liquid Glass Pill Navbar */}
      <Navbar />

      {/* Animated Rays Background pinned to viewport */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <AnimatedRays />
      </div>

      {/* Sections allowing vertical scroll */}
      <div className="relative z-10 flex flex-col pt-24 px-4 max-w-7xl mx-auto">
        {/* Hero / Top Section */}
        <section className="min-h-[85vh] flex flex-col items-center justify-center text-center py-20">
          <h1 className="text-5xl sm:text-7xl md:text-8xl lg:text-9xl font-medium tracking-tight text-white select-none font-manrope leading-[0.98] drop-shadow-[0_4px_30px_rgba(0,0,0,0.8)] flex flex-col items-center gap-0 sm:gap-1">
            <div className="flex items-baseline justify-center">
              <span className="instrument-serif-regular-italic font-normal text-zinc-100 mr-4 sm:mr-6 md:mr-8">
                One
              </span>
              <span className="inline-flex items-baseline">
                Workspace
                <span
                  className="inline-block w-[0.11em] h-[0.11em] rounded-full bg-white ml-[0.05em] align-baseline relative bottom-[0.01em]"
                  aria-hidden="true"
                />
                <span className="sr-only">.</span>
              </span>
            </div>
            <div className="flex items-baseline justify-center">
              <span className="instrument-serif-regular-italic font-normal text-zinc-100 mr-4 sm:mr-6 md:mr-8">
                One
              </span>
              <span className="inline-flex items-baseline">
                Team
                <span
                  className="inline-block w-[0.11em] h-[0.11em] rounded-full bg-white ml-[0.05em] align-baseline relative bottom-[0.01em]"
                  aria-hidden="true"
                />
                <span className="sr-only">.</span>
              </span>
            </div>
          </h1>

          <p className="mt-6 sm:mt-8 text-base sm:text-lg md:text-xl text-zinc-300/90 font-manrope font-normal max-w-2xl sm:max-w-3xl mx-auto leading-relaxed drop-shadow-[0_2px_12px_rgba(0,0,0,0.8)]">
            A browser-native collaborative OS powered by decoupled compute nodes. Zero setup, native terminal power.
          </p>

          <HeroCta />
        </section>

        {/* About Section */}
        <section id="about" className="min-h-[70vh] pt-32 flex flex-col items-center text-center">
          <h2 className="text-4xl sm:text-5xl md:text-6xl font-semibold tracking-tight text-white font-manrope">
            About
          </h2>
          <p className="mt-6 sm:mt-8 text-xl sm:text-2xl md:text-3xl lg:text-4xl font-instrument italic text-white max-w-3xl sm:max-w-4xl mx-auto leading-snug drop-shadow-[0_4px_24px_rgba(0,0,0,0.8)]">
            Traditional cloud labs stream heavy pixels, EnvOS streams pure compute.
          </p>
          <p className="mt-6 sm:mt-8 text-base sm:text-lg md:text-xl text-white font-manrope font-normal max-w-2xl sm:max-w-3xl leading-relaxed">
            Built for engineering teams and students tired of broken local environments and lagging screen-share sandboxes. EnvOS runs a lightweight operating system directly inside your browser tab—routing native terminal processes and file pipelines through dedicated, private runner nodes.
          </p>

          {/* Bento Grid */}
          <div className="mt-14 sm:mt-16 w-full">
            <BentoGrid />
          </div>
        </section>

        {/* Architecture Section */}
        <section id="architecture" className="min-h-[70vh] pt-28 sm:pt-36 flex flex-col items-center text-center">
          <h2 className="text-4xl sm:text-5xl md:text-6xl font-semibold tracking-tight text-white font-manrope">
            Architecture
          </h2>
          <p className="mt-6 sm:mt-8 text-xl sm:text-2xl md:text-3xl lg:text-4xl font-instrument italic text-white max-w-3xl sm:max-w-4xl mx-auto leading-snug drop-shadow-[0_4px_24px_rgba(0,0,0,0.8)]">
            Decoupled by design.
          </p>
          <p className="mt-6 sm:mt-8 text-base sm:text-lg md:text-xl text-white font-manrope font-normal max-w-2xl sm:max-w-3xl leading-relaxed">
            EnvOS separates presentation, identity control, and POSIX process virtualization across three isolated physical layers.
          </p>

          {/* Architecture 3 Tiers Bento Grid */}
          <div className="w-full">
            <ArchitectureTiers />
          </div>
        </section>

        {/* Features Section */}
        <FeaturesSection />
      </div>

      {/* Footer */}
      <Footer />
    </main>
  );
}
