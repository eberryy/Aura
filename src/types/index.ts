export type FolderType = "tech" | "life" | "private";
export type ContentType = "article" | "video";
export type ThemeMode = "light" | "dark";

export interface Folder {
  id: string;
  title: string;
  description?: string;
  type: FolderType;
  is_private: boolean;
  cover_image?: string;
  icon?: string;
  post_count: number;
  created_at: string;
  updated_at: string;
}

export interface Post {
  id: string;
  folder_id: string;
  title: string;
  content: string;
  content_type: ContentType;
  summary?: string;
  cover_image?: string;
  video_url?: string;
  video_description?: string;
  tags: string[];
  is_pinned: boolean;
  is_draft: boolean;
  view_count: number;
  created_at: string;
  updated_at: string;
}

export interface Comment {
  id: string;
  post_id: string;
  parent_id: string | null;
  author_name: string;
  author_avatar?: string;
  anonymous_id?: string;
  content: string;
  is_admin: boolean;
  is_author?: boolean;
  depth?: number;
  created_at: string;
  updated_at: string;
  replies?: Comment[];
}

export interface User {
  id: string;
  username: string;
  display_name: string;
  avatar?: string;
  bio?: string;
  role: "admin" | "user";
  created_at: string;
}

export interface PageMetadata {
  title: string;
  description?: string;
  ogImage?: string;
}

export interface ApiResponse<T> {
  data: T | null;
  error: string | null;
  status: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}
