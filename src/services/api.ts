import {
  Folder,
  Post,
  Comment,
  User,
  ApiResponse,
  PaginatedResponse,
} from "@/types";
import { supabase, isSupabaseConfigured } from "@/lib/supabaseClient";
import { buildCommentTree } from "@/lib/commentTree";
import {
  createFolderSchema,
  updateFolderSchema,
} from "@/lib/validations/folder";
import { createPostSchema, updatePostSchema } from "@/lib/validations/post";
import { createCommentSchema } from "@/lib/validations/comment";

const notConfiguredError =
  "Supabase is not configured. Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local";

export const folderService = {
  async getAll(includePrivate = false): Promise<ApiResponse<Folder[]>> {
    if (!isSupabaseConfigured()) {
      return { data: [], error: null, status: 200 };
    }

    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      let query = supabase
        .from("folders")
        .select("*")
        .order("created_at", { ascending: false });

      if (!includePrivate && !session) {
        query = query.eq("is_private", false);
      }

      const { data, error } = await query;

      if (error) {
        return { data: null, error: error.message, status: 500 };
      }

      const folders: Folder[] = (data || []).map((item) => ({
        id: item.id,
        title: item.title,
        description: item.description,
        type: item.type || "tech",
        is_private: item.is_private,
        icon: item.icon,
        post_count: item.post_count || 0,
        created_at: item.created_at,
        updated_at: item.updated_at,
      }));

      return { data: folders, error: null, status: 200 };
    } catch (error) {
      return {
        data: null,
        error: error instanceof Error ? error.message : "Unknown error",
        status: 500,
      };
    }
  },

  async getById(id: string): Promise<ApiResponse<Folder>> {
    if (!isSupabaseConfigured()) {
      return { data: null, error: notConfiguredError, status: 503 };
    }

    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      const { data, error } = await supabase
        .from("folders")
        .select("*")
        .eq("id", id)
        .single();

      if (error) {
        return { data: null, error: "Folder not found", status: 404 };
      }

      if (data.is_private && !session) {
        return { data: null, error: "Access denied", status: 403 };
      }

      const folder: Folder = {
        id: data.id,
        title: data.title,
        description: data.description,
        type: data.type || "tech",
        is_private: data.is_private,
        icon: data.icon,
        post_count: data.post_count || 0,
        created_at: data.created_at,
        updated_at: data.updated_at,
      };

      return { data: folder, error: null, status: 200 };
    } catch (error) {
      return {
        data: null,
        error: error instanceof Error ? error.message : "Unknown error",
        status: 500,
      };
    }
  },

  async create(data: Partial<Folder>): Promise<ApiResponse<Folder>> {
    if (!isSupabaseConfigured()) {
      return { data: null, error: notConfiguredError, status: 503 };
    }

    try {
      const validatedData = createFolderSchema.parse(data);

      const { data: result, error } = await supabase
        .from("folders")
        .insert({
          title: validatedData.title,
          description: validatedData.description,
          type: validatedData.type,
          is_private: validatedData.is_private,
          icon: validatedData.icon,
        })
        .select()
        .single();

      if (error) {
        return { data: null, error: error.message, status: 400 };
      }

      const folder: Folder = {
        id: result.id,
        title: result.title,
        description: result.description,
        type: result.type || "tech",
        is_private: result.is_private,
        icon: result.icon,
        post_count: result.post_count || 0,
        created_at: result.created_at,
        updated_at: result.updated_at,
      };

      return { data: folder, error: null, status: 201 };
    } catch (error) {
      if (error instanceof Error) {
        return { data: null, error: error.message, status: 400 };
      }
      return { data: null, error: "Validation failed", status: 400 };
    }
  },

  async update(
    id: string,
    data: Partial<Folder>,
  ): Promise<ApiResponse<Folder>> {
    if (!isSupabaseConfigured()) {
      return { data: null, error: notConfiguredError, status: 503 };
    }

    try {
      const validatedData = updateFolderSchema.parse(data);

      const { data: result, error } = await supabase
        .from("folders")
        .update({
          ...validatedData,
          updated_at: new Date().toISOString(),
        })
        .eq("id", id)
        .select()
        .single();

      if (error) {
        return { data: null, error: error.message, status: 400 };
      }

      if (!result) {
        return { data: null, error: "Folder not found", status: 404 };
      }

      const folder: Folder = {
        id: result.id,
        title: result.title,
        description: result.description,
        type: result.type || "tech",
        is_private: result.is_private,
        icon: result.icon,
        post_count: result.post_count || 0,
        created_at: result.created_at,
        updated_at: result.updated_at,
      };

      return { data: folder, error: null, status: 200 };
    } catch (error) {
      if (error instanceof Error) {
        return { data: null, error: error.message, status: 400 };
      }
      return { data: null, error: "Validation failed", status: 400 };
    }
  },

  async delete(id: string): Promise<ApiResponse<boolean>> {
    if (!isSupabaseConfigured()) {
      return { data: null, error: notConfiguredError, status: 503 };
    }

    try {
      const { error: postsError } = await supabase
        .from("posts")
        .delete()
        .eq("folder_id", id);
      if (postsError) {
        return { data: null, error: postsError.message, status: 400 };
      }

      const { error } = await supabase.from("folders").delete().eq("id", id);

      if (error) {
        return { data: null, error: error.message, status: 400 };
      }

      return { data: true, error: null, status: 200 };
    } catch (error) {
      return {
        data: null,
        error: error instanceof Error ? error.message : "Unknown error",
        status: 500,
      };
    }
  },
};

