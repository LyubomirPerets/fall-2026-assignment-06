import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getArticles, type Article } from '../api.ts';
import StatusMessage from '../components/StatusMessage.tsx';

const PREVIEW_LENGTH = 150;
const SEARCH_DEBOUNCE_MS = 300;

function preview(text: string): string {
  return text.length > PREVIEW_LENGTH ? `${text.slice(0, PREVIEW_LENGTH).trimEnd()}…` : text;
}

export default function ArticleListPage() {
  const [search, setSearch] = useState('');
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Re-fetch from the API whenever the search text changes (debounced while typing).
  useEffect(() => {
    let ignore = false;
    const timer = setTimeout(
      () => {
        setLoading(true);
        setError(null);
        getArticles(search)
          .then((data) => {
            if (!ignore) setArticles(data);
          })
          .catch((err: Error) => {
            if (!ignore) setError(err.message);
          })
          .finally(() => {
            if (!ignore) setLoading(false);
          });
      },
      search ? SEARCH_DEBOUNCE_MS : 0,
    );
    return () => {
      ignore = true;
      clearTimeout(timer);
    };
  }, [search]);

  const trimmedSearch = search.trim();

  return (
    <section>
      <div className="page-header">
        <h1>All Articles</h1>
        <Link to="/articles/new" className="btn btn-primary">
          New Article
        </Link>
      </div>

      <label className="search">
        <span className="visually-hidden">Search articles by title</span>
        <input
          type="search"
          className="input"
          placeholder="Search by title…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </label>

      {error ? (
        <StatusMessage kind="error">Could not load articles: {error}</StatusMessage>
      ) : loading && articles.length === 0 ? (
        <StatusMessage kind="loading">Loading articles…</StatusMessage>
      ) : articles.length === 0 ? (
        <StatusMessage kind="empty">
          {trimmedSearch
            ? `No articles match “${trimmedSearch}”.`
            : 'No articles yet. Create the first one!'}
        </StatusMessage>
      ) : (
        <ul className="article-list" aria-busy={loading}>
          {articles.map((article) => (
            <li key={article.articleId} className="card">
              <h2 className="card-title">
                <Link to={`/articles/${article.articleId}`}>{article.title}</Link>
              </h2>
              <p className="card-preview">{preview(article.contents)}</p>
              <Link to={`/articles/${article.articleId}`} className="btn btn-ghost">
                Read more
              </Link>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
