import { useLayoutEffect, useRef, useState, type FormEvent } from 'react';
import type { ArticleInput } from '../api.ts';

type ArticleFormProps = {
  initialValues?: ArticleInput;
  submitLabel: string;
  onSubmit: (values: ArticleInput) => Promise<void>;
  onCancel: () => void;
};

type FieldErrors = Partial<Record<keyof ArticleInput, string>>;

export default function ArticleForm({
  initialValues = { title: '', contents: '' },
  submitLabel,
  onSubmit,
  onCancel,
}: ArticleFormProps) {
  const [title, setTitle] = useState(initialValues.title);
  const [contents, setContents] = useState(initialValues.contents);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // The title is a one-line textarea that grows, so long titles wrap like headings.
  const titleRef = useRef<HTMLTextAreaElement>(null);
  useLayoutEffect(() => {
    const el = titleRef.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = `${el.scrollHeight}px`;
  }, [title]);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const values = { title: title.trim(), contents: contents.trim() };

    const newErrors: FieldErrors = {};
    if (!values.title) newErrors.title = 'Title is required.';
    if (!values.contents) newErrors.contents = 'Contents are required.';
    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    setSubmitting(true);
    setSubmitError(null);
    try {
      await onSubmit(values);
    } catch (err) {
      setSubmitError((err as Error).message);
      setSubmitting(false);
    }
  }

  return (
    <form className="editor" onSubmit={handleSubmit} noValidate>
      <div className="editor-field">
        <label htmlFor="article-title" className="visually-hidden">
          Title
        </label>
        <textarea
          ref={titleRef}
          id="article-title"
          className="editor-title"
          placeholder="Untitled"
          rows={1}
          value={title}
          onKeyDown={(e) => {
            // A title is one line: Enter moves on to the body instead of adding a newline.
            if (e.key === 'Enter') {
              e.preventDefault();
              document.getElementById('article-contents')?.focus();
            }
          }}
          onChange={(e) => {
            setTitle(e.target.value.replace(/\n/g, ' '));
            setErrors((prev) => ({ ...prev, title: undefined }));
          }}
          aria-invalid={Boolean(errors.title)}
          aria-describedby={errors.title ? 'article-title-error' : undefined}
        />
        {errors.title && (
          <p id="article-title-error" className="error-text">
            {errors.title}
          </p>
        )}
      </div>

      <div className="editor-field">
        <label htmlFor="article-contents" className="visually-hidden">
          Contents
        </label>
        <textarea
          id="article-contents"
          className="editor-body"
          placeholder="Start writing…"
          rows={12}
          value={contents}
          onChange={(e) => {
            setContents(e.target.value);
            setErrors((prev) => ({ ...prev, contents: undefined }));
          }}
          aria-invalid={Boolean(errors.contents)}
          aria-describedby={errors.contents ? 'article-contents-error' : undefined}
        />
        {errors.contents && (
          <p id="article-contents-error" className="error-text">
            {errors.contents}
          </p>
        )}
      </div>

      {submitError && (
        <p className="status status--error" role="alert">
          Could not save article: {submitError}
        </p>
      )}

      <div className="editor-actions">
        <button type="submit" className="btn btn-primary" disabled={submitting}>
          {submitting ? 'Saving…' : submitLabel}
        </button>
        <button type="button" className="btn btn-quiet" onClick={onCancel} disabled={submitting}>
          Cancel
        </button>
      </div>
    </form>
  );
}
