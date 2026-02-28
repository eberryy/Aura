'use client';

import { motion } from 'framer-motion';
import { Edit } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/useAuth';
import { useTheme } from '@/hooks/useTheme';

interface EditButtonProps {
  postId: string;
  folderId: string;
}

export default function EditButton({ postId, folderId }: EditButtonProps) {
  const { isAuthenticated } = useAuth();
  const { isPrivateMode } = useTheme();

  if (!isAuthenticated) return null;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      className="absolute top-4 right-4 z-10"
    >
      <Button
        variant="outline"
        size="sm"
        className={cn(
          "gap-2",
          isPrivateMode
            ? "border-purple-500/30 text-purple-400 hover:bg-purple-500/20 hover:text-purple-300"
            : ""
        )}
        onClick={() => {
          console.log('Edit post:', postId);
        }}
      >
        <Edit size={16} />
        编辑
      </Button>
    </motion.div>
  );
}