export const postService = {
  async getByFolderId(
    folderId: string,
    page = 1,
    pageSize = 10,
  ): Promise<ApiResponse<PaginatedResponse<Post>>> {
    if (!isSupabaseConfigured()) {
      return {
        data: { data: [], total: 0, page, pageSize, hasMore: false },
        error: null,
        status: 200,
      };
    }

    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      const { data: folder, error: folderError } = await supabase
        .from("folders")
        .select("is_private")
        .eq("id", folderId)
        .single();

      if (folderError || !folder) {
        return { data: null, error: "Folder not found", status: 404 };
      }

      if (folder.is_private && !session) {
        return { data: null, error: "Access denied", status: 403 };
      }

      const from = (page - 1) * pageSize;
      const to = from + pageSize - 1;

      const { data, error, count } = await supabase
        .from("posts")
        .select("*", { count: "exact" })
        .eq("folder_id", folderId)
        .eq("is_draft", false)
        .order("is_pinned", { ascending: false })
        .order("created_at", { ascending: false })
        .range(from, to);

      if (error) {
        return { data: null, error: error.message, status: 500 };
      }

      const posts: Post[] = (data || []).map((item) => ({
        id: item.id,
        folder_id: item.folder_id,
        title: item.title,
        content: item.content,
        content_type: item.content_type || "article",
        summary: item.summary,
        cover_image: item.cover_image,
        video_url: item.video_url,
        video_description: item.video_description,
        tags: item.tags || [],
        is_pinned: item.is_pinned || false,
        is_draft: item.is_draft || false,
        view_count: item.view_count || 0,
        created_at: item.created_at,
        updated_at: item.updated_at,
      }));

      return {
        data: {
          data: posts,
          total: count || 0,
          page,
          pageSize,
          hasMore: from + pageSize < (count || 0),
        },
        error: null,
        status: 200,
      };
    } catch (error) {
      return {
        data: null,
        error: error instanceof Error ? error.message : "Unknown error",
        status: 500,
      };
    }
  },

  async getAll(
    folderId?: string,
    page = 1,
    pageSize = 10,
  ): Promise<ApiResponse<PaginatedResponse<Post>>> {
    if (!isSupabaseConfigured()) {
      return {
        data: { data: [], total: 0, page, pageSize, hasMore: false },
        error: null,
        status: 200,
      };
    }

    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      const from = (page - 1) * pageSize;
      const to = from + pageSize - 1;

      let query = supabase
        .from("posts")
        .select("*, folders!inner(is_private)", { count: "exact" })
        .eq("is_draft", false)
        .order("is_pinned", { ascending: false })
        .order("created_at", { ascending: false })
        .range(from, to);

      if (folderId) {
        query = query.eq("folder_id", folderId);
      }

      if (!session) {
        query = query.eq("folders.is_private", false);
      }

      const { data, error, count } = await query;

      if (error) {
        return { data: null, error: error.message, status: 500 };
      }

      const posts: Post[] = (data || []).map((item: any) => ({
        id: item.id,
        folder_id: item.folder_id,
        title: item.title,
        content: item.content,
        content_type: item.content_type || "article",
        summary: item.summary,
        cover_image: item.cover_image,
        video_url: item.video_url,
        video_description: item.video_description,
        tags: item.tags || [],
        is_pinned: item.is_pinned || false,
        is_draft: item.is_draft || false,
        view_count: item.view_count || 0,
        created_at: item.created_at,
        updated_at: item.updated_at,
      }));

      return {
        data: {
          data: posts,
          total: count || 0,
          page,
          pageSize,
          hasMore: from + pageSize < (count || 0),
        },
        error: null,
        status: 200,
      };
    } catch (error) {
      return {
        data: null,
        error: error instanceof Error ? error.message : "Unknown error",
        status: 500,
      };
    }
  },

  async getById(id: string): Promise<ApiResponse<Post>> {
    if (!isSupabaseConfigured()) {
      return { data: null, error: notConfiguredError, status: 503 };
    }

    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      const { data, error } = await supabase
        .from("posts")
        .select("*, folders!inner(is_private)")
        .eq("id", id)
        .single();

      if (error || !data) {
        return { data: null, error: "Post not found", status: 404 };
      }

      if (data.folders.is_private && !session) {
        return { data: null, error: "Access denied", status: 403 };
      }

      await supabase
        .from("posts")
        .update({ view_count: (data.view_count || 0) + 1 })
        .eq("id", id);

      const post: Post = {
        id: data.id,
        folder_id: data.folder_id,
        title: data.title,
        content: data.content,
        content_type: data.content_type || "article",
        summary: data.summary,
        cover_image: data.cover_image,
        video_url: data.video_url,
        video_description: data.video_description,
        tags: data.tags || [],
        is_pinned: data.is_pinned || false,
        is_draft: data.is_draft || false,
        view_count: (data.view_count || 0) + 1,
        created_at: data.created_at,
        updated_at: data.updated_at,
      };

      return { data: post, error: null, status: 200 };
    } catch (error) {
      return {
        data: null,
        error: error instanceof Error ? error.message : "Unknown error",
        status: 500,
      };
    }
  },

  async create(data: Partial<Post>): Promise<ApiResponse<Post>> {
    if (!isSupabaseConfigured()) {
      return { data: null, error: notConfiguredError, status: 503 };
    }

    try {
      const validatedData = createPostSchema.parse(data);

      const { data: result, error } = await supabase
        .from("posts")
        .insert({
          folder_id: validatedData.folder_id,
          title: validatedData.title,
          content: validatedData.content,
          content_type: validatedData.content_type || "article",
          summary: validatedData.summary,
          cover_image: validatedData.cover_image,
          video_url: validatedData.video_url,
          video_description: validatedData.video_description,
          tags: validatedData.tags || [],
          is_pinned: validatedData.is_pinned || false,
          is_draft: validatedData.is_draft || false,
        })
        .select()
        .single();

      if (error) {
        return { data: null, error: error.message, status: 400 };
      }

      const post: Post = {
        id: result.id,
        folder_id: result.folder_id,
        title: result.title,
        content: result.content,
        content_type: result.content_type || "article",
        summary: result.summary,
        cover_image: result.cover_image,
        video_url: result.video_url,
        video_description: result.video_description,
        tags: result.tags || [],
        is_pinned: result.is_pinned || false,
        is_draft: result.is_draft || false,
        view_count: result.view_count || 0,
        created_at: result.created_at,
        updated_at: result.updated_at,
      };

      return { data: post, error: null, status: 201 };
    } catch (error) {
      if (error instanceof Error) {
        return { data: null, error: error.message, status: 400 };
      }
      return { data: null, error: "Validation failed", status: 400 };
    }
  },

  async update(id: string, data: Partial<Post>): Promise<ApiResponse<Post>> {
    if (!isSupabaseConfigured()) {
      return { data: null, error: notConfiguredError, status: 503 };
    }

    try {
      const validatedData = updatePostSchema.parse(data);

      const { data: result, error } = await supabase
        .from("posts")
        .update({
          ...validatedData,
          updated_at: new Date().toISOString(),
        })
        .eq("id", id)
        .select()
        .single();

      if (error) {
        return { data: null, error: error.message, status: 400 };
      }

      if (!result) {
        return { data: null, error: "Post not found", status: 404 };
      }

      const post: Post = {
        id: result.id,
        folder_id: result.folder_id,
        title: result.title,
        content: result.content,
        content_type: result.content_type || "article",
        summary: result.summary,
        cover_image: result.cover_image,
        video_url: result.video_url,
        video_description: result.video_description,
        tags: result.tags || [],
        is_pinned: result.is_pinned || false,
        is_draft: result.is_draft || false,
        view_count: result.view_count || 0,
        created_at: result.created_at,
        updated_at: result.updated_at,
      };

      return { data: post, error: null, status: 200 };
    } catch (error) {
      if (error instanceof Error) {
        return { data: null, error: error.message, status: 400 };
      }
      return { data: null, error: "Validation failed", status: 400 };
    }
  },

  async delete(id: string): Promise<ApiResponse<boolean>> {
    if (!isSupabaseConfigured()) {
      return { data: null, error: notConfiguredError, status: 503 };
    }

    try {
      const { error } = await supabase.from("posts").delete().eq("id", id);

      if (error) {
        return { data: null, error: error.message, status: 400 };
      }

      return { data: true, error: null, status: 200 };
    } catch (error) {
      return {
        data: null,
        error: error instanceof Error ? error.message : "Unknown error",
        status: 500,
      };
    }
  },
};

