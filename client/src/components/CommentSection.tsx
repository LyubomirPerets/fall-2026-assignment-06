import { useEffect, useState, type FormEvent } from 'react';
import { createComment, getComments, type Comment } from '../api.ts';
import CommentItem from './CommentItem.tsx';
import StatusMessage from './StatusMessage.tsx';

type CommentSectionProps = {
  articleId: number;
};

export default function CommentSection({ articleId }: CommentSectionProps) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [newBody, setNewBody] = useState('');
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  // The comment just added or edited, briefly highlighted so the eye finds it.
  const [freshId, setFreshId] = useState<number | null>(null);

  useEffect(() => {
    let ignore = false;
    getComments(articleId)
      .then((data) => {
        // The API returns comments in no guaranteed order; keep them oldest-first.
        if (!ignore) setComments([...data].sort((a, b) => a.commentId - b.commentId));
      })
      .catch((err: Error) => {
        if (!ignore) setError(err.message);
      })
      .finally(() => {
        if (!ignore) setLoading(false);
      });
    return () => {
      ignore = true;
    };
  }, [articleId]);

  async function handleAdd(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const body = newBody.trim();
    if (!body) {
      setFormError('Comment cannot be empty.');
      return;
    }
    setSubmitting(true);
    setFormError(null);
    try {
      const created = await createComment(articleId, body);
      setComments((prev) => [...prev, created]);
      setFreshId(created.commentId);
      setNewBody('');
    } catch (err) {
      setFormError(`Could not add comment: ${(err as Error).message}`);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section className="comments" aria-labelledby="comments-heading">
      <h2 id="comments-heading" className="comments-heading">
        Comments
        {comments.length > 0 && <span className="count"> ({comments.length})</span>}
      </h2>

      {loading ? (
        <StatusMessage kind="loading">Loading comments…</StatusMessage>
      ) : error ? (
        <StatusMessage kind="error">Could not load comments: {error}</StatusMessage>
      ) : comments.length === 0 ? (
        <StatusMessage kind="empty">No comments yet.</StatusMessage>
      ) : (
        <ul className="comment-list">
          {comments.map((comment) => (
            <CommentItem
              key={comment.commentId}
              articleId={articleId}
              comment={comment}
              fresh={freshId === comment.commentId}
              onFreshEnd={() => setFreshId(null)}
              onUpdated={(updated) => {
                setComments((prev) =>
                  prev.map((c) => (c.commentId === updated.commentId ? updated : c)),
                );
                setFreshId(updated.commentId);
              }}
              onDeleted={(commentId) =>
                setComments((prev) => prev.filter((c) => c.commentId !== commentId))
              }
            />
          ))}
        </ul>
      )}

      <form className="composer" onSubmit={handleAdd} noValidate>
        <div className="composer-field">
          <label htmlFor="new-comment" className="visually-hidden">
            Add a comment
          </label>
          <textarea
            id="new-comment"
            className="input"
            rows={3}
            placeholder="Add a comment…"
            value={newBody}
            onChange={(e) => {
              setNewBody(e.target.value);
              setFormError(null);
            }}
            aria-invalid={Boolean(formError)}
            aria-describedby={formError ? 'new-comment-error' : undefined}
          />
          {formError && (
            <p id="new-comment-error" className="error-text">
              {formError}
            </p>
          )}
        </div>
        <div className="composer-actions">
          <button type="submit" className="btn btn-primary" disabled={submitting}>
            {submitting ? 'Posting…' : 'Post comment'}
          </button>
        </div>
      </form>
    </section>
  );
}
