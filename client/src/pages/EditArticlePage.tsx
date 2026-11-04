import { Link, useNavigate, useParams } from 'react-router-dom';
import { updateArticle, type ArticleInput } from '../api.ts';
import ArticleForm from '../components/ArticleForm.tsx';
import StatusMessage from '../components/StatusMessage.tsx';
import { useArticle } from '../hooks/useArticle.ts';

export default function EditArticlePage() {
  const articleId = Number(useParams().articleId);
  const { article, loading, error } = useArticle(articleId);
  const navigate = useNavigate();
  const detailPath = `/articles/${articleId}`;

  async function handleSubmit(values: ArticleInput) {
    await updateArticle(articleId, values);
    navigate(detailPath, { replace: true });
  }

  return (
    <section>
      <Link to={detailPath} className="back-link">
        ← Back to article
      </Link>
      <h1>Edit Article</h1>

      {loading ? (
        <StatusMessage kind="loading">Loading article…</StatusMessage>
      ) : error || !article ? (
        <StatusMessage kind="error">Could not load article: {error}</StatusMessage>
      ) : (
        // Rendered only once the article has loaded, so the form's state starts pre-populated.
        <ArticleForm
          initialValues={{ title: article.title, contents: article.contents }}
          submitLabel="Save Changes"
          onSubmit={handleSubmit}
          onCancel={() => navigate(detailPath)}
        />
      )}
    </section>
  );
}