export const commentService = {
  async getByPostId(postId: string): Promise<ApiResponse<Comment[]>> {
    if (!isSupabaseConfigured()) {
      return { data: [], error: null, status: 200 };
    }

    try {
      const { data, error } = await supabase
        .from("comments")
        .select("*")
        .eq("post_id", postId)
        .order("created_at", { ascending: true });

      if (error) {
        return { data: null, error: error.message, status: 500 };
      }

      const comments: Comment[] = (data || []).map((item) => ({
        id: item.id,
        post_id: item.post_id,
        parent_id: item.parent_id,
        author_name: item.author_name,
        author_avatar: item.author_avatar,
        anonymous_id: item.anonymous_id,
        content: item.content,
        is_admin: item.is_admin || false,
        is_author: item.is_author || false,
        created_at: item.created_at,
        updated_at: item.updated_at,
      }));

      const treeComments = buildCommentTree(comments);

      return { data: treeComments, error: null, status: 200 };
    } catch (error) {
      return {
        data: null,
        error: error instanceof Error ? error.message : "Unknown error",
        status: 500,
      };
    }
  },

  async create(data: Partial<Comment>): Promise<ApiResponse<Comment>> {
    if (!isSupabaseConfigured()) {
      return { data: null, error: notConfiguredError, status: 503 };
    }

    try {
      const validatedData = createCommentSchema.parse(data);

      const { data: result, error } = await supabase
        .from("comments")
        .insert({
          post_id: validatedData.post_id,
          parent_id: validatedData.parent_id ?? null,
          author_name: validatedData.author_name,
          anonymous_id: validatedData.anonymous_id,
          content: validatedData.content,
          is_admin: validatedData.is_admin,
          is_author: validatedData.is_author,
        })
        .select()
        .single();

      if (error) {
        return { data: null, error: error.message, status: 400 };
      }

      const comment: Comment = {
        id: result.id,
        post_id: result.post_id,
        parent_id: result.parent_id,
        author_name: result.author_name,
        anonymous_id: result.anonymous_id,
        content: result.content,
        is_admin: result.is_admin || false,
        is_author: result.is_author || false,
        created_at: result.created_at,
        updated_at: result.updated_at,
      };

      return { data: comment, error: null, status: 201 };
    } catch (error) {
      if (error instanceof Error) {
        return { data: null, error: error.message, status: 400 };
      }
      return { data: null, error: "Validation failed", status: 400 };
    }
  },

  async delete(commentId: string): Promise<ApiResponse<boolean>> {
    if (!isSupabaseConfigured()) {
      return { data: null, error: notConfiguredError, status: 503 };
    }

    try {
      const { error } = await supabase
        .from("comments")
        .delete()
        .eq("id", commentId);

      if (error) {
        return { data: null, error: error.message, status: 400 };
      }

      return { data: true, error: null, status: 200 };
    } catch (error) {
      return {
        data: null,
        error: error instanceof Error ? error.message : "Unknown error",
        status: 500,
      };
    }
  },
};

