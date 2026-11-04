import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';

type Crumb = { label: string; to?: string };

type PageBarProps = {
  crumbs: Crumb[];
  children?: ReactNode;
};

// Top bar of the main area: where you are on the left, page actions on the right.
export default function PageBar({ crumbs, children }: PageBarProps) {
  return (
    <div className="pagebar">
      <nav aria-label="Breadcrumb" className="crumbs-nav">
        <ol className="crumbs">
          {crumbs.map((crumb, i) => (
            <li key={i}>
              {crumb.to ? (
                <Link to={crumb.to} title={crumb.label}>
                  {crumb.label}
                </Link>
              ) : (
                <span aria-current="page" title={crumb.label}>
                  {crumb.label}
                </span>
              )}
            </li>
          ))}
        </ol>
      </nav>
      {children && <div className="pagebar-actions">{children}</div>}
    </div>
  );
}
