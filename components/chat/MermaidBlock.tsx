"use client";

import mermaid from "mermaid";
import { useEffect, useId, useState } from "react";

export function MermaidBlock({ chart }: { chart: string }) {
  const id = useId().replace(/:/g, "");
  const [svg, setSvg] = useState("");

  useEffect(() => {
    let mounted = true;
    mermaid.initialize({ startOnLoad: false, theme: "neutral", securityLevel: "strict" });
    mermaid
      .render(`mermaid-${id}`, chart)
      .then((result) => {
        if (mounted) setSvg(result.svg);
      })
      .catch(() => {
        if (mounted) setSvg("");
      });
    return () => {
      mounted = false;
    };
  }, [chart, id]);

  if (!svg) {
    return <pre className="whitespace-pre-wrap">{chart}</pre>;
  }

  return (
    <div
      className="overflow-x-auto rounded-app border border-line bg-white p-3"
      dangerouslySetInnerHTML={{ __html: svg }}
    />
  );
}
