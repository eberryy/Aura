'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { ArrowLeft, Save, Eye, Edit2, Video, FileText, Bold, Italic, Heading2, List, Link2, Image, Code } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { folderService, postService } from '@/services/api';
import { Folder, Post } from '@/types';
import { cn } from '@/lib/utils';
import { useTheme } from '@/hooks/useTheme';
import { useAuth } from '@/hooks/useAuth';
import { PrivateModeBackground } from '@/components/shared/PrivateModeBackground';
import { toast } from 'sonner';

function CreatePageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const folderIdFromUrl = searchParams.get('folderId');
  const editPostId = searchParams.get('editPostId');
  const { isPrivateMode } = useTheme();
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const [folders, setFolders] = useState<Folder[]>([]);
  const [selectedFolderId, setSelectedFolderId] = useState('');
  const [editingPost, setEditingPost] = useState<Post | null>(null);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [summary, setSummary] = useState('');
  const [tags, setTags] = useState('');
  const [contentType, setContentType] = useState<'article' | 'video'>('article');
  const [videoUrl, setVideoUrl] = useState('');
  const [videoDescription, setVideoDescription] = useState('');
  const [isPreview, setIsPreview] = useState(false);
  const [saving, setSaving] = useState(false);

  const isEditMode = !!editPostId;

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/');
    }
  }, [isAuthenticated, authLoading, router]);

  useEffect(() => {
    const fetchData = async () => {
      const foldersResponse = await folderService.getAll(true);
      if (foldersResponse.data) {
        setFolders(foldersResponse.data);
        if (folderIdFromUrl) {
          setSelectedFolderId(folderIdFromUrl);
        } else if (foldersResponse.data.length > 0) {
          setSelectedFolderId(foldersResponse.data[0].id);
        }
      }

      if (editPostId) {
        const postResponse = await postService.getById(editPostId);
        if (postResponse.data) {
          const post = postResponse.data;
          setEditingPost(post);
          setTitle(post.title);
          setContent(post.content);
          setSummary(post.summary || '');
          setTags(post.tags.join(', '));
          setContentType(post.content_type);
          setVideoUrl(post.video_url || '');
          setVideoDescription(post.video_description || '');
          if (!folderIdFromUrl) {
            setSelectedFolderId(post.folder_id);
          }
        }
      }
    };
    fetchData();
  }, [folderIdFromUrl, editPostId]);

  const parseTags = (tagString: string): string[] => {
    return tagString
      .split(/[,，]/)
      .map((t) => t.trim())
      .filter(Boolean);
  };

  const insertMarkdown = (syntax: string) => {
    const textarea = document.getElementById('content-textarea') as HTMLTextAreaElement;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = content.substring(start, end);
    let newText = '';

    switch (syntax) {
      case 'bold':
        newText = `**${selectedText || '粗体文本'}**`;
        break;
      case 'italic':
        newText = `*${selectedText || '斜体文本'}*`;
        break;
      case 'h2':
        newText = `\n## ${selectedText || '标题'}\n`;
        break;
      case 'list':
        newText = `\n- ${selectedText || '列表项'}\n`;
        break;
      case 'link':
        newText = `[${selectedText || '链接文本'}](url)`;
        break;
      case 'image':
        newText = `![${selectedText || '图片描述'}](图片URL)`;
        break;
      case 'code':
        newText = `\`\`\`\n${selectedText || '代码'}\n\`\`\``;
        break;
      default:
        newText = syntax;
    }

    const newContent = content.substring(0, start) + newText + content.substring(end);
    setContent(newContent);

    setTimeout(() => {
      textarea.focus();
      const newCursorPos = start + newText.length;
      textarea.setSelectionRange(newCursorPos, newCursorPos);
    }, 0);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedFolderId) {
      toast.error('请选择一个板块');
      return;
    }

    if (!title.trim() || !content.trim()) {
      toast.error('标题和内容不能为空');
      return;
    }

    setSaving(true);

    let response;
    if (isEditMode && editingPost) {
      response = await postService.update(editingPost.id, {
        title,
        content,
        summary,
        tags: parseTags(tags),
        content_type: contentType,
        video_url: videoUrl || undefined,
        video_description: videoDescription || undefined,
      });
    } else {
      response = await postService.create({
        folder_id: selectedFolderId,
        title,
        content,
        summary,
        tags: parseTags(tags),
        content_type: contentType,
        video_url: videoUrl || undefined,
        video_description: videoDescription || undefined,
      });
    }

    setSaving(false);

    if (response.data) {
      toast.success(isEditMode ? '文章更新成功' : '文章发布成功');
      router.push(`/${selectedFolderId}/${response.data.id}`);
    } else {
      toast.error(isEditMode ? '更新失败' : '发布失败');
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500" />
      </div>
    );
  }

  return (
    <div
      className={cn(
        "min-h-screen transition-colors duration-500",
        isPrivateMode ? "bg-black" : "bg-gray-50 dark:bg-gray-900"
      )}
    >
      {isPrivateMode && <PrivateModeBackground />}

      <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="mb-6"
        >
          <Button
            variant="ghost"
            onClick={() => router.back()}
            className={cn(
              "gap-2",
              isPrivateMode ? "text-gray-300 hover:text-white hover:bg-white/10" : ""
            )}
          >
            <ArrowLeft size={20} />
            返回
          </Button>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card className={cn(
            isPrivateMode
              ? "bg-white/5 border-purple-500/20"
              : "dark:bg-gray-800/50"
          )}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h1 className={cn(
                  "text-2xl font-bold",
                  isPrivateMode ? "text-white" : "text-gray-900 dark:text-white"
                )}>
                  {isEditMode ? '编辑文章' : '发布新文章'}
                </h1>
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsPreview(!isPreview)}
                    className={cn(
                      "gap-2",
                      isPrivateMode
                        ? "text-gray-400 hover:text-white hover:bg-white/10"
                        : ""
                    )}
                  >
                    {isPreview ? <Edit2 size={16} /> : <Eye size={16} />}
                    {isPreview ? '编辑' : '预览'}
                  </Button>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                {!folderIdFromUrl && (
                  <div>
                    <label className={cn(
                      "block text-sm font-medium mb-2",
                      isPrivateMode ? "text-gray-300" : "text-gray-700 dark:text-gray-300"
                    )}>
                      选择板块
                    </label>
                    <select
                      value={selectedFolderId}
                      onChange={(e) => setSelectedFolderId(e.target.value)}
                      className={cn(
                        "w-full h-9 rounded-md border px-3 py-1 text-sm",
                        isPrivateMode
                          ? "bg-white/10 border-purple-500/30 text-white"
                          : "border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900"
                      )}
                    >
                      {folders.map((folder) => (
                        <option key={folder.id} value={folder.id}>
                          {folder.title} {folder.is_private ? '(私密)' : ''}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className={cn(
                      "block text-sm font-medium mb-2",
                      isPrivateMode ? "text-gray-300" : "text-gray-700 dark:text-gray-300"
                    )}>
                      内容类型
                    </label>
                    <div className="flex gap-2">
                      <Button
                        type="button"
                        variant={contentType === 'article' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setContentType('article')}
                        className={cn(
                          "gap-2 flex-1",
                          contentType === 'article' && isPrivateMode
                            ? "bg-gradient-to-r from-purple-600 to-pink-600"
                            : ""
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
                          "gap-2 flex-1",
                          contentType === 'video' && isPrivateMode
                            ? "bg-gradient-to-r from-purple-600 to-pink-600"
                            : ""
                        )}
                      >
                        <Video size={16} />
                        视频
                      </Button>
                    </div>
                  </div>
                </div>

                <Input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="标题"
                  required
                  className={cn(
                    "text-lg font-medium",
                    isPrivateMode
                      ? "bg-white/10 border-purple-500/30 text-white placeholder:text-gray-400"
                      : ""
                  )}
                />

                <Input
                  value={summary}
                  onChange={(e) => setSummary(e.target.value)}
                  placeholder="摘要（可选）"
                  className={cn(
                    isPrivateMode
                      ? "bg-white/10 border-purple-500/30 text-white placeholder:text-gray-400"
                      : ""
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
                          ? "bg-white/10 border-purple-500/30 text-white placeholder:text-gray-400"
                          : ""
                      )}
                    />
                    <Input
                      value={videoDescription}
                      onChange={(e) => setVideoDescription(e.target.value)}
                      placeholder="视频简介"
                      className={cn(
                        isPrivateMode
                          ? "bg-white/10 border-purple-500/30 text-white placeholder:text-gray-400"
                          : ""
                      )}
                    />
                  </div>
                )}

                {contentType === 'article' && (
                  <>
                    <div className="flex gap-1 flex-wrap">
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => insertMarkdown('bold')}
                        title="粗体"
                        className={cn(isPrivateMode ? "text-gray-400 hover:text-white hover:bg-white/10" : "")}
                      >
                        <Bold size={16} />
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => insertMarkdown('italic')}
                        title="斜体"
                        className={cn(isPrivateMode ? "text-gray-400 hover:text-white hover:bg-white/10" : "")}
                      >
                        <Italic size={16} />
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => insertMarkdown('h2')}
                        title="标题"
                        className={cn(isPrivateMode ? "text-gray-400 hover:text-white hover:bg-white/10" : "")}
                      >
                        <Heading2 size={16} />
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => insertMarkdown('list')}
                        title="列表"
                        className={cn(isPrivateMode ? "text-gray-400 hover:text-white hover:bg-white/10" : "")}
                      >
                        <List size={16} />
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => insertMarkdown('link')}
                        title="链接"
                        className={cn(isPrivateMode ? "text-gray-400 hover:text-white hover:bg-white/10" : "")}
                      >
                        <Link2 size={16} />
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => insertMarkdown('image')}
                        title="图片"
                        className={cn(isPrivateMode ? "text-gray-400 hover:text-white hover:bg-white/10" : "")}
                      >
                        <Image size={16} />
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => insertMarkdown('code')}
                        title="代码块"
                        className={cn(isPrivateMode ? "text-gray-400 hover:text-white hover:bg-white/10" : "")}
                      >
                        <Code size={16} />
                      </Button>
                    </div>

                    {isPreview ? (
                      <MarkdownPreview content={content} isPrivateMode={isPrivateMode} />
                    ) : (
                      <textarea
                        id="content-textarea"
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        placeholder="支持 Markdown 格式..."
                        required
                        rows={20}
                        className={cn(
                          "w-full p-4 rounded-lg resize-none font-mono text-sm",
                          isPrivateMode
                            ? "bg-white/10 border border-purple-500/30 text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                            : "border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        )}
                      />
                    )}
                  </>
                )}

                <Input
                  value={tags}
                  onChange={(e) => setTags(e.target.value)}
                  placeholder="标签（用中文逗号或英文逗号分隔）"
                  className={cn(
                    isPrivateMode
                      ? "bg-white/10 border-purple-500/30 text-white placeholder:text-gray-400"
                      : ""
                  )}
                />

                <div className="flex gap-3 justify-end pt-4">
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => router.back()}
                    className={cn(
                      isPrivateMode
                        ? "text-gray-400 hover:text-white hover:bg-white/10"
                        : ""
                    )}
                  >
                    取消
                  </Button>
                  <Button
                    type="submit"
                    disabled={saving || !title.trim() || !content.trim()}
                    className={cn(
                      "gap-2",
                      isPrivateMode
                        ? "bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                        : ""
                    )}
                  >
                    <Save size={16} />
                    {saving
                      ? isEditMode
                        ? '保存中...'
                        : '发布中...'
                      : isEditMode
                        ? '保存修改'
                        : '发布文章'
                    }
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}

