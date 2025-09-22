"use client";

import { useAuth } from '@/contexts/AuthContext';
import { getCurrentUser } from '@/services/auth';
import { LogOut, User, ShoppingCart, Settings, CreditCard, Package, BarChart3 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useRouter, usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useState, useEffect } from 'react';

const Navbar = () => {
  const { user, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [profileUser, setProfileUser] = useState(null);
  const [loadingProfile, setLoadingProfile] = useState(true);

  // Fetch user profile data
  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        setLoadingProfile(true);
        const userData = await getCurrentUser();
        setProfileUser(userData);
      } catch (error) {
        console.error('Failed to fetch user profile:', error);
        // Fallback to auth context user if profile fetch fails
        setProfileUser(user);
      } finally {
        setLoadingProfile(false);
      }
    };

    fetchUserProfile();
  }, [user]);

  // Get user display info with fallback
  const getUserDisplayInfo = () => {
    const currentUser = profileUser || user;
    if (!currentUser) return { name: 'Loading...', email: '', role: '' };

    const displayName = currentUser.first_name && currentUser.last_name 
      ? `${currentUser.first_name} ${currentUser.last_name}`
      : currentUser.full_name || currentUser.username || 'User';
      
    const email = currentUser.email || '';
    const roleName = currentUser.role?.name || currentUser.role_info?.name || 'User';
    const initials = currentUser.first_name && currentUser.last_name 
      ? `${currentUser.first_name.charAt(0)}${currentUser.last_name.charAt(0)}`.toUpperCase()
      : (currentUser.username || 'U').charAt(0).toUpperCase();

    return { name: displayName, email, role: roleName, initials };
  };

  const handleProfileClick = () => {
    router.push('/profile');
  };

  const handleChangePasswordClick = () => {
    router.push('/changepassword');
  };

  const userDisplayInfo = getUserDisplayInfo();

  const navigation = [
    {
      name: 'POS Sale',
      href: '/pos-sale',
      icon: ShoppingCart,
      current: pathname === '/pos-sale' || pathname === '/',
    },
    {
      name: 'Procurement',
      href: '/procurement',
      icon: CreditCard,
      current: pathname.startsWith('/procurement'),
    },
    {
      name: 'Inventory',
      href: '/inventory',
      icon: Package,
      current: pathname.startsWith('/inventory'),
    },
    {
      name: 'Reports',
      href: '/reports',
      icon: BarChart3,
      current: pathname.startsWith('/reports'),
    },
     {
      name: 'admin',
      href: '/admin',
      icon: BarChart3,
      current: pathname.startsWith('/admin'),
    },
  ];

  return (
    <nav className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo and Navigation Tabs */}
          <div className="flex items-center">
            {/* Logo Section with improved spacing */}
            <div className="flex-shrink-0 flex items-center mr-66">
              <ShoppingCart className="h-8 w-8 text-blue-600 mr-3" />
              <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                POS
              </span>
            </div>
            
            {/* Navigation Tabs with better spacing */}
            <div className="hidden md:flex md:space-x-2">
              {navigation.map((item) => {
                const Icon = item.icon;
                return (
                  <Button
                    key={item.name}
                    onClick={() => router.push(item.href)}
                    variant={item.current ? "secondary" : "ghost"}
                    className={cn(
                      "rounded-lg px-4 py-2 text-sm font-medium flex items-center transition-all duration-200",
                      item.current
                        ? "bg-blue-50 text-blue-700 border border-blue-200 shadow-sm"
                        : "text-gray-600 hover:text-blue-700 hover:bg-blue-50"
                    )}
                  >
                    <Icon className="h-4 w-4 mr-2" />
                    {item.name}
                  </Button>
                );
              })}
            </div>
          </div>

          {/* Mobile menu button (hidden on larger screens) */}
          <div className="md:hidden flex items-center">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="p-2 hover:bg-gray-100 rounded-lg">
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end">
                {navigation.map((item) => {
                  const Icon = item.icon;
                  return (
                    <DropdownMenuItem
                      key={item.name}
                      onClick={() => router.push(item.href)}
                      className={cn(
                        "flex items-center py-2",
                        item.current ? "bg-blue-50 text-blue-700" : ""
                      )}
                    >
                      <Icon className="h-4 w-4 mr-3" />
                      {item.name}
                    </DropdownMenuItem>
                  );
                })}
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleProfileClick} className="py-2">
                  <User className="mr-3 h-4 w-4" />
                  <span>Profile</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleChangePasswordClick} className="py-2">
                  <Settings className="mr-3 h-4 w-4" />
                  <span>Change Password</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={logout} className="py-2 text-red-600 hover:text-red-700">
                  <LogOut className="mr-3 h-4 w-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* User dropdown (hidden on mobile) */}
          <div className="hidden md:flex items-center space-x-4">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-10 w-10 rounded-full hover:bg-gray-100 transition-colors">
                  <div className="h-8 w-8 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center text-white text-sm font-bold">
                    {loadingProfile ? '?' : userDisplayInfo.initials}
                  </div>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-64" align="end" forcePortal>
                <DropdownMenuLabel className="font-normal p-4">
                  <div className="flex flex-col space-y-2">
                    <div className="flex items-center space-x-3">
                      <div className="h-10 w-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center text-white text-sm font-bold">
                        {loadingProfile ? '?' : userDisplayInfo.initials}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-gray-900 truncate">
                          {loadingProfile ? 'Loading...' : userDisplayInfo.name}
                        </p>
                        <p className="text-xs text-gray-500 truncate">
                          {loadingProfile ? '' : userDisplayInfo.email}
                        </p>
                      </div>
                    </div>
                    <div className="bg-gray-50 rounded-md px-2 py-1">
                      <p className="text-xs text-gray-600 font-medium">
                        {loadingProfile ? '' : userDisplayInfo.role}
                      </p>
                    </div>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleProfileClick} className="py-3">
                  <User className="mr-3 h-4 w-4 text-gray-500" />
                  <span className="font-medium">Profile</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleChangePasswordClick} className="py-3">
                  <Settings className="mr-3 h-4 w-4 text-gray-500" />
                  <span className="font-medium">Change Password</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={logout} className="py-3 text-red-600 hover:text-red-700 hover:bg-red-50">
                  <LogOut className="mr-3 h-4 w-4" />
                  <span className="font-medium">Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Mobile navigation (shown on mobile) */}
        <div className="md:hidden pb-3 pt-1">
          <div className="flex space-x-2 overflow-x-auto scrollbar-hide">
            {navigation.map((item) => {
              const Icon = item.icon;
              return (
                <Button
                  key={item.name}
                  onClick={() => router.push(item.href)}
                  variant={item.current ? "secondary" : "ghost"}
                  className={cn(
                    "rounded-lg px-3 py-2 text-xs font-medium flex items-center whitespace-nowrap flex-shrink-0",
                    item.current
                      ? "bg-blue-50 text-blue-700 border border-blue-200"
                      : "text-gray-600 hover:text-blue-700 hover:bg-blue-50"
                  )}
                >
                  <Icon className="h-3 w-3 mr-2" />
                  {item.name}
                </Button>
              );
            })}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;