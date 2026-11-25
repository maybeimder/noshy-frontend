import { useRef, type KeyboardEvent, type PointerEvent } from "react";
import type { Sex } from "../utils/body";

const clamp = (n: number, min: number, max: number) => Math.min(max, Math.max(min, n));

type VerticalSliderProps = {
      label: string;
      unit: string;
      value: number;
      /** False until the user answers: the thumb waits, muted, at a typical value. */
      touched: boolean;
      min: number;
      max: number;
      /** A labelled mark every so many units. */
      mark: number;
      onChange: (value: number) => void;
      /** Which side its marks are on. */
      marks: "left" | "right";
};

/** Upright slider: drag, tap or use the arrow keys. */
export function VerticalSlider({ label, unit, value, touched, min, max, mark, onChange, marks }: VerticalSliderProps) {
      const track = useRef<HTMLDivElement>(null);
      const shown = clamp(value, min, max);
      const share = (shown - min) / (max - min);

      const follow = (event: PointerEvent) => {
            const box = track.current!.getBoundingClientRect();
            onChange(Math.round(min + clamp((box.bottom - event.clientY) / box.height, 0, 1) * (max - min)));
      };
      const onKeyDown = (event: KeyboardEvent) => {
            const moves: Record<string, number> = { ArrowUp: shown + 1, ArrowRight: shown + 1, ArrowDown: shown - 1, ArrowLeft: shown - 1, PageUp: shown + 10, PageDown: shown - 10, Home: min, End: max };
            const next = moves[event.key];
            if (next === undefined) return;
            event.preventDefault();
            onChange(clamp(next, min, max));
      };
      const ticks = Array.from({ length: Math.floor((max - min) / mark) + 1 }, (_, i) => min + i * mark);

      return (
            <div className={`flex h-full items-stretch gap-1.5 ${marks === "left" ? "" : "flex-row-reverse"}`}>
                  <div aria-hidden className="relative w-7 text-[0.6875rem] font-semibold text-ink-muted tabular-nums">
                        {ticks.map((tick) => (
                              <span key={tick} className={`absolute -translate-y-1/2 ${marks === "left" ? "right-0" : "left-0"}`} style={{ top: `${(1 - (tick - min) / (max - min)) * 100}%` }}>
                                    {tick}
                              </span>
                        ))}
                  </div>
                  <div
                        ref={track}
                        role="slider"
                        tabIndex={0}
                        aria-label={label}
                        aria-orientation="vertical"
                        aria-valuemin={min}
                        aria-valuemax={max}
                        aria-valuenow={shown}
                        aria-valuetext={touched ? `${shown} ${unit}` : `Sin responder, ${shown} ${unit}`}
                        onKeyDown={onKeyDown}
                        onPointerDown={(event) => {
                              event.currentTarget.setPointerCapture(event.pointerId);
                              follow(event);
                        }}
                        onPointerMove={(event) => event.currentTarget.hasPointerCapture(event.pointerId) && follow(event)}
                        className="group relative w-11 cursor-grab touch-none rounded-full focus-visible:outline-none active:cursor-grabbing"
                  >
                        <span aria-hidden className="absolute inset-y-0 left-1/2 w-3 -translate-x-1/2 overflow-hidden rounded-full bg-line">
                              <span className={`absolute inset-x-0 bottom-0 rounded-full ${touched ? "bg-[linear-gradient(0deg,var(--color-brand-from),var(--color-brand-to))]" : "bg-marker/60"}`} style={{ height: `${share * 100}%` }} />
                        </span>
                        <span
                              aria-hidden
                              className={`absolute left-1/2 size-9 -translate-x-1/2 translate-y-1/2 rounded-full border-[7px] bg-card transition-[scale] group-focus-visible:outline-2 group-focus-visible:outline-offset-2 group-focus-visible:outline-primary-strong group-active:scale-110 ${touched ? "border-primary-strong shadow-brand" : "border-marker"}`}
                              style={{ bottom: `${share * 100}%` }}
                        />
                  </div>
            </div>
      );
}

