import { useNavigate } from 'react-router-dom';
import { createArticle, type ArticleInput } from '../api.ts';
import ArticleForm from '../components/ArticleForm.tsx';
import PageBar from '../components/PageBar.tsx';

export default function CreateArticlePage() {
  const navigate = useNavigate();

  async function handleSubmit(values: ArticleInput) {
    const created = await createArticle(values);
    navigate(`/articles/${created.articleId}`, { replace: true });
  }

  return (
    <>
      <PageBar crumbs={[{ label: 'All articles', to: '/' }, { label: 'New article' }]} />
      <div className="doc">
        <h1 className="visually-hidden">New article</h1>
        <ArticleForm submitLabel="Create article" onSubmit={handleSubmit} onCancel={() => navigate('/')} />
      </div>
    </>
  );
}
