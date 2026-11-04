import { Link } from 'react-router-dom';
import PageBar from '../components/PageBar.tsx';

export default function NotFoundPage() {
  return (
    <>
      <PageBar crumbs={[{ label: 'All articles', to: '/' }, { label: 'Not found' }]} />
      <div className="doc">
        <h1 className="doc-title">Page not found</h1>
        <p className="doc-meta">There’s nothing at this address.</p>
        <Link to="/" className="btn btn-quiet">
          Back to all articles
        </Link>
      </div>
    </>
  );
}
