import Mascot from "./Mascot";

/** "Noshy" + "Chef Companion" in brand wine (DESIGN.md › Actualización desde las referencias). */
export function Wordmark({ size = "lg", align = "center" }: { size?: "md" | "lg"; align?: "center" | "start" }) {
      return (
            <span className={`flex flex-col leading-none text-wine ${align === "center" ? "items-center" : "items-start"}`}>
                  <span className={`font-display font-extrabold tracking-tight ${size === "lg" ? "text-[3.25rem]" : "text-metric"}`}>
                        Noshy
                  </span>
                  <span className="mt-1 text-base font-bold">Chef Companion</span>
            </span>
      );
}

type LogoProps = {
      withTagline?: boolean;
      className?: string;
};

export default function Logo({ className = "" }: LogoProps) {
      return (
            <div className={`flex flex-col items-center ${className}`}>
                  <Mascot className="mb-2 size-24" />
                  <Wordmark size="md" />
            </div>
      );
}
