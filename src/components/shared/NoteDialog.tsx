"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Plus,
  Search,
  Edit2,
  Trash2,
  Check,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { noteService } from "@/services/api";
import { Note } from "@/types";
import { useTheme } from "@/hooks/useTheme";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface NoteDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

const PAGE_SIZE = 10;

export function NoteDialog({ isOpen, onClose }: NoteDialogProps) {
  const { isPrivateMode } = useTheme();
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchNotes = useCallback(async () => {
    setLoading(true);
    const response = await noteService.getAll();
    if (response.data) {
      setNotes(response.data);
      setTotalCount(response.data.length);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    if (isOpen) {
      fetchNotes();
      setPage(1);
      setSelectedIds(new Set());
      setSearchQuery("");
    }
  }, [isOpen, fetchNotes]);

  const filteredNotes = notes.filter((note) =>
    note.content.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const paginatedNotes = filteredNotes.slice(
    (page - 1) * PAGE_SIZE,
    page * PAGE_SIZE,
  );

  const totalPages = Math.ceil(filteredNotes.length / PAGE_SIZE);

  const handleSelectAll = () => {
    if (selectedIds.size === paginatedNotes.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(paginatedNotes.map((n) => n.id)));
    }
  };

  const handleSelect = (id: string) => {
    const newSelected = new Set(selectedIds);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedIds(newSelected);
  };

  const handleAdd = async () => {
    const content = prompt("请输入新留言内容：");
    if (!content?.trim()) return;

    setIsSubmitting(true);
    const response = await noteService.create(content.trim());
    setIsSubmitting(false);

    if (response.data) {
      setNotes((prev) => [response.data!, ...prev]);
      toast.success("留言添加成功");
    } else {
      toast.error(response.error || "添加失败");
    }
  };

  const handleEdit = (note: Note) => {
    setEditingId(note.id);
    setEditContent(note.content);
  };

  const handleSaveEdit = async () => {
    if (!editingId || !editContent.trim()) return;

    setIsSubmitting(true);
    const response = await noteService.update(editingId, editContent.trim());
    setIsSubmitting(false);

    if (response.data) {
      setNotes((prev) =>
        prev.map((n) => (n.id === editingId ? response.data! : n)),
      );
      setEditingId(null);
      setEditContent("");
      toast.success("留言更新成功");
    } else {
      toast.error(response.error || "更新失败");
    }
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditContent("");
  };

  const handleDelete = async (id: string) => {
    if (!confirm("确定要删除这条留言吗？")) return;

    setIsSubmitting(true);
    const response = await noteService.delete(id);
    setIsSubmitting(false);

    if (response.status === 200) {
      setNotes((prev) => prev.filter((n) => n.id !== id));
      setSelectedIds((prev) => {
        const newSet = new Set(prev);
        newSet.delete(id);
        return newSet;
      });
      toast.success("留言删除成功");
    } else {
      toast.error(response.error || "删除失败");
    }
  };

  const handleBatchDelete = async () => {
    if (selectedIds.size === 0) return;
    if (!confirm(`确定要删除选中的 ${selectedIds.size} 条留言吗？`)) return;

    setIsSubmitting(true);
    const response = await noteService.deleteMany(Array.from(selectedIds));
    setIsSubmitting(false);

    if (response.status === 200) {
      setNotes((prev) => prev.filter((n) => !selectedIds.has(n.id)));
      setSelectedIds(new Set());
      toast.success(`成功删除 ${selectedIds.size} 条留言`);
    } else {
      toast.error(response.error || "批量删除失败");
    }
  };

  if (!isOpen) return null;

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
          "relative w-full max-w-3xl max-h-[80vh] flex flex-col rounded-2xl shadow-2xl overflow-hidden",
          isPrivateMode
            ? "bg-gradient-to-br from-gray-900 to-purple-900 border border-purple-500/30"
            : "bg-white dark:bg-gray-900",
        )}
      >
        <div
          className={cn(
            "flex items-center justify-between p-4 border-b",
            isPrivateMode
              ? "border-purple-500/30"
              : "border-gray-200 dark:border-gray-700",
          )}
        >
          <h2
            className={cn(
              "text-xl font-bold",
              isPrivateMode ? "text-white" : "text-gray-900 dark:text-white",
            )}
          >
            Note 管理
          </h2>
          <button
            onClick={onClose}
            className={cn(
              "p-2 rounded-lg transition-colors",
              isPrivateMode
                ? "text-gray-400 hover:text-white hover:bg-white/10"
                : "text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800",
            )}
          >
            <X size={20} />
          </button>
        </div>

        <div
          className={cn(
            "flex items-center gap-3 p-4 border-b",
            isPrivateMode
              ? "border-purple-500/30"
              : "border-gray-200 dark:border-gray-700",
          )}
        >
          <div className="relative flex-1">
            <Search
              size={18}
              className={cn(
                "absolute left-3 top-1/2 -translate-y-1/2",
                isPrivateMode ? "text-gray-400" : "text-gray-400",
              )}
            />
            <Input
              type="text"
              placeholder="搜索留言..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setPage(1);
              }}
              className={cn(
                "pl-10",
                isPrivateMode
                  ? "bg-white/10 border-purple-500/30 text-white placeholder:text-gray-400 focus:border-purple-500"
                  : "",
              )}
            />
          </div>
          <Button
            onClick={handleAdd}
            disabled={isSubmitting}
            className={cn(
              "gap-2",
              isPrivateMode
                ? "bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                : "",
            )}
          >
            <Plus size={18} />
            添加
          </Button>
          {selectedIds.size > 0 && (
            <Button
              onClick={handleBatchDelete}
              disabled={isSubmitting}
              variant="destructive"
              className="gap-2"
            >
              <Trash2 size={18} />
              删除 ({selectedIds.size})
            </Button>
          )}
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <RefreshCw
                className={cn(
                  "animate-spin",
                  isPrivateMode ? "text-purple-400" : "text-gray-400",
                )}
                size={32}
              />
            </div>
          ) : filteredNotes.length === 0 ? (
            <div
              className={cn(
                "text-center py-12",
                isPrivateMode ? "text-gray-400" : "text-gray-500",
              )}
            >
              {searchQuery ? "没有找到匹配的留言" : "暂无留言"}
            </div>
          ) : (
            <div className="space-y-2">
              <div
                className={cn(
                  "flex items-center gap-3 p-2 rounded-lg text-sm font-medium",
                  isPrivateMode
                    ? "text-gray-400"
                    : "text-gray-500 dark:text-gray-400",
                )}
              >
                <button
                  onClick={handleSelectAll}
                  className={cn(
                    "w-5 h-5 rounded border flex items-center justify-center transition-colors",
                    selectedIds.size === paginatedNotes.length && selectedIds.size > 0
                      ? "bg-purple-600 border-purple-600"
                      : isPrivateMode
                        ? "border-gray-600 hover:border-gray-500"
                        : "border-gray-300 dark:border-gray-600 hover:border-gray-400",
                  )}
                >
                  {selectedIds.size === paginatedNotes.length &&
                    selectedIds.size > 0 && <Check size={14} className="text-white" />}
                </button>
                <span className="flex-1">内容</span>
                <span className="w-32">创建时间</span>
                <span className="w-24 text-right">操作</span>
              </div>
              {paginatedNotes.map((note) => (
                <motion.div
                  key={note.id}
                  layout
                  className={cn(
                    "flex items-center gap-3 p-3 rounded-lg transition-colors",
                    isPrivateMode
                      ? "bg-white/5 hover:bg-white/10"
                      : "hover:bg-gray-50 dark:hover:bg-gray-800",
                    selectedIds.has(note.id) &&
                      (isPrivateMode
                        ? "bg-purple-500/20"
                        : "bg-purple-50 dark:bg-purple-900/20"),
                  )}
                >
                  <button
                    onClick={() => handleSelect(note.id)}
                    className={cn(
                      "w-5 h-5 rounded border flex items-center justify-center transition-colors flex-shrink-0",
                      selectedIds.has(note.id)
                        ? "bg-purple-600 border-purple-600"
                        : isPrivateMode
                          ? "border-gray-600 hover:border-gray-500"
                          : "border-gray-300 dark:border-gray-600 hover:border-gray-400",
                    )}
                  >
                    {selectedIds.has(note.id) && (
                      <Check size={14} className="text-white" />
                    )}
                  </button>
                  <span
                    className={cn(
                      "flex-1 truncate",
                      isPrivateMode ? "text-gray-200" : "text-gray-700 dark:text-gray-200",
                    )}
                  >
                    {editingId === note.id ? (
                      <Input
                        value={editContent}
                        onChange={(e) => setEditContent(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") handleSaveEdit();
                          if (e.key === "Escape") handleCancelEdit();
                        }}
                        autoFocus
                        className={cn(
                          isPrivateMode
                            ? "bg-white/10 border-purple-500/30 text-white"
                            : "",
                        )}
                      />
                    ) : (
                      note.content
                    )}
                  </span>
                  <span
                    className={cn(
                      "w-32 text-sm flex-shrink-0",
                      isPrivateMode ? "text-gray-400" : "text-gray-500 dark:text-gray-400",
                    )}
                  >
                    {new Date(note.created_at).toLocaleDateString("zh-CN")}
                  </span>
                  <div className="w-24 flex items-center justify-end gap-1 flex-shrink-0">
                    {editingId === note.id ? (
                      <>
                        <button
                          onClick={handleSaveEdit}
                          disabled={isSubmitting}
                          className={cn(
                            "p-2 rounded-lg transition-colors",
                            isPrivateMode
                              ? "text-green-400 hover:text-green-300 hover:bg-white/10"
                              : "text-green-600 hover:text-green-700 hover:bg-gray-100 dark:hover:bg-gray-700",
                          )}
                        >
                          <Check size={16} />
                        </button>
                        <button
                          onClick={handleCancelEdit}
                          className={cn(
                            "p-2 rounded-lg transition-colors",
                            isPrivateMode
                              ? "text-gray-400 hover:text-white hover:bg-white/10"
                              : "text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700",
                          )}
                        >
                          <X size={16} />
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          onClick={() => handleEdit(note)}
                          className={cn(
                            "p-2 rounded-lg transition-colors",
                            isPrivateMode
                              ? "text-blue-400 hover:text-blue-300 hover:bg-white/10"
                              : "text-blue-600 hover:text-blue-700 hover:bg-gray-100 dark:hover:bg-gray-700",
                          )}
                        >
                          <Edit2 size={16} />
                        </button>
                        <button
                          onClick={() => handleDelete(note.id)}
                          disabled={isSubmitting}
                          className={cn(
                            "p-2 rounded-lg transition-colors",
                            isPrivateMode
                              ? "text-red-400 hover:text-red-300 hover:bg-white/10"
                              : "text-red-600 hover:text-red-700 hover:bg-gray-100 dark:hover:bg-gray-700",
                          )}
                        >
                          <Trash2 size={16} />
                        </button>
                      </>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>

        {totalPages > 1 && (
          <div
            className={cn(
              "flex items-center justify-between p-4 border-t",
              isPrivateMode
                ? "border-purple-500/30"
                : "border-gray-200 dark:border-gray-700",
            )}
          >
            <span
              className={cn(
                "text-sm",
                isPrivateMode ? "text-gray-400" : "text-gray-500 dark:text-gray-400",
              )}
            >
              共 {filteredNotes.length} 条，第 {page}/{totalPages} 页
            </span>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className={cn(
                  isPrivateMode
                    ? "border-purple-500/30 text-gray-300 hover:bg-white/10"
                    : "",
                )}
              >
                <ChevronLeft size={16} />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className={cn(
                  isPrivateMode
                    ? "border-purple-500/30 text-gray-300 hover:bg-white/10"
                    : "",
                )}
              >
                <ChevronRight size={16} />
              </Button>
            </div>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}
