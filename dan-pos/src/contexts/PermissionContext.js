"use client";

import { createContext, useContext, useState, useEffect, useRef } from 'react';
import { getUserPermissions } from '@/lib/api/permissions';
import { useAuth } from './AuthContext';

const PermissionContext = createContext({});

export const PermissionProvider = ({ children }) => {
  const { user } = useAuth();
  const [permissions, setPermissions] = useState([]);
  const [permissionMap, setPermissionMap] = useState({});
  const [loading, setLoading] = useState(true);
  const hasLoadedRef = useRef(false);
  const previousUserRef = useRef(null);

  useEffect(() => {
    const loadPermissions = async () => {
      // If no user, reset and don't load
      if (!user) {
        setPermissions([]);
        setPermissionMap({});
        setLoading(false);
        hasLoadedRef.current = false;
        previousUserRef.current = null;
        return;
      }

      // If we've already loaded for this user, don't load again
      if (hasLoadedRef.current && previousUserRef.current === user.id) {
        return;
      }

      // If user changed, reset the flag
      if (previousUserRef.current !== user.id) {
        hasLoadedRef.current = false;
        previousUserRef.current = user.id;
      }

      try {
        setLoading(true);
        const data = await getUserPermissions();
        
        // Flatten permissions from all categories
        const allPermissions = [];
        const map = {};
        
        if (data.permissions_by_category) {
          Object.values(data.permissions_by_category).forEach(categoryPerms => {
            categoryPerms.forEach(perm => {
              allPermissions.push(perm);
              map[perm.codename] = true;
            });
          });
        }
        
        setPermissions(allPermissions);
        setPermissionMap(map);
        hasLoadedRef.current = true;
      } catch (error) {
        console.error('Failed to load permissions:', error);
        setPermissions([]);
        setPermissionMap({});
      } finally {
        setLoading(false);
      }
    };

    loadPermissions();
  }, [user]);

  // Check if user has a specific permission
  const hasPermission = (codename) => {
    return permissionMap[codename] === true;
  };

  // Check if user has ANY of the permissions
  const hasAnyPermission = (codenames = []) => {
    return codenames.some(codename => hasPermission(codename));
  };

  // Check if user has ALL of the permissions
  const hasAllPermissions = (codenames = []) => {
    return codenames.every(codename => hasPermission(codename));
  };

  // Manual refresh function
  const refreshPermissions = async () => {
    if (!user) return;
    
    hasLoadedRef.current = false;
    
    try {
      setLoading(true);
      const data = await getUserPermissions();
      
      const allPermissions = [];
      const map = {};
      
      if (data.permissions_by_category) {
        Object.values(data.permissions_by_category).forEach(categoryPerms => {
          categoryPerms.forEach(perm => {
            allPermissions.push(perm);
            map[perm.codename] = true;
          });
        });
      }
      
      setPermissions(allPermissions);
      setPermissionMap(map);
      hasLoadedRef.current = true;
    } catch (error) {
      console.error('Failed to refresh permissions:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <PermissionContext.Provider
      value={{
        permissions,
        permissionMap,
        loading,
        hasPermission,
        hasAnyPermission,
        hasAllPermissions,
        refreshPermissions
      }}
    >
      {children}
    </PermissionContext.Provider>
  );
};

export const usePermissions = () => {
  const context = useContext(PermissionContext);
  if (!context) {
    throw new Error('usePermissions must be used within PermissionProvider');
  }
  return context;
};