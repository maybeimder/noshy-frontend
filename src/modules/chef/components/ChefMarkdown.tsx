import Markdown, { type Components } from "react-markdown";
import remarkGfm from "remark-gfm";

// Chef replies come from an LLM: raw HTML is never rendered (react-markdown default) and images are
// dropped so a reply cannot load external content. Sizes stay inside the DESIGN.md type scale.
const components: Components = {
      h1: ({ children }) => <h3 className="text-title font-bold">{children}</h3>,
      h2: ({ children }) => <h3 className="text-title font-bold">{children}</h3>,
      h3: ({ children }) => <h4 className="text-base font-bold">{children}</h4>,
      h4: ({ children }) => <h4 className="text-base font-bold">{children}</h4>,
      p: ({ children }) => <p>{children}</p>,
      ul: ({ children }) => <ul className="list-disc space-y-1 pl-6 marker:text-primary-strong">{children}</ul>,
      ol: ({ children }) => <ol className="list-decimal space-y-1 pl-6 marker:font-bold">{children}</ol>,
      strong: ({ children }) => <strong className="font-bold">{children}</strong>,
      a: ({ href, children }) => (
            <a
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer nofollow"
                  className="font-semibold underline underline-offset-4 focus-visible:outline-2 focus-visible:outline-primary-strong"
            >
                  {children}
            </a>
      ),
      code: ({ children }) => <code className="rounded bg-canvas px-1 py-0.5 text-sm">{children}</code>,
      pre: ({ children }) => <pre className="overflow-x-auto rounded-control bg-canvas p-3 text-sm">{children}</pre>,
      blockquote: ({ children }) => (
            <blockquote className="border-l-4 border-secondary pl-3 text-ink-muted">{children}</blockquote>
      ),
      hr: () => <hr className="border-line" />,
      table: ({ children }) => (
            <div className="overflow-x-auto">
                  <table className="w-full border-collapse text-sm">{children}</table>
            </div>
      ),
      th: ({ children }) => <th className="border-b-2 border-line px-2 py-1 text-left font-bold">{children}</th>,
      td: ({ children }) => <td className="border-b border-line px-2 py-1">{children}</td>,
};

export default function ChefMarkdown({ children }: { children: string }) {
      return (
            <div className="flex flex-col gap-3 break-words">
                  <Markdown remarkPlugins={[remarkGfm]} components={components} disallowedElements={["img"]} unwrapDisallowed>
                        {children}
                  </Markdown>
            </div>
      );
}
