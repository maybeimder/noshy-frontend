import { useState, type ReactNode } from "react";
import { imageVariant } from "@/shared/lib/images";

type PhotoProps = { url: string | null | undefined; alt?: string; width: number; height?: number; className?: string; fallback: ReactNode };

/** Photo that falls back to an illustration when there is none or it does not load. */
export default function Photo({ url, alt = "", width, height, className = "", fallback }: PhotoProps) {
      const [failed, setFailed] = useState<string | null>(null);
      if (!url || failed === url) return fallback;
      return <img src={imageVariant(url, width, height)} alt={alt} loading="lazy" onError={() => setFailed(url)} className={className} />;
}
