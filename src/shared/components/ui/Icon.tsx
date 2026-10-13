// One stroke style for every icon (DESIGN.md › Navegación: estilo y grosor consistentes).
const paths = {
      home: "M3 10.5 12 3l9 7.5V20a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1Z",
      pantry: "M5 3h14v18H5zM5 10h14M9 6.5h1M9 13.5h1",
      chef: "M7 13.5V20h10v-6.5M7 13.5a4 4 0 1 1 1.5-7.7 4 4 0 0 1 7 0 4 4 0 1 1 1.5 7.7ZM7 17h10",
      book: "M4 4.5A1.5 1.5 0 0 1 5.5 3H20v15H5.5A1.5 1.5 0 0 0 4 19.5Zm0 15A1.5 1.5 0 0 0 5.5 21H20v-3",
      user: "M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8Zm-7 9c0-3.9 3.1-6 7-6s7 2.1 7 6",
      back: "M15 5l-7 7 7 7",
      plus: "M12 5v14M5 12h14",
      minus: "M5 12h14",
      close: "M6 6l12 12M18 6 6 18",
      edit: "M4 20h4L19 9l-4-4L4 16Zm9-13 4 4",
      trash: "M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3",
      check: "M5 12.5 10 17l9-10",
      cart: "M3 4h2l2.4 11h10.2L20 7H6.2M10 20h.01M17 20h.01",
      send: "M4 12 20 4l-6 16-3-7Z",
      sparkle: "M12 3v4m0 10v4M3 12h4m10 0h4M6 6l2.5 2.5m7 7L18 18M6 18l2.5-2.5m7-7L18 6",
      arrowRight: "M4 12h16M14 6l6 6-6 6",
      globe: "M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18Zm-9-9h18M12 3c2.5 2.5 3.5 5.5 3.5 9s-1 6.5-3.5 9c-2.5-2.5-3.5-5.5-3.5-9s1-6.5 3.5-9Z",
      lock: "M6 11h12v10H6zM8.5 11V7.5a3.5 3.5 0 0 1 7 0V11",
      logout: "M15 4h4v16h-4M10 8l-4 4 4 4M6 12h11",
      alert: "M12 3 2 20h20Zm0 6v5m0 3h.01",
      info: "M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18Zm0-10v5m0-8h.01",
      copy: "M8 8h12v12H8zM16 8V4H4v12h4",
      bowl: "M3 11h18a9 9 0 0 1-18 0Zm5-3c0-2 1-3 2-4m3 4c0-2 1-3 2-4",
      trendDown: "M3 7l6 6 4-4 8 8M21 11v6h-6",
      trendUp: "M3 17l6-6 4 4 8-8M21 13V7h-6",
      flame: "M12 3c1 4 5 5.5 5 10.5a5 5 0 0 1-10 0c0-2.5 1.5-3.5 2-5.5 1 1 1.6 2 1.8 3C12 9 12.5 6 12 3Z",
      dumbbell: "M6 7v10M3 10v4M18 7v10M21 10v4M6 12h12",
      scale: "M12 4v16M8 20h8M5 7h14M5 7l-3 7a3 3 0 0 0 6 0Zm14 0-3 7a3 3 0 0 0 6 0Z",
      star4: "M12 3c.8 4.5 4.5 8.2 9 9-4.5.8-8.2 4.5-9 9-.8-4.5-4.5-8.2-9-9 4.5-.8 8.2-4.5 9-9Z",
      camera: "M4 8h3l2-3h6l2 3h3v11H4ZM12 16.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7Z",
      clock: "M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18Zm0-13v4l3 2",
      tag: "M3 12V4h8l10 10-8 8ZM7.5 8.5h.01",
      search: "M11 18a7 7 0 1 0 0-14 7 7 0 0 0 0 14Zm5-2 5 5",
      sliders: "M4 7h10M18 7h2M4 17h4M12 17h8M16 5v4M10 15v4",
      target: "M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18Zm0-5a4 4 0 1 0 0-8 4 4 0 0 0 0 8Zm0-3.5h.01",
      chevronDown: "M6 9l6 6 6-6",
} as const;

export type IconName = keyof typeof paths;

type IconProps = {
      name: IconName;
      className?: string;
      strokeWidth?: number;
};

export default function Icon({ name, className = "size-6", strokeWidth = 1.75 }: IconProps) {
      return (
            <svg
                  viewBox="0 0 24 24"
                  className={className}
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={strokeWidth}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden
            >
                  <path d={paths[name]} />
            </svg>
      );
}
