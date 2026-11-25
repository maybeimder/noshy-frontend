import { Component, type ReactNode } from "react";
import Button from "@/shared/components/ui/Button";
import Mascot from "@/shared/components/ui/Mascot";

const RELOADED = "noshy.reloadedForChunk";
/** One automatic reload at most in this time, so a broken deploy cannot loop. */
const RELOAD_EVERY_MS = 60_000;
/** A screen whose code is gone because there is a newer version deployed. */
const isStaleChunk = (error: Error) => /dynamically imported module|Importing a module script failed|error loading dynamically/i.test(error.message);

type Props = { children: ReactNode; /** Changing it clears the error (the route). */ resetKey?: string };

/** Instead of a blank page: says it and offers a way out. A new deploy reloads by itself, once. */
export default class ErrorBoundary extends Component<Props, { error: Error | null }> {
      override state = { error: null as Error | null };

      static getDerivedStateFromError(error: Error) {
            return { error };
      }

      override componentDidCatch(error: Error) {
            console.error(error);
            if (!isStaleChunk(error)) return;
            try {
                  if (Date.now() - Number(sessionStorage.getItem(RELOADED) ?? 0) < RELOAD_EVERY_MS) return;
                  sessionStorage.setItem(RELOADED, String(Date.now()));
                  window.location.reload();
            } catch {
                  // Without storage there is no way to know it already reloaded: the button does it.
            }
      }

      override componentDidUpdate(previous: Props) {
            if (this.state.error && previous.resetKey !== this.props.resetKey) this.setState({ error: null });
      }

      override render() {
            const { error } = this.state;
            if (!error) return this.props.children;
            const offline = !navigator.onLine;
            return (
                  <main role="alert" className="mx-auto flex min-h-[70dvh] max-w-md flex-col items-center justify-center gap-4 px-6 text-center">
                        <Mascot className="w-32" />
                        <h1 className="text-section font-semibold text-ink">{offline ? "Estás sin conexión" : "Se nos quemó esta pantalla"}</h1>
                        <p className="text-ink-muted">{offline ? "Conéctate y vuelve a intentarlo." : "Algo falló al mostrarla. Tus datos están guardados."}</p>
                        <div className="mt-2 flex flex-wrap justify-center gap-3">
                              <Button onClick={() => window.location.reload()}>Reintentar</Button>
                              <Button variant="secondary" onClick={() => window.location.assign("/")}>
                                    Ir a Inicio
                              </Button>
                        </div>
                  </main>
            );
      }
}
