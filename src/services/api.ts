import {
  Folder,
  Post,
  Comment,
  User,
  ApiResponse,
  PaginatedResponse,
} from "@/types";

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
    content: "Next.js 15 带来了许多令人兴奋的新特性...",
    content_type: "article",
    summary: "探索 Next.js 15 的最新特性和改进",
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
    title: "TypeScript 5.4 更新详解",
    content: "TypeScript 5.4 引入了许多新特性...",
    content_type: "article",
    summary: "深入了解 TypeScript 5.4 的新特性",
    tags: ["TypeScript", "前端"],
    is_pinned: false,
    is_draft: false,
    view_count: 856,
    created_at: "2024-01-12T14:30:00Z",
    updated_at: "2024-01-12T14:30:00Z",
  },
  {
    id: "3",
    folder_id: "2",
    title: "京都之旅",
    content: "在京都的每一天都充满惊喜...",
    content_type: "article",
    summary: "我的京都之旅详细记录",
    tags: ["旅行", "摄影", "日本"],
    is_pinned: false,
    is_draft: false,
    view_count: 2341,
    created_at: "2024-01-10T09:00:00Z",
    updated_at: "2024-01-10T09:00:00Z",
  },
  {
    id: "4",
    folder_id: "2",
    title: "日落延时摄影",
    content: "记录城市日落的美好时刻",
    content_type: "video",
    summary: "城市日落延时摄影作品",
    video_url: "https://example.com/video1.mp4",
    video_description: "使用索尼A7M4拍摄，后期使用DaVinci Resolve调色",
    tags: ["摄影", "延时摄影"],
    is_pinned: false,
    is_draft: false,
    view_count: 5678,
    created_at: "2024-01-08T18:00:00Z",
    updated_at: "2024-01-08T18:00:00Z",
  },
];

const mockComments: Comment[] = [
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
    let folders = [...mockFolders];
    if (!includePrivate) {
      folders = folders.filter((f) => !f.is_private);
    }
    return { data: folders, error: null, status: 200 };
  },

  async getById(id: string): Promise<ApiResponse<Folder>> {
    await delay(200);
    const folder = mockFolders.find((f) => f.id === id);
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
      post_count: 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    return { data: newFolder, error: null, status: 201 };
  },
};

export const postService = {
  async getAll(
    folderId?: string,
    page = 1,
    pageSize = 10,
  ): Promise<ApiResponse<PaginatedResponse<Post>>> {
    await delay(300);
    let posts = folderId
      ? mockPosts.filter((p) => p.folder_id === folderId)
      : mockPosts;
    const total = posts.length;
    const start = (page - 1) * pageSize;
    const paginatedPosts = posts.slice(start, start + pageSize);

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
    const post = mockPosts.find((p) => p.id === id);
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
      is_pinned: false,
      is_draft: data.is_draft || false,
      view_count: 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    return { data: newPost, error: null, status: 201 };
  },

  async update(id: string, data: Partial<Post>): Promise<ApiResponse<Post>> {
    await delay(300);
    const postIndex = mockPosts.findIndex((p) => p.id === id);
    if (postIndex === -1) {
      return { data: null, error: "Post not found", status: 404 };
    }
    const updatedPost = {
      ...mockPosts[postIndex],
      ...data,
      updated_at: new Date().toISOString(),
    };
    return { data: updatedPost, error: null, status: 200 };
  },

  async delete(id: string): Promise<ApiResponse<boolean>> {
    await delay(300);
    return { data: true, error: null, status: 200 };
  },
};

export const commentService = {
  async getByPostId(postId: string): Promise<ApiResponse<Comment[]>> {
    await delay(300);
    const comments = mockComments.filter((c) => c.post_id === postId);
    return { data: comments, error: null, status: 200 };
  },

  async create(data: Partial<Comment>): Promise<ApiResponse<Comment>> {
    await delay(300);
    const newComment: Comment = {
      id: String(Date.now()),
      post_id: data.post_id || "",
      parent_id: data.parent_id || null,
      author_name: data.author_name || "匿名",
      content: data.content || "",
      is_admin: data.is_admin || false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    return { data: newComment, error: null, status: 201 };
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
    return { data: null, error: "Invalid credentials", status: 401 };
  },

  async logout(): Promise<ApiResponse<boolean>> {
    await delay(200);
    return { data: true, error: null, status: 200 };
  },
};
