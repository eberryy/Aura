"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { ThemeMode } from "@/types";

interface ThemeContextType {
  theme: ThemeMode;
  isPrivateMode: boolean;
  setTheme: (theme: ThemeMode) => void;
  setPrivateMode: (isPrivate: boolean) => void;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({
  children,
}: {
  children: ReactNode;
}): React.ReactElement {
  const [theme, setTheme] = useState<ThemeMode>("light");
  const [isPrivateMode, setIsPrivateMode] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const savedTheme = localStorage.getItem("aura-theme") as ThemeMode;
    if (savedTheme) {
      setTheme(savedTheme);
    }
    const savedPrivateMode = localStorage.getItem("aura-private-mode");
    if (savedPrivateMode) {
      setIsPrivateMode(savedPrivateMode === "true");
    }
  }, []);

  useEffect(() => {
    if (mounted) {
      localStorage.setItem("aura-theme", theme);
      if (theme === "dark") {
        document.documentElement.classList.add("dark");
      } else {
        document.documentElement.classList.remove("dark");
      }
    }
  }, [theme, mounted]);

  useEffect(() => {
    if (mounted) {
      localStorage.setItem("aura-private-mode", String(isPrivateMode));
    }
  }, [isPrivateMode, mounted]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === "light" ? "dark" : "light"));
  };

  return (
    <ThemeContext.Provider
      value={{
        theme,
        isPrivateMode,
        setTheme,
        setPrivateMode: setIsPrivateMode,
        toggleTheme,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}
