"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { motion, AnimatePresence, Variants } from "framer-motion";
import { Plus, Trash2, Edit2 } from "lucide-react";
import * as LucideIcons from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { folderService } from "@/services/api";
import { Folder } from "@/types";
import { cn } from "@/lib/utils";
import { useTheme } from "@/hooks/useTheme";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import FolderDialog from "@/components/admin/FolderDialog";
import DeleteConfirmDialog from "@/components/admin/DeleteConfirmDialog";
import EmotionWall from "@/components/shared/EmotionWall";

const iconMap: Record<string, keyof typeof LucideIcons> = {
  "code-2": "Code2",
  camera: "Camera",
  lock: "Lock",
  book: "Book",
  music: "Music2",
  heart: "Heart",
  star: "Star",
  folder: "Folder",
};

function getIconComponent(iconName: string | undefined) {
  if (!iconName) return LucideIcons.Folder;
  const iconKey = iconMap[iconName] || "Folder";
  return (LucideIcons as any)[iconKey] || LucideIcons.Folder;
}

const pageVariants: Variants = {
  initial: { opacity: 0, x: 100 },
  animate: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.5, ease: "easeInOut" },
  },
  exit: {
    opacity: 0,
    x: -100,
    transition: { duration: 0.3, ease: "easeInOut" },
  },
};

