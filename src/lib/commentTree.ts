import { Comment } from '@/types';

const MAX_DEPTH = 3;

export function buildCommentTree(comments: Comment[]): Comment[] {
  const commentMap = new Map<string, Comment>();
  const rootComments: Comment[] = [];

  comments.forEach((comment) => {
    commentMap.set(comment.id, { ...comment, replies: [], depth: 0 });
  });

  comments.forEach((comment) => {
    const node = commentMap.get(comment.id)!;
    if (comment.parent_id === null) {
      rootComments.push(node);
    } else {
      const parent = commentMap.get(comment.parent_id);
      if (parent) {
        node.depth = (parent.depth || 0) + 1;
        parent.replies = parent.replies || [];
        parent.replies.push(node);
      }
    }
  });

  return rootComments;
}

export function flattenCommentTree(comments: Comment[]): Comment[] {
  const result: Comment[] = [];

  function flatten(nodes: Comment[], depth: number = 0) {
    nodes.forEach((node) => {
      result.push({ ...node, depth });
      if (node.replies && node.replies.length > 0) {
        flatten(node.replies, depth + 1);
      }
    });
  }

  flatten(comments);
  return result;
}

export function getEffectiveDepth(depth: number): number {
  return Math.min(depth, MAX_DEPTH);
}

export function shouldShowThreadLine(depth: number): boolean {
  return depth > 0 && depth <= MAX_DEPTH;
}
