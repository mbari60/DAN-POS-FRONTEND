"use client";

import {
  Package,
  BarChart3,
  TrendingUp,
  Edit,
  LogOut,
  X,
  Menu,
  ChevronLeft,
  ChevronRight,
  Home
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { getCurrentUser } from '@/services/auth';
import { cn } from '@/lib/utils';
import { useState, useEffect } from 'react';

const InventorySidebar = ({ activeComponent, setActiveComponent }) => {
  const { user, logout } = useAuth();
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isDesktopCollapsed, setIsDesktopCollapsed] = useState(false);
  const [profileUser, setProfileUser] = useState(null);
  const [loadingProfile, setLoadingProfile] = useState(true);

  const navigation = [
    { id: 'stores', name: 'Stores', icon: Home },
    { id: 'items', name: 'Inventory Items', icon: Package },
    { id: 'transfers', name: 'Location Transfer', icon: Package },
    { id: 'movements', name: 'Stock Movements', icon: TrendingUp },
    { id: 'adjustments', name: 'Stock Adjustments', icon: Edit },
    { id: 'stocktake', name: 'stocktake', icon: Edit },
    { id: 'pricing', name: 'pricing', icon: BarChart3 },
  ];

  // Fetch user profile data
  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        setLoadingProfile(true);
        const userData = await getCurrentUser();
        setProfileUser(userData);
      } catch (error) {
        console.error('Failed to fetch user profile:', error);
        setProfileUser(user);
      } finally {
        setLoadingProfile(false);
      }
    };

    fetchUserProfile();
  }, [user]);

  // Close mobile menu on component change
  useEffect(() => {
    setIsMobileOpen(false);
  }, [activeComponent]);

  // Get user display info with fallback
  const getUserDisplayInfo = () => {
    const currentUser = profileUser || user;
    if (!currentUser) return { name: 'Loading...', role: '' };

    const displayName = currentUser.first_name && currentUser.last_name 
      ? `${currentUser.first_name} ${currentUser.last_name}`
      : currentUser.full_name || currentUser.username || 'User';
      
    const roleName = currentUser.role?.name || currentUser.role_info?.name || 'User';

    return { name: displayName, role: roleName };
  };

  const userDisplayInfo = getUserDisplayInfo();

  return (
    <>
      {/* Mobile overlay */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setIsMobileOpen(false)}
        />
      )}
            
      {/* Sidebar */}
      <div className={cn(
        "fixed left-0 top-16 h-[calc(100vh-4rem)] bg-gray-900 text-white flex flex-col transform transition-all duration-300 z-50",
        // Mobile states - fixed width on mobile
        isMobileOpen ? "translate-x-0 w-64" : "-translate-x-full w-64",
        // Desktop states - controlled by collapse state
        "lg:translate-x-0",
        isDesktopCollapsed ? "lg:w-16" : "lg:w-64"
      )}>
        {/* Mobile close button */}
        <button
          className="lg:hidden absolute top-4 right-4 p-1 hover:bg-gray-800 rounded"
          onClick={() => setIsMobileOpen(false)}
        >
          <X className="h-5 w-5" />
        </button>

        {/* Desktop toggle button */}
        <button
          className="hidden lg:block absolute -right-3 top-8 bg-gray-900 border border-gray-700 text-white p-1 rounded-full shadow-lg hover:bg-gray-800 transition-colors z-10"
          onClick={() => setIsDesktopCollapsed(!isDesktopCollapsed)}
        >
          {isDesktopCollapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <ChevronLeft className="h-4 w-4" />
          )}
        </button>

        <div className="flex flex-col h-full p-4">
          {/* User Info */}
          <div className={cn(
            "px-4 py-3 mb-6 bg-gray-800 rounded-lg transition-all duration-300",
            isDesktopCollapsed && "lg:px-2 lg:py-2"
          )}>
            {!isDesktopCollapsed ? (
              <>
                <p className="text-sm font-medium truncate" title={userDisplayInfo.name}>
                  {loadingProfile ? 'Loading...' : userDisplayInfo.name}
                </p>
                <p className="text-xs text-gray-400 truncate" title={userDisplayInfo.role}>
                  {loadingProfile ? '' : userDisplayInfo.role}
                </p>
              </>
            ) : (
              <div className="flex justify-center">
                <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-sm font-bold">
                  {loadingProfile ? '?' : (userDisplayInfo.name?.charAt(0) || 'U')}
                </div>
              </div>
            )}
          </div>

          {/* Navigation */}
          <nav className="flex-1">
            <ul className="space-y-2">
              {navigation.map((item) => (
                <li key={item.id}>
                  <button
                    onClick={() => {
                      setActiveComponent(item.id);
                    }}
                    className={cn(
                      "w-full flex items-center px-4 py-3 rounded-lg text-left transition-all duration-200",
                      activeComponent === item.id
                        ? "bg-blue-600 text-white"
                        : "text-gray-300 hover:bg-gray-800 hover:text-white",
                      isDesktopCollapsed && "lg:px-3 lg:justify-center lg:relative group"
                    )}
                    title={isDesktopCollapsed ? item.name : undefined}
                  >
                    <item.icon className={cn(
                      "h-5 w-5 flex-shrink-0",
                      !isDesktopCollapsed && "mr-3"
                    )} />
                    
                    {!isDesktopCollapsed && (
                      <span className="truncate">{item.name}</span>
                    )}

                    {/* Tooltip for collapsed state */}
                    {isDesktopCollapsed && (
                      <div className="absolute left-full ml-2 px-2 py-1 bg-gray-800 text-white text-sm rounded shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50">
                        {item.name}
                      </div>
                    )}
                  </button>
                </li>
              ))}
            </ul>
          </nav>

        </div>
      </div>

      {/* Mobile menu button - Fixed positioning */}
      <button
        className="fixed bottom-6 right-6 bg-blue-600 text-white p-4 rounded-full shadow-lg lg:hidden z-30 hover:bg-blue-700 transition-colors"
        onClick={() => setIsMobileOpen(true)}
      >
        <Menu className="h-6 w-6" />
      </button>
    </>
  );
};

export default InventorySidebar;