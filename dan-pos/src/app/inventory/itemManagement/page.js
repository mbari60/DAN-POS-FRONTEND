'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Switch } from "@/components/ui/switch";
import { 
  Package, 
  Plus, 
  Edit, 
  Trash2, 
  Search,
  RefreshCw,
  Tag,
  MoreHorizontal,
  AlertCircle,
  CheckCircle,
  Eye,
  Filter,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  TrendingDown,
  DollarSign
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from 'react-toastify';
import { 
  getItems, 
  createItem, 
  updateItem, 
  deleteItem,
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory
} from '@/lib/api/inventory';

export default function ItemManagement() {
  // State management
  const [activeTab, setActiveTab] = useState('items');
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  
  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(8);
  
  // Dialog states
  const [itemDialog, setItemDialog] = useState({ open: false, mode: 'create', item: null });
  const [categoryDialog, setCategoryDialog] = useState({ open: false, mode: 'create', category: null });
  const [deleteDialog, setDeleteDialog] = useState({ open: false, type: '', item: null });
  const [viewDialog, setViewDialog] = useState({ open: false, item: null });

  // Form states
  const [itemForm, setItemForm] = useState({
    name: '',
    description: '',
    category: '',
    sku: '',
    barcode: '',
    standard_cost: '',
    reorder_level: '',
    is_active: true
  });
  
  const [categoryForm, setCategoryForm] = useState({
    name: '',
    description: '',
    parent: null
  });

  // Load data
  const loadData = async () => {
    try {
      setLoading(true);
      const [itemsData, categoriesData] = await Promise.all([
        getItems(),
        getCategories()
      ]);
      
      setItems(itemsData.results || []);
      setCategories(categoriesData.results || []);
    } catch (error) {
      toast.error(error.message || 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Item CRUD operations
  const handleItemSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const formData = {
        ...itemForm,
        standard_cost: parseFloat(itemForm.standard_cost) || 0,
        reorder_level: parseInt(itemForm.reorder_level) || 0,
        category: parseInt(itemForm.category)
      };

      if (itemDialog.mode === 'create') {
        await createItem(formData);
        toast.success('Item created successfully');
      } else {
        await updateItem(itemDialog.item.id, formData);
        toast.success('Item updated successfully');
      }
      
      setItemDialog({ open: false, mode: 'create', item: null });
      resetItemForm();
      loadData();
    } catch (error) {
      toast.error(error.message || 'Failed to save item');
    }
  };

  const handleItemDelete = async () => {
    try {
      await deleteItem(deleteDialog.item.id);
      toast.success('Item deleted successfully');
      setDeleteDialog({ open: false, type: '', item: null });
      loadData();
    } catch (error) {
      toast.error(error.message || 'Failed to delete item');
    }
  };

  // Category CRUD operations
  const handleCategorySubmit = async (e) => {
    e.preventDefault();
    
    try {
      const formData = {
        ...categoryForm,
        parent: categoryForm.parent || null
      };

      if (categoryDialog.mode === 'create') {
        await createCategory(formData);
        toast.success('Category created successfully');
      } else {
        await updateCategory(categoryDialog.category.id, formData);
        toast.success('Category updated successfully');
      }
      
      setCategoryDialog({ open: false, mode: 'create', category: null });
      resetCategoryForm();
      loadData();
    } catch (error) {
      toast.error(error.message || 'Failed to save category');
    }
  };

  const handleCategoryDelete = async () => {
    try {
      await deleteCategory(deleteDialog.item.id);
      toast.success('Category deleted successfully');
      setDeleteDialog({ open: false, type: '', item: null });
      loadData();
    } catch (error) {
      toast.error(error.message || 'Failed to delete category');
    }
  };

  // Helper functions
  const resetItemForm = () => {
    setItemForm({
      name: '',
      description: '',
      category: '',
      sku: '',
      barcode: '',
      standard_cost: '',
      reorder_level: '',
      is_active: true
    });
  };

  const resetCategoryForm = () => {
    setCategoryForm({
      name: '',
      description: '',
      parent: null
    });
  };

  const openItemDialog = (mode, item = null) => {
    if (mode === 'edit' && item) {
      setItemForm({
        name: item.name,
        description: item.description,
        category: item.category.toString(),
        sku: item.sku,
        barcode: item.barcode || '',
        standard_cost: item.standard_cost,
        reorder_level: item.reorder_level.toString(),
        is_active: item.is_active
      });
    } else {
      resetItemForm();
    }
    setItemDialog({ open: true, mode, item });
  };

  const openCategoryDialog = (mode, category = null) => {
    if (mode === 'edit' && category) {
      setCategoryForm({
        name: category.name,
        description: category.description,
        parent: category.parent
      });
    } else {
      resetCategoryForm();
    }
    setCategoryDialog({ open: true, mode, category });
  };

  // Filter items
  const filteredItems = items.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.sku.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === 'all' || item.category.toString() === filterCategory;
    const matchesStatus = filterStatus === 'all' || 
                         (filterStatus === 'active' && item.is_active) ||
                         (filterStatus === 'inactive' && !item.is_active);
    return matchesSearch && matchesCategory && matchesStatus;
  });

  // Pagination functions
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredItems.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredItems.length / itemsPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const PaginationControls = () => {
    const totalItems = filteredItems.length;
    const showingFrom = indexOfFirstItem + 1;
    const showingTo = Math.min(indexOfLastItem, totalItems);

    if (totalItems === 0) return null;

    return (
      <div className="flex items-center justify-between px-4 py-3 border-t">
        <div className="text-sm text-muted-foreground">
          Showing {showingFrom}-{showingTo} of {totalItems} items
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => paginate(currentPage - 1)}
            disabled={currentPage === 1}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          
          {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
            let pageNumber;
            if (totalPages <= 5) {
              pageNumber = i + 1;
            } else if (currentPage <= 3) {
              pageNumber = i + 1;
            } else if (currentPage >= totalPages - 2) {
              pageNumber = totalPages - 4 + i;
            } else {
              pageNumber = currentPage - 2 + i;
            }

            return (
              <Button
                key={pageNumber}
                variant={currentPage === pageNumber ? "default" : "outline"}
                size="sm"
                onClick={() => paginate(pageNumber)}
                className="h-8 w-8 p-0"
              >
                {pageNumber}
              </Button>
            );
          })}
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => paginate(currentPage + 1)}
            disabled={currentPage === totalPages}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    );
  };

  // Reset pagination when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filterCategory, filterStatus]);

  // Stats calculations
  const totalItemsCount = items.length;
  const activeItemsCount = items.filter(item => item.is_active).length;
  const lowStockItemsCount = items.filter(item => item.total_stock <= item.reorder_level).length;

  if (loading) {
    return (
      <div className="w-full">
        <div className="flex items-center justify-between mb-4">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-10 w-32" />
        </div>
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} className="h-16 w-full" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="w-full space-y-4 p-4 lg:p-6">
      {/* Header with Stats */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Item Management</h1>
          <p className="text-sm text-muted-foreground">
            Manage your inventory items and categories
          </p>
        </div>
        <Button onClick={loadData} className="mt-2 sm:mt-0" size="sm">
          <RefreshCw className="mr-2 h-4 w-4" />
          Refresh
        </Button>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-900">Total Items</p>
                <p className="text-2xl font-bold text-blue-700">{totalItemsCount}</p>
              </div>
              <Package className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-900">Active Items</p>
                <p className="text-2xl font-bold text-green-700">{activeItemsCount}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-orange-900">Low Stock</p>
                <p className="text-2xl font-bold text-orange-700">{lowStockItemsCount}</p>
              </div>
              <AlertCircle className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2 lg:w-[300px]">
          <TabsTrigger value="items" className="flex items-center gap-2 text-xs">
            <Package className="h-3 w-3" />
            Items ({items.length})
          </TabsTrigger>
          <TabsTrigger value="categories" className="flex items-center gap-2 text-xs">
            <Tag className="h-3 w-3" />
            Categories ({categories.length})
          </TabsTrigger>
        </TabsList>

        {/* Items Tab */}
        <TabsContent value="items" className="space-y-3">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
                <div>
                  <CardTitle className="text-lg">Inventory Items</CardTitle>
                  <CardDescription className="text-sm">
                    Manage your product inventory
                  </CardDescription>
                </div>
                <Button 
                  onClick={() => openItemDialog('create')}
                  size="sm"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Add Item
                </Button>
              </div>
            </CardHeader>
            <CardContent className="pt-0 p-0">
              {/* Search and Filter */}
              <div className="flex flex-col sm:flex-row gap-2 p-4 pb-0">
                <div className="relative flex-1">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search items by name or SKU..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-8 h-9"
                  />
                </div>
                <Select value={filterCategory} onValueChange={setFilterCategory}>
                  <SelectTrigger className="w-full sm:w-[180px] h-9">
                    <Filter className="mr-2 h-3 w-3" />
                    <SelectValue placeholder="All Categories" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    {categories.map((category) => (
                      <SelectItem key={category.id} value={category.id.toString()}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={filterStatus} onValueChange={setFilterStatus}>
                  <SelectTrigger className="w-full sm:w-[140px] h-9">
                    <SelectValue placeholder="All Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="active">Active Only</SelectItem>
                    <SelectItem value="inactive">Inactive Only</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Items Table */}
              <div className="border rounded-md overflow-hidden">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-muted/50">
                        <TableHead className="font-semibold">Item</TableHead>
                        <TableHead className="font-semibold">SKU</TableHead>
                        <TableHead className="font-semibold hidden sm:table-cell">Category</TableHead>
                        <TableHead className="font-semibold">Stock</TableHead>
                        <TableHead className="font-semibold hidden md:table-cell">Price</TableHead>
                        <TableHead className="font-semibold">Status</TableHead>
                        <TableHead className="font-semibold w-12">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {currentItems.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={7} className="text-center py-6">
                            <div className="flex flex-col items-center gap-2">
                              <Package className="h-6 w-6 text-muted-foreground" />
                              <p className="text-sm text-muted-foreground">No items found</p>
                              <p className="text-xs text-muted-foreground">
                                Try adjusting your search or filters
                              </p>
                            </div>
                          </TableCell>
                        </TableRow>
                      ) : (
                        currentItems.map((item) => (
                          <TableRow key={item.id} className="hover:bg-muted/30">
                            <TableCell>
                              <div>
                                <div className="font-medium text-sm">{item.name}</div>
                                <div className="text-xs text-muted-foreground truncate max-w-[150px]">
                                  {item.description}
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <code className="bg-muted px-1.5 py-0.5 rounded text-xs">
                                {item.sku}
                              </code>
                            </TableCell>
                            <TableCell className="hidden sm:table-cell">
                              <Badge variant="secondary" className="text-xs">
                                {item.category_name}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-1">
                                <span className="font-medium text-sm">{item.total_stock}</span>
                                {item.total_stock <= item.reorder_level && (
                                  <AlertCircle className="h-3 w-3 text-destructive" />
                                )}
                                {item.total_stock > item.reorder_level && item.total_stock <= item.reorder_level + 5 && (
                                  <AlertCircle className="h-3 w-3 text-yellow-500" />
                                )}
                              </div>
                              <div className="text-xs text-muted-foreground">
                                Reorder: {item.reorder_level}
                              </div>
                            </TableCell>
                            <TableCell className="hidden md:table-cell">
                              <div className="flex items-center gap-1">
                                {/* <DollarSign className="h-3 w-3 text-green-600" /> */}
                                <span className="font-medium text-sm">
                                 Price. {item.current_price?.toLocaleString() || 'N/A'}
                                </span>
                              </div>
                              <div className="text-xs text-muted-foreground">
                                Unit_Cost: {parseFloat(item.standard_cost).toLocaleString()}
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge 
                                variant={item.is_active ? "default" : "secondary"} 
                                className="text-xs flex items-center gap-1"
                              >
                                {item.is_active ? (
                                  <CheckCircle className="h-3 w-3" />
                                ) : (
                                  <AlertCircle className="h-3 w-3" />
                                )}
                                {item.is_active ? "Active" : "Inactive"}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" className="h-7 w-7 p-0">
                                    <MoreHorizontal className="h-3 w-3" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuLabel className="text-xs">Actions</DropdownMenuLabel>
                                  <DropdownMenuItem onClick={() => setViewDialog({ open: true, item })}>
                                    <Eye className="mr-2 h-3 w-3" />
                                    View Details
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => openItemDialog('edit', item)}>
                                    <Edit className="mr-2 h-3 w-3" />
                                    Edit
                                  </DropdownMenuItem>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem 
                                    onClick={() => setDeleteDialog({ open: true, type: 'item', item })}
                                    className="text-destructive"
                                  >
                                    <Trash2 className="mr-2 h-3 w-3" />
                                    Delete
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
                <PaginationControls />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Categories Tab */}
        <TabsContent value="categories" className="space-y-3">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
                <div>
                  <CardTitle className="text-lg">Categories</CardTitle>
                  <CardDescription className="text-sm">
                    Organize your inventory with categories
                  </CardDescription>
                </div>
                <Button 
                  onClick={() => openCategoryDialog('create')}
                  size="sm"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Add Category
                </Button>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {categories.length === 0 ? (
                  <div className="col-span-full text-center py-6">
                    <Tag className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                    <p className="text-sm text-muted-foreground">No categories found</p>
                    <p className="text-xs text-muted-foreground">Create your first category to get started</p>
                  </div>
                ) : (
                  categories.map((category) => (
                    <Card key={category.id} className="hover:shadow-sm transition-shadow">
                      <CardHeader className="pb-2">
                        <div className="flex items-start justify-between">
                          <div className="flex-1 min-w-0">
                            <CardTitle className="text-base truncate">{category.name}</CardTitle>
                            <CardDescription className="text-xs mt-1 line-clamp-2">
                              {category.description || 'No description'}
                            </CardDescription>
                          </div>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" className="h-7 w-7 p-0 flex-shrink-0">
                                <MoreHorizontal className="h-3 w-3" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => openCategoryDialog('edit', category)}>
                                <Edit className="mr-2 h-3 w-3" />
                                Edit
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem 
                                onClick={() => setDeleteDialog({ open: true, type: 'category', item: category })}
                                className="text-destructive"
                              >
                                <Trash2 className="mr-2 h-3 w-3" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </CardHeader>
                      <CardContent className="pt-0">
                        <div className="flex items-center justify-between">
                          <Badge variant="outline" className="text-xs">
                            {category.item_count} item{category.item_count !== 1 ? 's' : ''}
                          </Badge>
                          {category.subcategories?.length > 0 && (
                            <Badge variant="secondary" className="text-xs">
                              {category.subcategories.length} sub
                            </Badge>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Item Dialog */}
      <Dialog open={itemDialog.open} onOpenChange={(open) => setItemDialog({ ...itemDialog, open })}>
        <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-lg">
              {itemDialog.mode === 'create' ? 'Add New Item' : 'Edit Item'}
            </DialogTitle>
            <DialogDescription className="text-sm">
              {itemDialog.mode === 'create' 
                ? 'Create a new inventory item' 
                : 'Update item information'
              }
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleItemSubmit}>
            <div className="grid gap-3 py-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-sm">Item Name *</Label>
                  <Input
                    id="name"
                    value={itemForm.name}
                    onChange={(e) => setItemForm({ ...itemForm, name: e.target.value })}
                    placeholder="Enter item name"
                    className="h-9"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="sku" className="text-sm">SKU *</Label>
                  <Input
                    id="sku"
                    value={itemForm.sku}
                    onChange={(e) => setItemForm({ ...itemForm, sku: e.target.value })}
                    placeholder="Enter SKU"
                    className="h-9"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description" className="text-sm">Description</Label>
                <Textarea
                  id="description"
                  value={itemForm.description}
                  onChange={(e) => setItemForm({ ...itemForm, description: e.target.value })}
                  placeholder="Enter item description"
                  className="min-h-[60px]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="category" className="text-sm">Category *</Label>
                  <Select
                    value={itemForm.category}
                    onValueChange={(value) => setItemForm({ ...itemForm, category: value })}
                    required
                  >
                    <SelectTrigger className="h-9">
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category.id} value={category.id.toString()}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="barcode" className="text-sm">Barcode</Label>
                  <Input
                    id="barcode"
                    value={itemForm.barcode}
                    onChange={(e) => setItemForm({ ...itemForm, barcode: e.target.value })}
                    placeholder="Enter barcode"
                    className="h-9"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="standard_cost" className="text-sm">Standard Cost *</Label>
                  <Input
                    id="standard_cost"
                    type="number"
                    step="0.01"
                    min="0"
                    value={itemForm.standard_cost}
                    onChange={(e) => setItemForm({ ...itemForm, standard_cost: e.target.value })}
                    placeholder="0.00"
                    className="h-9"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="reorder_level" className="text-sm">Reorder Level *</Label>
                  <Input
                    id="reorder_level"
                    type="number"
                    min="0"
                    value={itemForm.reorder_level}
                    onChange={(e) => setItemForm({ ...itemForm, reorder_level: e.target.value })}
                    placeholder="0"
                    className="h-9"
                    required
                  />
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="is_active"
                  checked={itemForm.is_active}
                  onCheckedChange={(checked) => setItemForm({ ...itemForm, is_active: checked })}
                />
                <Label htmlFor="is_active" className="text-sm">Active Item</Label>
              </div>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setItemDialog({ open: false, mode: 'create', item: null })}
              >
                Cancel
              </Button>
              <Button type="submit">
                {itemDialog.mode === 'create' ? 'Create Item' : 'Update Item'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Category Dialog */}
      <Dialog open={categoryDialog.open} onOpenChange={(open) => setCategoryDialog({ ...categoryDialog, open })}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle className="text-lg">
              {categoryDialog.mode === 'create' ? 'Add New Category' : 'Edit Category'}
            </DialogTitle>
            <DialogDescription className="text-sm">
              {categoryDialog.mode === 'create' 
                ? 'Create a new item category' 
                : 'Update category information'
              }
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCategorySubmit}>
            <div className="grid gap-3 py-4">
              <div className="space-y-2">
                <Label htmlFor="cat_name" className="text-sm">Category Name *</Label>
                <Input
                  id="cat_name"
                  value={categoryForm.name}
                  onChange={(e) => setCategoryForm({ ...categoryForm, name: e.target.value })}
                  placeholder="Enter category name"
                  className="h-9"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="cat_description" className="text-sm">Description</Label>
                <Textarea
                  id="cat_description"
                  value={categoryForm.description}
                  onChange={(e) => setCategoryForm({ ...categoryForm, description: e.target.value })}
                  placeholder="Enter category description"
                  className="min-h-[60px]"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="parent" className="text-sm">Parent Category</Label>
                <Select
                  value={categoryForm.parent ? categoryForm.parent.toString() : "none"}
                  onValueChange={(value) => setCategoryForm({ 
                    ...categoryForm, 
                    parent: value === "none" ? null : parseInt(value)
                  })}
                >
                  <SelectTrigger className="h-9">
                    <SelectValue placeholder="Select parent category (optional)" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">No Parent</SelectItem>
                    {categories
                      .filter(cat => categoryDialog.mode === 'create' || cat.id !== categoryDialog.category?.id)
                      .map((category) => (
                        <SelectItem key={category.id} value={category.id.toString()}>
                          {category.name}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setCategoryDialog({ open: false, mode: 'create', category: null })}
              >
                Cancel
              </Button>
              <Button type="submit">
                {categoryDialog.mode === 'create' ? 'Create Category' : 'Update Category'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* View Item Dialog */}
      <Dialog open={viewDialog.open} onOpenChange={(open) => setViewDialog({ ...viewDialog, open })}>
        <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-lg">Item Details</DialogTitle>
            <DialogDescription className="text-sm">
              Complete information about {viewDialog.item?.name}
            </DialogDescription>
          </DialogHeader>
          {viewDialog.item && (
            <div className="grid gap-3 py-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs font-medium text-muted-foreground">Name</Label>
                  <p className="text-sm font-semibold">{viewDialog.item.name}</p>
                </div>
                <div>
                  <Label className="text-xs font-medium text-muted-foreground">SKU</Label>
                  <p className="text-sm font-mono bg-muted px-2 py-1 rounded">{viewDialog.item.sku}</p>
                </div>
              </div>

              <div>
                <Label className="text-xs font-medium text-muted-foreground">Description</Label>
                <p className="text-sm">{viewDialog.item.description || 'No description'}</p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs font-medium text-muted-foreground">Category</Label>
                  <Badge variant="secondary" className="text-xs">{viewDialog.item.category_name}</Badge>
                </div>
                <div>
                  <Label className="text-xs font-medium text-muted-foreground">Status</Label>
                  <Badge variant={viewDialog.item.is_active ? "default" : "secondary"} className="text-xs">
                    {viewDialog.item.is_active ? "Active" : "Inactive"}
                  </Badge>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <Label className="text-xs font-medium text-muted-foreground">Current Stock</Label>
                  <p className="text-sm font-semibold">{viewDialog.item.total_stock}</p>
                </div>
                <div>
                  <Label className="text-xs font-medium text-muted-foreground">Reorder Level</Label>
                  <p className="text-sm">{viewDialog.item.reorder_level}</p>
                </div>
                <div>
                  <Label className="text-xs font-medium text-muted-foreground">Standard Cost</Label>
                  <p className="text-sm">Ksh {parseFloat(viewDialog.item.standard_cost).toLocaleString()}</p>
                </div>
              </div>

              {viewDialog.item.barcode && (
                <div>
                  <Label className="text-xs font-medium text-muted-foreground">Barcode</Label>
                  <p className="text-sm font-mono bg-muted px-2 py-1 rounded">{viewDialog.item.barcode}</p>
                </div>
              )}

              {Object.keys(viewDialog.item.stock_by_store || {}).length > 0 && (
                <div>
                  <Label className="text-xs font-medium text-muted-foreground">Stock by Store</Label>
                  <div className="grid gap-2 mt-1">
                    {Object.entries(viewDialog.item.stock_by_store).map(([store, stock]) => (
                      <div key={store} className="flex justify-between items-center bg-muted p-2 rounded">
                        <span className="text-xs">{store}</span>
                        <Badge variant="outline" className="text-xs">{stock} units</Badge>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs font-medium text-muted-foreground">Created At</Label>
                  <p className="text-xs">{new Date(viewDialog.item.created_at).toLocaleDateString()}</p>
                </div>
                <div>
                  <Label className="text-xs font-medium text-muted-foreground">Updated At</Label>
                  <p className="text-xs">{new Date(viewDialog.item.updated_at).toLocaleDateString()}</p>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setViewDialog({ open: false, item: null })}
            >
              Close
            </Button>
            <Button
              onClick={() => {
                setViewDialog({ open: false, item: null });
                openItemDialog('edit', viewDialog.item);
              }}
            >
              <Edit className="mr-2 h-4 w-4" />
              Edit Item
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialog.open} onOpenChange={(open) => setDeleteDialog({ ...deleteDialog, open })}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the{' '}
              <strong>{deleteDialog.type}</strong>{' '}
              <strong>"{deleteDialog.item?.name}"</strong>
              {deleteDialog.type === 'category' && deleteDialog.item?.item_count > 0 && (
                <span className="text-destructive">
                  {' '}and will affect {deleteDialog.item.item_count} item(s) in this category.
                </span>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={deleteDialog.type === 'item' ? handleItemDelete : handleCategoryDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete {deleteDialog.type}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}