"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion, Variants } from "framer-motion";
import * as LucideIcons from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { folderService } from "@/services/api";
import { Folder } from "@/types";
import { cn } from "@/lib/utils";
import { useTheme } from "@/hooks/useTheme";
import { useAuth } from "@/hooks/useAuth";

const iconMap: Record<string, keyof typeof LucideIcons> = {
  "code-2": "Code2",
  camera: "Camera",
  lock: "Lock",
};

function getIconComponent(iconName: string | undefined) {
  if (!iconName) return LucideIcons.Folder;
  const iconKey = iconMap[iconName] || "Folder";
  return (LucideIcons as any)[iconKey] || LucideIcons.Folder;
}

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: "spring" as const,
      stiffness: 100,
      damping: 12,
    },
  },
};

export default function HomePage() {
  const { isPrivateMode } = useTheme();
  const { isAuthenticated } = useAuth();
  const [folders, setFolders] = useState<Folder[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFolders = async () => {
      const response = await folderService.getAll(isAuthenticated);
      if (response.data) {
        setFolders(response.data);
      }
      setLoading(false);
    };
    fetchFolders();
  }, [isAuthenticated]);

  return (
    <div
      className={cn(
        "min-h-screen transition-colors duration-500",
        isPrivateMode
          ? "bg-black"
          : "bg-gradient-to-b from-white to-gray-50 dark:from-black dark:to-gray-900",
      )}
    >
      {isPrivateMode && <PrivateModeBackground />}

      <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 200, delay: 0.2 }}
            className={cn(
              "inline-flex items-center justify-center w-24 h-24 rounded-3xl mb-6",
              isPrivateMode
                ? "bg-gradient-to-br from-purple-600 to-pink-600"
                : "bg-gradient-to-br from-indigo-500 to-purple-500",
            )}
          >
            <span className="text-4xl text-white font-bold">A</span>
          </motion.div>
          <h1
            className={cn(
              "text-4xl md:text-5xl font-bold mb-4",
              isPrivateMode ? "text-white" : "text-gray-900 dark:text-white",
            )}
          >
            欢迎来到 Aura
          </h1>
          <p
            className={cn(
              "text-lg md:text-xl max-w-2xl mx-auto",
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

        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {loading
            ? Array.from({ length: 3 }).map((_, i) => (
                <motion.div
                  key={i}
                  variants={itemVariants}
                  className={cn(
                    "h-48 rounded-2xl animate-pulse",
                    isPrivateMode
                      ? "bg-white/5"
                      : "bg-gray-200 dark:bg-gray-800",
                  )}
                />
              ))
            : folders.map((folder, index) => {
                const Icon = getIconComponent(folder.icon);
                return (
                  <motion.div
                    key={folder.id}
                    variants={itemVariants}
                    whileHover={{ scale: 1.02, y: -4 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Link href={`/folder/${folder.id}`}>
                      <Card
                        className={cn(
                          "h-full transition-all duration-300 cursor-pointer overflow-hidden group",
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
                              isPrivateMode
                                ? "text-white"
                                : "text-gray-900 dark:text-white",
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
                  </motion.div>
                );
              })}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="mt-16 text-center"
        >
          <p
            className={cn(
              "text-sm",
              isPrivateMode
                ? "text-gray-500"
                : "text-gray-500 dark:text-gray-400",
            )}
          >
            探索更多内容，了解我的技术思考和生活点滴
          </p>
        </motion.div>
      </div>
    </div>
  );
}

function PrivateModeBackground() {
  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none">
      <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 via-black to-pink-900/20" />
      <motion.div
        animate={{
          backgroundPosition: ["0% 0%", "100% 100%", "0% 0%"],
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          ease: "linear",
        }}
        className="absolute inset-0 opacity-30"
        style={{
          background:
            "radial-gradient(circle at 20% 30%, rgba(147, 51, 234, 0.15) 0%, transparent 50%), radial-gradient(circle at 80% 70%, rgba(236, 72, 153, 0.15) 0%, transparent 50%)",
          backgroundSize: "200% 200%",
        }}
      />
      <motion.div
        animate={{
          opacity: [0.3, 0.5, 0.3],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl"
      />
      <motion.div
        animate={{
          opacity: [0.3, 0.5, 0.3],
        }}
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
