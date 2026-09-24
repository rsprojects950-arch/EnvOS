'use client';

import { useEffect, useId, useState } from 'react';
import mermaid from 'mermaid';

interface MermaidProps {
  chart: string;
  caption?: string;
}

export function Mermaid({ chart, caption }: MermaidProps) {
  const id = useId().replace(/:/g, '_');
  const [svg, setSvg] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    mermaid.initialize({
      startOnLoad: false,
      theme: 'dark',
      themeVariables: {
        darkMode: true,
        background: '#0f172a',
        primaryColor: '#3b82f6',
        primaryTextColor: '#f8fafc',
        primaryBorderColor: '#60a5fa',
        lineColor: '#94a3b8',
        secondaryColor: '#1e293b',
        tertiaryColor: '#0f172a',
        fontFamily: 'Inter, system-ui, sans-serif',
      },
      securityLevel: 'loose',
    });

    let isMounted = true;

    async function renderChart() {
      try {
        const cleanChart = chart.trim();
        const renderId = `mermaid_${id}_${Math.random().toString(36).substring(2, 7)}`;
        const { svg: renderedSvg } = await mermaid.render(renderId, cleanChart);
        if (isMounted) {
          setSvg(renderedSvg);
          setError(null);
        }
      } catch (err: any) {
        if (isMounted) {
          setError(err?.message || 'Failed to render diagram');
        }
      }
    }

    renderChart();

    return () => {
      isMounted = false;
    };
  }, [chart, id]);

  if (error) {
    return (
      <div className="my-6 p-4 rounded-lg border border-red-500/30 bg-red-950/20 text-red-400 text-sm">
        <p className="font-semibold mb-1">Failed to render Mermaid diagram:</p>
        <pre className="text-xs overflow-x-auto">{error}</pre>
      </div>
    );
  }

  return (
    <div className="my-6 flex flex-col items-center justify-center p-6 rounded-xl border border-fd-border bg-fd-card/60 backdrop-blur-md shadow-sm overflow-x-auto">
      {svg ? (
        <div
          className="w-full flex justify-center [&>svg]:max-w-full [&>svg]:h-auto"
          dangerouslySetInnerHTML={{ __html: svg }}
        />
      ) : (
        <div className="py-8 text-xs text-fd-muted-foreground animate-pulse">
          Rendering UML diagram...
        </div>
      )}
      {caption && (
        <p className="mt-3 text-xs text-center text-fd-muted-foreground font-medium">
          {caption}
        </p>
      )}
    </div>
  );
}
