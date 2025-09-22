// components/roles/EditPermissionDialog.jsx
import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { Save, Loader2 } from 'lucide-react';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription,
  DialogHeader, 
  DialogTitle, 
  DialogTrigger,
  DialogFooter 
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { updatePermission } from '@/lib/api/permissions';

export default function EditPermissionDialog({ permission, onPermissionUpdated }) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    codename: '',
    category: '',
    description: '',
    is_active: true
  });

  useEffect(() => {
    if (permission) {
      setFormData({
        name: permission.name || '',
        codename: permission.codename || '',
        category: permission.category || '',
        description: permission.description || '',
        is_active: permission.is_active !== undefined ? permission.is_active : true
      });
    }
  }, [permission]);

  const handleInputChange = (field) => (e) => {
    const value = e.target.value;
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSwitchChange = (checked) => {
    setFormData(prev => ({
      ...prev,
      is_active: checked
    }));
  };

  const validateForm = () => {
    if (!formData.name.trim()) {
      toast.error('Permission name is required');
      return false;
    }
    if (!formData.codename.trim()) {
      toast.error('Permission codename is required');
      return false;
    }
    if (!formData.codename.startsWith('can_')) {
      toast.error('Permission codename must start with "can_"');
      return false;
    }
    if (!formData.category.trim()) {
      toast.error('Permission category is required');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    try {
      setLoading(true);
      
      const permissionData = {
        name: formData.name.trim(),
        codename: formData.codename.trim(),
        category: formData.category.trim(),
        description: formData.description.trim() || '',
        is_active: formData.is_active
      };

      const updatedPermission = await updatePermission(permission.id, permissionData);
      
      toast.success('Permission updated successfully');
      setOpen(false);
      
      if (onPermissionUpdated) {
        onPermissionUpdated(updatedPermission);
      }
    } catch (error) {
      console.error('Error updating permission:', error);
      toast.error(error.message || 'Failed to update permission');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenChange = (newOpen) => {
    setOpen(newOpen);
  };

  if (!permission) return null;

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm">
          <Save className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Edit Permission</DialogTitle>
          <DialogDescription>
            Update the permission details below.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Permission Name *</Label>
            <Input
              id="name"
              placeholder="e.g., Can view dashboard"
              value={formData.name}
              onChange={handleInputChange('name')}
              disabled={loading}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="codename">Codename *</Label>
            <Input
              id="codename"
              placeholder="e.g., can_view_dashboard"
              value={formData.codename}
              onChange={handleInputChange('codename')}
              disabled={loading}
              required
            />
            <p className="text-xs text-muted-foreground">
              Unique identifier for this permission (must start with "can_")
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="category">Category *</Label>
            <Input
              id="category"
              placeholder="e.g., Dashboard, Users, Sales"
              value={formData.category}
              onChange={handleInputChange('category')}
              disabled={loading}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Describe what this permission allows..."
              value={formData.description}
              onChange={handleInputChange('description')}
              disabled={loading}
              rows={3}
            />
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="is_active"
              checked={formData.is_active}
              onCheckedChange={handleSwitchChange}
              disabled={loading}
            />
            <Label htmlFor="is_active">Active</Label>
          </div>

          <DialogFooter>
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => setOpen(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Updating...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Update Permission
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
