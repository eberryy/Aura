"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
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

const mockNotes: Note[] = [
  { id: "1", content: "今天心情不错", created_at: new Date().toISOString() },
  { id: "2", content: "生活需要仪式感", created_at: new Date().toISOString() },
  {
    id: "3",
    content: "保持热爱奔赴山海",
    created_at: new Date().toISOString(),
  },
  { id: "4", content: "慢慢来比较快", created_at: new Date().toISOString() },
  { id: "5", content: "做一个温柔的人", created_at: new Date().toISOString() },
  {
    id: "6",
    content: "星辰大海都在等你",
    created_at: new Date().toISOString(),
  },
  { id: "7", content: "保持期待", created_at: new Date().toISOString() },
  { id: "8", content: "时间会给出答案", created_at: new Date().toISOString() },
  { id: "9", content: "愿你被温柔以待", created_at: new Date().toISOString() },
  {
    id: "10",
    content: "心有猛虎细嗅蔷薇",
    created_at: new Date().toISOString(),
  },
  { id: "11", content: "岁月静好", created_at: new Date().toISOString() },
  { id: "12", content: "向阳而生", created_at: new Date().toISOString() },
  { id: "13", content: "温柔且有力量", created_at: new Date().toISOString() },
  { id: "14", content: "静待花开", created_at: new Date().toISOString() },
  { id: "15", content: "保持热爱", created_at: new Date().toISOString() },
];

function seededRandom(seed: number) {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
}

export default function EmotionWall({ isVisible }: EmotionWallProps) {
  const { isAuthenticated } = useAuth();
  const [notes, setNotes] = useState<Note[]>([]);
  const [showInput, setShowInput] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchNotes = useCallback(async () => {
    const response = await noteService.getAll();
    if (response.data && response.data.length > 0) {
      setNotes(response.data);
    } else {
      setNotes(mockNotes);
    }
  }, []);

  useEffect(() => {
    if (isVisible) {
      fetchNotes();
    }
  }, [isVisible, fetchNotes]);

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
    } else {
      const newNote: Note = {
        id: String(Date.now()),
        content: inputValue.trim(),
        created_at: new Date().toISOString(),
      };
      setNotes((prev) => [newNote, ...prev]);
      setInputValue("");
      setShowInput(false);
      toast.success("气泡已投掷");
    }
  };

  const tracks = useMemo(() => {
    const trackConfigs = [
      { top: "11%", baseDuration: 18 },
      { top: "33%", baseDuration: 22 },
      { top: "55%", baseDuration: 17 },
      { top: "77%", baseDuration: 24 },
    ];

    return trackConfigs.map((config, trackIndex) => {
      const shuffledNotes = [...notes].sort(
        () => seededRandom(trackIndex * 100) - 0.5,
      );
      const notesForTrack = shuffledNotes.slice(
        0,
        Math.floor(shuffledNotes.length / 2) + trackIndex,
      );

      const duration = config.baseDuration + seededRandom(trackIndex * 7) * 4;
      const initialDelay = seededRandom(trackIndex * 13) * 3;

      const bubbles = notesForTrack.map((note, noteIndex) => {
        const gapMultiplier =
          1.5 + seededRandom(trackIndex * 100 + noteIndex) * 1.5;
        return {
          note,
          yOffset: (seededRandom(trackIndex * 300 + noteIndex * 7) - 0.5) * 16,
          gap: gapMultiplier,
        };
      });

      return {
        ...config,
        duration,
        initialDelay,
        bubbles,
      };
    });
  }, [notes]);

  if (!isVisible) return null;

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {tracks.map((track, trackIndex) => (
        <motion.div
          key={trackIndex}
          className="absolute w-[300%] flex items-center"
          style={{ top: track.top, left: "-100%" }}
          animate={{
            x: ["0%", "33.33%"],
          }}
          transition={{
            x: {
              duration: track.duration,
              repeat: Infinity,
              ease: "linear",
              delay: track.initialDelay,
            },
          }}
        >
          {track.bubbles.slice(0, 3).map((bubble, bubbleIndex) => (
            <motion.div
              key={`${bubble.note.id}-${bubbleIndex}`}
              className="flex-shrink-0"
              style={{
                marginLeft: `${bubble.gap * 8}rem`,
                transform: `translateY(${bubble.yOffset}px)`,
              }}
            >
              <div
                className={cn(
                  "px-5 py-2.5 rounded-full",
                  "bg-purple-500/10 backdrop-blur-md",
                  "border border-purple-500/20",
                  "shadow-[0_0_20px_rgba(168,85,247,0.15)]",
                  "text-purple-200/90 text-sm font-light tracking-wide",
                  "whitespace-nowrap",
                )}
              >
                {bubble.note.content}
              </div>
            </motion.div>
          ))}
        </motion.div>
      ))}

      {isAuthenticated && (
        <div className="pointer-events-auto absolute bottom-4 right-4 z-20">
          <AnimatePresence>
            {showInput ? (
              <motion.form
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                onSubmit={handleSubmit}
                className="flex items-center gap-2 bg-gray-900/95 backdrop-blur-md rounded-full p-2 border border-purple-500/30 shadow-lg"
              >
                <input
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  placeholder="写下你的心情..."
                  autoFocus
                  className="bg-transparent border-none outline-none text-white placeholder:text-gray-500 px-3 py-1 w-48 text-sm"
                  maxLength={100}
                />
                <Button
                  type="submit"
                  size="sm"
                  disabled={!inputValue.trim() || isSubmitting}
                  className="rounded-full w-8 h-8 p-0 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                >
                  <Send size={14} />
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  onClick={() => setShowInput(false)}
                  className="rounded-full w-8 h-8 p-0 text-gray-400 hover:text-white"
                >
                  <X size={14} />
                </Button>
              </motion.form>
            ) : (
              <motion.button
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowInput(true)}
                className="w-12 h-12 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 flex items-center justify-center text-white shadow-lg hover:shadow-xl transition-shadow"
              >
                <Plus size={24} />
              </motion.button>
            )}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
