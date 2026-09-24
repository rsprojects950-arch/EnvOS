import Link from 'next/link';

export default function HomePage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-4rem)] px-6 py-12 text-center">
      <div className="inline-flex items-center gap-2 px-3 py-1 mb-8 text-xs font-medium border rounded-full bg-fd-secondary/50 border-fd-border text-fd-foreground backdrop-blur-md">
        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
        v0.1.0 • Browser-Native Cloud OS
      </div>

      <h1 className="max-w-4xl text-4xl sm:text-6xl font-extrabold tracking-tight text-fd-foreground">
        The Collaborative Cloud Operating System for{' '}
        <span className="bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 bg-clip-text text-transparent">
          Developers
        </span>
      </h1>

      <p className="max-w-2xl mt-6 text-base sm:text-lg text-fd-muted-foreground leading-relaxed">
        EnvOS transforms your browser into a full virtual desktop development workspace.
        Featuring Monaco Code Studio, real bash shells with zero cloud hosting bills, and seamless room-code collaboration.
      </p>

      <div className="flex flex-wrap items-center justify-center gap-4 mt-10">
        <Link
          href="/docs"
          className="px-6 py-3 text-sm font-semibold rounded-lg bg-fd-primary text-fd-primary-foreground shadow-lg hover:opacity-90 transition-all"
        >
          Explore Documentation →
        </Link>
        <Link
          href="/docs/architecture"
          className="px-6 py-3 text-sm font-semibold rounded-lg border border-fd-border bg-fd-secondary/40 hover:bg-fd-secondary/80 text-fd-foreground transition-all"
        >
          Decoupled Architecture
        </Link>
        <a
          href="https://github.com/rsprojects950-arch/EnvOS"
          target="_blank"
          rel="noopener noreferrer"
          className="px-6 py-3 text-sm font-semibold rounded-lg border border-fd-border bg-fd-secondary/20 hover:bg-fd-secondary/60 text-fd-foreground transition-all"
        >
          GitHub Repo
        </a>
      </div>

      {/* Feature Highlights Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-5xl mt-20 text-left">
        <div className="p-6 rounded-xl border border-fd-border bg-fd-card/40 backdrop-blur-md">
          <div className="text-2xl mb-3">🖥️</div>
          <h3 className="font-semibold text-base mb-1 text-fd-foreground">Liquid Glass Desktop</h3>
          <p className="text-sm text-fd-muted-foreground">
            Apple-inspired frosted glass window manager with traffic lights, draggable canvases, and floating docks.
          </p>
        </div>
        <div className="p-6 rounded-xl border border-fd-border bg-fd-card/40 backdrop-blur-md">
          <div className="text-2xl mb-3">⚡</div>
          <h3 className="font-semibold text-base mb-1 text-fd-foreground">Decoupled Compute</h3>
          <p className="text-sm text-fd-muted-foreground">
            Thin-client browser presentation paired with a dedicated local runner node. Zero expensive cloud VM bills.
          </p>
        </div>
        <div className="p-6 rounded-xl border border-fd-border bg-fd-card/40 backdrop-blur-md">
          <div className="text-2xl mb-3">🤝</div>
          <h3 className="font-semibold text-base mb-1 text-fd-foreground">Multiplayer Collaboration</h3>
          <p className="text-sm text-fd-muted-foreground">
            Share a 6-character room code to pair program instantly with role-based access control and persistent terminals.
          </p>
        </div>
      </div>
    </div>
  );
}
