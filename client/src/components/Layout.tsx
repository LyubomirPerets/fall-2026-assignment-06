import { useEffect, useState } from 'react';
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom';
import { getArticles, type Article } from '../api.ts';
import { DocIcon, ListIcon, PlusIcon } from './Icons.tsx';

export default function Layout() {
  const { pathname } = useLocation();
  const [articles, setArticles] = useState<Article[] | null>(null);
  const [error, setError] = useState(false);

  // Refresh the sidebar's page list on every navigation, so creates,
  // title edits and deletes show up as soon as the user lands somewhere new.
  useEffect(() => {
    let ignore = false;
    getArticles()
      .then((data) => {
        if (!ignore) {
          setArticles(data);
          setError(false);
        }
      })
      .catch(() => {
        if (!ignore) setError(true);
      });
    return () => {
      ignore = true;
    };
  }, [pathname]);

  return (
    <div className="app">
      <aside className="sidebar">
        <Link to="/" className="workspace">
          <span className="workspace-mark" aria-hidden="true">
            A
          </span>
          Articles
        </Link>

        <nav className="sidebar-nav" aria-label="Main">
          <NavLink to="/" end className="sidebar-item">
            <ListIcon />
            All articles
          </NavLink>
          <NavLink to="/articles/new" className="sidebar-item">
            <PlusIcon />
            New article
          </NavLink>
        </nav>

        <nav className="sidebar-pages" aria-labelledby="pages-heading">
          <h2 id="pages-heading" className="sidebar-heading">
            Pages
          </h2>
          {error ? (
            <p className="sidebar-note">Couldn’t load pages.</p>
          ) : articles === null ? (
            <p className="sidebar-note">Loading…</p>
          ) : articles.length === 0 ? (
            <p className="sidebar-note">No pages yet.</p>
          ) : (
            <ul className="sidebar-list">
              {articles.map((article) => (
                <li key={article.articleId}>
                  <NavLink to={`/articles/${article.articleId}`} className="sidebar-item">
                    <DocIcon />
                    <span className="truncate">{article.title}</span>
                  </NavLink>
                </li>
              ))}
            </ul>
          )}
        </nav>
      </aside>

      <main className="main">
        <Outlet />
      </main>
    </div>
  );
}
