"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, X, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { noteService } from "@/services/api";
import { Note } from "@/types";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

interface EmotionWallProps {
  isVisible: boolean;
}

interface ActiveBubble extends Note {
  instanceId: string;
  trackIdx: number;
  duration: number;
}

export default function EmotionWall({ isVisible }: EmotionWallProps) {
  const { isAuthenticated } = useAuth();
  const [notes, setNotes] = useState<Note[]>([]);
  const [activeBubbles, setActiveBubbles] = useState<ActiveBubble[]>([]);
  const [showInput, setShowInput] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 算法核心：记录当前屏幕上每个 NoteId 出现的次数
  const activeCounts = useRef<Record<string, number>>({});
  const tracks = [10, 33, 56, 79];

  const fetchNotes = useCallback(async () => {
    const response = await noteService.getAll();
    if (response.data) setNotes(response.data);
  }, []);

  useEffect(() => {
    if (isVisible) fetchNotes();
  }, [isVisible, fetchNotes]);

  // 发射气泡的函数
  const spawnBubble = useCallback(() => {
    if (notes.length === 0) return;

    // 1. 随机挑选一个文本
    const randomNote = notes[Math.floor(Math.random() * notes.length)];
    const currentCount = activeCounts.current[randomNote.id] || 0;

    // 2. 检查显现上限：如果当前屏幕上已有3个，则跳过本次发射
    if (currentCount >= 3) return;

    // 3. 随机选择轨道
    const trackIdx = Math.floor(Math.random() * tracks.length);

    // 4. 创建气泡实例
    const instanceId = `${randomNote.id}-${Math.random().toString(36).substr(2, 9)}`;
    const newBubble: ActiveBubble = {
      ...randomNote,
      instanceId,
      trackIdx,
      duration: 20 + Math.random() * 5, // 15s - 25s 随机速度
    };

    // 5. 更新计数并添加
    activeCounts.current[randomNote.id] = currentCount + 1;
    setActiveBubbles((prev) => [...prev, newBubble]);
  }, [notes, tracks.length]);

  // 切换模式后，开始发射循环
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isVisible && notes.length > 0) {
      // 每隔 1.5 - 3 秒尝试发射一个新气泡
      const tick = () => {
        spawnBubble();
        timer = setTimeout(tick, 1500 + Math.random() * 1500);
      };
      tick();
    } else {
      setActiveBubbles([]);
      activeCounts.current = {};
    }
    return () => clearTimeout(timer);
  }, [isVisible, notes.length, spawnBubble]);

  const removeBubble = (id: string, noteId: string) => {
    setActiveBubbles((prev) => prev.filter((b) => b.instanceId !== id));
    if (activeCounts.current[noteId] > 0) {
      activeCounts.current[noteId] -= 1;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim() || isSubmitting) return;
    setIsSubmitting(true);
    const response = await noteService.create(inputValue.trim());
    setIsSubmitting(false);
    if (response.data) {
      setNotes((prev) => [response.data!, ...prev]);
      setInputValue("");
      setShowInput(false);
      toast.success("气泡已投掷");
    }
  };

  if (!isVisible) return null;

  return (
    <>
      {/* 气泡流动区域 - 不拦截点击 */}
      <div className="absolute inset-0 overflow-hidden">
        <AnimatePresence>
          {activeBubbles.map((bubble) => (
            <motion.div
              key={bubble.instanceId}
              initial={{ x: "-100%", opacity: 0 }}
              animate={{ x: "110vw", opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{
                duration: bubble.duration,
                ease: "linear",
                opacity: { duration: 0.5 },
              }}
              onAnimationComplete={() =>
                removeBubble(bubble.instanceId, bubble.id)
              }
              className={cn(
                "absolute px-5 py-2.5 rounded-full whitespace-nowrap pointer-events-none",
                "bg-purple-500/10 backdrop-blur-md border border-purple-500/20",
                "shadow-[0_0_20px_rgba(168,85,247,0.15)]",
                "text-purple-200/90 text-sm font-light tracking-wide",
              )}
              style={{
                top: `${tracks[bubble.trackIdx]}%`,
                left: 0,
              }}
            >
              {bubble.content}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* 管理员交互层 - 独立渲染确保可点击 */}
      {isAuthenticated && (
        <div className="fixed bottom-6 right-6 z-50">
          <AnimatePresence>
            {showInput ? (
              <motion.form
                initial={{ opacity: 0, scale: 0.9, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 10 }}
                onSubmit={handleSubmit}
                className="flex items-center gap-2 bg-gray-900/90 backdrop-blur-xl rounded-full p-2 border border-purple-500/30 shadow-2xl"
              >
                <input
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  placeholder="写下心情..."
                  autoFocus
                  className="bg-transparent border-none outline-none text-white placeholder:text-gray-500 px-3 w-40 text-sm"
                />
                <Button
                  type="submit"
                  size="sm"
                  className="rounded-full w-8 h-8 p-0 bg-gradient-to-r from-purple-600 to-pink-600"
                >
                  <Send size={14} />
                </Button>
                <Button
                  type="button"
                  onClick={() => setShowInput(false)}
                  variant="ghost"
                  className="rounded-full w-8 h-8 p-0 text-gray-400"
                >
                  <X size={14} />
                </Button>
              </motion.form>
            ) : (
              <motion.button
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={(e) => {
                  e.stopPropagation();
                  setShowInput(true);
                }}
                className="w-11 h-11 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 flex items-center justify-center text-white shadow-lg shadow-purple-500/30"
              >
                <Plus size={24} />
              </motion.button>
            )}
          </AnimatePresence>
        </div>
      )}
    </>
  );
}
