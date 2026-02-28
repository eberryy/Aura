import {
  Folder,
  Post,
  Comment,
  User,
  ApiResponse,
  PaginatedResponse,
} from "@/types";
import { getStorageItem, setStorageItem, STORAGE_KEYS } from "@/lib/storage";
import { buildCommentTree } from "@/lib/commentTree";

const mockFolders: Folder[] = [
  {
    id: "1",
    title: "技术札记",
    description: "前端开发、后端架构、技术思考",
    type: "tech",
    is_private: false,
    icon: "code-2",
    post_count: 12,
    created_at: "2024-01-01T00:00:00Z",
    updated_at: "2024-01-15T00:00:00Z",
  },
  {
    id: "2",
    title: "生活随笔",
    description: "日常记录、摄影、旅行",
    type: "life",
    is_private: false,
    icon: "camera",
    post_count: 8,
    created_at: "2024-01-02T00:00:00Z",
    updated_at: "2024-01-10T00:00:00Z",
  },
  {
    id: "3",
    title: "树洞",
    description: "只属于自己的秘密空间",
    type: "private",
    is_private: true,
    icon: "lock",
    post_count: 5,
    created_at: "2024-01-03T00:00:00Z",
    updated_at: "2024-01-12T00:00:00Z",
  },
];

const mockPosts: Post[] = [
  {
    id: "1",
    folder_id: "1",
    title: "Next.js 15 新特性探索",
    content: `# Next.js 15 新特性探索

Next.js 15 带来了许多令人兴奋的新特性...

## 主要更新

### 1. 改进的 App Router
- 更快的路由切换
- 更好的错误处理

### 2. 服务端组件优化
- 流式渲染增强
- 更小的打包体积

## 总结

这次更新让 Next.js 变得更加强大和易用。`,
    content_type: "article",
    summary: "探索 Next.js 15 的最新特性",
    tags: ["Next.js", "React", "前端"],
    is_pinned: true,
    is_draft: false,
    view_count: 1234,
    created_at: "2024-01-15T10:00:00Z",
    updated_at: "2024-01-15T10:00:00Z",
  },
  {
    id: "2",
    folder_id: "1",
    title: "TypeScript 高级类型技巧",
    content: `# TypeScript 高级类型技巧

深入探讨 TypeScript 的高级类型系统...`,
    content_type: "article",
    summary: "TypeScript 类型体操入门",
    tags: ["TypeScript", "前端"],
    is_pinned: false,
    is_draft: false,
    view_count: 567,
    created_at: "2024-01-10T14:00:00Z",
    updated_at: "2024-01-10T14:00:00Z",
  },
  {
    id: "3",
    folder_id: "2",
    title: "冬日摄影记录",
    content: `# 冬日摄影记录

记录这个冬天的美好瞬间...`,
    content_type: "article",
    summary: "冬日风景摄影作品",
    tags: ["摄影", "生活"],
    is_pinned: false,
    is_draft: false,
    view_count: 890,
    created_at: "2024-01-08T18:00:00Z",
    updated_at: "2024-01-08T18:00:00Z",
  },
];

const initialComments: Comment[] = [
  {
    id: "1",
    post_id: "1",
    parent_id: null,
    author_name: "访客A",
    content: "写得真好，期待更多内容！",
    is_admin: false,
    created_at: "2024-01-15T12:00:00Z",
    updated_at: "2024-01-15T12:00:00Z",
    replies: [
      {
        id: "2",
        post_id: "1",
        parent_id: "1",
        author_name: "博主",
        content: "感谢支持！会继续更新的~",
        is_admin: true,
        created_at: "2024-01-15T13:00:00Z",
        updated_at: "2024-01-15T13:00:00Z",
      },
    ],
  },
  {
    id: "3",
    post_id: "1",
    parent_id: null,
    author_name: "访客B",
    content: "这个特性在实际项目中怎么应用？",
    is_admin: false,
    created_at: "2024-01-15T14:00:00Z",
    updated_at: "2024-01-15T14:00:00Z",
  },
];

function getStoredFolders(): Folder[] {
  return getStorageItem<Folder[]>(STORAGE_KEYS.FOLDERS, mockFolders);
}

function setStoredFolders(folders: Folder[]): void {
  setStorageItem(STORAGE_KEYS.FOLDERS, folders);
}

function getStoredPosts(): Post[] {
  return getStorageItem<Post[]>(STORAGE_KEYS.POSTS, mockPosts);
}

