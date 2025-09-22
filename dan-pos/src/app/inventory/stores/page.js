// components/StoreManagement.jsx
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
  Store, 
  Plus, 
  Edit, 
  Trash2, 
  Search,
  RefreshCw,
  MapPin,
  MoreHorizontal,
  AlertCircle,
  CheckCircle,
  Eye,
  Filter,
  Package,
  ChevronLeft,
  ChevronRight,
  DollarSign,
  Building,
  Warehouse
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
  getStores,
  createStore,
  updateStore,
  deleteStore,
  getStock,
  getStoreInventory
} from '@/lib/api/inventory';

export default function StoreManagement() {
  // State management
  const [activeTab, setActiveTab] = useState('stores');
  const [loading, setLoading] = useState(true);
  const [stores, setStores] = useState([]);
  const [stock, setStock] = useState([]);
  const [storeInventory, setStoreInventory] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStore, setSelectedStore] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  
  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [storesPerPage] = useState(6);
  const [inventoryPerPage] = useState(8);
  
  // Dialog states
  const [storeDialog, setStoreDialog] = useState({ open: false, mode: 'create', store: null });
  const [deleteDialog, setDeleteDialog] = useState({ open: false, type: '', store: null });
  const [viewDialog, setViewDialog] = useState({ open: false, store: null });

  // Form states
  const [storeForm, setStoreForm] = useState({
    name: '',
    location: '',
    is_active: true
  });

  const loadData = async () => {
    try {
      setLoading(true);
      const [storesData, stockData] = await Promise.all([
        getStores(),
        getStock()
      ]);
      
      setStores(storesData.data || []);
      setStock(stockData.data || []);
    } catch (error) {
      toast.error(error.message || 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  // Load store inventory when store is selected
  const loadStoreInventory = async (storeId) => {
    try {
      if (storeId && storeId !== 'all') {
        const inventoryData = await getStoreInventory(storeId);
        setStoreInventory(inventoryData.results || []);
      } else {
        setStoreInventory([]);
      }
    } catch (error) {
      toast.error(error.message || 'Failed to load store inventory');
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    loadStoreInventory(selectedStore);
  }, [selectedStore]);

  // Store CRUD operations
  const handleStoreSubmit = async (e) => {
    e.preventDefault();
    
    try {
      if (storeDialog.mode === 'create') {
        await createStore(storeForm);
        toast.success('Store created successfully');
      } else {
        await updateStore(storeDialog.store.id, storeForm);
        toast.success('Store updated successfully');
      }
      
      setStoreDialog({ open: false, mode: 'create', store: null });
      resetStoreForm();
      loadData();
    } catch (error) {
      toast.error(error.message || 'Failed to save store');
    }
  };

  const handleStoreDelete = async () => {
    try {
      await deleteStore(deleteDialog.store.id);
      toast.success('Store deleted successfully');
      setDeleteDialog({ open: false, type: '', store: null });
      loadData();
    } catch (error) {
      toast.error(error.message || 'Failed to delete store');
    }
  };

  // Helper functions
  const resetStoreForm = () => {
    setStoreForm({
      name: '',
      location: '',
      is_active: true
    });
  };

  const openStoreDialog = (mode, store = null) => {
    if (mode === 'edit' && store) {
      setStoreForm({
        name: store.name,
        location: store.location,
        is_active: store.is_active
      });
    } else {
      resetStoreForm();
    }
    setStoreDialog({ open: true, mode, store });
  };

  // Filter stores
  const filteredStores = stores.filter(store => {
    const matchesSearch = store.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         store.location.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || 
                         (filterStatus === 'active' && store.is_active) ||
                         (filterStatus === 'inactive' && !store.is_active);
    return matchesSearch && matchesStatus;
  });

  // Get stock for selected store
  const filteredStock = selectedStore === 'all' 
    ? stock 
    : stock.filter(item => item.store.toString() === selectedStore);

  // Pagination functions for stores
  const indexOfLastStore = currentPage * storesPerPage;
  const indexOfFirstStore = indexOfLastStore - storesPerPage;
  const currentStores = filteredStores.slice(indexOfFirstStore, indexOfLastStore);
  const totalStorePages = Math.ceil(filteredStores.length / storesPerPage);

  // Pagination functions for inventory
  const indexOfLastInventory = currentPage * inventoryPerPage;
  const indexOfFirstInventory = indexOfLastInventory - inventoryPerPage;
  const currentInventory = filteredStock.slice(indexOfFirstInventory, indexOfLastInventory);
  const totalInventoryPages = Math.ceil(filteredStock.length / inventoryPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const PaginationControls = ({ totalItems, itemsPerPage, currentPage, onPageChange, type = 'stores' }) => {
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    const showingFrom = (currentPage - 1) * itemsPerPage + 1;
    const showingTo = Math.min(currentPage * itemsPerPage, totalItems);

    if (totalItems === 0) return null;

    return (
      <div className="flex items-center justify-between px-4 py-3 border-t">
        <div className="text-sm text-muted-foreground">
          Showing {showingFrom}-{showingTo} of {totalItems} {type}
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(currentPage - 1)}
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
                onClick={() => onPageChange(pageNumber)}
                className="h-8 w-8 p-0"
              >
                {pageNumber}
              </Button>
            );
          })}
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(currentPage + 1)}
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
  }, [searchTerm, filterStatus, selectedStore, activeTab]);

  // Statistics calculations
  const totalStoresCount = stores.length;
  const activeStoresCount = stores.filter(store => store.is_active).length;
  const totalInventoryValue = stores.reduce((sum, store) => sum + (store.total_stock_value || 0), 0);

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
          <h1 className="text-2xl font-bold tracking-tight">Store Management</h1>
          <p className="text-sm text-muted-foreground">
            Manage your stores and inventory distribution
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
                <p className="text-sm font-medium text-blue-900">Total Stores</p>
                <p className="text-2xl font-bold text-blue-700">{totalStoresCount}</p>
              </div>
              <Building className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-900">Active Stores</p>
                <p className="text-2xl font-bold text-green-700">{activeStoresCount}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-purple-900">Total Inventory Value</p>
                <p className="text-2xl font-bold text-purple-700">
                  Ksh {totalInventoryValue.toLocaleString()}
                </p>
              </div>
              
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2 lg:w-[300px]">
          <TabsTrigger value="stores" className="flex items-center gap-2 text-xs">
            <Store className="h-3 w-3" />
            Stores ({stores.length})
          </TabsTrigger>
          <TabsTrigger value="inventory" className="flex items-center gap-2 text-xs">
            <Package className="h-3 w-3" />
            Inventory
          </TabsTrigger>
        </TabsList>

        {/* Stores Tab */}
        <TabsContent value="stores" className="space-y-3">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
                <div>
                  <CardTitle className="text-lg">Stores</CardTitle>
                  <CardDescription className="text-sm">
                    Manage your store locations
                  </CardDescription>
                </div>
                <Button 
                  onClick={() => openStoreDialog('create')}
                  size="sm"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Add Store
                </Button>
              </div>
            </CardHeader>
            <CardContent className="pt-0 p-0">
              {/* Search and Filter */}
              <div className="flex flex-col sm:flex-row gap-2 p-4 pb-0">
                <div className="relative flex-1">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search stores by name or location..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-8 h-9"
                  />
                </div>
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

              {/* Stores Grid */}
              <div className="p-4">
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {currentStores.length === 0 ? (
                    <div className="col-span-full text-center py-6">
                      <Store className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                      <p className="text-sm text-muted-foreground">No stores found</p>
                      <p className="text-xs text-muted-foreground">
                        Try adjusting your search or filters
                      </p>
                    </div>
                  ) : (
                    currentStores.map((store) => (
                      <Card key={store.id} className="hover:shadow-sm transition-shadow group">
                        <CardHeader className="pb-2">
                          <div className="flex items-start justify-between">
                            <div className="flex-1 min-w-0">
                              <CardTitle className="text-base truncate group-hover:text-blue-600 transition-colors">
                                {store.name}
                              </CardTitle>
                              <CardDescription className="text-xs mt-1 flex items-center gap-1">
                                <MapPin className="h-3 w-3" />
                                <span className="truncate">{store.location}</span>
                              </CardDescription>
                            </div>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" className="h-7 w-7 p-0 flex-shrink-0">
                                  <MoreHorizontal className="h-3 w-3" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => setViewDialog({ open: true, store })}>
                                  <Eye className="mr-2 h-3 w-3" />
                                  View Details
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => openStoreDialog('edit', store)}>
                                  <Edit className="mr-2 h-3 w-3" />
                                  Edit
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem 
                                  onClick={() => setDeleteDialog({ open: true, type: 'store', store })}
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
                              {store.total_items} item{store.total_items !== 1 ? 's' : ''}
                            </Badge>
                            <div className="flex items-center gap-2">
                              <Badge 
                                variant={store.is_active ? "default" : "secondary"} 
                                className="text-xs flex items-center gap-1"
                              >
                                {store.is_active ? (
                                  <CheckCircle className="h-3 w-3" />
                                ) : (
                                  <AlertCircle className="h-3 w-3" />
                                )}
                                {store.is_active ? "Active" : "Inactive"}
                              </Badge>
                              <Badge variant="secondary" className="text-xs">
                                Ksh.
                                {store.total_stock_value?.toLocaleString() || '0'}
                              </Badge>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  )}
                </div>
              </div>
              
              <PaginationControls
                totalItems={filteredStores.length}
                itemsPerPage={storesPerPage}
                currentPage={currentPage}
                onPageChange={paginate}
                type="stores"
              />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Inventory Tab */}
        <TabsContent value="inventory" className="space-y-3">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
                <div>
                  <CardTitle className="text-lg">Store Inventory</CardTitle>
                  <CardDescription className="text-sm">
                    View inventory distribution across stores
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-0 p-0">
              {/* Store Filter */}
              <div className="flex flex-col sm:flex-row gap-2 p-4 pb-0">
                <Select value={selectedStore} onValueChange={setSelectedStore}>
                  <SelectTrigger className="w-full sm:w-[250px] h-9">
                    <Filter className="mr-2 h-3 w-3" />
                    <SelectValue placeholder="Filter by store" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Stores</SelectItem>
                    {stores.map((store) => (
                      <SelectItem key={store.id} value={store.id.toString()}>
                        {store.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Inventory Table */}
              <div className="border rounded-md overflow-hidden">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-muted/50">
                        <TableHead className="font-semibold">Item</TableHead>
                        <TableHead className="font-semibold">SKU</TableHead>
                        <TableHead className="font-semibold hidden sm:table-cell">Store</TableHead>
                        <TableHead className="font-semibold">Quantity</TableHead>
                        <TableHead className="font-semibold hidden md:table-cell">Last Updated</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {currentInventory.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={5} className="text-center py-6">
                            <div className="flex flex-col items-center gap-2">
                              <Package className="h-6 w-6 text-muted-foreground" />
                              <p className="text-sm text-muted-foreground">
                                {selectedStore === 'all' 
                                  ? 'No stock records found' 
                                  : 'No inventory found for this store'
                                }
                              </p>
                            </div>
                          </TableCell>
                        </TableRow>
                      ) : (
                        currentInventory.map((stockItem) => (
                          <TableRow key={stockItem.id} className="hover:bg-muted/30">
                            <TableCell>
                              <div className="font-medium text-sm">{stockItem.item_name}</div>
                            </TableCell>
                            <TableCell>
                              <code className="bg-muted px-1.5 py-0.5 rounded text-xs">
                                {stockItem.item_sku}
                              </code>
                            </TableCell>
                            <TableCell className="hidden sm:table-cell">
                              <Badge variant="secondary" className="text-xs">
                                {stockItem.store_name}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-1">
                                <span className="font-medium text-sm">{stockItem.quantity}</span>
                                {stockItem.quantity === 0 && (
                                  <AlertCircle className="h-3 w-3 text-destructive" />
                                )}
                              </div>
                            </TableCell>
                            <TableCell className="hidden md:table-cell">
                              <span className="text-xs text-muted-foreground">
                                {new Date(stockItem.last_updated).toLocaleDateString()}
                              </span>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
                <PaginationControls
                  totalItems={filteredStock.length}
                  itemsPerPage={inventoryPerPage}
                  currentPage={currentPage}
                  onPageChange={paginate}
                  type="items"
                />
              </div>

              {/* Store-specific inventory details */}
              {selectedStore !== 'all' && storeInventory.length > 0 && (
                <div className="p-4">
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base flex items-center gap-2">
                        <Warehouse className="h-4 w-4" />
                        Store Inventory Summary
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div className="text-center">
                          <div className="text-2xl font-bold text-blue-600">{storeInventory.length}</div>
                          <div className="text-xs text-muted-foreground">Total Items</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-green-600">
                            {storeInventory.reduce((sum, item) => sum + item.quantity, 0)}
                          </div>
                          <div className="text-xs text-muted-foreground">Total Quantity</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-orange-600">
                            {storeInventory.filter(item => item.quantity === 0).length}
                          </div>
                          <div className="text-xs text-muted-foreground">Out of Stock</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-purple-600">
                            {storeInventory.filter(item => item.quantity <= 5).length}
                          </div>
                          <div className="text-xs text-muted-foreground">Low Stock</div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Store Dialog */}
      <Dialog open={storeDialog.open} onOpenChange={(open) => setStoreDialog({ ...storeDialog, open })}>
        <DialogContent className="sm:max-w-[450px]">
          <DialogHeader>
            <DialogTitle className="text-lg">
              {storeDialog.mode === 'create' ? 'Add New Store' : 'Edit Store'}
            </DialogTitle>
            <DialogDescription className="text-sm">
              {storeDialog.mode === 'create' 
                ? 'Create a new store location' 
                : 'Update store information'
              }
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleStoreSubmit}>
            <div className="grid gap-3 py-4">
              <div className="space-y-2">
                <Label htmlFor="store_name" className="text-sm">Store Name *</Label>
                <Input
                  id="store_name"
                  value={storeForm.name}
                  onChange={(e) => setStoreForm({ ...storeForm, name: e.target.value })}
                  placeholder="Enter store name"
                  className="h-9"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="location" className="text-sm">Location *</Label>
                <Textarea
                  id="location"
                  value={storeForm.location}
                  onChange={(e) => setStoreForm({ ...storeForm, location: e.target.value })}
                  placeholder="Enter store location address"
                  className="min-h-[60px]"
                  required
                />
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="is_active"
                  checked={storeForm.is_active}
                  onCheckedChange={(checked) => setStoreForm({ ...storeForm, is_active: checked })}
                />
                <Label htmlFor="is_active" className="text-sm">Active Store</Label>
              </div>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setStoreDialog({ open: false, mode: 'create', store: null })}
              >
                Cancel
              </Button>
              <Button type="submit">
                {storeDialog.mode === 'create' ? 'Create Store' : 'Update Store'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* View Store Dialog */}
      <Dialog open={viewDialog.open} onOpenChange={(open) => setViewDialog({ ...viewDialog, open })}>
        <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-lg">Store Details</DialogTitle>
            <DialogDescription className="text-sm">
              Complete information about {viewDialog.store?.name}
            </DialogDescription>
          </DialogHeader>
          {viewDialog.store && (
            <div className="grid gap-3 py-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs font-medium text-muted-foreground">Name</Label>
                  <p className="text-sm font-semibold">{viewDialog.store.name}</p>
                </div>
                <div>
                  <Label className="text-xs font-medium text-muted-foreground">Status</Label>
                  <Badge variant={viewDialog.store.is_active ? "default" : "secondary"} className="text-xs">
                    {viewDialog.store.is_active ? "Active" : "Inactive"}
                  </Badge>
                </div>
              </div>

              <div>
                <Label className="text-xs font-medium text-muted-foreground">Location</Label>
                <p className="text-sm flex items-center gap-1">
                  <MapPin className="h-3 w-3" />
                  {viewDialog.store.location}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs font-medium text-muted-foreground">Total Items</Label>
                  <p className="text-sm font-semibold">{viewDialog.store.total_items}</p>
                </div>
                <div>
                  <Label className="text-xs font-medium text-muted-foreground">Total Value</Label>
                  <p className="text-sm font-semibold">
                    Ksh {viewDialog.store.total_stock_value?.toLocaleString() || '0'}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs font-medium text-muted-foreground">Created At</Label>
                  <p className="text-xs">{new Date(viewDialog.store.created_at).toLocaleDateString()}</p>
                </div>
                <div>
                  <Label className="text-xs font-medium text-muted-foreground">Last Updated</Label>
                  <p className="text-xs">
                    {viewDialog.store.updated_at 
                      ? new Date(viewDialog.store.updated_at).toLocaleDateString()
                      : 'N/A'
                    }
                  </p>
                </div>
              </div>

              {/* Store Inventory Summary */}
              {storeInventory.length > 0 && (
                <div>
                  <Label className="text-xs font-medium text-muted-foreground">Current Inventory</Label>
                  <div className="grid gap-2 mt-1 max-h-40 overflow-y-auto">
                    {storeInventory.map((item) => (
                      <div key={item.id} className="flex justify-between items-center bg-muted p-2 rounded">
                        <span className="text-xs truncate flex-1">{item.item_name}</span>
                        <Badge variant="outline" className="text-xs ml-2">{item.quantity} units</Badge>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setViewDialog({ open: false, store: null })}
            >
              Close
            </Button>
            <Button
              onClick={() => {
                setViewDialog({ open: false, store: null });
                openStoreDialog('edit', viewDialog.store);
              }}
            >
              <Edit className="mr-2 h-4 w-4" />
              Edit Store
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
              <strong>store</strong>{' '}
              <strong>"{deleteDialog.store?.name}"</strong>
              {deleteDialog.store?.total_items > 0 && (
                <span className="text-destructive">
                  {' '}and will affect {deleteDialog.store.total_items} item(s) in this store.
                </span>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleStoreDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete Store
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}