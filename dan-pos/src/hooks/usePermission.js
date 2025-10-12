"use client";

import { usePermissions } from "@/contexts/PermissionContext";


export const usePermission = (codename) => {
  const { hasPermission } = usePermissions();
  return hasPermission(codename);
};