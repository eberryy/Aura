'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Reply, MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { commentService } from '@/services/api';
import { Comment } from '@/types';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/useAuth';

interface CommentSectionProps {
  postId: string;
  isPrivateMode: boolean;
}

export default function CommentSection({ postId, isPrivateMode }: CommentSectionProps) {
  const { isAuthenticated, user } = useAuth();
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [newComment, setNewComment] = useState('');
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyContent, setReplyContent] = useState('');

  useEffect(() => {
    const fetchComments = async () => {
      setLoading(true);
      const response = await commentService.getByPostId(postId);
      if (response.data) {
        setComments(response.data);
      }
      setLoading(false);
    };

    fetchComments();
  }, [postId]);

  const handleSubmitComment = async () => {
    if (!newComment.trim()) return;

    const response = await commentService.create({
      post_id: postId,
      parent_id: null,
      author_name: user?.display_name || '匿名用户',
      content: newComment,
      is_admin: !!user,
    });

    if (response.data) {
      setComments([...comments, response.data]);
      setNewComment('');
    }
  };

  const handleSubmitReply = async (parentId: string) => {
    if (!replyContent.trim()) return;

    const response = await commentService.create({
      post_id: postId,
      parent_id: parentId,
      author_name: user?.display_name || '匿名用户',
      content: replyContent,
      is_admin: !!user,
    });

    if (response.data) {
      setComments(comments.map(comment => {
        if (comment.id === parentId) {
          return {
            ...comment,
            replies: [...(comment.replies || []), response.data!],
          };
        }
        return comment;
      }));
      setReplyingTo(null);
      setReplyContent('');
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="mt-8"
    >
      <div className="flex items-center gap-2 mb-6">
        <MessageCircle size={24} className={cn(
          isPrivateMode ? "text-purple-400" : "text-indigo-500"
        )} />
        <h2 className={cn(
          "text-2xl font-bold",
          isPrivateMode ? "text-white" : "text-gray-900 dark:text-white"
        )}>
          回响 ({comments.length})
        </h2>
      </div>

      {isAuthenticated ? (
        <Card className={cn(
          "mb-6",
          isPrivateMode
            ? "bg-white/5 border-purple-500/20"
            : "dark:bg-gray-800/50"
        )}>
          <CardContent className="p-4">
            <div className="space-y-3">
              <Input
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="写下你的想法..."
                className={cn(
                  isPrivateMode
                    ? "bg-white/10 border-purple-500/30 text-white placeholder:text-gray-400"
                    : ""
                )}
              />
              <div className="flex justify-end">
                <Button
                  onClick={handleSubmitComment}
                  className={cn(
                    "gap-2",
                    isPrivateMode
                      ? "bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                      : ""
                  )}
                >
                  <Send size={16} />
                  发布评论
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card className={cn(
          "mb-6",
          isPrivateMode
            ? "bg-white/5 border-purple-500/20"
            : "dark:bg-gray-800/50"
        )}>
          <CardContent className="py-8 text-center">
            <p className={cn(
              isPrivateMode ? "text-gray-400" : "text-gray-500 dark:text-gray-400"
            )}>
              登录后才能发表评论
            </p>
          </CardContent>
        </Card>
      )}

      <div className="space-y-4">
        <AnimatePresence>
          {loading ? (
            Array.from({ length: 2 }).map((_, i) => (
              <CommentSkeleton key={i} isPrivateMode={isPrivateMode} />
            ))
          ) : comments.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className={cn(
                "text-center py-12",
                isPrivateMode ? "text-gray-500" : "text-gray-400 dark:text-gray-500"
              )}
            >
              暂无评论，快来抢沙发吧~
            </motion.div>
          ) : (
            comments.map((comment, index) => (
              <CommentItem
                key={comment.id}
                comment={comment}
                isPrivateMode={isPrivateMode}
                onReply={setReplyingTo}
                replyingTo={replyingTo}
                replyContent={replyContent}
                setReplyContent={setReplyContent}
                onSubmitReply={handleSubmitReply}
                initialDelay={index * 0.1}
              />
            ))
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

interface CommentItemProps {
  comment: Comment;
  isPrivateMode: boolean;
  onReply: (id: string) => void;
  replyingTo: string | null;
  replyContent: string;
  setReplyContent: (content: string) => void;
  onSubmitReply: (parentId: string) => void;
  initialDelay: number;
}

function CommentItem({
  comment,
  isPrivateMode,
  onReply,
  replyingTo,
  replyContent,
  setReplyContent,
  onSubmitReply,
  initialDelay,
}: CommentItemProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ delay: initialDelay }}
    >
      <Card className={cn(
        isPrivateMode
          ? "bg-white/5 border-purple-500/20"
          : "dark:bg-gray-800/50"
      )}>
        <CardContent className="p-4">
          <div className="flex gap-3">
            <div className={cn(
              "w-10 h-10 rounded-full flex items-center justify-center font-bold text-white flex-shrink-0",
              comment.is_admin
                ? "bg-gradient-to-br from-purple-600 to-pink-600 ring-2 ring-purple-400/50 ring-offset-2 ring-offset-black"
                : "bg-gradient-to-br from-indigo-500 to-purple-500"
            )}>
              {comment.author_name[0].toUpperCase()}
            </div>
            <div className="flex-1 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className={cn(
                    "font-semibold",
                    isPrivateMode ? "text-white" : "text-gray-900 dark:text-white"
                  )}>
                    {comment.author_name}
                  </span>
                  {comment.is_admin && (
                    <span className={cn(
                      "px-2 py-0.5 rounded text-xs font-medium",
                      isPrivateMode
                        ? "bg-gradient-to-r from-purple-500/20 to-pink-500/20 text-purple-400 border border-purple-500/30"
                        : "bg-gradient-to-r from-indigo-500/20 to-purple-500/20 text-indigo-500"
                    )}>
                      Author
                    </span>
                  )}
                </div>
                <span className={cn(
                  "text-xs",
                  isPrivateMode ? "text-gray-500" : "text-gray-400 dark:text-gray-500"
                )}>
                  {new Date(comment.created_at).toLocaleDateString('zh-CN')}
                </span>
              </div>
              <p className={cn(
                isPrivateMode ? "text-gray-300" : "text-gray-700 dark:text-gray-300"
              )}>
                {comment.content}
              </p>
              <div className="flex items-center gap-4">
                <button
                  onClick={() => onReply(comment.id)}
                  className={cn(
                    "text-xs flex items-center gap-1 transition-colors",
                    isPrivateMode
                      ? "text-gray-500 hover:text-purple-400"
                      : "text-gray-400 hover:text-indigo-500"
                  )}
                >
                  <Reply size={12} />
                  回复
                </button>
              </div>

              {replyingTo === comment.id && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mt-3 space-y-2"
                >
                  <Input
                    value={replyContent}
                    onChange={(e) => setReplyContent(e.target.value)}
                    placeholder={`回复 ${comment.author_name}...`}
                    className={cn(
                      isPrivateMode
                        ? "bg-white/10 border-purple-500/30 text-white"
                        : ""
                    )}
                  />
                  <div className="flex gap-2 justify-end">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onReply('')}
                      className={cn(
                        isPrivateMode ? "text-gray-400 hover:text-white" : ""
                      )}
                    >
                      取消
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => onSubmitReply(comment.id)}
                      className={cn(
                        "gap-1",
                        isPrivateMode
                          ? "bg-gradient-to-r from-purple-600 to-pink-600"
                          : ""
                      )}
                    >
                      <Send size={14} />
                      回复
                    </Button>
                  </div>
                </motion.div>
              )}

              {comment.replies && comment.replies.length > 0 && (
                <div className="mt-4 space-y-3 pl-4 border-l-2 border-purple-500/20">
                  {comment.replies.map((reply) => (
                    <CommentItem
                      key={reply.id}
                      comment={reply}
                      isPrivateMode={isPrivateMode}
                      onReply={onReply}
                      replyingTo={replyingTo}
                      replyContent={replyContent}
                      setReplyContent={setReplyContent}
                      onSubmitReply={onSubmitReply}
                      initialDelay={0}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

function CommentSkeleton({ isPrivateMode }: { isPrivateMode: boolean }) {
  return (
    <Card className={cn(
      isPrivateMode
        ? "bg-white/5 border-purple-500/20"
        : "dark:bg-gray-800/50"
    )}>
      <CardContent className="p-4">
        <div className="flex gap-3">
          <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-700 animate-pulse" />
          <div className="flex-1 space-y-2">
            <div className="h-4 w-32 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
            <div className="h-4 w-full bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
            <div className="h-4 w-2/3 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
