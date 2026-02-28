export function generateAnonymousId(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < 8; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `anon_${result}`;
}

export function validateAnonymousId(id: string): { valid: boolean; error?: string } {
  if (!id || id.trim().length === 0) {
    return { valid: false, error: '评论ID不能为空' };
  }

  if (id.length < 3 || id.length > 20) {
    return { valid: false, error: '评论ID长度需在3-20个字符之间' };
  }

  const validPattern = /^[a-zA-Z0-9_\u4e00-\u9fa5]+$/;
  if (!validPattern.test(id)) {
    return { valid: false, error: '评论ID只能包含字母、数字、下划线和中文' };
  }

  return { valid: true };
}

export function formatAnonymousId(id: string): string {
  if (id.startsWith('anon_')) {
    return id;
  }
  return `anon_${id}`;
}
