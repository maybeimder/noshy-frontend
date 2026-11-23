import { useState } from "react";
import Avatar from "@/shared/components/ui/Avatar";
import Button from "@/shared/components/ui/Button";
import Dialog from "@/shared/components/ui/Dialog";
import LoadMore from "@/shared/components/ui/LoadMore";
import { ErrorState } from "@/shared/components/ui/QueryState";
import TextField from "@/shared/components/ui/TextField";
import VerifyEmail from "@/modules/settings/components/VerifyEmail";
import { ApiError } from "@/shared/lib/axios";
import { formatDate } from "@/shared/lib/format";
import { CommentsSkeleton } from "./RecipeSkeletons";
import { useComments, useRecipeActions } from "../hooks/useRecipes";

export default function CommentsDialog({ recipeId, open, onClose }: { recipeId: string; open: boolean; onClose: () => void }) {
      const comments = useComments(recipeId, open);
      const { comment } = useRecipeActions();
      const [text, setText] = useState("");
      const needsEmail = comment.error instanceof ApiError && comment.error.code === "EMAIL_NOT_VERIFIED";
      const list = (comments.data?.pages ?? []).flatMap((p) => p.data);

      return (
            <Dialog open={open} onClose={onClose} variant="sheet" title="Comentarios">
                  <div className="flex flex-col gap-4">
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
                                                <div className="min-w-0">
                                                      <p className="text-sm font-bold text-ink">
                                                            {c.author.displayName} <span className="font-semibold text-ink-muted">· {formatDate(c.createdAt)}</span>
                                                      </p>
                                                      <p className="break-words text-ink">{c.text}</p>
                                                </div>
                                          </li>
                                    ))}
                              </ul>
                        )}
                        <LoadMore query={comments} />
                        {needsEmail ? (
                              <VerifyEmail onVerified={() => comment.reset()} />
                        ) : (
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
                        )}
                  </div>
            </Dialog>
      );
}