export default function HomePage() {
  const { isPrivateMode } = useTheme();
  const { isAuthenticated } = useAuth();
  const [folders, setFolders] = useState<Folder[]>([]);
  const [loading, setLoading] = useState(true);
  const [modeKey, setModeKey] = useState(0);
  const [isFolderDialogOpen, setIsFolderDialogOpen] = useState(false);
  const [editingFolder, setEditingFolder] = useState<Folder | null>(null);
  const [deletingFolder, setDeletingFolder] = useState<Folder | null>(null);
  const prevModeRef = useRef(isPrivateMode);

  useEffect(() => {
    if (prevModeRef.current !== isPrivateMode) {
      setModeKey((prev) => prev + 1);
      prevModeRef.current = isPrivateMode;
    }
  }, [isPrivateMode]);

  const fetchFolders = async () => {
    setLoading(true);
    const response = await folderService.getAll(isPrivateMode);
    if (response.data) {
      setFolders(response.data);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchFolders();
  }, [isPrivateMode]);

  const handleCreateFolder = async (data: Partial<Folder>) => {
    const response = await folderService.create(data);
    if (response.data) {
      toast.success("板块创建成功");
      fetchFolders();
    } else {
      toast.error("创建失败");
    }
  };

  const handleUpdateFolder = async (data: Partial<Folder>) => {
    if (!editingFolder) return;
    const response = await folderService.update(editingFolder.id, data);
    if (response.data) {
      toast.success("板块更新成功");
      fetchFolders();
    } else {
      toast.error("更新失败");
    }
  };

  const handleDeleteFolder = async () => {
    if (!deletingFolder) return;
    const response = await folderService.delete(deletingFolder.id);
    if (response.data) {
      toast.success("板块已删除");
      setDeletingFolder(null);
      fetchFolders();
    } else {
      toast.error("删除失败");
    }
  };

  return (
    <div
      className={cn(
        "min-h-screen transition-colors duration-700",
        isPrivateMode
          ? "bg-black"
          : "bg-gradient-to-b from-white to-gray-50 dark:from-black dark:to-gray-900",
      )}
    >
      {isPrivateMode && <PrivateModeBackground />}

      <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="relative z-10 text-center mb-8">
          {isPrivateMode && (
            <div className="absolute inset-0 -z-10">
              <EmotionWall isVisible={true} />
            </div>
          )}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 200, delay: 0.2 }}
              className={cn(
                "inline-flex items-center justify-center w-24 h-24 rounded-3xl mb-6 transition-colors duration-500",
                isPrivateMode
                  ? "bg-gradient-to-br from-purple-600 to-pink-600"
                  : "bg-gradient-to-br from-indigo-500 to-purple-500",
              )}
            >
              <span className="text-4xl text-white font-bold">A</span>
            </motion.div>
            <h1
              className={cn(
                "text-4xl md:text-5xl font-bold mb-4 transition-colors duration-500",
                isPrivateMode ? "text-white" : "text-gray-900 dark:text-white",
              )}
            >
              欢迎来到 Aura
            </h1>
            <p
              className={cn(
                "text-lg md:text-xl max-w-2xl mx-auto transition-colors duration-500",
                isPrivateMode
                  ? "text-gray-400"
                  : "text-gray-600 dark:text-gray-400",
              )}
            >
              {isPrivateMode
                ? "这里是只属于你的秘密空间"
                : "一个兼具技术名片与私密自留地性质的个人数字空间"}
            </p>
          </motion.div>
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={modeKey}
            variants={pageVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {loading
              ? Array.from({ length: 3 }).map((_, i) => (
                  <motion.div
                    key={i}
                    className={cn(
                      "h-48 rounded-2xl animate-pulse",
                      isPrivateMode
                        ? "bg-white/5"
                        : "bg-gray-200 dark:bg-gray-800",
                    )}
                  />
                ))
              : folders.map((folder) => {
                  const Icon = getIconComponent(folder.icon);
                  return (
                    <FolderCard
                      key={folder.id}
                      folder={folder}
                      Icon={Icon}
                      isPrivateMode={isPrivateMode}
                      isAuthenticated={isAuthenticated}
                      onEdit={() => {
                        setEditingFolder(folder);
                        setIsFolderDialogOpen(true);
                      }}
                      onDelete={() => setDeletingFolder(folder)}
                    />
                  );
                })}

            {isAuthenticated && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: folders.length * 0.1 }}
              >
                <Card
                  onClick={() => {
                    setEditingFolder(null);
                    setIsFolderDialogOpen(true);
                  }}
                  className={cn(
                    "h-48 cursor-pointer transition-all duration-300 border-2 border-dashed flex items-center justify-center",
                    isPrivateMode
                      ? "bg-white/5 border-purple-500/30 hover:border-purple-500/50 hover:bg-white/10"
                      : "border-gray-300 dark:border-gray-700 hover:border-indigo-400 dark:hover:border-indigo-500",
                  )}
                >
                  <CardContent className="flex flex-col items-center gap-2">
                    <Plus
                      size={32}
                      className={cn(
                        isPrivateMode ? "text-purple-400" : "text-gray-400",
                      )}
                    />
                    <span
                      className={cn(
                        "text-sm font-medium",
                        isPrivateMode ? "text-gray-400" : "text-gray-500",
                      )}
                    >
                      新建板块
                    </span>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      <FolderDialog
        isOpen={isFolderDialogOpen}
        onClose={() => {
          setIsFolderDialogOpen(false);
          setEditingFolder(null);
        }}
        onSubmit={editingFolder ? handleUpdateFolder : handleCreateFolder}
        folder={editingFolder}
        isPrivateMode={isPrivateMode}
      />

      <DeleteConfirmDialog
        isOpen={!!deletingFolder}
        onClose={() => setDeletingFolder(null)}
        onConfirm={handleDeleteFolder}
        title="删除板块"
        message={`确定要删除「${deletingFolder?.title}」吗？该操作将同步删除文件夹内的所有文章，此操作不可撤销。`}
        isPrivateMode={isPrivateMode}
      />
    </div>
  );
}

interface FolderCardProps {
  folder: Folder;
  Icon: any;
  isPrivateMode: boolean;
  isAuthenticated: boolean;
  onEdit: () => void;
  onDelete: () => void;
}

