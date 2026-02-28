"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  Menu,
  X,
  Sun,
  Moon,
  Lock,
  User,
  LogOut,
  PenSquare,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/hooks/useTheme";
import { useAuth } from "@/hooks/useAuth";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

export function Header() {
  const { theme, toggleTheme, isPrivateMode, setPrivateMode } = useTheme();
  const { user, isAuthenticated, logout } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isLoginOpen, setIsLoginOpen] = useState(false);

  const handlePrivateModeToggle = () => {
    setPrivateMode(!isPrivateMode);
  };

  return (
    <>
      <motion.header
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        className={cn(
          "fixed top-0 left-0 right-0 z-50 backdrop-blur-md border-b transition-colors duration-500",
          isPrivateMode
            ? "bg-black/80 border-purple-500/30"
            : "bg-white/80 border-gray-200 dark:bg-black/80 dark:border-gray-800",
        )}
      >
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center gap-2">
              <motion.div
                whileHover={{ rotate: 360 }}
                transition={{ duration: 0.5 }}
                className={cn(
                  "w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-lg",
                  isPrivateMode
                    ? "bg-gradient-to-br from-purple-600 to-pink-600"
                    : "bg-gradient-to-br from-indigo-500 to-purple-500",
                )}
              >
                A
              </motion.div>
              <span
                className={cn(
                  "text-xl font-bold",
                  isPrivateMode
                    ? "text-white"
                    : "text-gray-900 dark:text-white",
                )}
              >
                Aura
              </span>
            </Link>

            <nav className="hidden md:flex items-center gap-4">
              {isAuthenticated && (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handlePrivateModeToggle}
                  className={cn(
                    "p-2 rounded-lg transition-colors flex items-center gap-2",
                    isPrivateMode
                      ? "text-purple-400 hover:text-purple-300 hover:bg-white/10"
                      : "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800",
                  )}
                >
                  <Lock size={20} />
                  <span className="text-sm">
                    {isPrivateMode ? "树洞模式" : "公开模式"}
                  </span>
                </motion.button>
              )}

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={toggleTheme}
                className={cn(
                  "p-2 rounded-lg transition-colors",
                  isPrivateMode
                    ? "text-gray-300 hover:text-white hover:bg-white/10"
                    : "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800",
                )}
              >
                {theme === "light" ? <Moon size={20} /> : <Sun size={20} />}
              </motion.button>

              {isAuthenticated ? (
                <>
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Button
                      variant="ghost"
                      className={cn(
                        isPrivateMode
                          ? "text-gray-300 hover:text-white hover:bg-white/10"
                          : "",
                      )}
                    >
                      <PenSquare size={18} />
                      <span>发布</span>
                    </Button>
                  </motion.div>
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Button
                      variant="ghost"
                      onClick={logout}
                      className={cn(
                        isPrivateMode
                          ? "text-gray-300 hover:text-white hover:bg-white/10"
                          : "",
                      )}
                    >
                      <LogOut size={18} />
                      <span>退出</span>
                    </Button>
                  </motion.div>
                </>
              ) : (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setIsLoginOpen(true)}
                  className={cn(
                    "p-2 rounded-lg transition-colors flex items-center gap-2",
                    isPrivateMode
                      ? "text-gray-300 hover:text-white hover:bg-white/10"
                      : "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800",
                  )}
                >
                  <User size={20} />
                  <span className="text-sm">登录</span>
                </motion.button>
              )}
            </nav>

            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className={cn(
                "md:hidden p-2 rounded-lg",
                isPrivateMode
                  ? "text-gray-300"
                  : "text-gray-600 dark:text-gray-300",
              )}
            >
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        <AnimatePresence>
          {isMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className={cn(
                "md:hidden border-t overflow-hidden",
                isPrivateMode
                  ? "border-purple-500/30 bg-black/90"
                  : "border-gray-200 dark:border-gray-800",
              )}
            >
              <div className="px-4 py-4 space-y-3">
                {isAuthenticated && (
                  <button
                    onClick={handlePrivateModeToggle}
                    className={cn(
                      "flex items-center gap-3 w-full p-3 rounded-lg transition-colors",
                      isPrivateMode
                        ? "text-purple-400 hover:text-purple-300 hover:bg-white/10"
                        : "hover:bg-gray-100 dark:hover:bg-gray-800",
                    )}
                  >
                    <Lock size={20} />
                    <span>
                      {isPrivateMode ? "退出树洞模式" : "进入树洞模式"}
                    </span>
                  </button>
                )}
                <button
                  onClick={toggleTheme}
                  className={cn(
                    "flex items-center gap-3 w-full p-3 rounded-lg transition-colors",
                    isPrivateMode
                      ? "text-gray-300 hover:text-white hover:bg-white/10"
                      : "hover:bg-gray-100 dark:hover:bg-gray-800",
                  )}
                >
                  {theme === "light" ? <Moon size={20} /> : <Sun size={20} />}
                  <span>{theme === "light" ? "切换深色" : "切换浅色"}</span>
                </button>
                {isAuthenticated ? (
                  <>
                    <Link
                      href="/create"
                      className={cn(
                        "flex items-center gap-3 w-full p-3 rounded-lg transition-colors",
                        isPrivateMode
                          ? "text-gray-300 hover:text-white hover:bg-white/10"
                          : "hover:bg-gray-100 dark:hover:bg-gray-800",
                      )}
                    >
                      <PenSquare size={20} />
                      <span>发布</span>
                    </Link>
                    <button
                      onClick={logout}
                      className={cn(
                        "flex items-center gap-3 w-full p-3 rounded-lg transition-colors",
                        isPrivateMode
                          ? "text-gray-300 hover:text-white hover:bg-white/10"
                          : "hover:bg-gray-100 dark:hover:bg-gray-800",
                      )}
                    >
                      <LogOut size={20} />
                      <span>退出登录</span>
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => setIsLoginOpen(true)}
                    className={cn(
                      "flex items-center gap-3 w-full p-3 rounded-lg transition-colors",
                      isPrivateMode
                        ? "text-gray-300 hover:text-white hover:bg-white/10"
                        : "hover:bg-gray-100 dark:hover:bg-gray-800",
                    )}
                  >
                    <User size={20} />
                    <span>登录</span>
                  </button>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.header>

      <AnimatePresence>
        {isLoginOpen && <LoginDialog onClose={() => setIsLoginOpen(false)} />}
      </AnimatePresence>
    </>
  );
}

