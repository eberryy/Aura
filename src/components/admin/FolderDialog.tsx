'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { X, Lock, LockOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Folder } from '@/types';
import { cn } from '@/lib/utils';

interface FolderDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: Partial<Folder>) => void;
  folder?: Folder | null;
  isPrivateMode?: boolean;
}

const iconOptions = [
  { value: 'code-2', label: '代码' },
  { value: 'camera', label: '相机' },
  { value: 'lock', label: '锁' },
  { value: 'book', label: '书本' },
  { value: 'music', label: '音乐' },
  { value: 'heart', label: '心' },
  { value: 'star', label: '星星' },
  { value: 'folder', label: '文件夹' },
];

export default function FolderDialog({
  isOpen,
  onClose,
  onSubmit,
  folder,
  isPrivateMode = false,
}: FolderDialogProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [icon, setIcon] = useState('folder');
  const [isPrivate, setIsPrivate] = useState(false);

  useEffect(() => {
    if (folder) {
      setTitle(folder.title);
      setDescription(folder.description || '');
      setIcon(folder.icon || 'folder');
      setIsPrivate(folder.is_private);
    } else {
      setTitle('');
      setDescription('');
      setIcon('folder');
      setIsPrivate(false);
    }
  }, [folder, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      title,
      description,
      icon,
      is_private: isPrivate,
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
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
      >
        <Card className={cn('w-full max-w-md', isPrivateMode ? 'bg-gray-900 border-purple-500/30' : 'dark:bg-gray-800')}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className={cn('text-xl font-bold', isPrivateMode ? 'text-white' : 'text-gray-900 dark:text-white')}>
                {folder ? '编辑板块' : '新建板块'}
              </h2>
              <Button variant="ghost" size="icon" onClick={onClose} className={cn(isPrivateMode ? 'text-gray-400 hover:text-white' : '')}>
                <X size={20} />
              </Button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className={cn('block text-sm font-medium mb-2', isPrivateMode ? 'text-gray-300' : 'text-gray-700 dark:text-gray-300')}>
                  标题
                </label>
                <Input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="输入板块标题"
                  required
                  className={cn(isPrivateMode ? 'bg-white/10 border-purple-500/30 text-white placeholder:text-gray-400' : '')}
                />
              </div>

              <div>
                <label className={cn('block text-sm font-medium mb-2', isPrivateMode ? 'text-gray-300' : 'text-gray-700 dark:text-gray-300')}>
                  简介
                </label>
                <Input
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="输入板块简介"
                  className={cn(isPrivateMode ? 'bg-white/10 border-purple-500/30 text-white placeholder:text-gray-400' : '')}
                />
              </div>

              <div>
                <label className={cn('block text-sm font-medium mb-2', isPrivateMode ? 'text-gray-300' : 'text-gray-700 dark:text-gray-300')}>
                  图标
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {iconOptions.map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => setIcon(option.value)}
                      className={cn(
                        'p-3 rounded-lg border-2 transition-all text-sm',
                        icon === option.value
                          ? isPrivateMode
                            ? 'border-purple-500 bg-purple-500/20 text-purple-400'
                            : 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400'
                          : isPrivateMode
                            ? 'border-gray-700 hover:border-purple-500/50 text-gray-400'
                            : 'border-gray-200 dark:border-gray-700 hover:border-indigo-300 text-gray-600 dark:text-gray-400',
                      )}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-between p-4 rounded-lg border-2 border-dashed">
                <div className="flex items-center gap-3">
                  {isPrivate ? (
                    <Lock className={cn('w-5 h-5', isPrivateMode ? 'text-purple-400' : 'text-indigo-500')} />
                  ) : (
                    <LockOpen className={cn('w-5 h-5', isPrivateMode ? 'text-gray-400' : 'text-gray-500')} />
                  )}
                  <div>
                    <p className={cn('font-medium', isPrivateMode ? 'text-white' : 'text-gray-900 dark:text-white')}>
                      私密板块
                    </p>
                    <p className={cn('text-xs', isPrivateMode ? 'text-gray-400' : 'text-gray-500 dark:text-gray-400')}>
                      仅在私密模式下可见
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsPrivate(!isPrivate)}
                  className={cn(
                    'relative w-12 h-6 rounded-full transition-colors',
                    isPrivate
                      ? 'bg-gradient-to-r from-purple-600 to-pink-600'
                      : isPrivateMode
                        ? 'bg-gray-700'
                        : 'bg-gray-200 dark:bg-gray-700',
                  )}
                >
                  <motion.div
                    animate={{ x: isPrivate ? 24 : 2 }}
                    className="absolute top-1 w-4 h-4 bg-white rounded-full shadow"
                  />
                </button>
              </div>

              <div className="flex gap-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={onClose}
                  className="flex-1"
                >
                  取消
                </Button>
                <Button
                  type="submit"
                  disabled={!title.trim()}
                  className={cn(
                    'flex-1',
                    isPrivateMode
                      ? 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700'
                      : '',
                  )}
                >
                  {folder ? '保存' : '创建'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
}
