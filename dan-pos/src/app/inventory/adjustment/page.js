"use client"

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { 
  Package, 
  Plus, 
  Edit, 
  Search,
  RefreshCw,
  AlertCircle,
  Eye,
  TrendingUp,
  TrendingDown,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { toast } from 'react-toastify';
import { 
  getStores,
  getItems,
  getStock,
  getStockAdjustments,
  adjustStock,
  createStockAdjustment
} from '@/lib/api/inventory';
import { getCurrentUser } from '@/services/auth';

export default function StockManagement() {
  // State management
  const [activeTab, setActiveTab] = useState('stock');
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);
  const [stores, setStores] = useState([]);
  const [items, setItems] = useState([]);
  const [stock, setStock] = useState([]);
  const [adjustments, setAdjustments] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStore, setSelectedStore] = useState('all');
  const [selectedItem, setSelectedItem] = useState('all');
  
  // Pagination states - changed to 5 items per page
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(3);
  
  // Dialog states
  const [adjustDialog, setAdjustDialog] = useState({ open: false, stock: null });
  const [viewDialog, setViewDialog] = useState({ open: false, adjustment: null });
  const [deleteDialog, setDeleteDialog] = useState({ open: false, adjustment: null });

  // Form states
  const [adjustForm, setAdjustForm] = useState({
    adjustment_type: 'add',
    quantity: '',
    reason: 'count_error',
    notes: ''
  });

  const loadData = async () => {
    try {
      setLoading(true);
      
      // Get current user first
      const userData = await getCurrentUser();
      setCurrentUser(userData);
      
      const [storesData, itemsData, stockData, adjustmentsData] = await Promise.all([
        getStores(),
        getItems(),
        getStock(),
        getStockAdjustments()
      ]);
      
      setStores(storesData.data || []);
      setItems(itemsData.data || itemsData.results || []);
      setStock(stockData.data || []);
      setAdjustments(adjustmentsData.data || adjustmentsData.results || []);
    } catch (error) {
      toast.error(error.message || 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Stock adjustment operations
  const handleStockAdjust = async (e) => {
    e.preventDefault();
    
    try {
      // Validate required fields for new adjustment
      if (!adjustDialog.stock && (!selectedItem || selectedItem === 'all' || !selectedStore || selectedStore === 'all')) {
        toast.error('Please select both Item and Store');
        return;
      }

      if (!adjustForm.quantity || parseInt(adjustForm.quantity) <= 0) {
        toast.error('Please enter a valid quantity greater than 0');
        return;
      }

      const adjustmentData = {
        adjustment_type: adjustForm.adjustment_type,
        quantity: parseInt(adjustForm.quantity),
        notes: adjustForm.notes,
        adjusted_by: currentUser?.id
      };

      if (adjustDialog.stock) {
        await adjustStock(adjustDialog.stock.id, adjustmentData);
      } else {
        adjustmentData.item = parseInt(selectedItem);
        adjustmentData.store = parseInt(selectedStore);
        await createStockAdjustment(adjustmentData);
      }
      toast.success('Stock adjustment created successfully');
      setAdjustDialog({ open: false, stock: null });
      resetAdjustForm();
      loadData();
    } catch (error) {
      console.error('Adjustment error:', error);
      toast.error(error.message || 'Failed to create stock adjustment');
    }
  };

  // Helper functions
  const resetAdjustForm = () => {
    setAdjustForm({
      adjustment_type: 'add',
      quantity: '',
      reason: 'count_error',
      notes: ''
    });
  };

  const openAdjustDialog = (stock = null) => {
    resetAdjustForm();
    setAdjustDialog({ open: true, stock });
  };

  const getAdjustmentTypeIcon = (type) => {
    switch (type) {
      case 'add':
        return <TrendingUp className="h-4 w-4 text-green-600" />;
      case 'remove':
        return <TrendingDown className="h-4 w-4 text-red-600" />;
      case 'set':
        return <Edit className="h-4 w-4 text-blue-600" />;
      default:
        return <Package className="h-4 w-4" />;
    }
  };

  const getReasonDisplay = (reason) => {
    const reasons = {
      'count_error': 'Count Error',
      'damage': 'Damaged Goods',
      'theft': 'Theft/Loss',
      'donation': 'Donation',
      'other': 'Other'
    };
    return reasons[reason] || reason;
  };

  // Filter functions
  const filteredStock = stock.filter(item => {
    const matchesSearch = item.item_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.item_sku?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.store_name?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStore = selectedStore === 'all' || item.store?.toString() === selectedStore;
    const matchesItem = selectedItem === 'all' || item.item?.toString() === selectedItem;
    return matchesSearch && matchesStore && matchesItem;
  });

  const filteredAdjustments = adjustments.filter(adj => {
    const matchesSearch = adj.item_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         adj.reference_no?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         adj.store_name?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStore = selectedStore === 'all' || adj.store?.toString() === selectedStore;
    const matchesItem = selectedItem === 'all' || adj.item?.toString() === selectedItem;
    return matchesSearch && matchesStore && matchesItem;
  });

  // Pagination functions - now showing 5 items per page
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentStock = filteredStock.slice(indexOfFirstItem, indexOfLastItem);
  const currentAdjustments = filteredAdjustments.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(
    activeTab === 'stock' ? filteredStock.length / itemsPerPage : filteredAdjustments.length / itemsPerPage
  );

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const PaginationControls = () => {
    const totalItems = activeTab === 'stock' ? filteredStock.length : filteredAdjustments.length;
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

  // Reset pagination when filters change or tab changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedStore, selectedItem, activeTab]);

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
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Stock Management</h1>
          <p className="text-sm text-muted-foreground">
            Manage stock levels and adjustments across your stores
          </p>
        </div>
        <div className="flex gap-2 mt-2 sm:mt-0">
          <Button onClick={() => openAdjustDialog()} size="sm">
            <Plus className="mr-2 h-4 w-4" />
            New Adjustment
          </Button>
          <Button onClick={loadData} variant="outline" size="sm">
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by item name, SKU, or store..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8 h-9"
              />
            </div>
            <Select value={selectedStore} onValueChange={setSelectedStore}>
              <SelectTrigger className="w-full sm:w-[200px] h-9">
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
            <Select value={selectedItem} onValueChange={setSelectedItem}>
              <SelectTrigger className="w-full sm:w-[200px] h-9">
                <SelectValue placeholder="Filter by item" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Items</SelectItem>
                {items.map((item) => (
                  <SelectItem key={item.id} value={item.id.toString()}>
                    {item.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2 lg:w-[400px]">
          <TabsTrigger value="stock" className="flex items-center gap-2 text-xs">
            <Package className="h-3 w-3" />
            Current Stock ({filteredStock.length})
          </TabsTrigger>
          <TabsTrigger value="adjustments" className="flex items-center gap-2 text-xs">
            <Edit className="h-3 w-3" />
            Adjustments ({filteredAdjustments.length})
          </TabsTrigger>
        </TabsList>

        {/* Stock Tab */}
        <TabsContent value="stock" className="space-y-3">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Current Stock Levels</CardTitle>
              <CardDescription className="text-sm">
                View and adjust stock quantities across all stores
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-0 p-0">
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
                        <TableHead className="font-semibold text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {currentStock.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={6} className="text-center py-6">
                            <div className="flex flex-col items-center gap-2">
                              <Package className="h-6 w-6 text-muted-foreground" />
                              <p className="text-sm text-muted-foreground">No stock records found</p>
                            </div>
                          </TableCell>
                        </TableRow>
                      ) : (
                        currentStock.map((stockItem) => (
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
                              <div className="flex items-center gap-2">
                                <span className="font-medium text-sm">{stockItem.quantity}</span>
                                {stockItem.quantity === 0 && (
                                  <AlertCircle className="h-3 w-3 text-destructive" />
                                )}
                                {stockItem.quantity > 0 && stockItem.quantity <= 5 && (
                                  <AlertCircle className="h-3 w-3 text-yellow-500" />
                                )}
                              </div>
                            </TableCell>
                            <TableCell className="hidden md:table-cell">
                              <span className="text-xs text-muted-foreground">
                                {new Date(stockItem.last_updated).toLocaleDateString()}
                              </span>
                            </TableCell>
                            <TableCell className="text-right">
                              <Button 
                                onClick={() => openAdjustDialog(stockItem)}
                                size="sm" 
                                variant="outline"
                                className="h-7 px-2"
                              >
                                <Edit className="h-3 w-3" />
                              </Button>
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

        {/* Adjustments Tab */}
        <TabsContent value="adjustments" className="space-y-3">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Stock Adjustments History</CardTitle>
              <CardDescription className="text-sm">
                View all stock adjustment records and their details
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-0 p-0">
              <div className="border rounded-md overflow-hidden">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-muted/50">
                        <TableHead className="font-semibold">Reference</TableHead>
                        <TableHead className="font-semibold">Item</TableHead>
                        <TableHead className="font-semibold hidden sm:table-cell">Store</TableHead>
                        <TableHead className="font-semibold">Type</TableHead>
                        <TableHead className="font-semibold">Quantity</TableHead>
                        <TableHead className="font-semibold hidden md:table-cell">Reason</TableHead>
                        <TableHead className="font-semibold hidden lg:table-cell">Date</TableHead>
                        <TableHead className="font-semibold text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {currentAdjustments.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={8} className="text-center py-6">
                            <div className="flex flex-col items-center gap-2">
                              <Edit className="h-6 w-6 text-muted-foreground" />
                              <p className="text-sm text-muted-foreground">No adjustments found</p>
                            </div>
                          </TableCell>
                        </TableRow>
                      ) : (
                        currentAdjustments.map((adjustment) => (
                          <TableRow key={adjustment.id} className="hover:bg-muted/30">
                            <TableCell>
                              <code className="bg-muted px-1.5 py-0.5 rounded text-xs">
                                {adjustment.reference_no}
                              </code>
                            </TableCell>
                            <TableCell>
                              <div className="font-medium text-sm">{adjustment.item_name}</div>
                            </TableCell>
                            <TableCell className="hidden sm:table-cell">
                              <Badge variant="secondary" className="text-xs">
                                {adjustment.store_name}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-1">
                                {getAdjustmentTypeIcon(adjustment.adjustment_type)}
                                <span className="text-xs capitalize">
                                  {adjustment.adjustment_type}
                                </span>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-1">
                                <span className="font-medium text-sm">
                                  {adjustment.adjustment_type === 'add' ? '+' : 
                                   adjustment.adjustment_type === 'remove' ? '-' : ''}
                                  {adjustment.quantity}
                                </span>
                              </div>
                            </TableCell>
                            <TableCell className="hidden md:table-cell">
                              <Badge variant="outline" className="text-xs">
                                {getReasonDisplay(adjustment.reason)}
                              </Badge>
                            </TableCell>
                            <TableCell className="hidden lg:table-cell">
                              <span className="text-xs text-muted-foreground">
                                {new Date(adjustment.adjusted_at).toLocaleDateString()}
                              </span>
                            </TableCell>
                            <TableCell className="text-right">
                              <Button 
                                onClick={() => setViewDialog({ open: true, adjustment })}
                                size="sm" 
                                variant="outline"
                                className="h-7 px-2"
                              >
                                <Eye className="h-3 w-3" />
                              </Button>
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
      </Tabs>

      {/* Stock Adjustment Dialog */}
      <Dialog open={adjustDialog.open} onOpenChange={(open) => setAdjustDialog({ ...adjustDialog, open })}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="text-lg">
              {adjustDialog.stock ? `Adjust Stock: ${adjustDialog.stock.item_name}` : 'Create Stock Adjustment'}
            </DialogTitle>
            <DialogDescription className="text-sm">
              {adjustDialog.stock 
                ? `Current quantity: ${adjustDialog.stock.quantity} at ${adjustDialog.stock.store_name}`
                : 'Create a new stock adjustment record'
              }
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleStockAdjust}>
            <div className="grid gap-4 py-4">
              {!adjustDialog.stock && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="adjust_store" className="text-sm">Store *</Label>
                    <Select 
                      value={selectedStore} 
                      onValueChange={setSelectedStore}
                      required
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select store" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all" disabled>Select a store</SelectItem>
                        {stores.map((store) => (
                          <SelectItem key={store.id} value={store.id.toString()}>
                            {store.name} - {store.location}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="adjust_item" className="text-sm">Item *</Label>
                    <Select 
                      value={selectedItem} 
                      onValueChange={setSelectedItem}
                      required
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select item" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all" disabled>Select an item</SelectItem>
                        {items.map((item) => (
                          <SelectItem key={item.id} value={item.id.toString()}>
                            {item.name} ({item.sku})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </>
              )}

              <div className="space-y-2">
                <Label htmlFor="adjustment_type" className="text-sm">Adjustment Type *</Label>
                <Select 
                  value={adjustForm.adjustment_type} 
                  onValueChange={(value) => setAdjustForm({ ...adjustForm, adjustment_type: value })}
                  required
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="add">Add Stock</SelectItem>
                    <SelectItem value="remove">Remove Stock</SelectItem>
                    <SelectItem value="set">Set Stock Level</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="quantity" className="text-sm">Quantity *</Label>
                <Input
                  id="quantity"
                  type="number"
                  value={adjustForm.quantity}
                  onChange={(e) => setAdjustForm({ ...adjustForm, quantity: e.target.value })}
                  placeholder="Enter quantity"
                  className="h-9"
                  min="1"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="reason" className="text-sm">Reason *</Label>
                <Select 
                  value={adjustForm.reason} 
                  onValueChange={(value) => setAdjustForm({ ...adjustForm, reason: value })}
                  required
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="count_error">Count Error</SelectItem>
                    <SelectItem value="damage">Damaged Goods</SelectItem>
                    <SelectItem value="theft">Theft/Loss</SelectItem>
                    <SelectItem value="donation">Donation</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes" className="text-sm">Notes</Label>
                <Textarea
                  id="notes"
                  value={adjustForm.notes}
                  onChange={(e) => setAdjustForm({ ...adjustForm, notes: e.target.value })}
                  placeholder="Optional notes about this adjustment"
                  className="min-h-[60px]"
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setAdjustDialog({ open: false, stock: null })}
              >
                Cancel
              </Button>
              <Button type="submit">Create Adjustment</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* View Adjustment Dialog */}
      <Dialog open={viewDialog.open} onOpenChange={(open) => setViewDialog({ ...viewDialog, open })}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-lg">Adjustment Details</DialogTitle>
            <DialogDescription className="text-sm">
              {viewDialog.adjustment?.reference_no}
            </DialogDescription>
          </DialogHeader>
          {viewDialog.adjustment && (
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-xs font-medium text-muted-foreground">Reference No.</Label>
                  <p className="text-sm font-mono">{viewDialog.adjustment.reference_no}</p>
                </div>
                <div>
                  <Label className="text-xs font-medium text-muted-foreground">Date</Label>
                  <p className="text-sm">{new Date(viewDialog.adjustment.adjusted_at).toLocaleString()}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-xs font-medium text-muted-foreground">Item</Label>
                  <p className="text-sm font-semibold">{viewDialog.adjustment.item_name}</p>
                </div>
                <div>
                  <Label className="text-xs font-medium text-muted-foreground">Store</Label>
                  <p className="text-sm">{viewDialog.adjustment.store_name}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-xs font-medium text-muted-foreground">Adjustment Type</Label>
                  <div className="flex items-center gap-1 mt-1">
                    {getAdjustmentTypeIcon(viewDialog.adjustment.adjustment_type)}
                    <span className="text-sm capitalize">{viewDialog.adjustment.adjustment_type}</span>
                  </div>
                </div>
                <div>
                  <Label className="text-xs font-medium text-muted-foreground">Reason</Label>
                  <Badge variant="outline" className="text-xs mt-1">
                    {getReasonDisplay(viewDialog.adjustment.reason)}
                  </Badge>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label className="text-xs font-medium text-muted-foreground">Previous Qty</Label>
                  <p className="text-sm font-semibold">{viewDialog.adjustment.previous_quantity}</p>
                </div>
                <div>
                  <Label className="text-xs font-medium text-muted-foreground">Adjustment</Label>
                  <p className="text-sm font-semibold">
                    {viewDialog.adjustment.adjustment_type === 'add' ? '+' : 
                     viewDialog.adjustment.adjustment_type === 'remove' ? '-' : ''}
                    {viewDialog.adjustment.quantity}
                  </p>
                </div>
                <div>
                  <Label className="text-xs font-medium text-muted-foreground">New Qty</Label>
                  <p className="text-sm font-semibold">{viewDialog.adjustment.new_quantity}</p>
                </div>
              </div>

              {viewDialog.adjustment.notes && (
                <div>
                  <Label className="text-xs font-medium text-muted-foreground">Notes</Label>
                  <p className="text-sm bg-muted p-2 rounded mt-1">{viewDialog.adjustment.notes}</p>
                </div>
              )}

              <div>
                <Label className="text-xs font-medium text-muted-foreground">Adjusted By</Label>
                <p className="text-sm">
                  {viewDialog.adjustment.adjusted_by_name || 
                   (currentUser && `${currentUser.first_name} ${currentUser.last_name}`) || 
                   viewDialog.adjustment.adjusted_by || 
                   'Unknown User'}
                </p>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setViewDialog({ open: false, adjustment: null })}
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
