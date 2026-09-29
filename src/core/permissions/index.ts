/**
 * Core RBAC & Permissions Engine
 * Vạn Cổ Luân Hồi
 */

export type UserRole = 'guest' | 'user' | 'moderator' | 'admin';

export type SystemPermission =
  | 'post:read'
  | 'post:like'
  | 'post:bookmark'
  | 'comment:create'
  | 'comment:delete_own'
  | 'comment:delete_any'
  | 'report:create'
  | 'report:manage'
  | 'user:block'
  | 'admin:manage_posts'
  | 'admin:manage_categories'
  | 'admin:manage_users'
  | 'admin:manage_modules'
  | 'admin:view_dashboard';

const ROLE_PERMISSIONS: Record<UserRole, SystemPermission[]> = {
  guest: [
    'post:read',
  ],
  user: [
    'post:read',
    'post:like',
    'post:bookmark',
    'comment:create',
    'comment:delete_own',
    'report:create',
    'user:block',
  ],
  moderator: [
    'post:read',
    'post:like',
    'post:bookmark',
    'comment:create',
    'comment:delete_own',
    'comment:delete_any',
    'report:create',
    'report:manage',
    'user:block',
  ],
  admin: [
    'post:read',
    'post:like',
    'post:bookmark',
    'comment:create',
    'comment:delete_own',
    'comment:delete_any',
    'report:create',
    'report:manage',
    'user:block',
    'admin:manage_posts',
    'admin:manage_categories',
    'admin:manage_users',
    'admin:manage_modules',
    'admin:view_dashboard',
  ],
};

export function hasPermission(role: UserRole = 'guest', permission: SystemPermission): boolean {
  const permissions = ROLE_PERMISSIONS[role] || ROLE_PERMISSIONS.guest;
  return permissions.includes(permission);
}
