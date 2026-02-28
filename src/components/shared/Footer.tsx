"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Github, Twitter, Mail } from "lucide-react";
import { cn } from "@/lib/utils";
import { useTheme } from "@/hooks/useTheme";

export function Footer() {
  const { isPrivateMode } = useTheme();

  return (
    <motion.footer
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.5 }}
      className={cn(
        "border-t py-12 mt-20",
        isPrivateMode
          ? "border-purple-500/30 bg-black/90"
          : "border-gray-200 dark:border-gray-800",
      )}
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <motion.div
              whileHover={{ rotate: 360 }}
              transition={{ duration: 0.5 }}
              className={cn(
                "w-8 h-8 rounded-lg flex items-center justify-center text-white font-bold",
                isPrivateMode
                  ? "bg-gradient-to-br from-purple-600 to-pink-600"
                  : "bg-gradient-to-br from-indigo-500 to-purple-500",
              )}
            >
              A
            </motion.div>
            <span
              className={cn(
                "font-medium",
                isPrivateMode
                  ? "text-gray-400"
                  : "text-gray-600 dark:text-gray-400",
              )}
            >
              Aura © 2024
            </span>
          </div>

          <div className="flex items-center gap-6">
            <motion.a
              whileHover={{ scale: 1.1, y: -2 }}
              href="https://github.com"
              target="_blank"
              rel="noopener noreferrer"
              className={cn(
                "transition-colors",
                isPrivateMode
                  ? "text-gray-500 hover:text-purple-400"
                  : "text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300",
              )}
            >
              <Github size={20} />
            </motion.a>
            <motion.a
              whileHover={{ scale: 1.1, y: -2 }}
              href="https://twitter.com"
              target="_blank"
              rel="noopener noreferrer"
              className={cn(
                "transition-colors",
                isPrivateMode
                  ? "text-gray-500 hover:text-purple-400"
                  : "text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300",
              )}
            >
              <Twitter size={20} />
            </motion.a>
            <motion.a
              whileHover={{ scale: 1.1, y: -2 }}
              href="mailto:hello@aura.com"
              className={cn(
                "transition-colors",
                isPrivateMode
                  ? "text-gray-500 hover:text-purple-400"
                  : "text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300",
              )}
            >
              <Mail size={20} />
            </motion.a>
          </div>

          <div
            className={cn(
              "text-sm",
              isPrivateMode
                ? "text-gray-500"
                : "text-gray-500 dark:text-gray-400",
            )}
          >
            Made with ❤️
          </div>
        </div>
      </div>
    </motion.footer>
  );
}
