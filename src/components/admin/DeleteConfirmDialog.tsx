'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface DeleteConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  isPrivateMode?: boolean;
}

export default function DeleteConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  isPrivateMode = false,
}: DeleteConfirmDialogProps) {
  return (
    <AnimatePresence>
      {isOpen && (
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
          >
            <Card
              className={cn(
                'w-full max-w-md',
                isPrivateMode
                  ? 'bg-gray-900 border-purple-500/30'
                  : 'dark:bg-gray-800',
              )}
              onClick={(e) => e.stopPropagation()}
            >
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <motion.div
                    animate={{ 
                      scale: [1, 1.1, 1],
                      rotate: [0, -5, 5, 0]
                    }}
                    transition={{ duration: 0.5 }}
                    className={cn(
                      'p-3 rounded-full',
                      isPrivateMode
                        ? 'bg-red-500/20 text-red-400'
                        : 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400',
                    )}
                  >
                    <AlertTriangle size={24} />
                  </motion.div>
                  <div className="flex-1">
                    <h3
                      className={cn(
                        'text-lg font-semibold mb-2',
                        isPrivateMode
                          ? 'text-white'
                          : 'text-gray-900 dark:text-white',
                      )}
                    >
                      {title}
                    </h3>
                    <p
                      className={cn(
                        'text-sm mb-6',
                        isPrivateMode
                          ? 'text-gray-400'
                          : 'text-gray-600 dark:text-gray-400',
                      )}
                    >
                      {message}
                    </p>
                    <div className="flex gap-3 justify-end">
                      <Button
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
                        onClick={() => {
                          onConfirm();
                          onClose();
                        }}
                        className="bg-red-600 hover:bg-red-700 text-white"
                      >
                        确认删除
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
