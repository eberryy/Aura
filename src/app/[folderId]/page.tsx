'use client';

import { useEffect, useState, use } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowLeft, Lock, Calendar, Edit2, FileText, ChevronRight, Plus, Trash2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { folderService, postService } from '@/services/api';
import { Folder, Post } from '@/types';
import { cn } from '@/lib/utils';
import { useTheme } from '@/hooks/useTheme';
import { useAuth } from '@/hooks/useAuth';
import { PrivateModeBackground } from '@/components/shared/PrivateModeBackground';
import FileCardSkeleton from '@/components/shared/FileCardSkeleton';
import DeleteConfirmDialog from '@/components/admin/DeleteConfirmDialog';
import { toast } from 'sonner';

interface FolderPageProps {
  params: Promise<{ folderId: string }>;
}

export default function FolderPage({ params }: FolderPageProps) {
  const { folderId } = use(params);
  const router = useRouter();
  const { isPrivateMode, setPrivateMode } = useTheme();
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const [folder, setFolder] = useState<Folder | null>(null);
  const [files, setFiles] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [editingPost, setEditingPost] = useState<Post | null>(null);
  const [deletingPost, setDeletingPost] = useState<Post | null>(null);

  const fetchData = async () => {
    setLoading(true);
    const folderResponse = await folderService.getById(folderId);
    if (folderResponse.error || !folderResponse.data) {
      setNotFound(true);
      setLoading(false);
      return;
    }

    const folderData = folderResponse.data;
    setFolder(folderData);

    if (folderData.is_private && !isAuthenticated && !authLoading) {
      router.push('/');
      return;
    }

    setPrivateMode(folderData.is_private);

    const postsResponse = await postService.getByFolderId(folderId);
    if (postsResponse.data) {
      setFiles(postsResponse.data.data);
    }

    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, [folderId, isAuthenticated, authLoading]);

  useEffect(() => {
    if (folder?.is_private && !isAuthenticated && !authLoading) {
      router.push('/');
    }
  }, [folder, isAuthenticated, authLoading]);

  const handleUpdatePost = async (data: Partial<Post>) => {
    if (!editingPost) return;
    const response = await postService.update(editingPost.id, data);
    if (response.data) {
      toast.success('文章更新成功');
      fetchData();
    } else {
      toast.error('更新失败');
    }
  };

  const handleDeletePost = async () => {
    if (!deletingPost) return;
    const response = await postService.delete(deletingPost.id);
    if (response.data) {
      toast.success('文章已删除');
      setDeletingPost(null);
      fetchData();
    } else {
      toast.error('删除失败');
    }
  };

  if (notFound) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4">404</h1>
          <p className="text-gray-500">文件夹不存在</p>
          <Button onClick={() => router.push('/')} className="mt-4">
            返回首页
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "min-h-screen transition-colors duration-500",
        isPrivateMode ? "bg-black" : "bg-gray-50 dark:bg-gray-900",
      )}
    >
      {isPrivateMode && <PrivateModeBackground />}

      <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="mb-8"
        >
          <Button
            variant="ghost"
            onClick={() => router.push('/')}
            className={cn(
              "gap-2",
              isPrivateMode
                ? "text-gray-300 hover:text-white hover:bg-white/10"
                : "",
            )}
          >
            <ArrowLeft size={20} />
            返回首页
          </Button>
        </motion.div>

        {loading ? (
          <FolderDetailSkeleton />
        ) : folder ? (
          <>
            <motion.div
              layoutId={`folder-${folderId}`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="mb-8"
            >
              <Card
                className={cn(
                  "overflow-hidden",
                  isPrivateMode
                    ? "bg-white/5 border-purple-500/20"
                    : "dark:bg-gray-800/50",
                )}
              >
                <CardContent className="p-8">
                  <div className="flex items-start gap-4">
                    <div
                      className={cn(
                        "p-4 rounded-2xl",
                        isPrivateMode
                          ? "bg-gradient-to-br from-purple-600/30 to-pink-600/30"
                          : "bg-gradient-to-br from-indigo-500/20 to-purple-500/20",
                      )}
                    >
                      {folder.is_private ? (
                        <Lock
                          size={32}
                          className={cn(
                            isPrivateMode ? "text-purple-400" : "text-indigo-500",
                          )}
                        />
                      ) : (
                        <FileText
                          size={32}
                          className={cn(
                            isPrivateMode ? "text-purple-400" : "text-indigo-500",
                          )}
                        />
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h1
                          className={cn(
                            "text-3xl font-bold",
                            isPrivateMode
                              ? "text-white"
                              : "text-gray-900 dark:text-white",
                          )}
                        >
                          {folder.title}
                        </h1>
                        {folder.is_private && (
                          <span
                            className={cn(
                              "px-3 py-1 rounded-full text-xs font-medium",
                              isPrivateMode
                                ? "bg-purple-500/20 text-purple-400"
                                : "bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400",
                            )}
                          >
                            私密
                          </span>
                        )}
                      </div>
                      <p
                        className={cn(
                          "mb-4",
                          isPrivateMode
                            ? "text-gray-400"
                            : "text-gray-600 dark:text-gray-400",
                        )}
                      >
                        {folder.description}
                      </p>
                      <div className="flex items-center gap-6 text-sm">
                        <span
                          className={cn(
                            "flex items-center gap-2",
                            isPrivateMode
                              ? "text-gray-500"
                              : "text-gray-500 dark:text-gray-400",
                          )}
                        >
                          <Calendar size={16} />
                          {folder.post_count} 个文件
                        </span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="mb-6"
            >
              <div className="flex items-center justify-between">
                <h2
                  className={cn(
                    "text-xl font-semibold",
                    isPrivateMode
                      ? "text-white"
                      : "text-gray-900 dark:text-white",
                  )}
                >
                  文件列表
                </h2>
                {isAuthenticated && (
                  <Link href={`/create?folderId=${folderId}`}>
                    <Button
                      className={cn(
                        "gap-2",
                        isPrivateMode
                          ? "bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                          : "",
                      )}
                    >
                      <Plus size={16} />
                      发布文章
                    </Button>
                  </Link>
                )}
              </div>
            </motion.div>

            {files.length === 0 ? (
              <Card
                className={cn(
                  isPrivateMode
                    ? "bg-white/5 border-purple-500/20"
                    : "dark:bg-gray-800/50",
                )}
              >
                <CardContent className="py-12 text-center">
                  <p
                    className={cn(
                      isPrivateMode
                        ? "text-gray-400"
                        : "text-gray-500 dark:text-gray-400",
                    )}
                  >
                    暂无文件
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {files.map((file, index) => (
                  <motion.div
                    key={file.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="relative group"
                  >
                    <FileCard
                      file={file}
                      isPrivateMode={isPrivateMode}
                      isAuthenticated={isAuthenticated}
                      folderId={folderId}
                      onDelete={() => setDeletingPost(file)}
                    />
                  </motion.div>
                ))}
              </div>
            )}
          </>
        ) : null}
      </div>

      <DeleteConfirmDialog
        isOpen={!!deletingPost}
        onClose={() => setDeletingPost(null)}
        onConfirm={handleDeletePost}
        title="删除文章"
        message={`确定要删除「${deletingPost?.title}」吗？此操作不可撤销。`}
        isPrivateMode={isPrivateMode}
      />
    </div>
  );
}

function FileCard({
  file,
  isPrivateMode,
  isAuthenticated,
  folderId,
  onDelete,
}: {
  file: Post;
  isPrivateMode: boolean;
  isAuthenticated: boolean;
  folderId: string;
  onDelete: () => void;
}) {
  const router = useRouter();

  return (
    <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
      <Card
        className={cn(
          "transition-all duration-300 cursor-pointer h-full",
          isPrivateMode
            ? "bg-white/5 border-purple-500/20 hover:border-purple-500/50 hover:bg-white/10"
            : "dark:bg-gray-800/50 hover:shadow-lg",
        )}
        onClick={() => router.push(`/${file.folder_id}/${file.id}`)}
      >
        <CardContent className="p-5">
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-3 flex-1">
              <div
                className={cn(
                  "p-2 rounded-lg",
                  isPrivateMode
                    ? "bg-purple-500/20 text-purple-400"
                    : "bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400",
                )}
              >
                <FileText size={20} />
              </div>
              <div className="flex-1 min-w-0">
                <h3
                  className={cn(
                    "font-semibold truncate",
                    isPrivateMode ? "text-white" : "text-gray-900 dark:text-white",
                  )}
                >
                  {file.title}
                </h3>
                <div className="flex items-center gap-2 mt-1">
                  <span
                    className={cn(
                      "text-xs px-2 py-0.5 rounded-full",
                      isPrivateMode
                        ? "bg-purple-500/20 text-purple-400"
                        : "bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400",
                    )}
                  >
                    {file.content_type === 'video' ? '视频' : '文章'}
                  </span>
                  {file.is_pinned && (
                    <span
                      className={cn(
                        "text-xs px-2 py-0.5 rounded-full",
                        isPrivateMode
                          ? "bg-amber-500/20 text-amber-400"
                          : "bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400",
                      )}
                    >
                      置顶
                    </span>
                  )}
                </div>
              </div>
            </div>
            <ChevronRight
              className={cn(
                "flex-shrink-0",
                isPrivateMode ? "text-gray-600" : "text-gray-400",
              )}
            />
          </div>

          <p
            className={cn(
              "text-sm mb-4 line-clamp-2",
              isPrivateMode ? "text-gray-400" : "text-gray-600 dark:text-gray-400",
            )}
          >
            {file.summary || file.content.slice(0, 80)}
          </p>

          <div className="flex items-center justify-between text-xs">
            <div
              className={cn(
                "flex items-center gap-3",
                isPrivateMode ? "text-gray-500" : "text-gray-500 dark:text-gray-400",
              )}
            >
              <span className="flex items-center gap-1">
                <Calendar size={12} />
                {new Date(file.created_at).toLocaleDateString('zh-CN')}
              </span>
            </div>
            <div
              className={cn(
                "flex items-center gap-1",
                isPrivateMode ? "text-gray-500" : "text-gray-500 dark:text-gray-400",
              )}
            >
              <Edit2 size={12} />
              {new Date(file.updated_at).toLocaleDateString('zh-CN')}
            </div>
          </div>

          {isAuthenticated && (
            <div
              className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity z-10"
              onClick={(e) => e.stopPropagation()}
            >
              <Link
                href={`/create?folderId=${folderId}&editPostId=${file.id}`}
                onClick={(e) => e.stopPropagation()}
              >
                <button
                  className={cn(
                    "p-2 rounded-lg transition-colors",
                    isPrivateMode
                      ? "bg-white/10 text-gray-400 hover:text-white hover:bg-white/20"
                      : "bg-gray-100 text-gray-600 hover:text-indigo-600",
                  )}
                >
                  <Edit2 size={14} />
                </button>
              </Link>
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  onDelete();
                }}
                className={cn(
                  "p-2 rounded-lg transition-colors",
                  isPrivateMode
                    ? "bg-white/10 text-gray-400 hover:text-red-400 hover:bg-red-500/20"
                    : "bg-gray-100 text-gray-600 hover:text-red-600",
                )}
              >
                <Trash2 size={14} />
              </button>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}

function FolderDetailSkeleton() {
  return (
    <div className="space-y-8">
      <Card className="overflow-hidden">
        <CardContent className="p-8">
          <div className="flex items-start gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gray-200 dark:bg-gray-700 animate-pulse" />
            <div className="flex-1 space-y-3">
              <div className="h-8 w-48 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
              <div className="h-4 w-full bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
              <div className="h-4 w-2/3 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <FileCardSkeleton key={i} isPrivateMode={false} />
        ))}
      </div>
    </div>
  );
}
