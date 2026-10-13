import Logo from "@/shared/components/ui/Logo";

export default function SplashScreen() {
      return (
            <div
                  role="status"
                  className="grid min-h-dvh place-items-center bg-canvas"
            >
                  <Logo className="animate-pulse" />
                  <span className="sr-only">Cargando…</span>
            </div>
      );
}
