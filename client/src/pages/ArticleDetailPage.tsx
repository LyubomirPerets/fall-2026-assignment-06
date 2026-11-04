import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { deleteArticle } from '../api.ts';
import CommentSection from '../components/CommentSection.tsx';
import StatusMessage from '../components/StatusMessage.tsx';
import { useArticle } from '../hooks/useArticle.ts';

export default function ArticleDetailPage() {
  const articleId = Number(useParams().articleId);
  const { article, loading, error } = useArticle(articleId);
  const navigate = useNavigate();
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  async function handleDelete() {
    if (!window.confirm('Delete this article and all of its comments?')) return;
    setDeleting(true);
    setDeleteError(null);
    try {
      await deleteArticle(articleId);
      navigate('/', { replace: true });
    } catch (err) {
      setDeleteError((err as Error).message);
      setDeleting(false);
    }
  }

  return (
    <section>
      <Link to="/" className="back-link">
        ← All articles
      </Link>

      {loading ? (
        <StatusMessage kind="loading">Loading article…</StatusMessage>
      ) : error || !article ? (
        <StatusMessage kind="error">Could not load article: {error}</StatusMessage>
      ) : (
        <article>
          <div className="page-header">
            <h1>{article.title}</h1>
            <div className="actions">
              <Link to={`/articles/${articleId}/edit`} className="btn btn-ghost">
                Edit
              </Link>
              <button type="button" className="btn btn-danger" onClick={handleDelete} disabled={deleting}>
                {deleting ? 'Deleting…' : 'Delete'}
              </button>
            </div>
          </div>
          {deleteError && (
            <StatusMessage kind="error">Could not delete article: {deleteError}</StatusMessage>
          )}
          <div className="article-body">{article.contents}</div>
          <CommentSection articleId={articleId} />
        </article>
      )}
    </section>
  );
}
