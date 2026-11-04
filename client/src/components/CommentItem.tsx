import { useState, type FormEvent } from 'react';
import { deleteComment, updateComment, type Comment } from '../api.ts';

type CommentItemProps = {
  articleId: number;
  comment: Comment;
  onUpdated: (comment: Comment) => void;
  onDeleted: (commentId: number) => void;
};

export default function CommentItem({ articleId, comment, onUpdated, onDeleted }: CommentItemProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [draft, setDraft] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState<'saving' | 'deleting' | null>(null);

  function startEditing() {
    setDraft(comment.body);
    setError(null);
    setIsEditing(true);
  }

  function cancelEditing() {
    setIsEditing(false);
    setError(null);
  }

  async function handleSave(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const body = draft.trim();
    if (!body) {
      setError('Comment cannot be empty.');
      return;
    }
    setBusy('saving');
    setError(null);
    try {
      const updated = await updateComment(articleId, comment.commentId, body);
      onUpdated(updated);
      setIsEditing(false);
    } catch (err) {
      setError(`Could not save comment: ${(err as Error).message}`);
    } finally {
      setBusy(null);
    }
  }

  async function handleDelete() {
    if (!window.confirm('Delete this comment?')) return;
    setBusy('deleting');
    setError(null);
    try {
      await deleteComment(articleId, comment.commentId);
      onDeleted(comment.commentId);
    } catch (err) {
      setError(`Could not delete comment: ${(err as Error).message}`);
      setBusy(null);
    }
  }

  if (isEditing) {
    const textareaId = `edit-comment-${comment.commentId}`;
    return (
      <li className="comment comment--editing">
        <form className="form" onSubmit={handleSave} noValidate>
          <label htmlFor={textareaId} className="visually-hidden">
            Edit comment
          </label>
          <textarea
            id={textareaId}
            className="input"
            rows={3}
            autoFocus
            value={draft}
            onChange={(e) => {
              setDraft(e.target.value);
              setError(null);
            }}
            onKeyDown={(e) => {
              if (e.key === 'Escape') cancelEditing();
            }}
            aria-invalid={Boolean(error)}
          />
          {error && <p className="error-text">{error}</p>}
          <div className="form-actions">
            <button type="submit" className="btn btn-primary btn-sm" disabled={busy !== null}>
              {busy === 'saving' ? 'Saving…' : 'Save'}
            </button>
            <button type="button" className="btn btn-ghost btn-sm" onClick={cancelEditing} disabled={busy !== null}>
              Cancel
            </button>
          </div>
        </form>
      </li>
    );
  }

  return (
    <li className="comment">
      <p className="comment-body">{comment.body}</p>
      {error && (
        <p className="error-text" role="alert">
          {error}
        </p>
      )}
      <div className="actions">
        <button type="button" className="btn btn-ghost btn-sm" onClick={startEditing} disabled={busy !== null}>
          Edit
        </button>
        <button type="button" className="btn btn-danger btn-sm" onClick={handleDelete} disabled={busy !== null}>
          {busy === 'deleting' ? 'Deleting…' : 'Delete'}
        </button>
      </div>
    </li>
  );
}
