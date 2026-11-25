import { useEffect, useState, type CSSProperties } from "react";

// An invented recipe can take up to a minute and a half: past the first phrases, it says so instead of «ya casi».
const phrases = ["Pensando qué te cocino", "Probando la sazón", "Bajando el fuego", "Sigo en la cocina, a veces tarda un minuto"];

// The chef is cooking the answer: a pot whose lid rattles while the steam escapes.
export default function ChefThinking() {
      const [index, setIndex] = useState(0);
      useEffect(() => {
            const timer = setInterval(() => setIndex((i) => Math.min(i + 1, phrases.length - 1)), 5000);
            return () => clearInterval(timer);
      }, []);

      return (
            <div role="status" className="msg-in flex items-center gap-3 self-start">
                  <svg aria-hidden viewBox="0 0 48 48" className="size-14 shrink-0 overflow-visible" fill="none" strokeLinecap="round" strokeLinejoin="round">
                        <g className="stroke-marker" strokeWidth={2.5}>
                              {[16, 24, 32].map((x, i) => (
                                    <path key={x} d={`M${x} 13c-2-2.500 2-4 0-7`} className="steam-dot" style={{ "--delay": `${i * 180}ms` } as CSSProperties} />
                              ))}
                        </g>
                        <path d="M9 24h30v9c0 5-3.500 8-8 8H17c-4.500 0-8-3-8-8Z" className="fill-primary" />
                        <path d="M9 27H4.500M43.500 27H39" className="stroke-plum" strokeWidth={4} />
                        <path d="M14 31v2.500c0 2 1 3.500 2.700 4" className="stroke-card/60" strokeWidth={2.500} />
                        <g className="pot-lid">
                              <path d="M8 23.500c0-4 7-6.500 16-6.500s16 2.500 16 6.500Z" className="fill-plum" />
                              <circle cx="24" cy="15.500" r="2.500" className="fill-plum" />
                        </g>
                  </svg>
                  <span key={index} className="cook-fade font-display text-base font-medium text-ink-muted">
                        {phrases[index]}…
                  </span>
            </div>
      );
}
