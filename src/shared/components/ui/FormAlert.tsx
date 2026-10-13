type FormAlertProps = {
      children: string;
};

// Form-level error: icon + text, never color alone (DESIGN.md › Accesibilidad).
export default function FormAlert({ children }: FormAlertProps) {
      return (
            <div
                  role="alert"
                  className="flex items-start gap-3 rounded-control border border-error bg-card p-4 text-sm text-error"
            >
                  <svg
                        viewBox="0 0 24 24"
                        className="size-5 shrink-0"
                        fill="currentColor"
                        aria-hidden
                  >
                        <path d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20Zm-1 5h2v7h-2Zm0 9h2v2h-2Z" />
                  </svg>
                  <p>{children}</p>
            </div>
      );
}
