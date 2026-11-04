import { useNavigate } from 'react-router-dom';
import { createArticle, type ArticleInput } from '../api.ts';
import ArticleForm from '../components/ArticleForm.tsx';

export default function CreateArticlePage() {
  const navigate = useNavigate();

  async function handleSubmit(values: ArticleInput) {
    const created = await createArticle(values);
    navigate(`/articles/${created.articleId}`, { replace: true });
  }

  return (
    <section>
      <h1>New Article</h1>
      <ArticleForm submitLabel="Create Article" onSubmit={handleSubmit} onCancel={() => navigate('/')} />
    </section>
  );
}
