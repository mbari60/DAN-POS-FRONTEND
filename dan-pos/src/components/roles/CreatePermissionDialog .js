// components/roles/CreatePermissionDialog.jsx
import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { Plus, Loader2 } from 'lucide-react';
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
import { createPermission } from '@/lib/api/permissions';

export default function CreatePermissionDialog({ onPermissionCreated }) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    codename: '',
    category: '',
    description: '',
    is_active: true
  });

  // Auto-generate codename from name
  const generateCodename = (name) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, '')
      .replace(/\s+/g, '_')
      .trim();
  };

  const handleNameChange = (e) => {
    const name = e.target.value;
    setFormData(prev => ({
      ...prev,
      name,
      // Auto-generate codename if it's empty or was auto-generated
      codename: prev.codename === generateCodename(prev.name) || !prev.codename 
        ? generateCodename(name) 
        : prev.codename
    }));
  };

  const handleInputChange = (field) => (e) => {
    const value = e.target.value;
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const resetForm = () => {
    setFormData({
      name: '',
      codename: '',
      category: '',
      description: '',
      is_active: true
    });
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

      const createdPermission = await createPermission(permissionData);
      
      toast.success('Permission created successfully');
      resetForm();
      setOpen(false);
      
      if (onPermissionCreated) {
        onPermissionCreated(createdPermission);
      }
    } catch (error) {
      console.error('Error creating permission:', error);
      toast.error(error.message || 'Failed to create permission');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenChange = (newOpen) => {
    if (!newOpen && !loading) {
      resetForm();
    }
    setOpen(newOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Create Permission
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Create New Permission</DialogTitle>
          <DialogDescription>
            Add a new permission to the system. Fill in the details below.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Permission Name *</Label>
            <Input
              id="name"
              placeholder="e.g., Can view dashboard"
              value={formData.name}
              onChange={handleNameChange}
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
            <p className="text-xs text-muted-foreground">
              Category to group this permission with others
            </p>
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
                  Creating...
                </>
              ) : (
                <>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Permission
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}