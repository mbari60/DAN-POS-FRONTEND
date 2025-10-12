"use client";

import { usePermissions } from '@/contexts/PermissionContext';

export const PermissionGuard = ({ 
  permission, 
  permissions = [], 
  requireAll = false,
  fallback = null,
  showDisabled = false,
  children 
}) => {
  const { hasPermission, hasAnyPermission, hasAllPermissions, loading } = usePermissions();

  if (loading) return null;

  // Single permission check
  if (permission) {
    const allowed = hasPermission(permission);
    if (!allowed) {
      if (showDisabled) {
        return <div className="opacity-50 cursor-not-allowed pointer-events-none">{children}</div>;
      }
      return fallback;
    }
    return <>{children}</>;
  }

  // Multiple permissions check
  if (permissions.length > 0) {
    const allowed = requireAll 
      ? hasAllPermissions(permissions)
      : hasAnyPermission(permissions);
    
    if (!allowed) {
      if (showDisabled) {
        return <div className="opacity-50 cursor-not-allowed pointer-events-none">{children}</div>;
      }
      return fallback;
    }
    return <>{children}</>;
  }

  return <>{children}</>;
};
