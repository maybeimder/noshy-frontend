import { useState } from "react";
import { imageVariant } from "@/shared/lib/images";

const sizes = {
      xs: { box: "size-6 text-xs", px: 48 },
      sm: { box: "size-11 text-base", px: 88 },
      md: { box: "size-16 text-section", px: 128 },
      lg: { box: "size-24 text-metric", px: 192 },
};

type AvatarProps = {
      name: string;
      url?: string | null;
      size?: keyof typeof sizes;
      className?: string;
};

// Photo when there is one (and it loads); otherwise the initial on brand pink with ciruela text.
export default function Avatar({ name, url, size = "md", className = "" }: AvatarProps) {
      const [failed, setFailed] = useState(false);
      const { box, px } = sizes[size];

      if (url && !failed) {
            return (
                  <img
                        src={imageVariant(url, px, px)}
                        alt=""
                        onError={() => setFailed(true)}
                        className={`${box} shrink-0 rounded-full bg-primary-soft object-cover ${className}`}
                  />
            );
      }
      return (
            <span
                  aria-hidden
                  className={`${box} grid shrink-0 place-items-center rounded-full bg-primary font-logo font-extrabold text-ink ${className}`}
            >
                  {name.trim().charAt(0).toUpperCase() || "·"}
            </span>
      );
}