function setStoredPosts(posts: Post[]): void {
  setStorageItem(STORAGE_KEYS.POSTS, posts);
}

function getStoredComments(): Comment[] {
  return getStorageItem<Comment[]>(STORAGE_KEYS.COMMENTS, initialComments);
}

function setStoredComments(comments: Comment[]): void {
  setStorageItem(STORAGE_KEYS.COMMENTS, comments);
}

function initializeStorage(): void {
  if (typeof window === "undefined") return;

  const storedFolders = localStorage.getItem(STORAGE_KEYS.FOLDERS);
  if (!storedFolders) {
    setStoredFolders(mockFolders);
  }

  const storedPosts = localStorage.getItem(STORAGE_KEYS.POSTS);
  if (!storedPosts) {
    setStoredPosts(mockPosts);
  }

  const storedComments = localStorage.getItem(STORAGE_KEYS.COMMENTS);
  if (!storedComments) {
    setStoredComments(initialComments);
  }
}

if (typeof window !== "undefined") {
  initializeStorage();
}

const mockUser: User = {
  id: "1",
  username: "aura",
  display_name: "Aura",
  avatar: "/avatar.png",
  bio: "前端开发者 / 摄影师 / 旅行爱好者",
  role: "admin",
  created_at: "2024-01-01T00:00:00Z",
};

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export const folderService = {
  async getAll(includePrivate = false): Promise<ApiResponse<Folder[]>> {
    await delay(300);
    let folders = getStoredFolders();
    if (!includePrivate) {
      folders = folders.filter((f) => !f.is_private);
    }
    return { data: folders, error: null, status: 200 };
  },

  async getById(id: string): Promise<ApiResponse<Folder>> {
    await delay(200);
    const folders = getStoredFolders();
    const folder = folders.find((f) => f.id === id);
    if (!folder) {
      return { data: null, error: "Folder not found", status: 404 };
    }
    return { data: folder, error: null, status: 200 };
  },

  async create(data: Partial<Folder>): Promise<ApiResponse<Folder>> {
    await delay(300);
    const newFolder: Folder = {
      id: String(Date.now()),
      title: data.title || "",
      description: data.description || "",
      type: data.type || "tech",
      is_private: data.is_private || false,
      icon: data.icon,
      post_count: 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const folders = getStoredFolders();
    folders.push(newFolder);
    setStoredFolders(folders);

    return { data: newFolder, error: null, status: 201 };
  },

  async update(
    id: string,
    data: Partial<Folder>,
  ): Promise<ApiResponse<Folder>> {
    await delay(300);
    const folders = getStoredFolders();
    const index = folders.findIndex((f) => f.id === id);

    if (index === -1) {
      return { data: null, error: "Folder not found", status: 404 };
    }

    const updatedFolder: Folder = {
      ...folders[index],
      ...data,
      updated_at: new Date().toISOString(),
    };

    folders[index] = updatedFolder;
    setStoredFolders(folders);

    return { data: updatedFolder, error: null, status: 200 };
  },

  async delete(id: string): Promise<ApiResponse<boolean>> {
    await delay(300);

    const folders = getStoredFolders();
    const filteredFolders = folders.filter((f) => f.id !== id);
    setStoredFolders(filteredFolders);

    const posts = getStoredPosts();
    const filteredPosts = posts.filter((p) => p.folder_id !== id);
    setStoredPosts(filteredPosts);

    return { data: true, error: null, status: 200 };
  },
};

export const postService = {
  async getByFolderId(
    folderId: string,
    page = 1,
    pageSize = 10,
  ): Promise<ApiResponse<PaginatedResponse<Post>>> {
    await delay(300);
    const posts = getStoredPosts();
    let filteredPosts = posts.filter((p) => p.folder_id === folderId);
    const total = filteredPosts.length;
    const start = (page - 1) * pageSize;
    const paginatedPosts = filteredPosts.slice(start, start + pageSize);

    return {
      data: {
        data: paginatedPosts,
        total,
        page,
        pageSize,
        hasMore: start + pageSize < total,
      },
      error: null,
      status: 200,
    };
  },

  async getAll(
    folderId?: string,
    page = 1,
    pageSize = 10,
  ): Promise<ApiResponse<PaginatedResponse<Post>>> {
    await delay(300);
    const posts = getStoredPosts();
    let filteredPosts = folderId
      ? posts.filter((p) => p.folder_id === folderId)
      : posts;
    const total = filteredPosts.length;
    const start = (page - 1) * pageSize;
    const paginatedPosts = filteredPosts.slice(start, start + pageSize);

    return {
      data: {
        data: paginatedPosts,
        total,
        page,
        pageSize,
        hasMore: start + pageSize < total,
      },
      error: null,
      status: 200,
    };
  },

  async getById(id: string): Promise<ApiResponse<Post>> {
    await delay(200);
    const posts = getStoredPosts();
    const post = posts.find((p) => p.id === id);
    if (!post) {
      return { data: null, error: "Post not found", status: 404 };
    }
    return { data: post, error: null, status: 200 };
  },

  async create(data: Partial<Post>): Promise<ApiResponse<Post>> {
    await delay(300);
    const newPost: Post = {
      id: String(Date.now()),
      folder_id: data.folder_id || "",
      title: data.title || "",
      content: data.content || "",
      content_type: data.content_type || "article",
      summary: data.summary,
      cover_image: data.cover_image,
      video_url: data.video_url,
      video_description: data.video_description,
      tags: data.tags || [],
      is_pinned: data.is_pinned || false,
      is_draft: data.is_draft || false,
      view_count: 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const posts = getStoredPosts();
    posts.push(newPost);
    setStoredPosts(posts);

    const folders = getStoredFolders();
    const folderIndex = folders.findIndex((f) => f.id === newPost.folder_id);
    if (folderIndex !== -1) {
      folders[folderIndex].post_count += 1;
      setStoredFolders(folders);
    }

    return { data: newPost, error: null, status: 201 };
  },

  async update(id: string, data: Partial<Post>): Promise<ApiResponse<Post>> {
    await delay(300);
    const posts = getStoredPosts();
    const index = posts.findIndex((p) => p.id === id);

    if (index === -1) {
      return { data: null, error: "Post not found", status: 404 };
    }

    const updatedPost: Post = {
      ...posts[index],
      ...data,
      updated_at: new Date().toISOString(),
    };

    posts[index] = updatedPost;
    setStoredPosts(posts);

    return { data: updatedPost, error: null, status: 200 };
  },

  async delete(id: string): Promise<ApiResponse<boolean>> {
    await delay(300);

    const posts = getStoredPosts();
    const post = posts.find((p) => p.id === id);

    if (post) {
      const folders = getStoredFolders();
      const folderIndex = folders.findIndex((f) => f.id === post.folder_id);
      if (folderIndex !== -1 && folders[folderIndex].post_count > 0) {
        folders[folderIndex].post_count -= 1;
        setStoredFolders(folders);
      }
    }

    const filteredPosts = posts.filter((p) => p.id !== id);
    setStoredPosts(filteredPosts);

    return { data: true, error: null, status: 200 };
  },
};

export const commentService = {
  async getByPostId(postId: string): Promise<ApiResponse<Comment[]>> {
    await delay(300);
    const allComments = getStoredComments();
    const postComments = allComments.filter((c) => c.post_id === postId);
    const treeComments = buildCommentTree(postComments);
    return { data: treeComments, error: null, status: 200 };
  },

  async create(data: Partial<Comment>): Promise<ApiResponse<Comment>> {
    await delay(300);
    const newComment: Comment = {
      id: String(Date.now()),
      post_id: data.post_id || "",
      parent_id: data.parent_id || null,
      author_name: data.author_name || "匿名",
      anonymous_id: data.anonymous_id,
      content: data.content || "",
      is_admin: data.is_admin || false,
      is_author: data.is_author || false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const allComments = getStoredComments();
    allComments.push(newComment);
    setStoredComments(allComments);

    return { data: newComment, error: null, status: 201 };
  },

  async delete(commentId: string): Promise<ApiResponse<boolean>> {
    await delay(200);
    const allComments = getStoredComments();
    const filteredComments = allComments.filter((c) => c.id !== commentId);
    setStoredComments(filteredComments);
    return { data: true, error: null, status: 200 };
  },
};

export const userService = {
  async getProfile(): Promise<ApiResponse<User>> {
    await delay(200);
    return { data: mockUser, error: null, status: 200 };
  },

  async login(
    username: string,
    password: string,
  ): Promise<ApiResponse<{ user: User; token: string }>> {
    await delay(500);
    if (username === "admin" && password === "aura123") {
      return {
        data: { user: mockUser, token: "mock-jwt-token" },
        error: null,
        status: 200,
      };
    }
    return {
      data: null,
      error: "Invalid credentials",
      status: 401,
    };
  },

  async logout(): Promise<ApiResponse<boolean>> {
    await delay(200);
    return { data: true, error: null, status: 200 };
  },
};