function FolderCard({
  folder,
  Icon,
  isPrivateMode,
  isAuthenticated,
  onEdit,
  onDelete,
}: FolderCardProps) {
  return (
    <motion.div
      whileHover={{ scale: 1.02, y: -4 }}
      whileTap={{ scale: 0.98 }}
      className="relative group"
    >
      <Link href={`/${folder.id}`}>
        <Card
          className={cn(
            "h-full transition-all duration-300 cursor-pointer overflow-hidden",
            isPrivateMode
              ? "bg-white/5 border-purple-500/20 hover:border-purple-500/50 hover:bg-white/10"
              : "hover:shadow-xl dark:bg-gray-800/50",
          )}
        >
          <CardContent className="p-6">
            <motion.div
              whileHover={{ rotate: 360 }}
              transition={{ duration: 0.5 }}
              className={cn(
                "inline-flex items-center justify-center w-14 h-14 rounded-2xl mb-4",
                isPrivateMode
                  ? "bg-gradient-to-br from-purple-600/30 to-pink-600/30 text-purple-400"
                  : "bg-gradient-to-br from-indigo-500/20 to-purple-500/20 text-indigo-500",
              )}
            >
              <Icon size={28} />
            </motion.div>
            <h3
              className={cn(
                "text-xl font-semibold mb-2",
                isPrivateMode ? "text-white" : "text-gray-900 dark:text-white",
              )}
            >
              {folder.title}
            </h3>
            <p
              className={cn(
                "text-sm mb-4 line-clamp-2",
                isPrivateMode
                  ? "text-gray-400"
                  : "text-gray-600 dark:text-gray-400",
              )}
            >
              {folder.description}
            </p>
            <div className="flex items-center justify-between">
              <span
                className={cn(
                  "text-xs",
                  isPrivateMode
                    ? "text-gray-500"
                    : "text-gray-500 dark:text-gray-400",
                )}
              >
                {folder.post_count} 篇文章
              </span>
              {folder.is_private && (
                <span
                  className={cn(
                    "text-xs px-2 py-1 rounded-full",
                    isPrivateMode
                      ? "bg-purple-500/20 text-purple-400"
                      : "bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400",
                  )}
                >
                  私密
                </span>
              )}
            </div>
          </CardContent>
        </Card>
      </Link>

      {isAuthenticated && (
        <motion.div
          initial={{ opacity: 0 }}
          whileHover={{ opacity: 1 }}
          className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity z-10"
        >
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onEdit();
            }}
            className={cn(
              "p-2 rounded-lg transition-colors",
              isPrivateMode
                ? "bg-white/10 text-gray-400 hover:text-white hover:bg-white/20"
                : "bg-gray-100 text-gray-600 hover:text-indigo-600",
            )}
          >
            <Edit2 size={16} />
          </button>
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onDelete();
            }}
            className={cn(
              "p-2 rounded-lg transition-colors",
              isPrivateMode
                ? "bg-white/10 text-gray-400 hover:text-red-400 hover:bg-red-500/20"
                : "bg-gray-100 text-gray-600 hover:text-red-600",
            )}
          >
            <Trash2 size={16} />
          </button>
        </motion.div>
      )}
    </motion.div>
  );
}

function PrivateModeBackground() {
  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none">
      <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 via-black to-pink-900/20" />
      <motion.div
        animate={{ backgroundPosition: ["0% 0%", "100% 100%", "0% 0%"] }}
        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
        className="absolute inset-0 opacity-30"
        style={{
          background:
            "radial-gradient(circle at 20% 30%, rgba(147, 51, 234, 0.15) 0%, transparent 50%), radial-gradient(circle at 80% 70%, rgba(236, 72, 153, 0.15) 0%, transparent 50%)",
          backgroundSize: "200% 200%",
        }}
      />
      <motion.div
        animate={{ opacity: [0.3, 0.5, 0.3] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl"
      />
      <motion.div
        animate={{ opacity: [0.3, 0.5, 0.3] }}
        transition={{
          duration: 10,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 2,
        }}
        className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-pink-600/10 rounded-full blur-3xl"
      />
    </div>
  );
}
