// What each entry of the history of this tab showed. react-router numbers them in history.state.idx.
const visits = new Map<number, string>();
const index = () => (window.history.state as { idx?: number } | null)?.idx ?? 0;

export function rememberVisit(url: string) {
      visits.set(index(), url);
}

/** What going back one entry shows. */
export const previousVisit = () => visits.get(index() - 1);
