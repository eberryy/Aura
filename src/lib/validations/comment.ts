import { z } from 'zod';

export const commentSchema = z.object({
  id: z.string().min(1, 'ID 不能为空'),
  post_id: z.string().min(1, '文章 ID 不能为空'),
  parent_id: z.string().nullable(),
  author_name: z.string().min(1, '作者名称不能为空').max(50, '作者名称最多 50 个字符'),
  author_avatar: z.string().url('头像必须是有效的 URL').optional().or(z.literal('')),
  anonymous_id: z.string().max(50, '匿名 ID 最多 50 个字符').optional(),
  content: z.string().min(1, '评论内容不能为空').max(2000, '评论内容最多 2000 个字符'),
  is_admin: z.boolean().default(false),
  is_author: z.boolean().default(false),
  depth: z.number().int().nonnegative().optional(),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
  replies: z.array(z.any()).optional(),
});

export const createCommentSchema = z.object({
  post_id: z.string().min(1, '文章 ID 不能为空'),
  parent_id: z.string().nullable().optional(),
  author_name: z.string().min(1, '作者名称不能为空').max(50, '作者名称最多 50 个字符'),
  author_avatar: z.string().url('头像必须是有效的 URL').optional().or(z.literal('')),
  anonymous_id: z.string().max(50, '匿名 ID 最多 50 个字符').optional(),
  content: z.string().min(1, '评论内容不能为空').max(2000, '评论内容最多 2000 个字符'),
  is_admin: z.boolean().default(false),
  is_author: z.boolean().default(false),
});

export const updateCommentSchema = createCommentSchema.partial();

export type CommentInput = z.infer<typeof createCommentSchema>;
export type CommentUpdate = z.infer<typeof updateCommentSchema>;