function LoginDialog({ onClose }: { onClose: () => void }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const { login } = useAuth();
  const { isPrivateMode } = useTheme();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    const success = await login(username, password);
    if (success) {
      onClose();
    } else {
      setError("用户名或密码错误");
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] flex items-center justify-center p-4"
    >
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      <motion.div
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 20 }}
        className={cn(
          "relative w-full max-w-md p-6 rounded-2xl shadow-2xl",
          isPrivateMode
            ? "bg-gradient-to-br from-gray-900 to-purple-900 border border-purple-500/30"
            : "bg-white dark:bg-gray-900",
        )}
      >
        <button
          onClick={onClose}
          className={cn(
            "absolute top-4 right-4 p-1 rounded-lg transition-colors",
            isPrivateMode
              ? "text-gray-400 hover:text-white"
              : "text-gray-500 hover:text-gray-700 dark:hover:text-gray-300",
          )}
        >
          <X size={20} />
        </button>

        <h2
          className={cn(
            "text-2xl font-bold mb-6",
            isPrivateMode ? "text-white" : "text-gray-900 dark:text-white",
          )}
        >
          管理员登录
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              className={cn(
                "block text-sm font-medium mb-2",
                isPrivateMode
                  ? "text-gray-300"
                  : "text-gray-700 dark:text-gray-300",
              )}
            >
              用户名
            </label>
            <Input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className={cn(
                isPrivateMode
                  ? "bg-white/10 border-purple-500/30 text-white placeholder:text-gray-400 focus:border-purple-500"
                  : "",
              )}
              placeholder="输入用户名"
            />
          </div>
          <div>
            <label
              className={cn(
                "block text-sm font-medium mb-2",
                isPrivateMode
                  ? "text-gray-300"
                  : "text-gray-700 dark:text-gray-300",
              )}
            >
              密码
            </label>
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={cn(
                isPrivateMode
                  ? "bg-white/10 border-purple-500/30 text-white placeholder:text-gray-400 focus:border-purple-500"
                  : "",
              )}
              placeholder="输入密码"
            />
          </div>
          {error && <p className="text-red-500 text-sm">{error}</p>}
          <Button
            type="submit"
            className={cn(
              "w-full",
              isPrivateMode
                ? "bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                : "",
            )}
          >
            登录
          </Button>
        </form>
      </motion.div>
    </motion.div>
  );
}
