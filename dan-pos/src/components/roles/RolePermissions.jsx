// components/roles/RolePermissionsManager.jsx
import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import {
  Save,
  Shield,
  ChevronDown,
  Filter,
  Search,
  RefreshCw,
  Edit,
  Trash2,
  Key,
  Loader2,
} from "lucide-react";

// UI Components
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// API functions from appropriate files
import {
  getRoles,
  getRolePermissions,
  updateRolePermissions,
} from "@/lib/api/roles";
import {
  getPermissions,
  getPermissionsWithCodenames,
  getPermissionCategories,
  updatePermission,
  deletePermission,
} from "@/lib/api/permissions";
import CreatePermissionDialog from "./CreatePermissionDialog ";
import EditPermissionDialog from "./EditPermissionDialog";

// Components
// import CreatePermissionDialog from './CreatePermissionDialog';

export default function RolePermissionsManager() {
  // State management
  const [activeTab, setActiveTab] = useState("role-permissions");
  const [roles, setRoles] = useState([]);
  const [permissions, setPermissions] = useState([]);
  const [permissionMap, setPermissionMap] = useState({});
  const [categories, setCategories] = useState([]);
  const [selectedRole, setSelectedRole] = useState(null);
  const [rolePermissions, setRolePermissions] = useState(new Set());

  // Loading and UI states
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [collapsedCategories, setCollapsedCategories] = useState(new Set());
  const [permissionsSearchTerm, setPermissionsSearchTerm] = useState("");

  // Load initial data
  useEffect(() => {
    loadData();
  }, []);

  // Load role permissions when role or tab changes
  useEffect(() => {
    if (selectedRole && activeTab === "role-permissions") {
      loadRolePermissions();
    }
  }, [selectedRole, activeTab]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [rolesResponse, permissionsData, categoriesData] =
        await Promise.all([
          getRoles(),
          getPermissionsWithCodenames(),
          getPermissionCategories(),
        ]);

      const rolesData = Array.isArray(rolesResponse)
        ? rolesResponse
        : rolesResponse?.results || rolesResponse?.data || [];

      setRoles(rolesData);
      setPermissions(permissionsData.permissions || []);
      setPermissionMap(permissionsData.permissionMap || {});
      setCategories(categoriesData?.categories || categoriesData || []);

      // Auto-select first role if none selected and we're on role-permissions tab
      if (
        rolesData.length > 0 &&
        !selectedRole &&
        activeTab === "role-permissions"
      ) {
        setSelectedRole(rolesData[0]);
      }
    } catch (error) {
      console.error("Error loading data:", error);
      toast.error(`Error loading data: ${error.message}`);
      // Reset states on error
      setRoles([]);
      setPermissions([]);
      setPermissionMap({});
      setCategories([]);
    } finally {
      setLoading(false);
    }
  };

  const loadRolePermissions = async () => {
    if (!selectedRole) return;

    try {
      const permissionsData = await getRolePermissions(selectedRole.id);
      const permissionIds = new Set(
        Array.isArray(permissionsData) ? permissionsData.map((p) => p.id) : []
      );
      setRolePermissions(permissionIds);
    } catch (error) {
      console.error("Error loading role permissions:", error);
      toast.error(`Error loading role permissions: ${error.message}`);
      setRolePermissions(new Set());
    }
  };

  // Permission management functions
  const handlePermissionToggle = (permissionId, checked) => {
    const newPermissions = new Set(rolePermissions);
    if (checked) {
      newPermissions.add(permissionId);
    } else {
      newPermissions.delete(permissionId);
    }
    setRolePermissions(newPermissions);
  };

  const handleCategoryToggle = (categoryName, checked) => {
    const newPermissions = new Set(rolePermissions);
    const categoryPerms = permissions.filter(
      (p) => p.category === categoryName
    );

    categoryPerms.forEach((permission) => {
      if (checked) {
        newPermissions.add(permission.id);
      } else {
        newPermissions.delete(permission.id);
      }
    });

    setRolePermissions(newPermissions);
  };

  const handleSavePermissions = async () => {
    if (!selectedRole) return;

    try {
      setSaving(true);
      const permissionIds = Array.from(rolePermissions);
      await updateRolePermissions(selectedRole.id, permissionIds);
      toast.success("Permissions updated successfully");
    } catch (error) {
      console.error("Error updating permissions:", error);
      toast.error(`Error updating permissions: ${error.message}`);
    } finally {
      setSaving(false);
    }
  };

  // Permission status management
  const handleToggleActive = async (permission, isActive) => {
    try {
      await updatePermission(permission.id, { is_active: isActive });
      toast.success(
        `Permission ${isActive ? "activated" : "deactivated"} successfully`
      );
      loadData();
    } catch (error) {
      console.error("Error updating permission:", error);
      toast.error(`Error updating permission: ${error.message}`);
    }
  };

  const handleDeletePermission = async (permissionId) => {
    if (!confirm("Are you sure you want to delete this permission?")) {
      return;
    }

    try {
      await deletePermission(permissionId);
      toast.success("Permission deleted successfully");
      loadData();
    } catch (error) {
      console.error("Error deleting permission:", error);
      toast.error(`Error deleting permission: ${error.message}`);
    }
  };

  // Utility functions
  const hasPermission = (permissionId) => rolePermissions.has(permissionId);

  const hasAllCategoryPermissions = (categoryName) => {
    const categoryPerms = permissions.filter(
      (p) => p.category === categoryName
    );
    return (
      categoryPerms.length > 0 &&
      categoryPerms.every((p) => rolePermissions.has(p.id))
    );
  };

  const hasSomeCategoryPermissions = (categoryName) => {
    const categoryPerms = permissions.filter(
      (p) => p.category === categoryName
    );
    return categoryPerms.some((p) => rolePermissions.has(p.id));
  };

  const toggleCategory = (categoryName) => {
    const newCollapsed = new Set(collapsedCategories);
    if (newCollapsed.has(categoryName)) {
      newCollapsed.delete(categoryName);
    } else {
      newCollapsed.add(categoryName);
    }
    setCollapsedCategories(newCollapsed);
  };

  // Filter functions
  const filteredCategories = categories.filter((category) => {
    if (!category || typeof category !== "object") return false;
    const categoryName = category.category || category.name;
    if (selectedCategory !== "all" && categoryName !== selectedCategory) {
      return false;
    }
    if (searchTerm) {
      const categoryPermissions = permissions.filter(
        (p) => p && p.category === categoryName
      );
      return categoryPermissions.some(
        (p) =>
          (p.name && p.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
          (p.codename &&
            p.codename.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }
    return true;
  });

  const filteredPermissions = (categoryName) => {
    return permissions.filter((p) => {
      if (!p || p.category !== categoryName) return false;
      if (searchTerm) {
        return (
          (p.name && p.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
          (p.codename &&
            p.codename.toLowerCase().includes(searchTerm.toLowerCase()))
        );
      }
      return true;
    });
  };

  const filteredAllPermissions = permissions.filter(
    (permission) =>
      permission.name
        .toLowerCase()
        .includes(permissionsSearchTerm.toLowerCase()) ||
      permission.codename
        .toLowerCase()
        .includes(permissionsSearchTerm.toLowerCase()) ||
      (permission.category &&
        permission.category
          .toLowerCase()
          .includes(permissionsSearchTerm.toLowerCase()))
  );

  // Loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">Loading permissions...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 p-2 sm:p-4 lg:p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">
          Permissions Management
        </h2>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={loadData}
            size="sm"
            disabled={loading}
          >
            <RefreshCw
              className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`}
            />
            Refresh
          </Button>
          {activeTab === "role-permissions" && (
            <Button
              onClick={handleSavePermissions}
              disabled={saving || !selectedRole}
              size="sm"
            >
              {saving ? (
                <div className="flex items-center">
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Saving...
                </div>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Save Permissions
                </>
              )}
            </Button>
          )}
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="role-permissions">
            <Shield className="h-4 w-4 mr-2" />
            Role Permissions
          </TabsTrigger>
          <TabsTrigger value="permissions-manager">
            <Key className="h-4 w-4 mr-2" />
            Permissions Manager
          </TabsTrigger>
        </TabsList>

        <TabsContent value="role-permissions">
          {!Array.isArray(roles) || roles.length === 0 ? (
            <div className="flex items-center justify-center min-h-[400px]">
              <div className="text-center">
                <Shield className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-medium mb-2">No Roles Available</h3>
                <p className="text-muted-foreground mb-4">
                  Create some roles first to manage permissions.
                </p>
                <Button onClick={loadData}>Retry Loading</Button>
              </div>
            </div>
          ) : (
            <>
              {/* Role Selection */}
              <Card>
                <CardHeader className="pb-4">
                  <CardTitle className="text-lg sm:text-xl">
                    Select Role
                  </CardTitle>
                  <CardDescription>
                    Choose a role to manage its permissions
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col sm:flex-row sm:items-center space-y-4 sm:space-y-0 sm:space-x-4">
                    <div className="w-full sm:w-1/2 lg:w-1/3">
                      <Select
                        value={selectedRole?.id?.toString()}
                        onValueChange={(value) => {
                          const role = roles.find(
                            (r) => r.id.toString() === value
                          );
                          setSelectedRole(role);
                        }}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select a role" />
                        </SelectTrigger>
                        <SelectContent>
                          {roles.map((role) => (
                            <SelectItem
                              key={role.id}
                              value={role.id.toString()}
                            >
                              {role.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    {selectedRole && (
                      <div className="flex items-center space-x-2 p-2 bg-muted/50 rounded-md">
                        <Shield className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">
                          {rolePermissions.size} permission
                          {rolePermissions.size !== 1 ? "s" : ""} assigned
                        </span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {selectedRole && (
                <>
                  {/* Filters */}
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex flex-col sm:flex-row gap-4">
                        <div className="flex-1">
                          <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                              placeholder="Search permissions..."
                              value={searchTerm}
                              onChange={(e) => setSearchTerm(e.target.value)}
                              className="pl-10"
                            />
                          </div>
                        </div>
                        <div className="w-full sm:w-48">
                          <Select
                            value={selectedCategory}
                            onValueChange={setSelectedCategory}
                          >
                            <SelectTrigger>
                              <Filter className="mr-2 h-4 w-4" />
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="all">
                                All Categories
                              </SelectItem>
                              {categories.map((category) => (
                                <SelectItem
                                  key={category.category || category.name}
                                  value={category.category || category.name}
                                >
                                  {category.category || category.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Permissions */}
                  <Card>
                    <CardHeader className="pb-4">
                      <CardTitle className="text-lg sm:text-xl">
                        Permissions for {selectedRole.name}
                      </CardTitle>
                      <CardDescription>
                        Manage what actions users with this role can perform
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-6">
                        {filteredCategories.length > 0 ? (
                          filteredCategories.map((category) => {
                            const categoryName =
                              category.category || category.name;
                            const categoryPermissions =
                              filteredPermissions(categoryName);
                            const isCollapsed =
                              collapsedCategories.has(categoryName);
                            const allSelected =
                              hasAllCategoryPermissions(categoryName);
                            const someSelected =
                              hasSomeCategoryPermissions(categoryName);

                            if (categoryPermissions.length === 0) return null;

                            return (
                              <div key={categoryName} className="space-y-4">
                                <div
                                  className="flex items-center justify-between border-b pb-2 cursor-pointer hover:bg-muted/30 -mx-2 px-2 py-2 rounded"
                                  onClick={() => toggleCategory(categoryName)}
                                >
                                  <div className="flex items-center">
                                    <ChevronDown
                                      className={`h-4 w-4 mr-2 transition-transform ${
                                        isCollapsed ? "-rotate-90" : ""
                                      }`}
                                    />
                                    <Checkbox
                                      checked={allSelected}
                                      indeterminate={
                                        someSelected && !allSelected
                                      }
                                      onCheckedChange={(checked) =>
                                        handleCategoryToggle(
                                          categoryName,
                                          checked
                                        )
                                      }
                                      className="mr-3"
                                      onClick={(e) => e.stopPropagation()}
                                    />
                                    <h3 className="text-base sm:text-lg font-medium">
                                      {categoryName}
                                    </h3>
                                  </div>
                                  <p className="text-sm text-muted-foreground">
                                    {categoryPermissions.length} permission
                                    {categoryPermissions.length !== 1
                                      ? "s"
                                      : ""}
                                  </p>
                                </div>

                                {!isCollapsed && (
                                  <div className="overflow-x-auto">
                                    {/* Mobile View */}
                                    <div className="block sm:hidden space-y-4">
                                      {categoryPermissions.map((permission) => (
                                        <div
                                          key={permission.id}
                                          className="border rounded-lg p-4 space-y-3"
                                        >
                                          <div className="flex items-start justify-between">
                                            <div className="flex-1 min-w-0">
                                              <div className="flex items-center space-x-2 mb-2">
                                                <Checkbox
                                                  checked={hasPermission(
                                                    permission.id
                                                  )}
                                                  onCheckedChange={(checked) =>
                                                    handlePermissionToggle(
                                                      permission.id,
                                                      checked
                                                    )
                                                  }
                                                />
                                                <span className="font-medium text-sm truncate">
                                                  {permission.name}
                                                </span>
                                              </div>
                                              <Badge
                                                variant="outline"
                                                className="text-xs mb-2"
                                              >
                                                {permission.codename}
                                              </Badge>
                                              {permission.description && (
                                                <p className="text-sm text-muted-foreground">
                                                  {permission.description}
                                                </p>
                                              )}
                                            </div>
                                          </div>
                                        </div>
                                      ))}
                                    </div>

                                    {/* Desktop View */}
                                    <Table className="hidden sm:table">
                                      <TableHeader>
                                        <TableRow>
                                          <TableHead className="w-16">
                                            Enabled
                                          </TableHead>
                                          <TableHead className="min-w-[200px]">
                                            Permission
                                          </TableHead>
                                          <TableHead className="min-w-[150px]">
                                            Code
                                          </TableHead>
                                          <TableHead>Description</TableHead>
                                        </TableRow>
                                      </TableHeader>
                                      <TableBody>
                                        {categoryPermissions.map(
                                          (permission) => (
                                            <TableRow key={permission.id}>
                                              <TableCell>
                                                <Checkbox
                                                  checked={hasPermission(
                                                    permission.id
                                                  )}
                                                  onCheckedChange={(checked) =>
                                                    handlePermissionToggle(
                                                      permission.id,
                                                      checked
                                                    )
                                                  }
                                                />
                                              </TableCell>
                                              <TableCell className="font-medium">
                                                {permission.name}
                                              </TableCell>
                                              <TableCell>
                                                <Badge variant="outline">
                                                  {permission.codename}
                                                </Badge>
                                              </TableCell>
                                              <TableCell>
                                                {permission.description || (
                                                  <span className="text-muted-foreground">
                                                    No description
                                                  </span>
                                                )}
                                              </TableCell>
                                            </TableRow>
                                          )
                                        )}
                                      </TableBody>
                                    </Table>
                                  </div>
                                )}
                              </div>
                            );
                          })
                        ) : (
                          <div className="text-center py-8">
                            <p className="text-muted-foreground">
                              {permissions.length === 0
                                ? "No permissions available."
                                : "No permissions found matching your criteria."}
                            </p>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </>
              )}
            </>
          )}
        </TabsContent>

        <TabsContent value="permissions-manager">
          <Card>
            <CardHeader>
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
                <div>
                  <CardTitle>All Permissions</CardTitle>
                  <CardDescription>
                    Manage system permissions and their activation status
                  </CardDescription>
                </div>
                <CreatePermissionDialog onPermissionCreated={loadData} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="mb-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search permissions..."
                    value={permissionsSearchTerm}
                    onChange={(e) => setPermissionsSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Active</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Codename</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredAllPermissions.map((permission) => (
                      <TableRow key={permission.id}>
                        <TableCell>
                          <Switch
                            checked={permission.is_active}
                            onCheckedChange={(checked) =>
                              handleToggleActive(permission, checked)
                            }
                          />
                        </TableCell>
                        <TableCell className="font-medium">
                          {permission.name}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{permission.codename}</Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary">
                            {permission.category || "General"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {permission.description || (
                            <span className="text-muted-foreground">
                              No description
                            </span>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-1">
                            <EditPermissionDialog
                              permission={permission}
                              onPermissionUpdated={loadData}
                            />
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() =>
                                handleDeletePermission(permission.id)
                              }
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {filteredAllPermissions.length === 0 && (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">
                    {permissions.length === 0
                      ? "No permissions available."
                      : "No permissions found matching your search."}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
