'use client';

import { useEffect, useState, use } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import Zoom from 'react-medium-image-zoom';
import 'react-medium-image-zoom/dist/styles.css';
import { ArrowLeft, Calendar, Eye, Tag, Edit, Lock, Play } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { postService, folderService } from '@/services/api';
import { Post, Folder } from '@/types';
import { cn } from '@/lib/utils';
import { useTheme } from '@/hooks/useTheme';
import { useAuth } from '@/hooks/useAuth';
import { PrivateModeBackground } from '@/components/shared/PrivateModeBackground';
import CommentSection from '@/components/shared/CommentSection';
import PostDetailSkeleton from '@/components/shared/PostDetailSkeleton';
import EditButton from '@/components/shared/EditButton';

interface PostPageProps {
  params: Promise<{ folderId: string; postId: string }>;
}

export default function PostPage({ params }: PostPageProps) {
  const { folderId, postId } = use(params);
  const router = useRouter();
  const { isPrivateMode, setPrivateMode } = useTheme();
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const [post, setPost] = useState<Post | null>(null);
  const [folder, setFolder] = useState<Folder | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      
      const postResponse = await postService.getById(postId);
      if (postResponse.error || !postResponse.data) {
        setNotFound(true);
        setLoading(false);
        return;
      }

      const postData = postResponse.data;
      setPost(postData);

      const folderResponse = await folderService.getById(postData.folder_id);
      if (folderResponse.data) {
        const folderData = folderResponse.data;
        setFolder(folderData);

        if (folderData.is_private && !isAuthenticated && !authLoading) {
          router.push('/');
          return;
        }

        setPrivateMode(folderData.is_private);
      }

      setLoading(false);
    };

    fetchData();
  }, [postId, isAuthenticated, authLoading]);

  useEffect(() => {
    if (folder?.is_private && !isAuthenticated && !authLoading) {
      router.push('/');
    }
  }, [folder, isAuthenticated, authLoading]);

  if (notFound) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4">404</h1>
          <p className="text-gray-500">文章不存在</p>
          <Button onClick={() => router.push('/')} className="mt-4">
            返回首页
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className={cn(
      "min-h-screen transition-colors duration-500",
      isPrivateMode ? "bg-black" : "bg-gray-50 dark:bg-gray-900"
    )}>
      {isPrivateMode && <PrivateModeBackground />}

      <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {loading ? (
          <PostDetailSkeleton />
        ) : post && folder ? (
          <>
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="mb-6"
            >
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  onClick={() => router.push(`/${folderId}`)}
                  className={cn(
                    "gap-2",
                    isPrivateMode ? "text-gray-300 hover:text-white hover:bg-white/10" : ""
                  )}
                >
                  <ArrowLeft size={20} />
                </Button>
                <Link href={`/${folderId}`}>
                  <span className={cn(
                    "text-sm",
                    isPrivateMode ? "text-gray-400 hover:text-white" : "text-gray-500 hover:text-gray-700"
                  )}>
                    {folder.title}
                  </span>
                </Link>
              </div>
            </motion.div>

            <motion.article
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="relative"
            >
              <EditButton postId={postId} folderId={folderId} />

              <Card className={cn(
                "overflow-hidden mb-6",
                isPrivateMode
                  ? "bg-white/5 border-purple-500/20"
                  : "dark:bg-gray-800/50"
              )}>
                <CardContent className="p-8">
                  <header className="mb-8">
                    <div className="flex items-center gap-3 mb-4">
                      {folder.is_private && (
                        <Lock size={18} className={cn(
                          isPrivateMode ? "text-purple-400" : "text-indigo-500"
                        )} />
                      )}
                      <h1 className={cn(
                        "text-3xl md:text-4xl font-bold",
                        isPrivateMode ? "text-white" : "text-gray-900 dark:text-white"
                      )}>
                        {post.title}
                      </h1>
                    </div>
                    <div className="flex items-center gap-6 text-sm">
                      <span className={cn(
                        "flex items-center gap-2",
                        isPrivateMode ? "text-gray-400" : "text-gray-500 dark:text-gray-400"
                      )}>
                        <Calendar size={16} />
                        {new Date(post.created_at).toLocaleDateString('zh-CN', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                        })}
                      </span>
                      <span className={cn(
                        "flex items-center gap-2",
                        isPrivateMode ? "text-gray-400" : "text-gray-500 dark:text-gray-400"
                      )}>
                        <Eye size={16} />
                        {post.view_count.toLocaleString()} 阅读
                      </span>
                    </div>
                    {post.tags.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-4">
                        {post.tags.map((tag) => (
                          <span
                            key={tag}
                            className={cn(
                              "px-3 py-1 rounded-full text-xs font-medium",
                              isPrivateMode
                                ? "bg-purple-500/20 text-purple-400"
                                : "bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400"
                            )}
                          >
                            <Tag size={12} className="inline mr-1" />
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </header>

                  {post.content_type === 'video' ? (
                    <VideoPlayer post={post} isPrivateMode={isPrivateMode} />
                  ) : (
                    <ArticleContent post={post} isPrivateMode={isPrivateMode} />
                  )}
                </CardContent>
              </Card>

              <CommentSection postId={post.id} isPrivateMode={isPrivateMode} />
            </motion.article>
          </>
        ) : null}
      </div>
    </div>
  );
}

function VideoPlayer({ post, isPrivateMode }: { post: Post; isPrivateMode: boolean }) {
  return (
    <div className="space-y-4">
      <div className="relative aspect-video bg-black rounded-xl overflow-hidden">
        {post.video_url ? (
          <video
            src={post.video_url}
            controls
            className="w-full h-full"
            poster={post.cover_image}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Play size={48} className="text-gray-600" />
          </div>
        )}
      </div>
      {post.video_description && (
        <div className={cn(
          "p-4 rounded-lg",
          isPrivateMode
            ? "bg-white/5 border border-purple-500/20"
            : "bg-gray-100 dark:bg-gray-700/50"
        )}>
          <p className={cn(
            isPrivateMode ? "text-gray-300" : "text-gray-700 dark:text-gray-300"
          )}>
            {post.video_description}
          </p>
        </div>
      )}
    </div>
  );
}

function ArticleContent({ post, isPrivateMode }: { post: Post; isPrivateMode: boolean }) {
  const content = post.content;

  const renderContent = () => {
    const lines = content.split('\n');
    return lines.map((line, index) => {
      if (line.startsWith('![')) {
        const match = line.match(/!\[(.*?)\]\((.*?)\)/);
        if (match) {
          return (
            <div key={index} className="my-6">
              <Zoom>
                <img
                  src={match[2]}
                  alt={match[1]}
                  className="max-w-full rounded-lg shadow-lg cursor-zoom-in"
                />
              </Zoom>
            </div>
          );
        }
      }

      if (line.startsWith('## ')) {
        return (
          <h2
            key={index}
            className={cn(
              "text-2xl font-bold mt-8 mb-4",
              isPrivateMode ? "text-white" : "text-gray-900 dark:text-white"
            )}
          >
            {line.replace('## ', '')}
          </h2>
        );
      }

      if (line.startsWith('### ')) {
        return (
          <h3
            key={index}
            className={cn(
              "text-xl font-semibold mt-6 mb-3",
              isPrivateMode ? "text-white" : "text-gray-900 dark:text-white"
            )}
          >
            {line.replace('### ', '')}
          </h3>
        );
      }

      if (line.startsWith('- ')) {
        return (
          <li
            key={index}
            className={cn(
              "ml-4",
              isPrivateMode ? "text-gray-300" : "text-gray-700 dark:text-gray-300"
            )}
          >
            {line.replace('- ', '')}
          </li>
        );
      }

      if (line.trim() === '') {
        return <br key={index} />;
      }

      return (
        <p
          key={index}
          className={cn(
            "mb-4 leading-relaxed",
            isPrivateMode ? "text-gray-300" : "text-gray-700 dark:text-gray-300"
          )}
        >
          {line}
        </p>
      );
    });
  };

  return <div className="prose dark:prose-invert max-w-none">{renderContent()}</div>;
}
