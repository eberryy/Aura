'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { X, Save, Eye, Edit2, Video, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Post } from '@/types';
import { cn } from '@/lib/utils';

interface PostEditorProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: Partial<Post>) => void;
  post?: Post | null;
  folderId: string;
  isPrivateMode?: boolean;
}

export default function PostEditor({
  isOpen,
  onClose,
  onSubmit,
  post,
  folderId,
  isPrivateMode = false,
}: PostEditorProps) {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [summary, setSummary] = useState('');
  const [tags, setTags] = useState('');
  const [contentType, setContentType] = useState<'article' | 'video'>('article');
  const [videoUrl, setVideoUrl] = useState('');
  const [videoDescription, setVideoDescription] = useState('');
  const [isPreview, setIsPreview] = useState(false);

  useEffect(() => {
    if (post) {
      setTitle(post.title);
      setContent(post.content);
      setSummary(post.summary || '');
      setTags(post.tags.join(', '));
      setContentType(post.content_type);
      setVideoUrl(post.video_url || '');
      setVideoDescription(post.video_description || '');
    } else {
      setTitle('');
      setContent('');
      setSummary('');
      setTags('');
      setContentType('article');
      setVideoUrl('');
      setVideoDescription('');
    }
  }, [post, isOpen]);

  const parseTags = (tagString: string): string[] => {
    return tagString
      .split(/[,，]/)
      .map((t) => t.trim())
      .filter(Boolean);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      folder_id: folderId,
      title,
      content,
      summary,
      tags: parseTags(tags),
      content_type: contentType,
      video_url: videoUrl || undefined,
      video_description: videoDescription || undefined,
    });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 20 }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        className="w-full max-w-4xl max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <Card
          className={cn(
            isPrivateMode
              ? 'bg-gray-900 border-purple-500/30'
              : 'dark:bg-gray-800',
          )}
        >
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h2
                className={cn(
                  'text-xl font-bold',
                  isPrivateMode ? 'text-white' : 'text-gray-900 dark:text-white',
                )}
              >
                {post ? '编辑文章' : '发布新文章'}
              </h2>
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsPreview(!isPreview)}
                  className={cn(
                    'gap-2',
                    isPrivateMode
                      ? 'text-gray-400 hover:text-white hover:bg-white/10'
                      : '',
                  )}
                >
                  {isPreview ? <Edit2 size={16} /> : <Eye size={16} />}
                  {isPreview ? '编辑' : '预览'}
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={onClose}
                  className={cn(
                    isPrivateMode
                      ? 'text-gray-400 hover:text-white hover:bg-white/10'
                      : '',
                  )}
                >
                  <X size={20} />
                </Button>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="flex gap-2 mb-4">
                <Button
                  type="button"
                  variant={contentType === 'article' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setContentType('article')}
                  className={cn(
                    'gap-2',
                    contentType === 'article' && isPrivateMode
                      ? 'bg-gradient-to-r from-purple-600 to-pink-600'
                      : '',
                  )}
                >
                  <FileText size={16} />
                  文章
                </Button>
                <Button
                  type="button"
                  variant={contentType === 'video' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setContentType('video')}
                  className={cn(
                    'gap-2',
                    contentType === 'video' && isPrivateMode
                      ? 'bg-gradient-to-r from-purple-600 to-pink-600'
                      : '',
                  )}
                >
                  <Video size={16} />
                  视频
                </Button>
              </div>

              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="标题"
                required
                className={cn(
                  isPrivateMode
                    ? 'bg-white/10 border-purple-500/30 text-white placeholder:text-gray-400'
                    : '',
                )}
              />

              <Input
                value={summary}
                onChange={(e) => setSummary(e.target.value)}
                placeholder="摘要（可选）"
                className={cn(
                  isPrivateMode
                    ? 'bg-white/10 border-purple-500/30 text-white placeholder:text-gray-400'
                    : '',
                )}
              />

              {contentType === 'video' && (
                <div className="space-y-3">
                  <Input
                    value={videoUrl}
                    onChange={(e) => setVideoUrl(e.target.value)}
                    placeholder="视频链接（YouTube, Bilibili 等）"
                    className={cn(
                      isPrivateMode
                        ? 'bg-white/10 border-purple-500/30 text-white placeholder:text-gray-400'
                        : '',
                    )}
                  />
                  <Input
                    value={videoDescription}
                    onChange={(e) => setVideoDescription(e.target.value)}
                    placeholder="视频简介"
                    className={cn(
                      isPrivateMode
                        ? 'bg-white/10 border-purple-500/30 text-white placeholder:text-gray-400'
                        : '',
                    )}
                  />
                </div>
              )}

              <div className="relative">
                {isPreview ? (
                  <div
                    className={cn(
                      'min-h-[300px] p-4 rounded-lg prose dark:prose-invert max-w-none',
                      isPrivateMode
                        ? 'bg-white/5 text-gray-300'
                        : 'bg-gray-50 dark:bg-gray-900',
                    )}
                  >
                    <h1 className="text-2xl font-bold mb-4">{title || '标题'}</h1>
                    <div className="whitespace-pre-wrap">{content || '内容预览...'}</div>
                  </div>
                ) : (
                  <textarea
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="支持 Markdown 格式..."
                    required
                    rows={12}
                    className={cn(
                      'w-full p-4 rounded-lg resize-none',
                      isPrivateMode
                        ? 'bg-white/10 border border-purple-500/30 text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500/50'
                        : 'border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500',
                    )}
                  />
                )}
              </div>

              <Input
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                placeholder="标签（用中文逗号或英文逗号分隔）"
                className={cn(
                  isPrivateMode
                    ? 'bg-white/10 border-purple-500/30 text-white placeholder:text-gray-400'
                    : '',
                )}
              />

              <div className="flex gap-3 justify-end pt-4">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={onClose}
                  className={cn(
                    isPrivateMode
                      ? 'text-gray-400 hover:text-white hover:bg-white/10'
                      : '',
                  )}
                >
                  取消
                </Button>
                <Button
                  type="submit"
                  disabled={!title.trim() || !content.trim()}
                  className={cn(
                    'gap-2',
                    isPrivateMode
                      ? 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700'
                      : '',
                  )}
                >
                  <Save size={16} />
                  {post ? '保存' : '发布'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
}
