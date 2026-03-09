import { z } from 'zod';

export const folderSchema = z.object({
  id: z.string().min(1, 'ID 不能为空'),
  title: z.string().min(1, '标题不能为空').max(100, '标题最多 100 个字符'),
  description: z.string().max(500, '描述最多 500 个字符').optional(),
  type: z.enum(['tech', 'life', 'private']).default('tech'),
  is_private: z.boolean().default(false),
  icon: z.string().optional(),
  post_count: z.number().int().nonnegative().default(0),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
});

export const createFolderSchema = folderSchema.omit({
  id: true,
  post_count: true,
  created_at: true,
  updated_at: true,
});

export const updateFolderSchema = createFolderSchema.partial();

export type FolderInput = z.infer<typeof createFolderSchema>;
export type FolderUpdate = z.infer<typeof updateFolderSchema>;
