"use client"

// components/procurement/PurchaseOrdersManagement.js
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  FileText, 
  Plus, 
  Edit, 
  Trash2, 
  Search,
  RefreshCw,
  Eye,
  Calendar,
  Package,
  ChevronLeft,
  ChevronRight,
  Send,
  Check,
  X,
  AlertCircle,
  ShoppingCart,
  User,
  DollarSign,
  Minus
} from 'lucide-react';
import { toast } from 'react-toastify';
import { 
  getPurchaseOrders,
  getPurchaseOrder,
  createPurchaseOrder,
  updatePurchaseOrder,
  deletePurchaseOrder,
  addPOItem,
  changePOStatus,
  getPOStatusOptions,
  calculatePOTotals,
  getSuppliers
} from '@/lib/api/procurement';
import { getItems } from '@/lib/api/inventory'; // Assuming this exists

export default function PurchaseOrdersManagement() {
  // State management
  const [loading, setLoading] = useState(true);
  const [purchaseOrders, setPurchaseOrders] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [items, setItems] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [supplierFilter, setSupplierFilter] = useState('all');
  const [dateFromFilter, setDateFromFilter] = useState('');
  const [dateToFilter, setDateToFilter] = useState('');
  
  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  
  // Dialog states
  const [poDialog, setPoDialog] = useState({ 
    open: false, 
    mode: 'create', // 'create' or 'edit'
    purchaseOrder: null 
  });
  const [viewDialog, setViewDialog] = useState({ 
    open: false, 
    purchaseOrder: null
  });
  const [deleteDialog, setDeleteDialog] = useState({ 
    open: false, 
    purchaseOrder: null 
  });
  const [statusDialog, setStatusDialog] = useState({
    open: false,
    purchaseOrder: null
  });
  const [addItemDialog, setAddItemDialog] = useState({
    open: false,
    purchaseOrder: null
  });

  // Form states
  const [poForm, setPoForm] = useState({
    supplier: '',
    expected_delivery_date: '',
    notes: '',
    items: []
  });

  const [itemForm, setItemForm] = useState({
    item: '',
    quantity: 1,
    unit_cost: '',
    notes: ''
  });

  const [formErrors, setFormErrors] = useState({});

  // Load data
  const loadPurchaseOrders = async () => {
    try {
      setLoading(true);
      const params = {};
      if (supplierFilter !== 'all') params.supplier = supplierFilter;
      if (statusFilter !== 'all') params.status = statusFilter;
      if (dateFromFilter) params.date_from = dateFromFilter;
      if (dateToFilter) params.date_to = dateToFilter;

      const response = await getPurchaseOrders(params);
      setPurchaseOrders(response.data || []);
    } catch (error) {
      toast.error(error.message || 'Failed to load purchase orders');
    } finally {
      setLoading(false);
    }
  };

  const loadSuppliers = async () => {
    try {
      const response = await getSuppliers();
      setSuppliers(response.data || []);
    } catch (error) {
      console.error('Failed to load suppliers:', error);
    }
  };

  const loadItems = async () => {
    try {
      const response = await getItems();
      setItems(response.data || []);
    } catch (error) {
      console.error('Failed to load items:', error);
    }
  };

  useEffect(() => {
    loadPurchaseOrders();
    loadSuppliers();
    loadItems();
  }, [supplierFilter, statusFilter, dateFromFilter, dateToFilter]);

  // Load PO details for view dialog
  const loadPODetails = async (po) => {
    try {
      const detailedPO = await getPurchaseOrder(po.id);
      setViewDialog({ open: true, purchaseOrder: detailedPO });
    } catch (error) {
      toast.error(error.message || 'Failed to load purchase order details');
    }
  };

  // Form handlers
  const handlePOSubmit = async (e) => {
    e.preventDefault();
    
    // Validation
    const errors = {};
    if (!poForm.supplier) errors.supplier = 'Supplier is required';
    if (poForm.items.length === 0) errors.items = 'At least one item is required';

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    try {
      if (poDialog.mode === 'create') {
        await createPurchaseOrder(poForm);
        toast.success('Purchase order created successfully');
      } else {
        const { items, ...updateData } = poForm;
        await updatePurchaseOrder(poDialog.purchaseOrder.id, updateData);
        toast.success('Purchase order updated successfully');
      }
      
      setPoDialog({ open: false, mode: 'create', purchaseOrder: null });
      resetPOForm();
      loadPurchaseOrders();
    } catch (error) {
      toast.error(error.message || `Failed to ${poDialog.mode} purchase order`);
    }
  };

  const handleDeletePO = async () => {
    try {
      await deletePurchaseOrder(deleteDialog.purchaseOrder.id);
      toast.success('Purchase order deleted successfully');
      setDeleteDialog({ open: false, purchaseOrder: null });
      loadPurchaseOrders();
    } catch (error) {
      toast.error(error.message || 'Failed to delete purchase order');
    }
  };

  const handleStatusChange = async (newStatus) => {
    try {
      await changePOStatus(statusDialog.purchaseOrder.id, { status: newStatus });
      toast.success('Purchase order status updated successfully');
      setStatusDialog({ open: false, purchaseOrder: null });
      loadPurchaseOrders();
    } catch (error) {
      toast.error(error.message || 'Failed to update purchase order status');
    }
  };

  const handleAddItem = async (e) => {
    e.preventDefault();
    
    const errors = {};
    if (!itemForm.item) errors.item = 'Item is required';
    if (!itemForm.quantity || itemForm.quantity < 1) errors.quantity = 'Valid quantity is required';
    if (!itemForm.unit_cost || parseFloat(itemForm.unit_cost) <= 0) errors.unit_cost = 'Valid unit cost is required';

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    try {
      await addPOItem(addItemDialog.purchaseOrder.id, {
        item_id: itemForm.item,
        quantity: parseInt(itemForm.quantity),
        unit_cost: parseFloat(itemForm.unit_cost),
        notes: itemForm.notes
      });
      
      toast.success('Item added to purchase order successfully');
      setAddItemDialog({ open: false, purchaseOrder: null });
      resetItemForm();
      loadPurchaseOrders();
    } catch (error) {
      toast.error(error.message || 'Failed to add item to purchase order');
    }
  };

  const resetPOForm = () => {
    setPoForm({
      supplier: '',
      expected_delivery_date: '',
      notes: '',
      items: []
    });
    setFormErrors({});
  };

  const resetItemForm = () => {
    setItemForm({
      item: '',
      quantity: 1,
      unit_cost: '',
      notes: ''
    });
    setFormErrors({});
  };

  const openCreateDialog = () => {
    resetPOForm();
    setPoDialog({ open: true, mode: 'create', purchaseOrder: null });
  };

  const openEditDialog = (po) => {
    setPoForm({
      supplier: po.supplier?.toString() || '',
      expected_delivery_date: po.expected_delivery_date || '',
      notes: po.notes || '',
      items: po.items || []
    });
    setPoDialog({ open: true, mode: 'edit', purchaseOrder: po });
  };

  const addItemToForm = () => {
    if (!itemForm.item || !itemForm.quantity || !itemForm.unit_cost) {
      toast.error('Please fill all required item fields');
      return;
    }

    const selectedItem = items.find(item => item.id.toString() === itemForm.item);
    if (!selectedItem) return;

    const newItem = {
      item: parseInt(itemForm.item),
      item_name: selectedItem.name,
      item_sku: selectedItem.sku,
      quantity: parseInt(itemForm.quantity),
      unit_cost: parseFloat(itemForm.unit_cost),
      notes: itemForm.notes,
      total_amount: parseInt(itemForm.quantity) * parseFloat(itemForm.unit_cost)
    };

    // Check if item already exists
    const existingIndex = poForm.items.findIndex(item => item.item === newItem.item);
    if (existingIndex >= 0) {
      // Update existing item
      const updatedItems = [...poForm.items];
      updatedItems[existingIndex] = newItem;
      setPoForm({ ...poForm, items: updatedItems });
    } else {
      // Add new item
      setPoForm({ ...poForm, items: [...poForm.items, newItem] });
    }

    resetItemForm();
  };

  const removeItemFromForm = (index) => {
    const updatedItems = poForm.items.filter((_, i) => i !== index);
    setPoForm({ ...poForm, items: updatedItems });
  };

  // Filter functions
  const filteredPOs = purchaseOrders.filter(po => {
    const matchesSearch = po.po_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         po.supplier_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         po.notes?.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesSearch;
  });

  // Pagination functions
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentPOs = filteredPOs.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredPOs.length / itemsPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  // Status badge styling
  const getStatusBadge = (status) => {
    const statusConfig = {
      draft: { variant: "secondary", label: "Draft" },
      sent: { variant: "outline", label: "Sent" },
      confirmed: { variant: "default", label: "Confirmed" },
      partially_received: { variant: "destructive", label: "Partially Received" },
      completed: { variant: "default", label: "Completed" },
      cancelled: { variant: "secondary", label: "Cancelled" }
    };

    const config = statusConfig[status] || { variant: "secondary", label: status };
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const PaginationControls = () => {
    const totalItems = filteredPOs.length;
    const showingFrom = indexOfFirstItem + 1;
    const showingTo = Math.min(indexOfLastItem, totalItems);

    if (totalItems === 0) return null;

    return (
      <div className="flex items-center justify-between px-4 py-3 border-t">
        <div className="text-sm text-muted-foreground">
          Showing {showingFrom}-{showingTo} of {totalItems} purchase orders
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
  }, [searchTerm, statusFilter, supplierFilter, dateFromFilter, dateToFilter]);

  // Loading skeleton
  if (loading) {
    return (
      <div className="w-full">
        <div className="flex items-center justify-between mb-4">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-10 w-40" />
        </div>
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} className="h-20 w-full" />
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
          <h1 className="text-2xl font-bold tracking-tight">Purchase Orders Management</h1>
          <p className="text-sm text-muted-foreground">
            Create, manage and track your purchase orders
          </p>
        </div>
        <div className="flex gap-2 mt-2 sm:mt-0">
          <Button onClick={openCreateDialog} size="sm">
            <Plus className="mr-2 h-4 w-4" />
            New Purchase Order
          </Button>
          <Button onClick={loadPurchaseOrders} variant="outline" size="sm">
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3">
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search PO number, supplier..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8 h-9"
              />
            </div>
            
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="h-9">
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                {getPOStatusOptions().map(option => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={supplierFilter} onValueChange={setSupplierFilter}>
              <SelectTrigger className="h-9">
                <SelectValue placeholder="All Suppliers" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Suppliers</SelectItem>
                {suppliers.map(supplier => (
                  <SelectItem key={supplier.id} value={supplier.id.toString()}>
                    {supplier.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Input
              type="date"
              value={dateFromFilter}
              onChange={(e) => setDateFromFilter(e.target.value)}
              className="h-9"
              placeholder="From date"
            />

            <Input
              type="date"
              value={dateToFilter}
              onChange={(e) => setDateToFilter(e.target.value)}
              className="h-9"
              placeholder="To date"
            />
          </div>
        </CardContent>
      </Card>

      {/* Purchase Orders Table */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Purchase Orders List</CardTitle>
          <CardDescription className="text-sm">
            {filteredPOs.length} purchase order(s) found
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-0 p-0">
          <div className="border rounded-md overflow-hidden">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead className="font-semibold">PO Number</TableHead>
                    <TableHead className="font-semibold">Supplier</TableHead>
                    <TableHead className="font-semibold">Date</TableHead>
                    <TableHead className="font-semibold">Status</TableHead>
                    <TableHead className="font-semibold">Progress</TableHead>
                    <TableHead className="font-semibold">Amount</TableHead>
                    <TableHead className="font-semibold text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {currentPOs.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-6">
                        <div className="flex flex-col items-center gap-2">
                          <FileText className="h-6 w-6 text-muted-foreground" />
                          <p className="text-sm text-muted-foreground">No purchase orders found</p>
                          {searchTerm || statusFilter !== 'all' || supplierFilter !== 'all' ? (
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => {
                                setSearchTerm('');
                                setStatusFilter('all');
                                setSupplierFilter('all');
                                setDateFromFilter('');
                                setDateToFilter('');
                              }}
                            >
                              Clear filters
                            </Button>
                          ) : null}
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : (
                    currentPOs.map((po) => (
                      <TableRow key={po.id} className="hover:bg-muted/30">
                        <TableCell>
                          <div className="font-medium text-sm">{po.po_number}</div>
                          <div className="text-xs text-muted-foreground">
                            {new Date(po.order_date).toLocaleDateString()}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">{po.supplier_name}</div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            {new Date(po.order_date).toLocaleDateString()}
                          </div>
                          {po.expected_delivery_date && (
                            <div className="text-xs text-muted-foreground">
                              Expected: {new Date(po.expected_delivery_date).toLocaleDateString()}
                            </div>
                          )}
                        </TableCell>
                        <TableCell>
                          {getStatusBadge(po.status)}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <div className="w-12 bg-muted rounded-full h-2">
                              <div 
                                className="bg-primary h-2 rounded-full"
                                style={{ width: `${po.received_percentage || 0}%` }}
                              />
                            </div>
                            <span className="text-xs text-muted-foreground">
                              {Math.round(po.received_percentage || 0)}%
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm font-medium">
                            Ksh {parseFloat(po.total_amount || 0).toLocaleString()}
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-1">
                            <Button 
                              onClick={() => loadPODetails(po)}
                              size="sm" 
                              variant="outline"
                              className="h-7 px-2"
                            >
                              <Eye className="h-3 w-3" />
                            </Button>
                            {po.status === 'draft' && (
                              <>
                                <Button 
                                  onClick={() => openEditDialog(po)}
                                  size="sm" 
                                  variant="outline"
                                  className="h-7 px-2"
                                >
                                  <Edit className="h-3 w-3" />
                                </Button>
                                <Button 
                                  onClick={() => setAddItemDialog({ open: true, purchaseOrder: po })}
                                  size="sm" 
                                  variant="outline"
                                  className="h-7 px-2"
                                >
                                  <Plus className="h-3 w-3" />
                                </Button>
                              </>
                            )}
                            <Button 
                              onClick={() => setStatusDialog({ open: true, purchaseOrder: po })}
                              size="sm" 
                              variant="outline"
                              className="h-7 px-2"
                            >
                              <Send className="h-3 w-3" />
                            </Button>
                            {po.status === 'draft' && (
                              <Button 
                                onClick={() => setDeleteDialog({ open: true, purchaseOrder: po })}
                                size="sm" 
                                variant="outline"
                                className="h-7 px-2 text-destructive hover:text-destructive"
                              >
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            )}
                          </div>
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

      {/* Create/Edit PO Dialog */}
      <Dialog open={poDialog.open} onOpenChange={(open) => setPoDialog({ ...poDialog, open })}>
        <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-lg">
              {poDialog.mode === 'create' ? 'Create New Purchase Order' : 'Edit Purchase Order'}
            </DialogTitle>
            <DialogDescription className="text-sm">
              {poDialog.mode === 'create' 
                ? 'Create a new purchase order for your supplier'
                : `Update details for ${poDialog.purchaseOrder?.po_number}`
              }
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handlePOSubmit}>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="supplier" className="text-sm">Supplier *</Label>
                  <Select 
                    value={poForm.supplier} 
                    onValueChange={(value) => setPoForm({ ...poForm, supplier: value })}
                  >
                    <SelectTrigger className="h-9">
                      <SelectValue placeholder="Select supplier" />
                    </SelectTrigger>
                    <SelectContent>
                      {suppliers.map(supplier => (
                        <SelectItem key={supplier.id} value={supplier.id.toString()}>
                          {supplier.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {formErrors.supplier && <p className="text-xs text-destructive">{formErrors.supplier}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="expected_delivery_date" className="text-sm">Expected Delivery Date</Label>
                  <Input
                    id="expected_delivery_date"
                    type="date"
                    value={poForm.expected_delivery_date}
                    onChange={(e) => setPoForm({ ...poForm, expected_delivery_date: e.target.value })}
                    className="h-9"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes" className="text-sm">Notes</Label>
                <Textarea
                  id="notes"
                  value={poForm.notes}
                  onChange={(e) => setPoForm({ ...poForm, notes: e.target.value })}
                  placeholder="Additional notes or instructions"
                  className="min-h-[60px]"
                />
              </div>

              {/* Items Section */}
              {poDialog.mode === 'create' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label className="text-sm font-medium">Items</Label>
                    <Badge variant="outline">
                      {poForm.items.length} item(s)
                    </Badge>
                  </div>

                  {/* Add Item Form */}
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm">Add Item</CardTitle>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-2 mb-2">
                        <Select 
                          value={itemForm.item} 
                          onValueChange={(value) => setItemForm({ ...itemForm, item: value })}
                        >
                          <SelectTrigger className="h-8">
                            <SelectValue placeholder="Select item" />
                          </SelectTrigger>
                          <SelectContent>
                            {items.map(item => (
                              <SelectItem key={item.id} value={item.id.toString()}>
                                {item.name} ({item.sku})
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>

                        <Input
                          type="number"
                          placeholder="Qty"
                          value={itemForm.quantity}
                          onChange={(e) => setItemForm({ ...itemForm, quantity: e.target.value })}
                          className="h-8"
                          min="1"
                        />

                        <Input
                          type="number"
                          placeholder="Unit Cost"
                          value={itemForm.unit_cost}
                          onChange={(e) => setItemForm({ ...itemForm, unit_cost: e.target.value })}
                          className="h-8"
                          min="0"
                          step="0.01"
                        />

                        <Button 
                          type="button" 
                          onClick={addItemToForm}
                          size="sm"
                          className="h-8"
                        >
                          <Plus className="h-3 w-3 mr-1" />
                          Add
                        </Button>
                      </div>

                      <Input
                        placeholder="Notes (optional)"
                        value={itemForm.notes}
                        onChange={(e) => setItemForm({ ...itemForm, notes: e.target.value })}
                        className="h-8"
                      />
                    </CardContent>
                  </Card>

                  {/* Items List */}
                  {poForm.items.length > 0 && (
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm">Order Items</CardTitle>
                      </CardHeader>
                      <CardContent className="pt-0">
                        <div className="space-y-2">
                          {poForm.items.map((item, index) => (
                            <div key={index} className="flex items-center justify-between p-2 border rounded">
                              <div className="flex-1">
                                <div className="text-sm font-medium">{item.item_name}</div>
                                <div className="text-xs text-muted-foreground">
                                  {item.quantity} × Ksh {parseFloat(item.unit_cost).toLocaleString()} = Ksh {parseFloat(item.total_amount).toLocaleString()}
                                </div>
                              </div>
                              <Button 
                                type="button"
                                size="sm"
                                variant="outline"
                                onClick={() => removeItemFromForm(index)}
                                className="h-7 px-2"
                              >
                                <Minus className="h-3 w-3" />
                              </Button>
                            </div>
                          ))}
                          
                          {/* Total */}
                          <div className="border-t pt-2 mt-2">
                            <div className="flex justify-between items-center">
                              <span className="font-medium text-sm">Total Amount:</span>
                              <span className="font-bold">
                                Ksh {calculatePOTotals(poForm.items).totalAmount}
                              </span>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {formErrors.items && <p className="text-xs text-destructive">{formErrors.items}</p>}
                </div>
              )}
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setPoDialog({ open: false, mode: 'create', purchaseOrder: null })}
              >
                Cancel
              </Button>
              <Button type="submit">
                {poDialog.mode === 'create' ? 'Create Purchase Order' : 'Update Purchase Order'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* View PO Dialog */}
      <Dialog open={viewDialog.open} onOpenChange={(open) => setViewDialog({ ...viewDialog, open })}>
        <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-lg">Purchase Order Details</DialogTitle>
            <DialogDescription className="text-sm">
              {viewDialog.purchaseOrder?.po_number}
            </DialogDescription>
          </DialogHeader>
          {viewDialog.purchaseOrder && (
            <div className="space-y-6">
              {/* Basic Information */}
              <div>
                <h3 className="text-sm font-medium mb-3">Order Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-xs font-medium text-muted-foreground">PO Number</Label>
                    <p className="text-sm font-semibold">{viewDialog.purchaseOrder.po_number}</p>
                  </div>
                  <div>
                    <Label className="text-xs font-medium text-muted-foreground">Status</Label>
                    <div className="mt-1">
                      {getStatusBadge(viewDialog.purchaseOrder.status)}
                    </div>
                  </div>
                  <div>
                    <Label className="text-xs font-medium text-muted-foreground">Supplier</Label>
                    <p className="text-sm">{viewDialog.purchaseOrder.supplier_name}</p>
                  </div>
                  <div>
                    <Label className="text-xs font-medium text-muted-foreground">Created By</Label>
                    <p className="text-sm">{viewDialog.purchaseOrder.created_by_name}</p>
                  </div>
                  <div>
                    <Label className="text-xs font-medium text-muted-foreground">Order Date</Label>
                    <p className="text-sm">
                      {new Date(viewDialog.purchaseOrder.order_date).toLocaleDateString()}
                    </p>
                  </div>
                  <div>
                    <Label className="text-xs font-medium text-muted-foreground">Expected Delivery</Label>
                    <p className="text-sm">
                      {viewDialog.purchaseOrder.expected_delivery_date 
                        ? new Date(viewDialog.purchaseOrder.expected_delivery_date).toLocaleDateString()
                        : 'Not specified'
                      }
                    </p>
                  </div>
                </div>
              </div>

              {/* Progress */}
              <div>
                <h3 className="text-sm font-medium mb-3">Delivery Progress</h3>
                <Card>
                  <CardContent className="pt-4">
                    <div className="flex items-center gap-4">
                      <div className="flex-1">
                        <div className="w-full bg-muted rounded-full h-3">
                          <div 
                            className="bg-primary h-3 rounded-full transition-all"
                            style={{ width: `${viewDialog.purchaseOrder.received_percentage || 0}%` }}
                          />
                        </div>
                      </div>
                      <div className="text-sm font-medium">
                        {Math.round(viewDialog.purchaseOrder.received_percentage || 0)}%
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">
                      {viewDialog.purchaseOrder.is_fully_received ? 'Fully received' : 'Pending delivery'}
                    </p>
                  </CardContent>
                </Card>
              </div>

              {/* Items */}
              <div>
                <h3 className="text-sm font-medium mb-3">Order Items</h3>
                {viewDialog.purchaseOrder.items && viewDialog.purchaseOrder.items.length > 0 ? (
                  <div className="border rounded-md">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Item</TableHead>
                          <TableHead>Ordered</TableHead>
                          <TableHead>Received</TableHead>
                          <TableHead>Unit Cost</TableHead>
                          <TableHead>Total</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {viewDialog.purchaseOrder.items.map((item, index) => (
                          <TableRow key={index}>
                            <TableCell>
                              <div className="text-sm font-medium">{item.item_name}</div>
                              <div className="text-xs text-muted-foreground">{item.item_sku}</div>
                            </TableCell>
                            <TableCell className="text-sm">{item.quantity}</TableCell>
                            <TableCell>
                              <div className="flex items-center gap-1">
                                <span className="text-sm">{item.received_quantity || 0}</span>
                                {item.received_quantity >= item.quantity ? (
                                  <Check className="h-3 w-3 text-green-600" />
                                ) : item.received_quantity > 0 ? (
                                  <AlertCircle className="h-3 w-3 text-yellow-600" />
                                ) : (
                                  <X className="h-3 w-3 text-red-600" />
                                )}
                              </div>
                            </TableCell>
                            <TableCell className="text-sm">
                              Ksh {parseFloat(item.unit_cost || 0).toLocaleString()}
                            </TableCell>
                            <TableCell className="text-sm font-medium">
                              Ksh {parseFloat(item.total_amount || 0).toLocaleString()}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                    <div className="border-t p-4">
                      <div className="flex justify-between items-center">
                        <span className="font-medium">Total Amount:</span>
                        <span className="font-bold text-lg">
                          Ksh {parseFloat(viewDialog.purchaseOrder.total_amount || 0).toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">No items in this purchase order</p>
                )}
              </div>

              {/* Notes */}
              {viewDialog.purchaseOrder.notes && (
                <div>
                  <h3 className="text-sm font-medium mb-3">Notes</h3>
                  <Card>
                    <CardContent className="pt-4">
                      <p className="text-sm whitespace-pre-wrap">{viewDialog.purchaseOrder.notes}</p>
                    </CardContent>
                  </Card>
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setViewDialog({ open: false, purchaseOrder: null })}
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Change Status Dialog */}
      <Dialog open={statusDialog.open} onOpenChange={(open) => setStatusDialog({ ...statusDialog, open })}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="text-lg">Change Purchase Order Status</DialogTitle>
            <DialogDescription className="text-sm">
              Update the status for {statusDialog.purchaseOrder?.po_number}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label className="text-sm">Current Status</Label>
              <div>
                {statusDialog.purchaseOrder && getStatusBadge(statusDialog.purchaseOrder.status)}
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-sm">Select New Status</Label>
              <div className="grid grid-cols-1 gap-2">
                {getPOStatusOptions().map(option => (
                  <Button
                    key={option.value}
                    variant="outline"
                    size="sm"
                    onClick={() => handleStatusChange(option.value)}
                    disabled={statusDialog.purchaseOrder?.status === option.value}
                    className="justify-start"
                  >
                    {option.label}
                  </Button>
                ))}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setStatusDialog({ open: false, purchaseOrder: null })}
            >
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Item Dialog */}
      <Dialog open={addItemDialog.open} onOpenChange={(open) => setAddItemDialog({ ...addItemDialog, open })}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="text-lg">Add Item to Purchase Order</DialogTitle>
            <DialogDescription className="text-sm">
              Add a new item to {addItemDialog.purchaseOrder?.po_number}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleAddItem}>
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="add_item" className="text-sm">Item *</Label>
                <Select 
                  value={itemForm.item} 
                  onValueChange={(value) => setItemForm({ ...itemForm, item: value })}
                >
                  <SelectTrigger className="h-9">
                    <SelectValue placeholder="Select item" />
                  </SelectTrigger>
                  <SelectContent>
                    {items.map(item => (
                      <SelectItem key={item.id} value={item.id.toString()}>
                        {item.name} ({item.sku})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {formErrors.item && <p className="text-xs text-destructive">{formErrors.item}</p>}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="add_quantity" className="text-sm">Quantity *</Label>
                  <Input
                    id="add_quantity"
                    type="number"
                    value={itemForm.quantity}
                    onChange={(e) => setItemForm({ ...itemForm, quantity: e.target.value })}
                    placeholder="Quantity"
                    className="h-9"
                    min="1"
                  />
                  {formErrors.quantity && <p className="text-xs text-destructive">{formErrors.quantity}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="add_unit_cost" className="text-sm">Unit Cost *</Label>
                  <Input
                    id="add_unit_cost"
                    type="number"
                    value={itemForm.unit_cost}
                    onChange={(e) => setItemForm({ ...itemForm, unit_cost: e.target.value })}
                    placeholder="Unit cost"
                    className="h-9"
                    min="0"
                    step="0.01"
                  />
                  {formErrors.unit_cost && <p className="text-xs text-destructive">{formErrors.unit_cost}</p>}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="add_notes" className="text-sm">Notes</Label>
                <Textarea
                  id="add_notes"
                  value={itemForm.notes}
                  onChange={(e) => setItemForm({ ...itemForm, notes: e.target.value })}
                  placeholder="Additional notes"
                  className="min-h-[60px]"
                />
              </div>

              {/* Preview */}
              {itemForm.item && itemForm.quantity && itemForm.unit_cost && (
                <Card>
                  <CardContent className="pt-4">
                    <div className="text-sm">
                      <div className="flex justify-between items-center">
                        <span>Total Amount:</span>
                        <span className="font-bold">
                          Ksh {(parseFloat(itemForm.quantity) * parseFloat(itemForm.unit_cost)).toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setAddItemDialog({ open: false, purchaseOrder: null })}
              >
                Cancel
              </Button>
              <Button type="submit">
                Add Item
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialog.open} onOpenChange={(open) => setDeleteDialog({ ...deleteDialog, open })}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="text-lg">Delete Purchase Order</DialogTitle>
            <DialogDescription className="text-sm">
              Are you sure you want to delete {deleteDialog.purchaseOrder?.po_number}? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteDialog({ open: false, purchaseOrder: null })}
            >
              Cancel
            </Button>
            <Button 
              variant="destructive"
              onClick={handleDeletePO}
            >
              Delete Purchase Order
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

