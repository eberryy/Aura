const STORAGE_KEYS = {
  COMMENTS: 'aura_comments',
  POSTS: 'aura_posts',
  FOLDERS: 'aura_folders',
};

function isClient(): boolean {
  return typeof window !== 'undefined';
}

export function getStorageItem<T>(key: string, defaultValue: T): T {
  if (!isClient()) {
    return defaultValue;
  }

  try {
    const item = localStorage.getItem(key);
    if (item === null) {
      return defaultValue;
    }
    return JSON.parse(item) as T;
  } catch (error) {
    console.error(`Error reading from localStorage key "${key}":`, error);
    return defaultValue;
  }
}

export function setStorageItem<T>(key: string, value: T): boolean {
  if (!isClient()) {
    return false;
  }

  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch (error) {
    console.error(`Error writing to localStorage key "${key}":`, error);
    return false;
  }
}

export function removeStorageItem(key: string): boolean {
  if (!isClient()) {
    return false;
  }

  try {
    localStorage.removeItem(key);
    return true;
  } catch (error) {
    console.error(`Error removing localStorage key "${key}":`, error);
    return false;
  }
}

export { STORAGE_KEYS };
