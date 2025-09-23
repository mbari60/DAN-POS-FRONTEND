// components/procurement/GoodsReceiptsManagement.js
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
  Package, 
  Plus, 
  Edit, 
  Trash2, 
  Search,
  RefreshCw,
  Eye,
  Calendar,
  CheckCircle,
  XCircle,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  Truck,
  FileText,
  DollarSign,
  User,
  Building,
  Hash,
  Minus,
  Check
} from 'lucide-react';
import { toast } from 'react-toastify';
import { 
  getGoodsReceipts,
  getGoodsReceipt,
  createGoodsReceipt,
  updateGoodsReceipt,
  deleteGoodsReceipt,
  markGoodsReceiptPaid,
  getSuppliers,
  getPurchaseOrders
} from '@/lib/api/procurement';
import { getStores, getItems } from '@/lib/api/inventory'; // Assuming these exist

export default function GoodsReceiptsManagement() {
  // State management
  const [loading, setLoading] = useState(true);
  const [goodsReceipts, setGoodsReceipts] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [purchaseOrders, setPurchaseOrders] = useState([]);
  const [stores, setStores] = useState([]);
  const [items, setItems] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [supplierFilter, setSupplierFilter] = useState('all');
  const [storeFilter, setStoreFilter] = useState('all');
  const [paidFilter, setPaidFilter] = useState('all');
  const [dateFromFilter, setDateFromFilter] = useState('');
  const [dateToFilter, setDateToFilter] = useState('');
  
  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  
  // Dialog states
  const [receiptDialog, setReceiptDialog] = useState({ 
    open: false, 
    mode: 'create', // 'create' or 'edit'
    receipt: null 
  });
  const [viewDialog, setViewDialog] = useState({ 
    open: false, 
    receipt: null
  });
  const [deleteDialog, setDeleteDialog] = useState({ 
    open: false, 
    receipt: null 
  });
  const [paymentDialog, setPaymentDialog] = useState({
    open: false,
    receipt: null
  });

  // Form states
  const [receiptForm, setReceiptForm] = useState({
    supplier: '',
    purchase_order: '',
    store: '',
    supplier_invoice_number: '',
    supplier_invoice_date: '',
    notes: '',
    items: []
  });

  const [itemForm, setItemForm] = useState({
    item: '',
    quantity_received: 1,
    unit_cost: '',
    expiry_date: '',
    batch_number: '',
    notes: ''
  });

  const [paymentForm, setPaymentForm] = useState({
    amount: ''
  });

  const [formErrors, setFormErrors] = useState({});

  // Load data
  const loadGoodsReceipts = async () => {
    try {
      setLoading(true);
      const params = {};
      if (supplierFilter !== 'all') params.supplier = supplierFilter;
      if (storeFilter !== 'all') params.store = storeFilter;
      if (paidFilter !== 'all') params.paid = paidFilter;
      if (dateFromFilter) params.date_from = dateFromFilter;
      if (dateToFilter) params.date_to = dateToFilter;

      const response = await getGoodsReceipts(params);
      setGoodsReceipts(response.data || []);
    } catch (error) {
      toast.error(error.message || 'Failed to load goods receipts');
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

  const loadPurchaseOrders = async () => {
    try {
      const response = await getPurchaseOrders();
      setPurchaseOrders(response.data || []);
    } catch (error) {
      console.error('Failed to load purchase orders:', error);
    }
  };

  const loadStores = async () => {
    try {
      const response = await getStores();
      setStores(response.data || []);
    } catch (error) {
      console.error('Failed to load stores:', error);
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
    loadGoodsReceipts();
    loadSuppliers();
    loadPurchaseOrders();
    loadStores();
    loadItems();
  }, [supplierFilter, storeFilter, paidFilter, dateFromFilter, dateToFilter]);

  // Load receipt details for view dialog
  const loadReceiptDetails = async (receipt) => {
    try {
      const detailedReceipt = await getGoodsReceipt(receipt.id);
      setViewDialog({ open: true, receipt: detailedReceipt });
    } catch (error) {
      toast.error(error.message || 'Failed to load receipt details');
    }
  };

  // Form handlers
  const handleReceiptSubmit = async (e) => {
    e.preventDefault();
    
    // Validation
    const errors = {};
    if (!receiptForm.supplier) errors.supplier = 'Supplier is required';
    if (!receiptForm.store) errors.store = 'Store is required';
    if (receiptForm.items.length === 0) errors.items = 'At least one item is required';

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    try {
      if (receiptDialog.mode === 'create') {
        await createGoodsReceipt(receiptForm);
        toast.success('Goods receipt created successfully');
      } else {
        const { items, ...updateData } = receiptForm;
        await updateGoodsReceipt(receiptDialog.receipt.id, updateData);
        toast.success('Goods receipt updated successfully');
      }
      
      setReceiptDialog({ open: false, mode: 'create', receipt: null });
      resetReceiptForm();
      loadGoodsReceipts();
    } catch (error) {
      toast.error(error.message || `Failed to ${receiptDialog.mode} goods receipt`);
    }
  };

  const handleDeleteReceipt = async () => {
    try {
      await deleteGoodsReceipt(deleteDialog.receipt.id);
      toast.success('Goods receipt deleted successfully');
      setDeleteDialog({ open: false, receipt: null });
      loadGoodsReceipts();
    } catch (error) {
      toast.error(error.message || 'Failed to delete goods receipt');
    }
  };

  const handleMarkPaid = async (e) => {
    e.preventDefault();
    
    try {
      const paymentAmount = paymentForm.amount ? parseFloat(paymentForm.amount) : null;
      await markGoodsReceiptPaid(paymentDialog.receipt.id, 
        paymentAmount ? { amount: paymentAmount } : {}
      );
      toast.success('Receipt marked as paid successfully');
      setPaymentDialog({ open: false, receipt: null });
      setPaymentForm({ amount: '' });
      loadGoodsReceipts();
    } catch (error) {
      toast.error(error.message || 'Failed to mark receipt as paid');
    }
  };

  const resetReceiptForm = () => {
    setReceiptForm({
      supplier: '',
      purchase_order: '',
      store: '',
      supplier_invoice_number: '',
      supplier_invoice_date: '',
      notes: '',
      items: []
    });
    setFormErrors({});
  };

  const resetItemForm = () => {
    setItemForm({
      item: '',
      quantity_received: 1,
      unit_cost: '',
      expiry_date: '',
      batch_number: '',
      notes: ''
    });
    setFormErrors({});
  };

  const openCreateDialog = () => {
    resetReceiptForm();
    setReceiptDialog({ open: true, mode: 'create', receipt: null });
  };

  const openEditDialog = (receipt) => {
    setReceiptForm({
      supplier: receipt.supplier?.toString() || '',
      purchase_order: receipt.purchase_order?.toString() || '',
      store: receipt.store?.toString() || '',
      supplier_invoice_number: receipt.supplier_invoice_number || '',
      supplier_invoice_date: receipt.supplier_invoice_date || '',
      notes: receipt.notes || '',
      items: receipt.items || []
    });
    setReceiptDialog({ open: true, mode: 'edit', receipt });
  };

  // Handle PO selection to auto-populate items
  const handlePOSelection = (poId) => {
    const selectedPO = purchaseOrders.find(po => po.id.toString() === poId);
    if (selectedPO) {
      setReceiptForm({
        ...receiptForm,
        purchase_order: poId,
        supplier: selectedPO.supplier?.toString() || '',
        items: selectedPO.items ? selectedPO.items.map(item => ({
          item: item.item,
          item_name: item.item_name,
          item_sku: item.item_sku,
          purchase_order_item: item.id,
          quantity_received: Math.min(item.remaining_quantity, item.quantity),
          unit_cost: item.unit_cost,
          expiry_date: '',
          batch_number: '',
          notes: ''
        })) : []
      });
    }
  };

  const addItemToForm = () => {
    if (!itemForm.item || !itemForm.quantity_received || !itemForm.unit_cost) {
      toast.error('Please fill all required item fields');
      return;
    }

    const selectedItem = items.find(item => item.id.toString() === itemForm.item);
    if (!selectedItem) return;

    const newItem = {
      item: parseInt(itemForm.item),
      item_name: selectedItem.name,
      item_sku: selectedItem.sku,
      quantity_received: parseInt(itemForm.quantity_received),
      unit_cost: parseFloat(itemForm.unit_cost),
      expiry_date: itemForm.expiry_date || null,
      batch_number: itemForm.batch_number,
      notes: itemForm.notes,
      total_cost: parseInt(itemForm.quantity_received) * parseFloat(itemForm.unit_cost)
    };

    // Check if item already exists
    const existingIndex = receiptForm.items.findIndex(item => item.item === newItem.item);
    if (existingIndex >= 0) {
      const updatedItems = [...receiptForm.items];
      updatedItems[existingIndex] = newItem;
      setReceiptForm({ ...receiptForm, items: updatedItems });
    } else {
      setReceiptForm({ ...receiptForm, items: [...receiptForm.items, newItem] });
    }

    resetItemForm();
  };

  const removeItemFromForm = (index) => {
    const updatedItems = receiptForm.items.filter((_, i) => i !== index);
    setReceiptForm({ ...receiptForm, items: updatedItems });
  };

  const updateItemInForm = (index, field, value) => {
    const updatedItems = [...receiptForm.items];
    updatedItems[index] = {
      ...updatedItems[index],
      [field]: value,
      total_cost: field === 'quantity_received' || field === 'unit_cost' 
        ? (field === 'quantity_received' ? parseInt(value) : updatedItems[index].quantity_received) * 
          (field === 'unit_cost' ? parseFloat(value) : updatedItems[index].unit_cost)
        : updatedItems[index].total_cost
    };
    setReceiptForm({ ...receiptForm, items: updatedItems });
  };

  // Filter functions
  const filteredReceipts = goodsReceipts.filter(receipt => {
    const matchesSearch = receipt.receipt_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         receipt.supplier_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         receipt.supplier_invoice_number?.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesSearch;
  });

  // Pagination functions
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentReceipts = filteredReceipts.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredReceipts.length / itemsPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  // Payment status badge styling
  const getPaymentBadge = (isPaid, outstandingAmount) => {
    if (isPaid) {
      return <Badge variant="default" className="bg-green-600">Paid</Badge>;
    } else if (outstandingAmount > 0) {
      return <Badge variant="destructive">Outstanding</Badge>;
    } else {
      return <Badge variant="secondary">Pending</Badge>;
    }
  };

  const PaginationControls = () => {
    const totalItems = filteredReceipts.length;
    const showingFrom = indexOfFirstItem + 1;
    const showingTo = Math.min(indexOfLastItem, totalItems);

    if (totalItems === 0) return null;

    return (
      <div className="flex items-center justify-between px-4 py-3 border-t">
        <div className="text-sm text-muted-foreground">
          Showing {showingFrom}-{showingTo} of {totalItems} receipts
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
  }, [searchTerm, supplierFilter, storeFilter, paidFilter, dateFromFilter, dateToFilter]);

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
          <h1 className="text-2xl font-bold tracking-tight">Goods Receipts Management</h1>
          <p className="text-sm text-muted-foreground">
            Record and manage deliveries from suppliers
          </p>
        </div>
        <div className="flex gap-2 mt-2 sm:mt-0">
          <Button onClick={openCreateDialog} size="sm">
            <Plus className="mr-2 h-4 w-4" />
            New Receipt
          </Button>
          <Button onClick={loadGoodsReceipts} variant="outline" size="sm">
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-3">
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search receipts..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8 h-9"
              />
            </div>
            
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

            <Select value={storeFilter} onValueChange={setStoreFilter}>
              <SelectTrigger className="h-9">
                <SelectValue placeholder="All Stores" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Stores</SelectItem>
                {stores.map(store => (
                  <SelectItem key={store.id} value={store.id.toString()}>
                    {store.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={paidFilter} onValueChange={setPaidFilter}>
              <SelectTrigger className="h-9">
                <SelectValue placeholder="Payment Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="true">Paid</SelectItem>
                <SelectItem value="false">Unpaid</SelectItem>
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

      {/* Goods Receipts Table */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Goods Receipts List</CardTitle>
          <CardDescription className="text-sm">
            {filteredReceipts.length} receipt(s) found
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-0 p-0">
          <div className="border rounded-md overflow-hidden">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead className="font-semibold">Receipt #</TableHead>
                    <TableHead className="font-semibold">Supplier</TableHead>
                    <TableHead className="font-semibold">Store</TableHead>
                    <TableHead className="font-semibold">Date</TableHead>
                    <TableHead className="font-semibold">Invoice #</TableHead>
                    <TableHead className="font-semibold">Amount</TableHead>
                    <TableHead className="font-semibold">Payment Status</TableHead>
                    <TableHead className="font-semibold text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {currentReceipts.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-6">
                        <div className="flex flex-col items-center gap-2">
                          <Package className="h-6 w-6 text-muted-foreground" />
                          <p className="text-sm text-muted-foreground">No goods receipts found</p>
                          {searchTerm || supplierFilter !== 'all' || storeFilter !== 'all' || paidFilter !== 'all' ? (
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => {
                                setSearchTerm('');
                                setSupplierFilter('all');
                                setStoreFilter('all');
                                setPaidFilter('all');
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
                    currentReceipts.map((receipt) => (
                      <TableRow key={receipt.id} className="hover:bg-muted/30">
                        <TableCell>
                          <div className="font-medium text-sm">{receipt.receipt_number}</div>
                          <div className="text-xs text-muted-foreground">
                            {new Date(receipt.receipt_date).toLocaleDateString()}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">{receipt.supplier_name}</div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">{receipt.store_name}</div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            {new Date(receipt.receipt_date).toLocaleDateString()}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">{receipt.supplier_invoice_number || 'N/A'}</div>
                          {receipt.supplier_invoice_date && (
                            <div className="text-xs text-muted-foreground">
                              {new Date(receipt.supplier_invoice_date).toLocaleDateString()}
                            </div>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="text-sm font-medium">
                            Ksh {parseFloat(receipt.total_amount || 0).toLocaleString()}
                          </div>
                          {!receipt.is_paid && receipt.outstanding_amount > 0 && (
                            <div className="text-xs text-destructive">
                              Outstanding: Ksh {parseFloat(receipt.outstanding_amount).toLocaleString()}
                            </div>
                          )}
                        </TableCell>
                        <TableCell>
                          {getPaymentBadge(receipt.is_paid, receipt.outstanding_amount)}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-1">
                            <Button 
                              onClick={() => loadReceiptDetails(receipt)}
                              size="sm" 
                              variant="outline"
                              className="h-7 px-2"
                            >
                              <Eye className="h-3 w-3" />
                            </Button>
                            <Button 
                              onClick={() => openEditDialog(receipt)}
                              size="sm" 
                              variant="outline"
                              className="h-7 px-2"
                            >
                              <Edit className="h-3 w-3" />
                            </Button>
                            {!receipt.is_paid && (
                              <Button 
                                onClick={() => setPaymentDialog({ open: true, receipt })}
                                size="sm" 
                                variant="outline"
                                className="h-7 px-2 text-green-600 hover:text-green-700"
                              >
                                <CheckCircle className="h-3 w-3" />
                              </Button>
                            )}
                            <Button 
                              onClick={() => setDeleteDialog({ open: true, receipt })}
                              size="sm" 
                              variant="outline"
                              className="h-7 px-2 text-destructive hover:text-destructive"
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
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

      {/* Create/Edit Receipt Dialog */}
      <Dialog open={receiptDialog.open} onOpenChange={(open) => setReceiptDialog({ ...receiptDialog, open })}>
        <DialogContent className="sm:max-w-[900px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-lg">
              {receiptDialog.mode === 'create' ? 'Create New Goods Receipt' : 'Edit Goods Receipt'}
            </DialogTitle>
            <DialogDescription className="text-sm">
              {receiptDialog.mode === 'create' 
                ? 'Record a new delivery from supplier'
                : `Update details for ${receiptDialog.receipt?.receipt_number}`
              }
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleReceiptSubmit}>
            <div className="grid gap-4 py-4">
              {/* Basic Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="supplier" className="text-sm">Supplier *</Label>
                  <Select 
                    value={receiptForm.supplier} 
                    onValueChange={(value) => setReceiptForm({ ...receiptForm, supplier: value })}
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
                  <Label htmlFor="store" className="text-sm">Store *</Label>
                  <Select 
                    value={receiptForm.store} 
                    onValueChange={(value) => setReceiptForm({ ...receiptForm, store: value })}
                  >
                    <SelectTrigger className="h-9">
                      <SelectValue placeholder="Select store" />
                    </SelectTrigger>
                    <SelectContent>
                      {stores.map(store => (
                        <SelectItem key={store.id} value={store.id.toString()}>
                          {store.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {formErrors.store && <p className="text-xs text-destructive">{formErrors.store}</p>}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="purchase_order" className="text-sm">Purchase Order (Optional)</Label>
                  <Select 
                    value={receiptForm.purchase_order} 
                    onValueChange={handlePOSelection}
                  >
                    <SelectTrigger className="h-9">
                      <SelectValue placeholder="Select purchase order" />
                    </SelectTrigger>
                    <SelectContent>
                      {purchaseOrders
                        .filter(po => !receiptForm.supplier || po.supplier.toString() === receiptForm.supplier)
                        .map(po => (
                        <SelectItem key={po.id} value={po.id.toString()}>
                          {po.po_number} - {po.supplier_name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="supplier_invoice_number" className="text-sm">Supplier Invoice Number</Label>
                  <Input
                    id="supplier_invoice_number"
                    value={receiptForm.supplier_invoice_number}
                    onChange={(e) => setReceiptForm({ ...receiptForm, supplier_invoice_number: e.target.value })}
                    placeholder="Invoice number from supplier"
                    className="h-9"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="supplier_invoice_date" className="text-sm">Supplier Invoice Date</Label>
                  <Input
                    id="supplier_invoice_date"
                    type="date"
                    value={receiptForm.supplier_invoice_date}
                    onChange={(e) => setReceiptForm({ ...receiptForm, supplier_invoice_date: e.target.value })}
                    className="h-9"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="notes" className="text-sm">Notes</Label>
                  <Textarea
                    id="notes"
                    value={receiptForm.notes}
                    onChange={(e) => setReceiptForm({ ...receiptForm, notes: e.target.value })}
                    placeholder="Additional notes or observations"
                    className="min-h-[60px]"
                  />
                </div>
              </div>

              {/* Items Section */}
              {receiptDialog.mode === 'create' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label className="text-sm font-medium">Received Items</Label>
                    <Badge variant="outline">
                      {receiptForm.items.length} item(s)
                    </Badge>
                  </div>

                  {/* Add Item Form */}
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm">Add Received Item</CardTitle>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2 mb-2">
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
                          placeholder="Qty Received"
                          value={itemForm.quantity_received}
                          onChange={(e) => setItemForm({ ...itemForm, quantity_received: e.target.value })}
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

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                        <Input
                          type="date"
                          placeholder="Expiry Date"
                          value={itemForm.expiry_date}
                          onChange={(e) => setItemForm({ ...itemForm, expiry_date: e.target.value })}
                          className="h-8"
                        />

                        <Input
                          placeholder="Batch Number"
                          value={itemForm.batch_number}
                          onChange={(e) => setItemForm({ ...itemForm, batch_number: e.target.value })}
                          className="h-8"
                        />

                        <Input
                          placeholder="Item Notes"
                          value={itemForm.notes}
                          onChange={(e) => setItemForm({ ...itemForm, notes: e.target.value })}
                          className="h-8"
                        />
                      </div>
                    </CardContent>
                  </Card>

                  {/* Items List */}
                  {receiptForm.items.length > 0 && (
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm">Received Items List</CardTitle>
                      </CardHeader>
                      <CardContent className="pt-0">
                        <div className="space-y-2">
                          {receiptForm.items.map((item, index) => (
                            <div key={index} className="border rounded-lg p-3">
                              <div className="flex items-start justify-between">
                                <div className="flex-1">
                                  <div className="font-medium text-sm">{item.item_name}</div>
                                  <div className="text-xs text-muted-foreground mb-2">
                                    SKU: {item.item_sku}
                                  </div>
                                  
                                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                                    <div>
                                      <Label className="text-xs">Quantity</Label>
                                      <Input
                                        type="number"
                                        value={item.quantity_received}
                                        onChange={(e) => updateItemInForm(index, 'quantity_received', e.target.value)}
                                        className="h-7 text-xs"
                                        min="1"
                                      />
                                    </div>
                                    
                                    <div>
                                      <Label className="text-xs">Unit Cost</Label>
                                      <Input
                                        type="number"
                                        value={item.unit_cost}
                                        onChange={(e) => updateItemInForm(index, 'unit_cost', e.target.value)}
                                        className="h-7 text-xs"
                                        min="0"
                                        step="0.01"
                                      />
                                    </div>
                                    
                                    <div>
                                      <Label className="text-xs">Expiry Date</Label>
                                      <Input
                                        type="date"
                                        value={item.expiry_date || ''}
                                        onChange={(e) => updateItemInForm(index, 'expiry_date', e.target.value)}
                                        className="h-7 text-xs"
                                      />
                                    </div>
                                    
                                    <div>
                                      <Label className="text-xs">Batch #</Label>
                                      <Input
                                        value={item.batch_number || ''}
                                        onChange={(e) => updateItemInForm(index, 'batch_number', e.target.value)}
                                        className="h-7 text-xs"
                                      />
                                    </div>
                                  </div>
                                  
                                  <div className="mt-2 flex justify-between items-center">
                                    <div className="text-xs text-muted-foreground">
                                      Total: Ksh {parseFloat(item.total_cost || 0).toLocaleString()}
                                    </div>
                                  </div>
                                </div>
                                
                                <Button 
                                  type="button"
                                  size="sm"
                                  variant="outline"
                                  onClick={() => removeItemFromForm(index)}
                                  className="h-7 px-2 ml-2"
                                >
                                  <Minus className="h-3 w-3" />
                                </Button>
                              </div>
                            </div>
                          ))}
                          
                          {/* Total */}
                          <div className="border-t pt-3 mt-3">
                            <div className="flex justify-between items-center">
                              <span className="font-medium">Grand Total:</span>
                              <span className="font-bold text-lg">
                                Ksh {receiptForm.items.reduce((sum, item) => sum + parseFloat(item.total_cost || 0), 0).toLocaleString()}
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
                onClick={() => setReceiptDialog({ open: false, mode: 'create', receipt: null })}
              >
                Cancel
              </Button>
              <Button type="submit">
                {receiptDialog.mode === 'create' ? 'Create Receipt' : 'Update Receipt'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* View Receipt Dialog */}
      <Dialog open={viewDialog.open} onOpenChange={(open) => setViewDialog({ ...viewDialog, open })}>
        <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-lg">Goods Receipt Details</DialogTitle>
            <DialogDescription className="text-sm">
              {viewDialog.receipt?.receipt_number}
            </DialogDescription>
          </DialogHeader>
          {viewDialog.receipt && (
            <div className="space-y-6">
              {/* Basic Information */}
              <div>
                <h3 className="text-sm font-medium mb-3">Receipt Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-xs font-medium text-muted-foreground">Receipt Number</Label>
                    <p className="text-sm font-semibold">{viewDialog.receipt.receipt_number}</p>
                  </div>
                  <div>
                    <Label className="text-xs font-medium text-muted-foreground">Receipt Date</Label>
                    <p className="text-sm">
                      {new Date(viewDialog.receipt.receipt_date).toLocaleDateString()}
                    </p>
                  </div>
                  <div>
                    <Label className="text-xs font-medium text-muted-foreground">Supplier</Label>
                    <p className="text-sm">{viewDialog.receipt.supplier_name}</p>
                  </div>
                  <div>
                    <Label className="text-xs font-medium text-muted-foreground">Store</Label>
                    <p className="text-sm">{viewDialog.receipt.store_name}</p>
                  </div>
                  <div>
                    <Label className="text-xs font-medium text-muted-foreground">Received By</Label>
                    <p className="text-sm">{viewDialog.receipt.received_by_name}</p>
                  </div>
                  <div>
                    <Label className="text-xs font-medium text-muted-foreground">Payment Status</Label>
                    <div className="mt-1">
                      {getPaymentBadge(viewDialog.receipt.is_paid, viewDialog.receipt.outstanding_amount)}
                    </div>
                  </div>
                </div>
              </div>

              {/* Invoice Information */}
              {(viewDialog.receipt.supplier_invoice_number || viewDialog.receipt.supplier_invoice_date) && (
                <div>
                  <h3 className="text-sm font-medium mb-3">Supplier Invoice</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label className="text-xs font-medium text-muted-foreground">Invoice Number</Label>
                      <p className="text-sm">{viewDialog.receipt.supplier_invoice_number || 'N/A'}</p>
                    </div>
                    <div>
                      <Label className="text-xs font-medium text-muted-foreground">Invoice Date</Label>
                      <p className="text-sm">
                        {viewDialog.receipt.supplier_invoice_date 
                          ? new Date(viewDialog.receipt.supplier_invoice_date).toLocaleDateString()
                          : 'N/A'
                        }
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Financial Summary */}
              <div>
                <h3 className="text-sm font-medium mb-3">Financial Summary</h3>
                <Card>
                  <CardContent className="pt-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <Label className="text-xs font-medium text-muted-foreground">Total Amount</Label>
                        <p className="text-lg font-bold">
                          Ksh {parseFloat(viewDialog.receipt.total_amount || 0).toLocaleString()}
                        </p>
                      </div>
                      <div>
                        <Label className="text-xs font-medium text-muted-foreground">Outstanding Amount</Label>
                        <p className="text-lg font-bold text-destructive">
                          Ksh {parseFloat(viewDialog.receipt.outstanding_amount || 0).toLocaleString()}
                        </p>
                      </div>
                      <div>
                        <Label className="text-xs font-medium text-muted-foreground">Payment Status</Label>
                        <div className="mt-2">
                          {getPaymentBadge(viewDialog.receipt.is_paid, viewDialog.receipt.outstanding_amount)}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Items */}
              <div>
                <h3 className="text-sm font-medium mb-3">Received Items</h3>
                {viewDialog.receipt.items && viewDialog.receipt.items.length > 0 ? (
                  <div className="border rounded-md">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Item</TableHead>
                          <TableHead>Quantity</TableHead>
                          <TableHead>Unit Cost</TableHead>
                          <TableHead>Total</TableHead>
                          <TableHead>Batch/Expiry</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {viewDialog.receipt.items.map((item, index) => (
                          <TableRow key={index}>
                            <TableCell>
                              <div className="text-sm font-medium">{item.item_name}</div>
                              <div className="text-xs text-muted-foreground">{item.item_sku}</div>
                            </TableCell>
                            <TableCell className="text-sm">{item.quantity_received}</TableCell>
                            <TableCell className="text-sm">
                              Ksh {parseFloat(item.unit_cost || 0).toLocaleString()}
                            </TableCell>
                            <TableCell className="text-sm font-medium">
                              Ksh {parseFloat(item.total_cost || 0).toLocaleString()}
                            </TableCell>
                            <TableCell>
                              <div className="text-xs">
                                {item.batch_number && (
                                  <div>Batch: {item.batch_number}</div>
                                )}
                                {item.expiry_date && (
                                  <div>Exp: {new Date(item.expiry_date).toLocaleDateString()}</div>
                                )}
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                    <div className="border-t p-4">
                      <div className="flex justify-between items-center">
                        <span className="font-medium">Total Amount:</span>
                        <span className="font-bold text-lg">
                          Ksh {parseFloat(viewDialog.receipt.total_amount || 0).toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">No items in this receipt</p>
                )}
              </div>

              {/* Notes */}
              {viewDialog.receipt.notes && (
                <div>
                  <h3 className="text-sm font-medium mb-3">Notes</h3>
                  <Card>
                    <CardContent className="pt-4">
                      <p className="text-sm whitespace-pre-wrap">{viewDialog.receipt.notes}</p>
                    </CardContent>
                  </Card>
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setViewDialog({ open: false, receipt: null })}
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Payment Dialog */}
      <Dialog open={paymentDialog.open} onOpenChange={(open) => setPaymentDialog({ ...paymentDialog, open })}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="text-lg">Mark Receipt as Paid</DialogTitle>
            <DialogDescription className="text-sm">
              Update payment status for {paymentDialog.receipt?.receipt_number}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleMarkPaid}>
            <div className="space-y-4 py-4">
              {paymentDialog.receipt && (
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Total Amount:</span>
                    <span className="font-bold">
                      Ksh {parseFloat(paymentDialog.receipt.total_amount || 0).toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Outstanding:</span>
                    <span className="font-bold text-destructive">
                      Ksh {parseFloat(paymentDialog.receipt.outstanding_amount || 0).toLocaleString()}
                    </span>
                  </div>
                </div>
              )}
              
              <div className="space-y-2">
                <Label htmlFor="payment_amount" className="text-sm">
                  Payment Amount (Leave empty for full payment)
                </Label>
                <Input
                  id="payment_amount"
                  type="number"
                  value={paymentForm.amount}
                  onChange={(e) => setPaymentForm({ amount: e.target.value })}
                  placeholder="Enter payment amount"
                  className="h-9"
                  min="0"
                  step="0.01"
                />
                <p className="text-xs text-muted-foreground">
                  If left empty, the full outstanding amount will be marked as paid.
                </p>
              </div>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setPaymentDialog({ open: false, receipt: null })}
              >
                Cancel
              </Button>
              <Button type="submit" className="bg-green-600 hover:bg-green-700">
                <Check className="mr-2 h-4 w-4" />
                Mark as Paid
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialog.open} onOpenChange={(open) => setDeleteDialog({ ...deleteDialog, open })}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="text-lg">Delete Goods Receipt</DialogTitle>
            <DialogDescription className="text-sm">
              Are you sure you want to delete {deleteDialog.receipt?.receipt_number}? This action cannot be undone and will affect inventory levels.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteDialog({ open: false, receipt: null })}
            >
              Cancel
            </Button>
            <Button 
              variant="destructive"
              onClick={handleDeleteReceipt}
            >
              Delete Receipt
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
