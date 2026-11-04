import type { ReactNode } from 'react';

type StatusMessageProps = {
  kind: 'loading' | 'error' | 'empty';
  children: ReactNode;
};

export default function StatusMessage({ kind, children }: StatusMessageProps) {
  return (
    <p className={`status status--${kind}`} role={kind === 'error' ? 'alert' : 'status'}>
      {children}
    </p>
  );
}
