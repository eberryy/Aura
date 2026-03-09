import { z } from 'zod';

export const postSchema = z.object({
  id: z.string().min(1, 'ID 不能为空'),
  folder_id: z.string().min(1, '文件夹 ID 不能为空'),
  title: z.string().min(1, '标题不能为空').max(200, '标题最多 200 个字符'),
  content: z.string().min(1, '内容不能为空'),
  content_type: z.enum(['article', 'video']).default('article'),
  summary: z.string().max(500, '摘要最多 500 个字符').optional(),
  cover_image: z.string().url('封面图片必须是有效的 URL').optional().or(z.literal('')),
  video_url: z.string().url('视频链接必须是有效的 URL').optional().or(z.literal('')),
  video_description: z.string().max(500, '视频描述最多 500 个字符').optional(),
  tags: z.array(z.string().max(50, '单个标签最多 50 个字符')).max(10, '最多 10 个标签').default([]),
  is_pinned: z.boolean().default(false),
  is_draft: z.boolean().default(false),
  view_count: z.number().int().nonnegative().default(0),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
});

export const createPostSchema = postSchema.omit({
  id: true,
  view_count: true,
  created_at: true,
  updated_at: true,
});

export const updatePostSchema = createPostSchema.partial();

export type PostInput = z.infer<typeof createPostSchema>;
export type PostUpdate = z.infer<typeof updatePostSchema>;
