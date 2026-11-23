/** Native share sheet, or the clipboard as a fallback. Returns what to tell the user, if anything. */
export async function shareText(title: string, text: string): Promise<string | null> {
      try {
            if (navigator.share) {
                  await navigator.share({ title, text });
                  return null;
            }
            await navigator.clipboard.writeText(text);
            return "Copiado. Pégalo donde quieras.";
      } catch (error) {
            if (error instanceof DOMException && error.name === "AbortError") return null;
            return "No pudimos compartir desde este navegador.";
      }
}
