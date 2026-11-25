import { useMutation } from "@tanstack/react-query";
import Button from "@/shared/components/ui/Button";
import Dialog from "@/shared/components/ui/Dialog";
import { recipesApi, type ReportReason, type ReportTarget } from "../api/recipes.api";

const reasons: { id: ReportReason; label: string }[] = [
      { id: "offensive", label: "Es ofensivo" },
      { id: "spam", label: "Es spam o publicidad" },
      { id: "unsafe", label: "Puede hacer daño a alguien" },
      { id: "stolen", label: "La copiaron de otra persona" },
      { id: "other", label: "Otra razón" },
];

/** One tap on the reason sends it. */
export default function ReportDialog({ target, onClose }: { target: ReportTarget; onClose: () => void }) {
      const report = useMutation({ mutationFn: recipesApi.report });
      return (
            <Dialog open variant="sheet" onClose={onClose} title={target.targetType === "recipe" ? "Reportar receta" : "Reportar comentario"}>
                  {report.isSuccess ? (
                        <div className="flex flex-col gap-4">
                              <p role="status" className="text-ink">
                                    Gracias. Lo vamos a revisar.
                              </p>
                              <Button onClick={onClose}>Listo</Button>
                        </div>
                  ) : (
                        <div className="flex flex-col gap-2">
                              {reasons.map((reason) => (
                                    <button
                                          key={reason.id}
                                          type="button"
                                          disabled={report.isPending}
                                          onClick={() => report.mutate({ ...target, reason: reason.id })}
                                          className="min-h-12 rounded-control bg-field px-4 text-left font-bold text-ink hover:bg-line focus-visible:outline-2 focus-visible:outline-primary-strong disabled:opacity-60"
                                    >
                                          {reason.label}
                                    </button>
                              ))}
                              {report.error && <p className="text-sm font-semibold text-error">{report.error.message}</p>}
                        </div>
                  )}
            </Dialog>
      );
}
