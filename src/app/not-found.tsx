'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { Home, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useTheme } from '@/hooks/useTheme';

export default function NotFound() {
  const { isPrivateMode } = useTheme();

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
            scale: [1, 1.05, 1],
          }}
          transition={{ duration: 2, repeat: Infinity }}
          className={cn(
            'inline-flex items-center justify-center w-24 h-24 rounded-full mb-6',
            isPrivateMode
              ? 'bg-gradient-to-br from-purple-600/30 to-pink-600/30'
              : 'bg-gradient-to-br from-indigo-500/20 to-purple-500/20'
          )}
        >
          <span className={cn(
            'text-5xl font-bold',
            isPrivateMode ? 'text-purple-400' : 'text-indigo-500'
          )}>
            4
          </span>
          <span className={cn(
            'text-5xl font-bold mx-1',
            isPrivateMode ? 'text-pink-400' : 'text-purple-500'
          )}>
            0
          </span>
          <span className={cn(
            'text-5xl font-bold',
            isPrivateMode ? 'text-purple-400' : 'text-indigo-500'
          )}>
            4
          </span>
        </motion.div>

        <h1
          className={cn(
            'text-3xl font-bold mb-4',
            isPrivateMode ? 'text-white' : 'text-gray-900 dark:text-white'
          )}
        >
          页面未找到
        </h1>

        <p
          className={cn(
            'mb-8',
            isPrivateMode ? 'text-gray-400' : 'text-gray-600 dark:text-gray-400'
          )}
        >
          抱歉，您访问的页面不存在或已被移除
        </p>

        <div className="flex gap-4 justify-center">
          <Button
            variant="outline"
            asChild
            className={cn(
              isPrivateMode
                ? 'border-purple-500/30 text-gray-300 hover:bg-white/10'
                : ''
            )}
          >
            <Link href="/">
              <Home size={16} className="mr-2" />
              返回首页
            </Link>
          </Button>
          <Button
            asChild
            className={cn(
              'gap-2',
              isPrivateMode
                ? 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700'
                : ''
            )}
          >
            <Link href="/">
              <Search size={16} />
              浏览内容
            </Link>
          </Button>
        </div>
      </motion.div>
    </div>
  );
}
