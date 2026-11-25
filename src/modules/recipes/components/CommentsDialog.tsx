import { useState } from "react";
import { useAuth } from "@/modules/auth/hooks/useAuth";
import Avatar from "@/shared/components/ui/Avatar";
import Button from "@/shared/components/ui/Button";
import Dialog from "@/shared/components/ui/Dialog";
import Icon from "@/shared/components/ui/Icon";
import LoadMore from "@/shared/components/ui/LoadMore";
import { ErrorState } from "@/shared/components/ui/QueryState";
import TextField from "@/shared/components/ui/TextField";
import { formatDate } from "@/shared/lib/format";
import ReportDialog from "./ReportDialog";
import { CommentsSkeleton } from "./RecipeSkeletons";
import { useComments, useRecipeActions } from "../hooks/useRecipes";

type CommentsDialogProps = { recipeId: string; open: boolean; onClose: () => void; /** The recipe is theirs: they can remove anyone's comment. */ canModerate?: boolean };

export default function CommentsDialog({ recipeId, open, onClose, canModerate = false }: CommentsDialogProps) {
      const { user } = useAuth();
      const comments = useComments(recipeId, open);
      const { comment, removeComment } = useRecipeActions();
      const [reporting, setReporting] = useState<string | null>(null);
      const [text, setText] = useState("");
      const list = (comments.data?.pages ?? []).flatMap((p) => p.data);

      const action = "grid size-11 shrink-0 place-items-center rounded-full text-ink-muted hover:bg-field hover:text-ink focus-visible:outline-2 focus-visible:outline-primary-strong disabled:opacity-50";

      return (
            <>
            <Dialog open={open} onClose={onClose} variant="sheet" title="Comentarios">
                  <div className="flex flex-col gap-4">
                        {removeComment.error && <p className="text-sm font-semibold text-error">{removeComment.error.message}</p>}
                        {comments.isPending ? (
                              <CommentsSkeleton />
                        ) : comments.isError ? (
                              <ErrorState message={comments.error.message} onRetry={() => comments.refetch()} />
                        ) : list.length === 0 ? (
                              <p className="text-ink-muted">Nadie ha comentado todavía.</p>
                        ) : (
                              <ul className="flex flex-col gap-4">
                                    {list.map((c) => (
                                          <li key={c.id} className="flex gap-3">
                                                <Avatar name={c.author.displayName} url={c.author.avatarUrl} size="sm" />
                                                <div className="min-w-0 flex-1">
                                                      <p className="text-sm font-bold text-ink">
                                                            {c.author.displayName} <span className="font-semibold text-ink-muted">· {formatDate(c.createdAt)}</span>
                                                      </p>
                                                      <p className="break-words text-ink">{c.text}</p>
                                                </div>
                                                {(c.author.id === user?.id || canModerate) && (
                                                      <button
                                                            type="button"
                                                            aria-label={`Borrar el comentario de ${c.author.displayName}`}
                                                            disabled={removeComment.isPending}
                                                            onClick={() => removeComment.mutate(c.id)}
                                                            className={action}
                                                      >
                                                            <Icon name="trash" className="size-5" />
                                                      </button>
                                                )}
                                                {c.author.id !== user?.id && (
                                                      <button type="button" aria-label={`Reportar el comentario de ${c.author.displayName}`} onClick={() => setReporting(c.id)} className={action}>
                                                            <Icon name="alert" className="size-5" />
                                                      </button>
                                                )}
                                          </li>
                                    ))}
                              </ul>
                        )}
                        <LoadMore query={comments} />
                        <form
                              className="flex items-end gap-2"
                              onSubmit={(e) => {
                                    e.preventDefault();
                                    if (text.trim()) comment.mutate({ id: recipeId, text: text.trim() }, { onSuccess: () => setText("") });
                              }}
                        >
                              <TextField label="Tu comentario" hideLabel placeholder="Escribe un comentario" maxLength={500} value={text} onChange={(e) => setText(e.target.value)} error={comment.error?.message} className="flex-1" />
                              <Button type="submit" loading={comment.isPending} disabled={!text.trim()}>
                                    Enviar
                              </Button>
                        </form>
                  </div>
            </Dialog>
            {reporting && <ReportDialog target={{ targetType: "comment", targetId: reporting }} onClose={() => setReporting(null)} />}
            </>
      );
}
