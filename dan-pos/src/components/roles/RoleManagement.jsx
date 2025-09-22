import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Plus, Search, Edit, Trash2, Copy, Key, Users, Shield, AlertCircle, Loader2 } from 'lucide-react';
import { getRoles, createRole, updateRole, deleteRole, cloneRole, assignRoleToUser } from '@/lib/api/roles';
import { getUsers } from '@/lib/api/users';
import { toast } from 'react-toastify';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

export default function RoleManagement() {
  const [activeTab, setActiveTab] = useState('roles');
  const [roles, setRoles] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isCloneDialogOpen, setIsCloneDialogOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState(null);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    is_active: true
  });

  // Clone form state
  const [cloneFormData, setCloneFormData] = useState({
    new_name: '',
    new_description: '',
    copy_permissions: true
  });

  // Role assignment state
  const [selectedUser, setSelectedUser] = useState('none');
  const [selectedRoleForAssignment, setSelectedRoleForAssignment] = useState('none');

  // Form validation errors
  const [formErrors, setFormErrors] = useState({});

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [rolesResponse, usersResponse] = await Promise.all([
        getRoles(),
        getUsers({ include_role: true })
      ]);
      
      // Extract the results array from the paginated response
      const rolesData = rolesResponse?.results || rolesResponse || [];
      const usersData = usersResponse?.results || usersResponse || [];
      
      setRoles(Array.isArray(rolesData) ? rolesData : []);
      setUsers(Array.isArray(usersData) ? usersData : []);
    } catch (error) {
      console.error('Error loading data:', error);
      toast.error(error.message || 'Error loading data');
      setRoles([]);
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  const validateForm = () => {
    const errors = {};
    
    if (!formData.name.trim()) {
      errors.name = 'Role name is required';
    } else if (formData.name.length < 2) {
      errors.name = 'Role name must be at least 2 characters';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const validateCloneForm = () => {
    const errors = {};
    
    if (!cloneFormData.new_name.trim()) {
      errors.new_name = 'New role name is required';
    } else if (cloneFormData.new_name.length < 2) {
      errors.new_name = 'Role name must be at least 2 characters';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      is_active: true
    });
    setFormErrors({});
  };

  const resetCloneForm = () => {
    setCloneFormData({
      new_name: '',
      new_description: '',
      copy_permissions: true
    });
    setFormErrors({});
  };

  const handleCreateRole = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    try {
      setSubmitting(true);
      await createRole(formData);
      toast.success('Role created successfully');
      setIsCreateDialogOpen(false);
      resetForm();
      loadData();
    } catch (error) {
      console.error('Error creating role:', error);
      toast.error(error.message || 'Error creating role');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditRole = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    try {
      setSubmitting(true);
      await updateRole(selectedRole.id, formData);
      toast.success('Role updated successfully');
      setIsEditDialogOpen(false);
      setSelectedRole(null);
      resetForm();
      loadData();
    } catch (error) {
      console.error('Error updating role:', error);
      toast.error(error.message || 'Error updating role');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCloneRole = async (e) => {
    e.preventDefault();
    
    if (!validateCloneForm()) return;
    
    try {
      setSubmitting(true);
      await cloneRole(selectedRole.id, cloneFormData);
      toast.success('Role cloned successfully');
      setIsCloneDialogOpen(false);
      setSelectedRole(null);
      resetCloneForm();
      loadData();
    } catch (error) {
      console.error('Error cloning role:', error);
      toast.error(error.message || 'Error cloning role');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteRole = async (roleId, roleName) => {
    if (!window.confirm(`Are you sure you want to delete role "${roleName}"? This action cannot be undone.`)) {
      return;
    }
    
    try {
      await deleteRole(roleId);
      toast.success('Role deleted successfully');
      loadData();
    } catch (error) {
      console.error('Error deleting role:', error);
      toast.error(error.message || 'Error deleting role');
    }
  };

  const handleAssignRole = async () => {
    if (!selectedUser || selectedUser === 'none' || !selectedRoleForAssignment || selectedRoleForAssignment === 'none') {
      toast.error('Please select both a user and a role');
      return;
    }

    try {
      setSubmitting(true);
      await assignRoleToUser(selectedUser, selectedRoleForAssignment);
      toast.success('Role assigned successfully');
      
      // Clear selection
      setSelectedUser('none');
      setSelectedRoleForAssignment('none');
      
      // Refresh data
      loadData();
    } catch (error) {
      console.error('Error assigning role:', error);
      toast.error(error.message || 'Error assigning role');
    } finally {
      setSubmitting(false);
    }
  };

  const openEditDialog = (role) => {
    setSelectedRole(role);
    setFormData({
      name: role.name || '',
      description: role.description || '',
      is_active: role.is_active !== false
    });
    setFormErrors({});
    setIsEditDialogOpen(true);
  };

  const openCloneDialog = (role) => {
    setSelectedRole(role);
    setCloneFormData({
      new_name: `${role.name} Copy`,
      new_description: role.description || '',
      copy_permissions: true
    });
    setFormErrors({});
    setIsCloneDialogOpen(true);
  };

  const filteredRoles = Array.isArray(roles) ? roles.filter(role => {
    if (!role) return false;
    
    const searchFields = [
      role.name || '',
      role.description || ''
    ].join(' ').toLowerCase();
    
    return !searchTerm || searchFields.includes(searchTerm.toLowerCase());
  }) : [];

  const formatDate = (dateString) => {
    if (!dateString) return 'Unknown';
    try {
      return new Date(dateString).toLocaleDateString();
    } catch (error) {
      return 'Invalid date';
    }
  };

  const getUserDisplayName = (user) => {
    if (!user) return 'Unknown User';
    if (user.full_name) return user.full_name;
    if (user.first_name && user.last_name) {
      return `${user.first_name} ${user.last_name}`;
    }
    return user.username || 'Unknown User';
  };

  const getUserRole = (user) => {
    return user?.role_info?.name || 'No role assigned';
  };

  const renderTable = () => (
    <div className="hidden lg:block overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b">
            <th className="text-left p-4 font-medium">Role Name</th>
            <th className="text-left p-4 font-medium">Description</th>
            <th className="text-left p-4 font-medium">Permissions</th>
            <th className="text-left p-4 font-medium">Users</th>
            <th className="text-left p-4 font-medium">Status</th>
            <th className="text-left p-4 font-medium">Created</th>
            <th className="text-right p-4 font-medium">Actions</th>
          </tr>
        </thead>
        <tbody>
          {filteredRoles.length === 0 ? (
            <tr>
              <td colSpan={7} className="text-center py-8 text-muted-foreground">
                <Key className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>{searchTerm ? 'No roles found matching your search.' : 'No roles created yet.'}</p>
              </td>
            </tr>
          ) : (
            filteredRoles.map(role => (
              <tr key={role.id} className="border-b hover:bg-gray-50">
                <td className="p-4 font-medium">{role.name}</td>
                <td className="p-4 max-w-xs">
                  <div className="truncate" title={role.description}>
                    {role.description || <span className="text-gray-500">No description</span>}
                  </div>
                </td>
                <td className="p-4">
                  <Badge variant="outline">
                    {Array.isArray(role.permissions) ? role.permissions.length : 0} permissions
                  </Badge>
                </td>
                <td className="p-4">
                  <Badge variant="secondary">
                    {role.users_count || 0} users
                  </Badge>
                </td>
                <td className="p-4">
                  <Badge variant={role.is_active ? "default" : "secondary"}>
                    {role.is_active ? "Active" : "Inactive"}
                  </Badge>
                </td>
                <td className="p-4 text-sm text-muted-foreground">
                  {formatDate(role.created_at)}
                </td>
                <td className="p-4 text-right">
                  <div className="flex justify-end gap-1">
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      onClick={() => openEditDialog(role)}
                      title="Edit role"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      onClick={() => openCloneDialog(role)}
                      title="Clone role"
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      onClick={() => handleDeleteRole(role.id, role.name)}
                      className="text-red-500 hover:text-red-700"
                      title="Delete role"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );

  const renderCardView = () => (
    <div className="lg:hidden space-y-4 p-4">
      {filteredRoles.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <Key className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p>{searchTerm ? 'No roles found matching your search.' : 'No roles created yet.'}</p>
        </div>
      ) : (
        filteredRoles.map(role => (
          <Card key={role.id} className="w-full border-l-4 border-l-primary">
            <CardContent className="p-4">
              <div className="flex justify-between items-start mb-3">
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-lg truncate">{role.name}</h3>
                  <p className="text-sm text-gray-500 mt-1 break-words">
                    {role.description || "No description"}
                  </p>
                </div>
              </div>
              
              <div className="flex flex-wrap gap-2 mb-4">
                <Badge variant="outline" className="text-xs">
                  {Array.isArray(role.permissions) ? role.permissions.length : 0} permissions
                </Badge>
                <Badge variant="secondary" className="text-xs">
                  {role.users_count || 0} users
                </Badge>
                <Badge variant={role.is_active ? "default" : "secondary"} className="text-xs">
                  {role.is_active ? "Active" : "Inactive"}
                </Badge>
              </div>

              <div className="text-xs text-muted-foreground mb-4">
                <div>Created: {formatDate(role.created_at)}</div>
                {role.created_by_name && (
                  <div>By: {role.created_by_name}</div>
                )}
              </div>

              <div className="flex flex-wrap gap-2">
                <Button variant="outline" size="sm" onClick={() => openEditDialog(role)} className="flex-1 sm:flex-none">
                  <Edit className="h-4 w-4 mr-1" />
                  Edit
                </Button>
                <Button variant="outline" size="sm" onClick={() => openCloneDialog(role)} className="flex-1 sm:flex-none">
                  <Copy className="h-4 w-4 mr-1" />
                  Clone
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => handleDeleteRole(role.id, role.name)} 
                  className="flex-1 sm:flex-none text-red-500 hover:text-red-700"
                >
                  <Trash2 className="h-4 w-4 mr-1" />
                  Delete
                </Button>
              </div>
            </CardContent>
          </Card>
        ))
      )}
    </div>
  );

  const renderRolesTab = () => (
    <>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-sm text-muted-foreground">Total Roles</p>
              <p className="text-xl sm:text-2xl font-bold">{roles.length}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-sm text-muted-foreground">Active</p>
              <p className="text-xl sm:text-2xl font-bold text-green-600">
                {Array.isArray(roles) ? roles.filter(r => r?.is_active).length : 0}
              </p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-sm text-muted-foreground">Inactive</p>
              <p className="text-xl sm:text-2xl font-bold text-red-600">
                {Array.isArray(roles) ? roles.filter(r => !r?.is_active).length : 0}
              </p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-sm text-muted-foreground">Filtered</p>
              <p className="text-xl sm:text-2xl font-bold">{filteredRoles.length}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="w-full">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg">Roles ({filteredRoles.length})</CardTitle>
          <div className="w-full">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
              <Input
                placeholder="Search roles by name or description..."
                className="pl-10 w-full"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {renderTable()}
          {renderCardView()}
        </CardContent>
      </Card>
    </>
  );

  const renderAssignmentTab = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Quick Role Assignment</CardTitle>
          <CardDescription>
            Quickly assign roles to users
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Select User</Label>
              <Select value={selectedUser} onValueChange={setSelectedUser}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose a user" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none" disabled>Choose a user</SelectItem>
                  {users.filter(user => user.is_active).map(user => (
                    <SelectItem key={user.id} value={user.id.toString()}>
                      {getUserDisplayName(user)} - {user.email}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Select Role</Label>
              <Select value={selectedRoleForAssignment} onValueChange={setSelectedRoleForAssignment}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose a role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none" disabled>Choose a role</SelectItem>
                  {roles.map(role => (
                    <SelectItem key={role.id} value={role.id.toString()}>
                      {role.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <Button 
            onClick={handleAssignRole}
            disabled={!selectedUser || selectedUser === 'none' || !selectedRoleForAssignment || selectedRoleForAssignment === 'none' || submitting}
            className="w-full md:w-auto"
          >
            {submitting ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Assigning...
              </>
            ) : (
              'Assign Role'
            )}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Users with Roles ({users.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Current Role</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Change Role</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                      <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>No users available.</p>
                    </TableCell>
                  </TableRow>
                ) : (
                  users.map(user => (
                    <TableRow key={user.id}>
                      <TableCell>
                        <div className="flex items-center space-x-3">
                          <div className="flex-shrink-0 h-10 w-10 bg-primary/10 rounded-full flex items-center justify-center">
                            <Users className="h-5 w-5 text-primary" />
                          </div>
                          <div>
                            <div className="font-medium">{getUserDisplayName(user)}</div>
                            <div className="text-sm text-muted-foreground">@{user.username}</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>
                        <Badge variant="secondary">
                          <Shield className="h-3 w-3 mr-1" />
                          {getUserRole(user)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={user.is_active ? "default" : "secondary"}>
                          {user.is_active ? "Active" : "Inactive"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Select 
                          value={user.role_info?.id?.toString() || 'none'} 
                          onValueChange={(roleId) => {
                            if (roleId === 'none') {
                              assignRoleToUser(user.id, null)
                                .then(() => {
                                  toast.success('Role removed successfully');
                                  loadData();
                                })
                                .catch(error => {
                                  toast.error(error.message || 'Error removing role');
                                });
                            } else {
                              assignRoleToUser(user.id, roleId)
                                .then(() => {
                                  toast.success('Role assigned successfully');
                                  loadData();
                                })
                                .catch(error => {
                                  toast.error(error.message || 'Error assigning role');
                                });
                            }
                          }}
                          disabled={submitting}
                        >
                          <SelectTrigger className="w-32">
                            <SelectValue placeholder="Change role" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="none">No role</SelectItem>
                            {roles.map(role => (
                              <SelectItem key={role.id} value={role.id.toString()}>
                                {role.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">Loading roles...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-full px-2 sm:px-4 lg:px-6 py-4 space-y-4 sm:space-y-6">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center space-x-2">
          <Key className="h-8 w-8 text-primary" />
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">Role Management</h2>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="w-full sm:w-auto">
              <Plus className="mr-2 h-4 w-4" />
              <span className="hidden xs:inline">Add Role</span>
              <span className="xs:hidden">Add</span>
            </Button>
          </DialogTrigger>
          <DialogContent className="w-[95vw] max-w-md mx-auto">
            <DialogHeader>
              <DialogTitle>Create New Role</DialogTitle>
              <DialogDescription>
                Define a new role with specific permissions and access levels.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleCreateRole} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Role Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className={formErrors.name ? 'border-red-500' : ''}
                  placeholder="Enter role name"
                />
                {formErrors.name && (
                  <p className="text-sm text-red-500 flex items-center">
                    <AlertCircle className="h-3 w-3 mr-1" />
                    {formErrors.name}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  rows={3}
                  className="resize-none"
                  placeholder="Enter role description"
                />
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="is_active"
                  checked={formData.is_active}
                  onCheckedChange={(checked) => setFormData({...formData, is_active: checked})}
                />
                <Label htmlFor="is_active">Active Role</Label>
              </div>
              <DialogFooter className="flex-col sm:flex-row gap-2">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => {
                    setIsCreateDialogOpen(false);
                    resetForm();
                  }}
                  disabled={submitting}
                  className="w-full sm:w-auto"
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={submitting} className="w-full sm:w-auto">
                  {submitting ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    'Create Role'
                  )}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="roles">
            <Key className="h-4 w-4 mr-2" />
            Roles
          </TabsTrigger>
          <TabsTrigger value="assignments">
            <Users className="h-4 w-4 mr-2" />
            User Assignments
          </TabsTrigger>
        </TabsList>

        <TabsContent value="roles">
          {renderRolesTab()}
        </TabsContent>

        <TabsContent value="assignments">
          {renderAssignmentTab()}
        </TabsContent>
      </Tabs>

      {/* Edit Role Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="w-[95vw] max-w-md mx-auto">
          <DialogHeader>
            <DialogTitle>Edit Role</DialogTitle>
            <DialogDescription>
              Update role information and settings.
            </DialogDescription>
          </DialogHeader>
          {selectedRole && (
            <form onSubmit={handleEditRole} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="edit-name">Role Name *</Label>
                <Input
                  id="edit-name"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className={formErrors.name ? 'border-red-500' : ''}
                />
                {formErrors.name && (
                  <p className="text-sm text-red-500 flex items-center">
                    <AlertCircle className="h-3 w-3 mr-1" />
                    {formErrors.name}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-description">Description</Label>
                <Textarea
                  id="edit-description"
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  rows={3}
                  className="resize-none"
                />
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="edit-is_active"
                  checked={formData.is_active}
                  onCheckedChange={(checked) => setFormData({...formData, is_active: checked})}
                />
                <Label htmlFor="edit-is_active">Active Role</Label>
              </div>
              <DialogFooter className="flex-col sm:flex-row gap-2">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => {
                    setIsEditDialogOpen(false);
                    setSelectedRole(null);
                    resetForm();
                  }}
                  disabled={submitting}
                  className="w-full sm:w-auto"
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={submitting} className="w-full sm:w-auto">
                  {submitting ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Updating...
                    </>
                  ) : (
                    'Update Role'
                  )}
                </Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>

      {/* Clone Role Dialog */}
      <Dialog open={isCloneDialogOpen} onOpenChange={setIsCloneDialogOpen}>
        <DialogContent className="w-[95vw] max-w-md mx-auto">
          <DialogHeader>
            <DialogTitle>Clone Role: {selectedRole?.name}</DialogTitle>
            <DialogDescription>
              Create a copy of this role with the same permissions.
            </DialogDescription>
          </DialogHeader>
          {selectedRole && (
            <form onSubmit={handleCloneRole} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="clone-name">New Role Name *</Label>
                <Input
                  id="clone-name"
                  value={cloneFormData.new_name}
                  onChange={(e) => setCloneFormData({...cloneFormData, new_name: e.target.value})}
                  className={formErrors.new_name ? 'border-red-500' : ''}
                />
                {formErrors.new_name && (
                  <p className="text-sm text-red-500 flex items-center">
                    <AlertCircle className="h-3 w-3 mr-1" />
                    {formErrors.new_name}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="clone-description">Description</Label>
                <Textarea
                  id="clone-description"
                  value={cloneFormData.new_description}
                  onChange={(e) => setCloneFormData({...cloneFormData, new_description: e.target.value})}
                  rows={3}
                  className="resize-none"
                />
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="copy_permissions"
                  checked={cloneFormData.copy_permissions}
                  onCheckedChange={(checked) => setCloneFormData({...cloneFormData, copy_permissions: checked})}
                />
                <Label htmlFor="copy_permissions">Copy Permissions</Label>
              </div>
              <DialogFooter className="flex-col sm:flex-row gap-2">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => {
                    setIsCloneDialogOpen(false);
                    setSelectedRole(null);
                    resetCloneForm();
                  }}
                  disabled={submitting}
                  className="w-full sm:w-auto"
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={submitting} className="w-full sm:w-auto">
                  {submitting ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Cloning...
                    </>
                  ) : (
                    'Clone Role'
                  )}
                </Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}