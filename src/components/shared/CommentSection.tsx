'use client';

import { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Reply, MessageCircle, RefreshCw, User, ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { commentService } from '@/services/api';
import { Comment } from '@/types';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/useAuth';
import {
  generateAnonymousId,
  validateAnonymousId,
  formatAnonymousId,
} from '@/lib/anonymousId';
import { getEffectiveDepth } from '@/lib/commentTree';

const MAX_VISUAL_DEPTH = 3;

interface CommentSectionProps {
  postId: string;
  isPrivateMode: boolean;
}

export default function CommentSection({ postId, isPrivateMode }: CommentSectionProps) {
  const { isAuthenticated, user } = useAuth();
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [newComment, setNewComment] = useState('');
  const [anonymousId, setAnonymousId] = useState('');
  const [idError, setIdError] = useState('');

  useEffect(() => {
    setAnonymousId(generateAnonymousId());
  }, []);

  const fetchComments = useCallback(async () => {
    setLoading(true);
    const response = await commentService.getByPostId(postId);
    if (response.data) {
      setComments(response.data);
    }
    setLoading(false);
  }, [postId]);

  useEffect(() => {
    fetchComments();
  }, [fetchComments]);

  const handleIdChange = (value: string) => {
    setAnonymousId(value);
    if (value.trim()) {
      const validation = validateAnonymousId(value);
      setIdError(validation.valid ? '' : validation.error || '');
    } else {
      setIdError('');
    }
  };

  const handleSubmitComment = async () => {
    if (!newComment.trim()) return;

    if (!isAuthenticated) {
      const validation = validateAnonymousId(anonymousId);
      if (!validation.valid) {
        setIdError(validation.error || '');
        return;
      }
    }

    await commentService.create({
      post_id: postId,
      parent_id: null,
      author_name: isAuthenticated ? user?.display_name || '管理员' : formatAnonymousId(anonymousId),
      content: newComment,
      is_admin: !!isAuthenticated,
      is_author: !!isAuthenticated,
      anonymous_id: isAuthenticated ? undefined : formatAnonymousId(anonymousId),
    });

    setNewComment('');
    setAnonymousId(generateAnonymousId());
    setIdError('');
    fetchComments();
  };

  const totalComments = countAllComments(comments);

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mt-8">
      <div className="flex items-center gap-2 mb-6">
        <MessageCircle size={24} className={cn(isPrivateMode ? 'text-purple-400' : 'text-indigo-500')} />
        <h2 className={cn('text-2xl font-bold', isPrivateMode ? 'text-white' : 'text-gray-900 dark:text-white')}>
          回响 ({totalComments})
        </h2>
      </div>

      <Card className={cn('mb-6', isPrivateMode ? 'bg-white/5 border-purple-500/20' : 'dark:bg-gray-800/50')}>
        <CardContent className="p-4">
          <div className="space-y-3">
            {!isAuthenticated && (
              <div className="space-y-2">
                <label className={cn('text-sm font-medium flex items-center gap-2', isPrivateMode ? 'text-gray-300' : 'text-gray-700 dark:text-gray-300')}>
                  <User size={16} />
                  评论身份
                </label>
                <div className="flex gap-2">
                  <Input
                    value={anonymousId}
                    onChange={(e) => handleIdChange(e.target.value)}
                    placeholder="输入自定义ID或使用随机ID"
                    className={cn(
                      'flex-1',
                      isPrivateMode ? 'bg-white/10 border-purple-500/30 text-white placeholder:text-gray-400' : '',
                      idError ? 'border-red-500' : ''
                    )}
                  />
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => { setAnonymousId(generateAnonymousId()); setIdError(''); }}
                    className={cn(isPrivateMode ? 'border-purple-500/30 text-purple-400 hover:bg-purple-500/20' : '')}
                    title="生成新ID"
                  >
                    <RefreshCw size={16} />
                  </Button>
                </div>
                {idError && <p className="text-red-500 text-xs">{idError}</p>}
                <p className={cn('text-xs', isPrivateMode ? 'text-gray-500' : 'text-gray-400')}>
                  可自定义你的评论身份ID（3-20个字符，支持字母、数字、下划线和中文）
                </p>
              </div>
            )}

            <Input
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="写下你的想法..."
              className={cn(isPrivateMode ? 'bg-white/10 border-purple-500/30 text-white placeholder:text-gray-400' : '')}
            />
            <div className="flex justify-end">
              <Button
                onClick={handleSubmitComment}
                disabled={!newComment.trim() || (!isAuthenticated && !anonymousId.trim())}
                className={cn('gap-2', isPrivateMode ? 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700' : '')}
              >
                <Send size={16} />
                发布评论
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-4">
        <AnimatePresence>
          {loading ? (
            Array.from({ length: 2 }).map((_, i) => <CommentSkeleton key={i} isPrivateMode={isPrivateMode} />)
          ) : comments.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className={cn('text-center py-12', isPrivateMode ? 'text-gray-500' : 'text-gray-400 dark:text-gray-500')}
            >
              暂无评论，快来抢沙发吧~
            </motion.div>
          ) : (
            comments.map((comment, index) => (
              <CommentItem
                key={comment.id}
                comment={comment}
                postId={postId}
                isPrivateMode={isPrivateMode}
                isAuthenticated={isAuthenticated}
                user={user}
                depth={0}
                onRefresh={fetchComments}
                initialDelay={index * 0.05}
              />
            ))
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

function countAllComments(comments: Comment[]): number {
  let count = 0;
  comments.forEach((c) => {
    count += 1;
    if (c.replies && c.replies.length > 0) {
      count += countAllComments(c.replies);
    }
  });
  return count;
}

interface CommentItemProps {
  comment: Comment;
  postId: string;
  isPrivateMode: boolean;
  isAuthenticated: boolean;
  user: any;
  depth: number;
  onRefresh: () => void;
  initialDelay: number;
}

function CommentItem({ comment, postId, isPrivateMode, isAuthenticated, user, depth, onRefresh, initialDelay }: CommentItemProps) {
  const [isReplying, setIsReplying] = useState(false);
  const [replyContent, setReplyContent] = useState('');
  const [replyAnonymousId, setReplyAnonymousId] = useState('');
  const [replyIdError, setReplyIdError] = useState('');
  const [isCollapsed, setIsCollapsed] = useState(false);

  useEffect(() => {
    if (isReplying && !isAuthenticated) {
      setReplyAnonymousId(generateAnonymousId());
    }
  }, [isReplying, isAuthenticated]);

  const effectiveDepth = getEffectiveDepth(depth);
  const showThreadLine = depth > 0 && depth <= MAX_VISUAL_DEPTH;
  const hasReplies = comment.replies && comment.replies.length > 0;

  const displayName = comment.is_admin
    ? comment.author_name
    : comment.anonymous_id || comment.author_name;

  const handleReplyIdChange = (value: string) => {
    setReplyAnonymousId(value);
    if (value.trim()) {
      const validation = validateAnonymousId(value);
      setReplyIdError(validation.valid ? '' : validation.error || '');
    } else {
      setReplyIdError('');
    }
  };

  const handleSubmitReply = async () => {
    if (!replyContent.trim()) return;

    if (!isAuthenticated) {
      const validation = validateAnonymousId(replyAnonymousId);
      if (!validation.valid) {
        setReplyIdError(validation.error || '');
        return;
      }
    }

    await commentService.create({
      post_id: postId,
      parent_id: comment.id,
      author_name: isAuthenticated ? user?.display_name || '管理员' : formatAnonymousId(replyAnonymousId),
      content: replyContent,
      is_admin: !!isAuthenticated,
      is_author: !!isAuthenticated,
      anonymous_id: isAuthenticated ? undefined : formatAnonymousId(replyAnonymousId),
    });

    setIsReplying(false);
    setReplyContent('');
    setReplyAnonymousId('');
    setReplyIdError('');
    onRefresh();
  };

  const indentClass = depth === 0 ? '' : depth === 1 ? 'ml-4 md:ml-6' : depth === 2 ? 'ml-8 md:ml-12' : 'ml-12 md:ml-16';

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ delay: initialDelay }}
      className={cn('relative', indentClass)}
    >
      {showThreadLine && (
        <div
          className={cn(
            'absolute left-0 top-0 bottom-0 w-0.5 cursor-pointer transition-colors rounded-full',
            isPrivateMode ? 'bg-purple-500/30 hover:bg-purple-500/50' : 'bg-indigo-200 dark:bg-indigo-800 hover:bg-indigo-300 dark:hover:bg-indigo-700'
          )}
          style={{ left: '-12px' }}
          onClick={() => setIsCollapsed(!isCollapsed)}
        />
      )}

      <Card className={cn(isPrivateMode ? 'bg-white/5 border-purple-500/20' : 'dark:bg-gray-800/50')}>
        <CardContent className="p-4">
          <div className="flex gap-3">
            <motion.div
              className={cn(
                'w-10 h-10 rounded-full flex items-center justify-center font-bold text-white flex-shrink-0',
                comment.is_admin || comment.is_author
                  ? 'bg-gradient-to-br from-purple-600 to-pink-600 ring-2 ring-purple-400/50 ring-offset-2 ring-offset-black'
                  : 'bg-gradient-to-br from-indigo-500 to-purple-500'
              )}
              animate={comment.is_author && isPrivateMode ? { boxShadow: ['0 0 10px rgba(147,51,234,0.3)', '0 0 20px rgba(147,51,234,0.5)', '0 0 10px rgba(147,51,234,0.3)'] } : {}}
              transition={{ duration: 2, repeat: Infinity }}
            >
              {displayName[0].toUpperCase()}
            </motion.div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className={cn('font-semibold truncate', isPrivateMode ? 'text-white' : 'text-gray-900 dark:text-white')}>
                    {displayName}
                  </span>
                  {(comment.is_admin || comment.is_author) && (
                    <span className={cn('px-2 py-0.5 rounded text-xs font-medium', isPrivateMode ? 'bg-gradient-to-r from-purple-500/20 to-pink-500/20 text-purple-400 border border-purple-500/30' : 'bg-gradient-to-r from-indigo-500/20 to-purple-500/20 text-indigo-500')}>
                      Author
                    </span>
                  )}
                </div>
                <span className={cn('text-xs flex-shrink-0', isPrivateMode ? 'text-gray-500' : 'text-gray-400 dark:text-gray-500')}>
                  {new Date(comment.created_at).toLocaleDateString('zh-CN')}
                </span>
              </div>

              <p className={cn('mt-2 break-words', isPrivateMode ? 'text-gray-300' : 'text-gray-700 dark:text-gray-300')}>
                {comment.content}
              </p>

              <div className="flex items-center gap-4 mt-3">
                <button
                  onClick={() => setIsReplying(!isReplying)}
                  className={cn('text-xs flex items-center gap-1 transition-colors', isPrivateMode ? 'text-gray-500 hover:text-purple-400' : 'text-gray-400 hover:text-indigo-500')}
                >
                  <Reply size={12} />
                  回复
                </button>

                {hasReplies && (
                  <button
                    onClick={() => setIsCollapsed(!isCollapsed)}
                    className={cn('text-xs flex items-center gap-1 transition-colors', isPrivateMode ? 'text-gray-500 hover:text-purple-400' : 'text-gray-400 hover:text-indigo-500')}
                  >
                    {isCollapsed ? <ChevronDown size={12} /> : <ChevronUp size={12} />}
                    {isCollapsed ? `展开 ${comment.replies?.length} 条回复` : '收起回复'}
                  </button>
                )}
              </div>

              <AnimatePresence>
                {isReplying && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mt-3 space-y-2 overflow-hidden"
                  >
                    {!isAuthenticated && (
                      <div className="flex gap-2">
                        <Input
                          value={replyAnonymousId}
                          onChange={(e) => handleReplyIdChange(e.target.value)}
                          placeholder="评论身份"
                          className={cn(
                            'flex-1',
                            isPrivateMode ? 'bg-white/10 border-purple-500/30 text-white' : '',
                            replyIdError ? 'border-red-500' : ''
                          )}
                        />
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => { setReplyAnonymousId(generateAnonymousId()); setReplyIdError(''); }}
                          className={cn(isPrivateMode ? 'border-purple-500/30 text-purple-400 hover:bg-purple-500/20' : '')}
                        >
                          <RefreshCw size={14} />
                        </Button>
                      </div>
                    )}
                    {replyIdError && <p className="text-red-500 text-xs">{replyIdError}</p>}
                    <Input
                      value={replyContent}
                      onChange={(e) => setReplyContent(e.target.value)}
                      placeholder={`回复 ${displayName}...`}
                      className={cn(isPrivateMode ? 'bg-white/10 border-purple-500/30 text-white' : '')}
                    />
                    <div className="flex gap-2 justify-end">
                      <Button variant="ghost" size="sm" onClick={() => setIsReplying(false)} className={cn(isPrivateMode ? 'text-gray-400 hover:text-white' : '')}>
                        取消
                      </Button>
                      <Button size="sm" onClick={handleSubmitReply} disabled={!replyContent.trim()} className={cn('gap-1', isPrivateMode ? 'bg-gradient-to-r from-purple-600 to-pink-600' : '')}>
                        <Send size={14} />
                        回复
                      </Button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </CardContent>
      </Card>

      <AnimatePresence>
        {hasReplies && !isCollapsed && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-3 space-y-3 overflow-hidden"
          >
            {comment.replies!.map((reply, index) => (
              <CommentItem
                key={reply.id}
                comment={reply}
                postId={postId}
                isPrivateMode={isPrivateMode}
                isAuthenticated={isAuthenticated}
                user={user}
                depth={depth + 1}
                onRefresh={onRefresh}
                initialDelay={index * 0.03}
              />
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

function CommentSkeleton({ isPrivateMode }: { isPrivateMode: boolean }) {
  return (
    <Card className={cn(isPrivateMode ? 'bg-white/5 border-purple-500/20' : 'dark:bg-gray-800/50')}>
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