export const userService = {
  async getProfile(): Promise<ApiResponse<User>> {
    if (!isSupabaseConfigured()) {
      return { data: null, error: notConfiguredError, status: 503 };
    }

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        return { data: null, error: "Not authenticated", status: 401 };
      }

      const { data: profile, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      if (error) {
        const newUser: User = {
          id: user.id,
          username: user.email?.split("@")[0] || "user",
          display_name:
            user.user_metadata?.display_name ||
            user.email?.split("@")[0] ||
            "User",
          avatar: user.user_metadata?.avatar_url,
          bio: user.user_metadata?.bio,
          role: "user",
          created_at: user.created_at,
        };
        return { data: newUser, error: null, status: 200 };
      }

      const userProfile: User = {
        id: profile.id,
        username: profile.username || user.email?.split("@")[0] || "user",
        display_name:
          profile.display_name || user.email?.split("@")[0] || "User",
        avatar: profile.avatar_url,
        bio: profile.bio,
        role: profile.role || "user",
        created_at: profile.created_at || user.created_at,
      };

      return { data: userProfile, error: null, status: 200 };
    } catch (error) {
      return {
        data: null,
        error: error instanceof Error ? error.message : "Unknown error",
        status: 500,
      };
    }
  },

  async login(
    email: string,
    password: string,
  ): Promise<ApiResponse<{ user: User; session: any }>> {
    if (!isSupabaseConfigured()) {
      return { data: null, error: notConfiguredError, status: 503 };
    }

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        return { data: null, error: error.message, status: 401 };
      }

      const user: User = {
        id: data.user.id,
        username: data.user.email?.split("@")[0] || "user",
        display_name:
          data.user.user_metadata?.display_name ||
          data.user.email?.split("@")[0] ||
          "User",
        avatar: data.user.user_metadata?.avatar_url,
        bio: data.user.user_metadata?.bio,
        role: "user",
        created_at: data.user.created_at,
      };

      return {
        data: { user, session: data.session },
        error: null,
        status: 200,
      };
    } catch (error) {
      return {
        data: null,
        error: error instanceof Error ? error.message : "Unknown error",
        status: 500,
      };
    }
  },

  async logout(): Promise<ApiResponse<boolean>> {
    if (!isSupabaseConfigured()) {
      return { data: true, error: null, status: 200 };
    }

    try {
      const { error } = await supabase.auth.signOut();

      if (error) {
        return { data: null, error: error.message, status: 400 };
      }

      return { data: true, error: null, status: 200 };
    } catch (error) {
      return {
        data: null,
        error: error instanceof Error ? error.message : "Unknown error",
        status: 500,
      };
    }
  },
};
