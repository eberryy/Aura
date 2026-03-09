'use client';

import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useTheme } from '@/hooks/useTheme';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const { isPrivateMode } = useTheme();

  useEffect(() => {
    console.error('Application error:', error);
  }, [error]);

  return (
    <div
      className={cn(
        'min-h-screen flex items-center justify-center p-4 transition-colors duration-500',
        isPrivateMode ? 'bg-black' : 'bg-gray-50 dark:bg-gray-900'
      )}
    >
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center max-w-md"
      >
        <motion.div
          animate={{ 
            scale: [1, 1.1, 1],
            rotate: [0, -5, 5, 0]
          }}
          transition={{ duration: 0.5 }}
          className={cn(
            'inline-flex items-center justify-center w-20 h-20 rounded-full mb-6',
            isPrivateMode
              ? 'bg-red-500/20 text-red-400'
              : 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400'
          )}
        >
          <AlertTriangle size={40} />
        </motion.div>

        <h1
          className={cn(
            'text-3xl font-bold mb-4',
            isPrivateMode ? 'text-white' : 'text-gray-900 dark:text-white'
          )}
        >
          出错了
        </h1>

        <p
          className={cn(
            'mb-8',
            isPrivateMode ? 'text-gray-400' : 'text-gray-600 dark:text-gray-400'
          )}
        >
          {error.message || '发生了意外错误，请稍后重试'}
        </p>

        <div className="flex gap-4 justify-center">
          <Button
            variant="outline"
            onClick={() => window.location.href = '/'}
            className={cn(
              'gap-2',
              isPrivateMode
                ? 'border-purple-500/30 text-gray-300 hover:bg-white/10'
                : ''
            )}
          >
            <Home size={16} />
            返回首页
          </Button>
          <Button
            onClick={reset}
            className={cn(
              'gap-2',
              isPrivateMode
                ? 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700'
                : ''
            )}
          >
            <RefreshCw size={16} />
            重试
          </Button>
        </div>
      </motion.div>
    </div>
  );
}
