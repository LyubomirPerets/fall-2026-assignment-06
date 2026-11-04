import { useEffect, useState } from 'react';
import { getArticle, type Article } from '../api.ts';

type UseArticleResult = {
  article: Article | null;
  loading: boolean;
  error: string | null;
};

// Loads a single article by id, tracking loading and error state.
export function useArticle(articleId: number): UseArticleResult {
  const [article, setArticle] = useState<Article | null>(null);
  const [error, setError] = useState<string | null>(null);
  const validId = Number.isInteger(articleId);

  useEffect(() => {
    if (!validId) return;
    let ignore = false;
    getArticle(articleId)
      .then((data) => {
        if (!ignore) setArticle(data);
      })
      .catch((err: Error) => {
        if (!ignore) setError(err.message);
      });
    return () => {
      ignore = true;
    };
  }, [articleId, validId]);

  if (!validId) return { article: null, loading: false, error: 'Invalid article id' };

  // Ignore a previously loaded article if the id has since changed.
  const current = article?.articleId === articleId ? article : null;
  return { article: current, loading: !current && !error, error };
}
