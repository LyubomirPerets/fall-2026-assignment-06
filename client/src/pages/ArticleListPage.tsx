import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getArticles, type Article } from '../api.ts';
import { DocIcon, PlusIcon, SearchIcon } from '../components/Icons.tsx';
import PageBar from '../components/PageBar.tsx';
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
  const count = articles.length;

  return (
    <>
      <PageBar crumbs={[{ label: 'All articles' }]}>
        <Link to="/articles/new" className="btn btn-primary">
          <PlusIcon />
          New article
        </Link>
      </PageBar>

      <div className="doc">
        <h1 className="doc-title">All articles</h1>
        <p className="doc-meta">
          {error || (loading && count === 0)
            ? ' '
            : trimmedSearch
              ? `${count} ${count === 1 ? 'result' : 'results'} for “${trimmedSearch}”`
              : `${count} ${count === 1 ? 'article' : 'articles'}`}
        </p>

        <label className="search">
          <SearchIcon />
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
        ) : loading && count === 0 ? (
          <StatusMessage kind="loading">Loading articles…</StatusMessage>
        ) : count === 0 ? (
          <StatusMessage kind="empty">
            {trimmedSearch
              ? `No articles match “${trimmedSearch}”.`
              : 'No articles yet. Create the first one!'}
          </StatusMessage>
        ) : (
          <ul className="article-list" aria-busy={loading}>
            {articles.map((article) => (
              <li key={article.articleId} className="article-row">
                <DocIcon />
                <div className="article-row-text">
                  <h2 className="article-row-title">
                    <Link to={`/articles/${article.articleId}`}>{article.title}</Link>
                  </h2>
                  <p className="article-row-preview">{preview(article.contents)}</p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </>
  );
}
