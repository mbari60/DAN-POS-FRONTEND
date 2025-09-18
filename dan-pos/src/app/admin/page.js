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
  Eye
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';

const AdminSystem = () => {
  const { user, isAuthenticated, isInitialized } = useAuth();
  const router = useRouter();
  
  // State for admin system
  const [activeSection, setActiveSection] = useState('dashboard');
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddingUser, setIsAddingUser] = useState(false);
  const [isEditingUser, setIsEditingUser] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  // Sample data
  const [users] = useState([
    { 
      id: 1, 
      name: 'John Doe', 
      email: 'john@example.com', 
      role: 'admin', 
      status: 'active',
      lastLogin: '2023-10-05 14:30',
      permissions: ['all']
    },
    { 
      id: 2, 
      name: 'Jane Smith', 
      email: 'jane@example.com', 
      role: 'manager', 
      status: 'active',
      lastLogin: '2023-10-04 09:15',
      permissions: ['inventory', 'reports']
    },
    { 
      id: 3, 
      name: 'Mike Johnson', 
      email: 'mike@example.com', 
      role: 'cashier', 
      status: 'inactive',
      lastLogin: '2023-09-28 16:45',
      permissions: ['sales']
    },
    { 
      id: 4, 
      name: 'Sarah Wilson', 
      email: 'sarah@example.com', 
      role: 'manager', 
      status: 'active',
      lastLogin: '2023-10-05 11:20',
      permissions: ['inventory', 'sales']
    },
  ]);

  const [systemStats] = useState({
    totalUsers: 24,
    activeUsers: 18,
    adminUsers: 3,
    todayLogins: 12
  });

  const permissionsList = [
    { id: 'inventory', name: 'Inventory Management' },
    { id: 'sales', name: 'Sales Processing' },
    { id: 'reports', name: 'Reports Access' },
    { id: 'settings', name: 'System Settings' },
    { id: 'users', name: 'User Management' }
  ];

  const roles = ['admin', 'manager', 'cashier', 'viewer'];

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

  const handleAddUser = () => {
    // In a real app, this would call an API
    setIsAddingUser(false);
    alert('User added successfully!');
  };

  const handleEditUser = () => {
    // In a real app, this would call an API
    setIsEditingUser(false);
    setSelectedUser(null);
    alert('User updated successfully!');
  };

  const handleDeleteUser = (userId) => {
    if (confirm('Are you sure you want to delete this user?')) {
      // In a real app, this would call an API
      alert('User deleted successfully!');
    }
  };

  // Filter users based on search
  const filteredUsers = users.filter(user => 
    user.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    user.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Render different sections based on selection
  const renderActiveSection = () => {
    switch (activeSection) {
      case 'users':
        return (
          <div className="space-y-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>User Management</CardTitle>
                  <CardDescription>
                    Manage system users and permissions
                  </CardDescription>
                </div>
                <Button onClick={() => setIsAddingUser(true)}>
                  <UserPlus className="h-4 w-4 mr-2" />
                  Add User
                </Button>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col sm:flex-row gap-4 mb-6">
                  <div className="relative flex-1">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                    <Input
                      placeholder="Search users..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-8"
                    />
                  </div>
                  <Select defaultValue="all">
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="All Roles" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Roles</SelectItem>
                      {roles.map(role => (
                        <SelectItem key={role} value={role}>
                          {role.charAt(0).toUpperCase() + role.slice(1)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Select defaultValue="all">
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="All Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="border rounded-lg">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b bg-gray-50">
                        <th className="p-3 text-left">User</th>
                        <th className="p-3 text-left">Role</th>
                        <th className="p-3 text-left">Status</th>
                        <th className="p-3 text-left">Last Login</th>
                        <th className="p-3 text-left">Permissions</th>
                        <th className="p-3 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredUsers.map(user => (
                        <tr key={user.id} className="border-b">
                          <td className="p-3">
                            <div className="font-medium">{user.name}</div>
                            <div className="text-gray-500 text-sm">{user.email}</div>
                          </td>
                          <td className="p-3">
                            <Badge variant={user.role === 'admin' ? 'destructive' : user.role === 'manager' ? 'default' : 'outline'}>
                              {user.role}
                            </Badge>
                          </td>
                          <td className="p-3">
                            <Badge variant={user.status === 'active' ? 'default' : 'secondary'}>
                              {user.status}
                            </Badge>
                          </td>
                          <td className="p-3">{user.lastLogin}</td>
                          <td className="p-3">
                            <div className="flex flex-wrap gap-1">
                              {user.permissions.map(perm => (
                                <Badge key={perm} variant="outline" className="text-xs">
                                  {perm}
                                </Badge>
                              ))}
                            </div>
                          </td>
                          <td className="p-3 text-right">
                            <div className="flex justify-end gap-2">
                              <Button 
                                variant="ghost" 
                                size="sm"
                                onClick={() => {
                                  setSelectedUser(user);
                                  setIsEditingUser(true);
                                }}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="sm"
                                onClick={() => handleDeleteUser(user.id)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {isAddingUser && (
                  <div className="mt-6">
                    {/* Add User Modal */}
                    <Card>
                      <CardHeader>
                        <CardTitle>Add New User</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          <Input placeholder="Name" />
                          <Input placeholder="Email" />
                          <Select>
                            <SelectTrigger>
                              <SelectValue placeholder="Select Role" />
                            </SelectTrigger>
                            <SelectContent>
                              {roles.map(role => (
                                <SelectItem key={role} value={role}>
                                  {role.charAt(0).toUpperCase() + role.slice(1)}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <div className="flex items-center gap-2">
                            <Label htmlFor="status">Active</Label>
                            <Switch id="status" />
                          </div>
                        </div>
                      </CardContent>
                      <CardFooter>
                        <Button onClick={handleAddUser}>
                          <Plus className="h-4 w-4 mr-2" />
                          Add User
                        </Button>
                        <Button variant="outline" onClick={() => setIsAddingUser(false)}>
                          Cancel
                        </Button>
                      </CardFooter>
                    </Card>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        );
      case 'dashboard':
        return (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Dashboard</CardTitle>
                <CardDescription>Quick stats about the system</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Total Users</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-center">
                        <span className="text-3xl font-semibold">{systemStats.totalUsers}</span>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Active Users</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-center">
                        <span className="text-3xl font-semibold">{systemStats.activeUsers}</span>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Admin Users</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-center">
                        <span className="text-3xl font-semibold">{systemStats.adminUsers}</span>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Logins Today</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-center">
                        <span className="text-3xl font-semibold">{systemStats.todayLogins}</span>
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
    <div>
      <Navbar />
      <div className="p-6">
        <div className="flex items-center gap-4">
          <Button onClick={() => setActiveSection('dashboard')}>
            <BarChart3 className="h-4 w-4 mr-2" />
            Dashboard
          </Button>
          <Button onClick={() => setActiveSection('users')}>
            <Users className="h-4 w-4 mr-2" />
            Users
          </Button>
        </div>
        {renderActiveSection()}
      </div>
    </div>
  );
};

export default AdminSystem;
