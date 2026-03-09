import { openDB, DBSchema, IDBPDatabase } from 'idb';
import { Folder, Post, Comment } from '@/types';

interface AuraDB extends DBSchema {
  folders: {
    key: string;
    value: Folder;
    indexes: { 'by-updated': string };
  };
  posts: {
    key: string;
    value: Post;
    indexes: { 'by-folder': string; 'by-updated': string };
  };
  comments: {
    key: string;
    value: Comment;
    indexes: { 'by-post': string };
  };
  syncQueue: {
    key: string;
    value: {
      id: string;
      action: 'create' | 'update' | 'delete';
      type: 'folder' | 'post' | 'comment';
      data: unknown;
      timestamp: number;
    };
  };
}

const DB_NAME = 'aura-db';
const DB_VERSION = 1;

let dbInstance: IDBPDatabase<AuraDB> | null = null;

export async function getDB(): Promise<IDBPDatabase<AuraDB>> {
  if (dbInstance) return dbInstance;

  dbInstance = await openDB<AuraDB>(DB_NAME, DB_VERSION, {
    upgrade(db) {
      if (!db.objectStoreNames.contains('folders')) {
        const folderStore = db.createObjectStore('folders', { keyPath: 'id' });
        folderStore.createIndex('by-updated', 'updated_at');
      }

      if (!db.objectStoreNames.contains('posts')) {
        const postStore = db.createObjectStore('posts', { keyPath: 'id' });
        postStore.createIndex('by-folder', 'folder_id');
        postStore.createIndex('by-updated', 'updated_at');
      }

      if (!db.objectStoreNames.contains('comments')) {
        const commentStore = db.createObjectStore('comments', { keyPath: 'id' });
        commentStore.createIndex('by-post', 'post_id');
      }

      if (!db.objectStoreNames.contains('syncQueue')) {
        db.createObjectStore('syncQueue', { keyPath: 'id' });
      }
    },
  });

  return dbInstance;
}

export const indexedDBStorage = {
  async getFolders(): Promise<Folder[]> {
    const db = await getDB();
    return db.getAll('folders');
  },

  async getFolder(id: string): Promise<Folder | undefined> {
    const db = await getDB();
    return db.get('folders', id);
  },

  async saveFolder(folder: Folder): Promise<void> {
    const db = await getDB();
    await db.put('folders', folder);
  },

  async saveFolders(folders: Folder[]): Promise<void> {
    const db = await getDB();
    const tx = db.transaction('folders', 'readwrite');
    await Promise.all([
      ...folders.map((folder) => tx.store.put(folder)),
      tx.done,
    ]);
  },

  async deleteFolder(id: string): Promise<void> {
    const db = await getDB();
    await db.delete('folders', id);
  },

  async getPosts(): Promise<Post[]> {
    const db = await getDB();
    return db.getAll('posts');
  },

  async getPostsByFolder(folderId: string): Promise<Post[]> {
    const db = await getDB();
    return db.getAllFromIndex('posts', 'by-folder', folderId);
  },

  async getPost(id: string): Promise<Post | undefined> {
    const db = await getDB();
    return db.get('posts', id);
  },

  async savePost(post: Post): Promise<void> {
    const db = await getDB();
    await db.put('posts', post);
  },

  async savePosts(posts: Post[]): Promise<void> {
    const db = await getDB();
    const tx = db.transaction('posts', 'readwrite');
    await Promise.all([
      ...posts.map((post) => tx.store.put(post)),
      tx.done,
    ]);
  },

  async deletePost(id: string): Promise<void> {
    const db = await getDB();
    await db.delete('posts', id);
  },

  async getCommentsByPost(postId: string): Promise<Comment[]> {
    const db = await getDB();
    return db.getAllFromIndex('comments', 'by-post', postId);
  },

  async saveComment(comment: Comment): Promise<void> {
    const db = await getDB();
    await db.put('comments', comment);
  },

  async saveComments(comments: Comment[]): Promise<void> {
    const db = await getDB();
    const tx = db.transaction('comments', 'readwrite');
    await Promise.all([
      ...comments.map((comment) => tx.store.put(comment)),
      tx.done,
    ]);
  },

  async deleteComment(id: string): Promise<void> {
    const db = await getDB();
    await db.delete('comments', id);
  },

  async addToSyncQueue(item: {
    id: string;
    action: 'create' | 'update' | 'delete';
    type: 'folder' | 'post' | 'comment';
    data: unknown;
  }): Promise<void> {
    const db = await getDB();
    await db.put('syncQueue', {
      ...item,
      timestamp: Date.now(),
    });
  },

  async getSyncQueue(): Promise<
    Array<{
      id: string;
      action: 'create' | 'update' | 'delete';
      type: 'folder' | 'post' | 'comment';
      data: unknown;
      timestamp: number;
    }>
  > {
    const db = await getDB();
    return db.getAll('syncQueue');
  },

  async clearSyncQueue(): Promise<void> {
    const db = await getDB();
    await db.clear('syncQueue');
  },

  async clearAll(): Promise<void> {
    const db = await getDB();
    await Promise.all([
      db.clear('folders'),
      db.clear('posts'),
      db.clear('comments'),
      db.clear('syncQueue'),
    ]);
  },
};

export function isLocalStorageFull(): boolean {
  try {
    const testKey = '__storage_test__';
    localStorage.setItem(testKey, 'test');
    localStorage.removeItem(testKey);
    return false;
  } catch (e) {
    return true;
  }
}

export function getStorageUsage(): { used: number; quota: number } | null {
  if ('storage' in navigator && 'estimate' in navigator.storage) {
    return null;
  }
  return null;
}

export async function estimateStorage(): Promise<{ used: number; quota: number } | null> {
  if ('storage' in navigator && 'estimate' in navigator.storage) {
    const estimate = await navigator.storage.estimate();
    return {
      used: estimate.usage || 0,
      quota: estimate.quota || 0,
    };
  }
  return null;
}
