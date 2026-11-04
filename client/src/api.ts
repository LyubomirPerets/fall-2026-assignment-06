export const API_URL = 'http://localhost:8080';

export type Article = {
  articleId: number;
  title: string;
  contents: string;
};

export type Comment = {
  commentId: number;
  articleId: number;
  body: string;
};

export type ArticleInput = Pick<Article, 'title' | 'contents'>;

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  let res: Response;
  try {
    res = await fetch(`${API_URL}${path}`, {
      ...options,
      headers: { 'Content-Type': 'application/json', ...options.headers },
    });
  } catch {
    // fetch only rejects when the server can't be reached at all.
    throw new Error('Can’t reach the server. Check that the API is running, then try again.');
  }

  if (!res.ok) {
    // Some error responses have a JSON { error } body, others (e.g. bare 400) have none.
    let message = `Request failed (${res.status})`;
    try {
      const data = await res.json();
      if (data?.error) message = data.error;
    } catch {
      // no JSON body; keep the default message
    }
    throw new Error(message);
  }

  return res.json() as Promise<T>;
}

// --- Articles ---

export function getArticles(titleContains?: string): Promise<Article[]> {
  const query = titleContains?.trim()
    ? `?${new URLSearchParams({ title_contains: titleContains.trim() })}`
    : '';
  return request<Article[]>(`/articles${query}`);
}

export function getArticle(articleId: number): Promise<Article> {
  return request<Article>(`/articles/${articleId}`);
}

export function createArticle(input: ArticleInput): Promise<Article> {
  return request<Article>('/articles', {
    method: 'POST',
    body: JSON.stringify(input),
  });
}

export function updateArticle(
  articleId: number,
  input: Partial<ArticleInput>,
): Promise<Article> {
  return request<Article>(`/articles/${articleId}`, {
    method: 'PUT',
    body: JSON.stringify(input),
  });
}

export function deleteArticle(articleId: number): Promise<Article> {
  return request<Article>(`/articles/${articleId}`, { method: 'DELETE' });
}

// --- Comments ---

export function getComments(articleId: number): Promise<Comment[]> {
  return request<Comment[]>(`/articles/${articleId}/comments`);
}

export function createComment(articleId: number, body: string): Promise<Comment> {
  return request<Comment>(`/articles/${articleId}/comments`, {
    method: 'POST',
    body: JSON.stringify({ body }),
  });
}

export function updateComment(
  articleId: number,
  commentId: number,
  body: string,
): Promise<Comment> {
  return request<Comment>(`/articles/${articleId}/comments/${commentId}`, {
    method: 'PUT',
    body: JSON.stringify({ body }),
  });
}

export function deleteComment(articleId: number, commentId: number): Promise<Comment> {
  return request<Comment>(`/articles/${articleId}/comments/${commentId}`, {
    method: 'DELETE',
  });
}
