import { useState, type FormEvent } from 'react';
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
    <form className="form" onSubmit={handleSubmit} noValidate>
      <div className="form-field">
        <label htmlFor="article-title">Title</label>
        <input
          id="article-title"
          className="input"
          value={title}
          onChange={(e) => {
            setTitle(e.target.value);
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

      <div className="form-field">
        <label htmlFor="article-contents">Contents</label>
        <textarea
          id="article-contents"
          className="input"
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
        <p className="error-text" role="alert">
          Could not save article: {submitError}
        </p>
      )}

      <div className="form-actions">
        <button type="submit" className="btn btn-primary" disabled={submitting}>
          {submitting ? 'Saving…' : submitLabel}
        </button>
        <button type="button" className="btn btn-ghost" onClick={onCancel} disabled={submitting}>
          Cancel
        </button>
      </div>
    </form>
  );
}
