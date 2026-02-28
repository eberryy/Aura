'use client';

import { motion } from 'framer-motion';
import { Edit, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/useAuth';
import { useTheme } from '@/hooks/useTheme';

interface EditButtonProps {
  postId: string;
  folderId: string;
  onEdit?: () => void;
  onDelete?: () => void;
}

export default function EditButton({ postId, folderId, onEdit, onDelete }: EditButtonProps) {
  const { isAuthenticated } = useAuth();
  const { isPrivateMode } = useTheme();

  if (!isAuthenticated) return null;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      className="absolute top-4 right-4 z-10 flex gap-2"
    >
      {onDelete && (
        <Button
          variant="outline"
          size="sm"
          className={cn(
            "gap-2",
            isPrivateMode
              ? "border-purple-500/30 text-gray-400 hover:text-red-400 hover:bg-red-500/20"
              : "hover:text-red-600"
          )}
          onClick={onDelete}
        >
          <Trash2 size={16} />
          删除
        </Button>
      )}
      {onEdit && (
        <Button
          variant="outline"
          size="sm"
          className={cn(
            "gap-2",
            isPrivateMode
              ? "border-purple-500/30 text-purple-400 hover:bg-purple-500/20 hover:text-purple-300"
              : ""
          )}
          onClick={onEdit}
        >
          <Edit size={16} />
          编辑
        </Button>
      )}
    </motion.div>
  );
}