function MarkdownPreview({ content, isPrivateMode }: { content: string; isPrivateMode: boolean }) {
  const renderContent = () => {
    const lines = content.split('\n');
    return lines.map((line, index) => {
      if (line.startsWith('```')) {
        return (
          <pre key={index} className={cn(
            "p-4 rounded-lg my-4 overflow-x-auto font-mono text-sm",
            isPrivateMode ? "bg-gray-800 text-gray-300" : "bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-300"
          )}>
            <code>{line.replace(/```/g, '')}</code>
          </pre>
        );
      }

      if (line.startsWith('![')) {
        const match = line.match(/!\[(.*?)\]\((.*?)\)/);
        if (match) {
          return (
            <div key={index} className="my-4">
              <img
                src={match[2]}
                alt={match[1]}
                className="max-w-full rounded-lg shadow-lg"
              />
            </div>
          );
        }
      }

      if (line.startsWith('## ')) {
        return (
          <h2
            key={index}
            className={cn(
              "text-2xl font-bold mt-6 mb-4",
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
              "text-xl font-semibold mt-4 mb-3",
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
              "ml-4 mb-1",
              isPrivateMode ? "text-gray-300" : "text-gray-700 dark:text-gray-300"
            )}
          >
            {parseInlineMarkdown(line.replace('- ', ''), isPrivateMode)}
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
          {parseInlineMarkdown(line, isPrivateMode)}
        </p>
      );
    });
  };

  return (
    <div className={cn(
      "min-h-[500px] p-6 rounded-lg",
      isPrivateMode
        ? "bg-white/5 border border-purple-500/20"
        : "bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700"
    )}>
      {renderContent()}
    </div>
  );
}

function parseInlineMarkdown(text: string, isPrivateMode: boolean): React.ReactNode {
  const parts: React.ReactNode[] = [];
  let remaining = text;
  let key = 0;

  while (remaining.length > 0) {
    const boldMatch = remaining.match(/\*\*(.+?)\*\*/);
    const italicMatch = remaining.match(/\*(.+?)\*/);
    const linkMatch = remaining.match(/\[(.+?)\]\((.+?)\)/);
    const codeMatch = remaining.match(/`(.+?)`/);

    const matches = [
      boldMatch && { type: 'bold', match: boldMatch, index: boldMatch.index! },
      italicMatch && { type: 'italic', match: italicMatch, index: italicMatch.index! },
      linkMatch && { type: 'link', match: linkMatch, index: linkMatch.index! },
      codeMatch && { type: 'code', match: codeMatch, index: codeMatch.index! },
    ].filter(Boolean) as { type: string; match: RegExpMatchArray; index: number }[];

    if (matches.length === 0) {
      parts.push(remaining);
      break;
    }

    const firstMatch = matches.sort((a, b) => a.index - b.index)[0];

    if (firstMatch.index > 0) {
      parts.push(remaining.slice(0, firstMatch.index));
    }

    switch (firstMatch.type) {
      case 'bold':
        parts.push(
          <strong key={key++} className="font-bold">
            {firstMatch.match[1]}
          </strong>
        );
        remaining = remaining.slice(firstMatch.index + firstMatch.match[0].length);
        break;
      case 'italic':
        parts.push(
          <em key={key++} className="italic">
            {firstMatch.match[1]}
          </em>
        );
        remaining = remaining.slice(firstMatch.index + firstMatch.match[0].length);
        break;
      case 'link':
        parts.push(
          <a
            key={key++}
            href={firstMatch.match[2]}
            target="_blank"
            rel="noopener noreferrer"
            className={cn(
              "underline",
              isPrivateMode ? "text-purple-400 hover:text-purple-300" : "text-indigo-600 hover:text-indigo-500"
            )}
          >
            {firstMatch.match[1]}
          </a>
        );
        remaining = remaining.slice(firstMatch.index + firstMatch.match[0].length);
        break;
      case 'code':
        parts.push(
          <code
            key={key++}
            className={cn(
              "px-1.5 py-0.5 rounded text-sm font-mono",
              isPrivateMode
                ? "bg-gray-800 text-purple-300"
                : "bg-gray-200 dark:bg-gray-800 text-gray-800 dark:text-gray-300"
            )}
          >
            {firstMatch.match[1]}
          </code>
        );
        remaining = remaining.slice(firstMatch.index + firstMatch.match[0].length);
        break;
    }
  }

  return parts;
}

export default function CreatePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500" />
      </div>
    }>
      <CreatePageContent />
    </Suspense>
  );
}