/** The little person: grows with the height and fills out with the weight. */
export function Figure({ heightCm, weightKg, sex }: { heightCm: number; weightKg: number; sex: Sex | null }) {
      const bmi = weightKg / (heightCm / 100) ** 2;
      const w = clamp(0.8 + (bmi - 17) * 0.026, 0.8, 1.42);
      const scale = 0.7 + 0.3 * clamp((heightCm - 120) / 90, 0, 1);
      // Half widths of the body, from the middle (x = 60).
      const shoulder = 20 * w ** 0.6;
      const waist = 16.5 * w;
      const hip = 18.5 * w ** 0.9;
      const leg = 13 * w ** 0.7;
      const legAt = hip * 0.5;
      const arm = 9.5 * w ** 0.7;
      const skin = "#ffd0b0";

      return (
            <svg aria-hidden viewBox="0 0 120 240" className="h-full w-full overflow-visible">
                  <ellipse cx="60" cy="233" rx={34 * scale * w ** 0.5} ry="5" className="fill-plum/10" />
                  <g style={{ transform: `scale(${scale})`, transformOrigin: "60px 232px", transition: "transform 180ms ease-out" }}>
                        {/* Long hair behind */}
                        {sex === "female" && <path d="M35 40c0-16 11-27 25-27s25 11 25 27v30c0 8-6 10-10 7H45c-4 3-10 1-10-7Z" className="fill-plum" />}
                        {/* Legs and shoes */}
                        {[-1, 1].map((side) => (
                              <g key={side}>
                                    <line x1={60 + side * legAt} y1="156" x2={60 + side * legAt} y2="220" strokeWidth={leg} strokeLinecap="round" className="stroke-plum" />
                                    <path d={`M${60 + side * legAt - 8} 231c0-7 4-10 8-10s8 3 8 10Z`} className="fill-primary-strong" />
                                    {/* Arms */}
                                    <path d={`M${60 + side * (shoulder - 2)} 88Q${60 + side * (Math.max(shoulder, waist) + 9)} 112 ${60 + side * (Math.max(waist, hip) + 7)} 140`} fill="none" stroke={skin} strokeWidth={arm} strokeLinecap="round" />
                                    <path d={`M${60 + side * (shoulder - 2)} 88Q${60 + side * (Math.max(shoulder, waist) + 5)} 100 ${60 + side * (Math.max(shoulder, waist) + 6)} 110`} fill="none" strokeWidth={arm + 3.5} strokeLinecap="round" className="stroke-brand-to" />
                              </g>
                        ))}
                        {/* Neck, shirt and shorts */}
                        <rect x="53" y="64" width="14" height="18" rx="6" fill={skin} />
                        <path d={`M${60 - hip} 148C${60 - hip} 160 ${60 - hip} 170 ${60 - legAt} 174L60 166L${60 + legAt} 174C${60 + hip} 170 ${60 + hip} 160 ${60 + hip} 148Z`} className="fill-plum" />
                        <path
                              d={`M${60 - shoulder} 86C${60 - shoulder} 79 52 77 52 77Q60 84 68 77C68 77 ${60 + shoulder} 79 ${60 + shoulder} 86C${60 + shoulder} 104 ${60 + waist} 110 ${60 + waist} 124C${60 + waist} 138 ${60 + hip} 142 ${60 + hip} 154Q60 162 ${60 - hip} 154C${60 - hip} 142 ${60 - waist} 138 ${60 - waist} 124C${60 - waist} 110 ${60 - shoulder} 104 ${60 - shoulder} 86Z`}
                              className="fill-primary"
                        />
                        {/* Head */}
                        <circle cx="60" cy="44" r="25" fill={skin} />
                        {sex === "female" ? (
                              <path d="M35 44c0-18 10-29 25-29s25 11 25 29c-6-3-10-8-12-14-8 8-22 12-38 14Z" className="fill-plum" />
                        ) : sex === "male" ? (
                              <path d="M35 42c-2-18 10-28 25-28s27 10 25 28c-3-2-4-6-5-10-12 2-26 1-36-4-5 3-7 8-9 14Z" className="fill-plum" />
                        ) : (
                              <path d="M34 52c-4-24 8-38 26-38s30 14 26 38c-4-1-6-5-6-12-14 1-26-2-32-8-4 5-5 9-6 14-1 4-4 6-8 6Z" className="fill-plum" />
                        )}
                        <circle cx="51" cy="47" r="2.3" className="fill-ink" />
                        <circle cx="69" cy="47" r="2.3" className="fill-ink" />
                        <path d="M54.500 55q5.500 5 11 0" fill="none" strokeWidth="2.200" strokeLinecap="round" className="stroke-ink" />
                        <circle cx="45.500" cy="54" r="3.600" className="fill-primary/40" />
                        <circle cx="74.500" cy="54" r="3.600" className="fill-primary/40" />
                  </g>
            </svg>
      );
}
