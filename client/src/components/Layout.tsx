import { Link, Outlet } from 'react-router-dom';

export default function Layout() {
  return (
    <>
      <header className="site-header">
        <div className="container">
          <Link to="/" className="site-title">
            Articles
          </Link>
        </div>
      </header>
      <main className="container">
        <Outlet />
      </main>
    </>
  );
}
