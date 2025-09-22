"use client";

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import ProtectedRoute from '@/components/ProtectedRoute';
import Navbar from '@/components/Navbar';
import { useRouter } from 'next/navigation';
import { 
  Loader2, 
  Users,
  Shield,
  Settings,
  BarChart3,
  Plus,
  Edit,
  Trash2,
  Search,
  UserPlus,
  Key,
  Eye,
  Grid3X3
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

// Import our components
import RoleManagement from '@/components/roles/RoleManagement';
import RolePermissions from '@/components/roles/RolePermissions';
import UserManagement from '@/components/users/userManagement';

const AdminSystem = () => {
  const { user, isAuthenticated, isInitialized } = useAuth();
  const router = useRouter();
  
  // State for admin system
  const [activeSection, setActiveSection] = useState('dashboard');
  const [activeTab, setActiveTab] = useState('users');

  // Sample data for dashboard
  const [systemStats] = useState({
    totalUsers: 24,
    activeUsers: 18,
    adminUsers: 3,
    todayLogins: 12,
    totalRoles: 8,
    systemHealth: 'Good'
  });

  // Additional protection - only admins should access this page
  useEffect(() => {
    if (!isAuthenticated ) {
      router.push('/');
    }
  }, [isAuthenticated, isInitialized, router, user]);

  if (!isInitialized) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  // Render different sections based on selection
  const renderActiveSection = () => {
    switch (activeSection) {
      case 'users':
        return (
          <div className="space-y-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>User & Role Management</CardTitle>
                  <CardDescription>
                    Manage system users, roles, and permissions
                  </CardDescription>
                </div>
              </CardHeader>
              <CardContent>
                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                  <TabsList className="grid w-full grid-cols-3 mb-6">
                    <TabsTrigger value="users" className="flex items-center gap-2">
                      <Users className="h-4 w-4" />
                      Users
                    </TabsTrigger>
                    <TabsTrigger value="roles" className="flex items-center gap-2">
                      <Shield className="h-4 w-4" />
                      Roles
                    </TabsTrigger>
                    <TabsTrigger value="permissions" className="flex items-center gap-2">
                      <Key className="h-4 w-4" />
                      Permissions
                    </TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="users">
                    <UserManagement />
                  </TabsContent>
                  
                  <TabsContent value="roles">
                    <RoleManagement />
                  </TabsContent>
                  
                  <TabsContent value="permissions">
                    <RolePermissions />
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>
        );
      case 'dashboard':
        return (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>System Dashboard</CardTitle>
                <CardDescription>Overview of system health and statistics</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <Card className="bg-gradient-to-br from-blue-50 to-blue-100">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Users className="h-5 w-5 text-blue-600" />
                        Users
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex justify-between items-end">
                        <div>
                          <div className="text-3xl font-bold">{systemStats.totalUsers}</div>
                          <div className="text-sm text-muted-foreground">Total Users</div>
                        </div>
                        <Badge variant="outline" className="bg-blue-100 text-blue-800">
                          {systemStats.activeUsers} Active
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-gradient-to-br from-green-50 to-green-100">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Shield className="h-5 w-5 text-green-600" />
                        Roles & Permissions
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex justify-between items-end">
                        <div>
                          <div className="text-3xl font-bold">{systemStats.totalRoles}</div>
                          <div className="text-sm text-muted-foreground">System Roles</div>
                        </div>
                        <Badge variant="outline" className="bg-green-100 text-green-800">
                          {systemStats.adminUsers} Admins
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-gradient-to-br from-purple-50 to-purple-100">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg flex items-center gap-2">
                        <BarChart3 className="h-5 w-5 text-purple-600" />
                        Activity
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex justify-between items-end">
                        <div>
                          <div className="text-3xl font-bold">{systemStats.todayLogins}</div>
                          <div className="text-sm text-muted-foreground">Today's Logins</div>
                        </div>
                        <Badge variant="outline" className="bg-purple-100 text-purple-800">
                          This Week
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Recent Activity</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {[
                          { user: 'John Doe', action: 'Logged in', time: '2 minutes ago' },
                          { user: 'Jane Smith', action: 'Updated inventory', time: '15 minutes ago' },
                          { user: 'Mike Johnson', action: 'Created new user', time: '1 hour ago' },
                          { user: 'System', action: 'Nightly backup completed', time: '3 hours ago' }
                        ].map((activity, index) => (
                          <div key={index} className="flex items-center justify-between py-2 border-b last:border-0">
                            <div>
                              <div className="font-medium">{activity.user}</div>
                              <div className="text-sm text-muted-foreground">{activity.action}</div>
                            </div>
                            <div className="text-sm text-muted-foreground">{activity.time}</div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">System Health</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className={`h-3 w-3 rounded-full ${systemStats.systemHealth === 'Good' ? 'bg-green-500' : 'bg-red-500'}`}></div>
                            <span>System Status</span>
                          </div>
                          <Badge variant={systemStats.systemHealth === 'Good' ? 'default' : 'destructive'}>
                            {systemStats.systemHealth}
                          </Badge>
                        </div>
                        
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span>API Response Time</span>
                            <span className="font-mono">142ms</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div className="bg-green-500 h-2 rounded-full" style={{width: '85%'}}></div>
                          </div>
                        </div>
                        
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span>Database Load</span>
                            <span className="font-mono">24%</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div className="bg-blue-500 h-2 rounded-full" style={{width: '24%'}}></div>
                          </div>
                        </div>
                        
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span>Storage Usage</span>
                            <span className="font-mono">62%</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div className="bg-amber-500 h-2 rounded-full" style={{width: '62%'}}></div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </CardContent>
            </Card>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="container mx-auto p-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold tracking-tight">Admin System</h1>
          <p className="text-muted-foreground">
            Manage users, roles, permissions, and monitor system health
          </p>
        </div>
        
        <div className="flex flex-wrap gap-2 mb-6">
          <Button 
            onClick={() => setActiveSection('dashboard')} 
            variant={activeSection === 'dashboard' ? 'default' : 'outline'}
            className="flex items-center gap-2"
          >
            <BarChart3 className="h-4 w-4" />
            Dashboard
          </Button>
          <Button 
            onClick={() => setActiveSection('users')} 
            variant={activeSection === 'users' ? 'default' : 'outline'}
            className="flex items-center gap-2"
          >
            <Users className="h-4 w-4" />
            User Management
          </Button>
          <Button 
            variant="outline"
            className="flex items-center gap-2"
            disabled
          >
            <Settings className="h-4 w-4" />
            System Settings
          </Button>
          <Button 
            variant="outline"
            className="flex items-center gap-2"
            disabled
          >
            <Grid3X3 className="h-4 w-4" />
            Audit Logs
          </Button>
        </div>
        
        {renderActiveSection()}
      </div>
    </div>
  );
};

export default AdminSystem;