import mascotUrl from "@/assets/brand/noshy-mascot.png";

type MascotProps = {
      className?: string;
      /** Empty when decorative (the default); give it text when the mascot carries meaning. */
      alt?: string;
};

// The Noshy chef bear (ref/noshy.png, white-filled so it reads on any surface).
export default function Mascot({ className = "size-10", alt = "" }: MascotProps) {
      return <img src={mascotUrl} alt={alt} draggable={false} className={`object-contain select-none ${className}`} />;
}
