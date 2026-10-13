type LogoProps = {
      withTagline?: boolean;
      className?: string;
};

export default function Logo({ withTagline = false, className = "" }: LogoProps) {
      return (
            <div className={`flex flex-col items-center leading-none ${className}`}>
                  <span className="font-logo text-metric font-extrabold lowercase text-ink">
                        noshy
                  </span>
                  {withTagline && (
                        <span className="mt-1 text-base font-semibold lowercase text-ink-muted">
                              chef companion
                        </span>
                  )}
            </div>
      );
}
