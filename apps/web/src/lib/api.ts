const API_URL = import.meta.env.VITE_API_URL as string;

export type User = {
  name: string;
};

export type PageSummary = {
  id: number;
  slug: string;
  title: string;
  updated_at: string;
  updated_by: string | null;
  published: number;
};

export type InfoboxRow = {
  label: string;
  value: string;
  links?: (string | null)[];
  /** @deprecated legacy single-link format from before auto-linking; still rendered for old pages */
  link?: string;
};
export type Infobox = { image?: string; rows: InfoboxRow[] };
export type PageCategory = { name: string; slug: string };

export type Page = PageSummary & {
  content: string;
  content_text: string;
  infobox: string | null;
  categories: PageCategory[];
  created_by: string | null;
  created_at: string;
};

export type Revision = {
  id: number;
  edited_by: string | null;
  edited_at: string;
};

export type Category = {
  name: string;
  slug: string;
  page_count: number;
};

export type CategoryPageSummary = PageSummary & { image: string | null };

export type CategoryDetail = {
  name: string;
  slug: string;
  pages: CategoryPageSummary[];
};

export type SearchResult = {
  slug: string;
  title: string;
  snippet: string;
};

class ApiError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    ...init,
    credentials: "include",
    headers: {
      ...(init?.body && !(init.body instanceof FormData) ? { "Content-Type": "application/json" } : {}),
      ...init?.headers,
    },
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({ error: res.statusText }));
    throw new ApiError(res.status, body.error ?? res.statusText);
  }
  if (res.status === 204) return undefined as T;
  return res.json();
}

export const api = {
  listPages: () => request<PageSummary[]>("/api/pages"),
  getPage: (slug: string) => request<Page>(`/api/pages/${encodeURIComponent(slug)}`),
  getHistory: (slug: string) => request<Revision[]>(`/api/pages/${encodeURIComponent(slug)}/history`),
  createPage: (data: {
    title: string;
    slug?: string;
    content: string;
    infobox?: Infobox | null;
    categories?: string[];
    published?: boolean;
  }) => request<Page>("/api/pages", { method: "POST", body: JSON.stringify(data) }),
  updatePage: (
    slug: string,
    data: { title: string; content: string; infobox?: Infobox | null; categories?: string[]; published?: boolean }
  ) => request<Page>(`/api/pages/${encodeURIComponent(slug)}`, { method: "PUT", body: JSON.stringify(data) }),
  deletePage: (slug: string) =>
    request<{ ok: true }>(`/api/pages/${encodeURIComponent(slug)}`, { method: "DELETE" }),
  uploadImage: (file: File) => {
    const form = new FormData();
    form.append("file", file);
    return request<{ key: string; url: string }>("/api/images", { method: "POST", body: form });
  },
  imageUrl: (key: string) => `${API_URL}/api/images/${key}`,
  me: () => request<User>("/api/auth/me"),
  login: (name: string, password: string) =>
    request<User>("/api/auth/login", { method: "POST", body: JSON.stringify({ name, password }) }),
  logout: () => request<{ ok: true }>("/api/auth/logout", { method: "POST" }),
  listCategories: () => request<Category[]>("/api/categories"),
  getCategory: (slug: string) => request<CategoryDetail>(`/api/categories/${encodeURIComponent(slug)}`),
  renameCategory: (slug: string, name: string) =>
    request<{ name: string; slug: string }>(`/api/categories/${encodeURIComponent(slug)}`, {
      method: "PATCH",
      body: JSON.stringify({ name }),
    }),
  deleteCategory: (slug: string) =>
    request<{ ok: true }>(`/api/categories/${encodeURIComponent(slug)}`, { method: "DELETE" }),
  search: (q: string) => request<SearchResult[]>(`/api/search?q=${encodeURIComponent(q)}`),
};

export { ApiError };
