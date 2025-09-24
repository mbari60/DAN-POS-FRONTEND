// app/procurement/payments/page.jsx
"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
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
  Search, 
  Plus, 
  RefreshCw, 
  CreditCard, 
  Eye,
  Filter,
  DollarSign,
  Calendar,
  User
} from 'lucide-react';
import { toast } from 'react-toastify';
import { 
  getSupplierPayments, 
  getSupplierPayment,
  createSupplierPayment,
  updateSupplierPayment,
  deleteSupplierPayment,
  getSuppliers 
} from '@/lib/api/procurement';

export default function SupplierPaymentsManagement() {
  // State management
  const [loading, setLoading] = useState(true);
  const [payments, setPayments] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [supplierFilter, setSupplierFilter] = useState('all');
  
  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(5);
  
  // Dialog states
  const [paymentDialog, setPaymentDialog] = useState({ 
    open: false, 
    mode: 'create', // 'create' or 'edit'
    payment: null 
  });
  const [viewDialog, setViewDialog] = useState({ 
    open: false, 
    payment: null 
  });
  const [deleteDialog, setDeleteDialog] = useState({ 
    open: false, 
    payment: null 
  });

  // Form state
  const [paymentForm, setPaymentForm] = useState({
    supplier: '',
    amount: '',
    payment_method: 'bank_transfer',
    reference_number: '',
    notes: '',
    auto_allocate: true
  });

  const [formErrors, setFormErrors] = useState({});

  // Load data
  const loadData = async () => {
    try {
      setLoading(true);
      const [paymentsResponse, suppliersResponse] = await Promise.all([
        getSupplierPayments(),
        getSuppliers()
      ]);
      
      setPayments(paymentsResponse.data || []);
      setSuppliers(suppliersResponse.data || []);
    } catch (error) {
      toast.error(error.message || 'Failed to load data');
      // Simple data fallback
      setPayments([
        {
          id: 1,
          payment_number: 'PAY-000001',
          supplier_name: 'Office Supplies Ltd',
          supplier_id: 1,
          amount: '1250.00',
          payment_date: '2024-01-20T10:30:00Z',
          payment_method: 'bank_transfer',
          reference_number: 'REF123456',
          notes: 'Payment for January invoice',
          created_by_name: 'John Doe'
        },
        {
          id: 2,
          payment_number: 'PAY-000002',
          supplier_name: 'Tech Solutions',
          supplier_id: 2,
          amount: '4500.00',
          payment_date: '2024-01-15T14:20:00Z',
          payment_method: 'mobile_money',
          reference_number: 'MM789012',
          notes: 'Mobile money payment',
          created_by_name: 'Jane Smith'
        },
        {
          id: 3,
          payment_number: 'PAY-000003',
          supplier_name: 'Clean Pro',
          supplier_id: 3,
          amount: '3200.00',
          payment_date: '2024-01-10T09:15:00Z',
          payment_method: 'bank_transfer',
          reference_number: 'REF654321',
          notes: '',
          created_by_name: 'Mike Johnson'
        }
      ]);
      
      setSuppliers([
        { id: 1, name: 'Office Supplies Ltd', total_debt: 1250.00 },
        { id: 2, name: 'Tech Solutions', total_debt: 4500.00 },
        { id: 3, name: 'Clean Pro', total_debt: 3200.00 },
        { id: 4, name: 'Coffee Direct', total_debt: 0.00 }
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Form handlers
  const handlePaymentSubmit = async (e) => {
    e.preventDefault();
    
    // Validation
    const errors = {};
    if (!paymentForm.supplier) errors.supplier = 'Supplier is required';
    if (!paymentForm.amount || parseFloat(paymentForm.amount) <= 0) {
      errors.amount = 'Valid amount is required';
    }
    if (!paymentForm.payment_method) errors.payment_method = 'Payment method is required';

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    try {
      if (paymentDialog.mode === 'create') {
        await createSupplierPayment(paymentForm);
        toast.success('Payment created successfully');
      } else {
        await updateSupplierPayment(paymentDialog.payment.id, paymentForm);
        toast.success('Payment updated successfully');
      }
      
      setPaymentDialog({ open: false, mode: 'create', payment: null });
      resetPaymentForm();
      loadData();
    } catch (error) {
      toast.error(error.message || `Failed to ${paymentDialog.mode} payment`);
    }
  };

  const handleDeletePayment = async () => {
    try {
      await deleteSupplierPayment(deleteDialog.payment.id);
      toast.success('Payment deleted successfully');
      setDeleteDialog({ open: false, payment: null });
      loadData();
    } catch (error) {
      toast.error(error.message || 'Failed to delete payment');
    }
  };

  const resetPaymentForm = () => {
    setPaymentForm({
      supplier: '',
      amount: '',
      payment_method: 'bank_transfer',
      reference_number: '',
      notes: '',
      auto_allocate: true
    });
    setFormErrors({});
  };

  const openCreateDialog = () => {
    resetPaymentForm();
    setPaymentDialog({ open: true, mode: 'create', payment: null });
  };

  const openEditDialog = (payment) => {
    setPaymentForm({
      supplier: payment.supplier_id.toString(),
      amount: payment.amount,
      payment_method: payment.payment_method,
      reference_number: payment.reference_number || '',
      notes: payment.notes || '',
      auto_allocate: true
    });
    setPaymentDialog({ open: true, mode: 'edit', payment });
  };

  // Filter functions
  const filteredPayments = payments.filter(payment => {
    const matchesSearch = payment.payment_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         payment.supplier_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         payment.reference_number?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesSupplier = supplierFilter === 'all' || 
                           payment.supplier_id?.toString() === supplierFilter;
    
    return matchesSearch && matchesSupplier;
  });

  // Pagination functions
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentPayments = filteredPayments.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredPayments.length / itemsPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const PaginationControls = () => {
    const totalItems = filteredPayments.length;
    const showingFrom = indexOfFirstItem + 1;
    const showingTo = Math.min(indexOfLastItem, totalItems);

    if (totalItems === 0) return null;

    return (
      <div className="flex items-center justify-between px-4 py-3 border-t">
        <div className="text-sm text-muted-foreground">
          Showing {showingFrom}-{showingTo} of {totalItems} payments
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => paginate(currentPage - 1)}
            disabled={currentPage === 1}
          >
            ←
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
            →
          </Button>
        </div>
      </div>
    );
  };

  // Helper functions
  const getPaymentMethodDisplay = (method) => {
    const methods = {
      'bank_transfer': 'Bank Transfer',
      'mobile_money': 'Mobile Money',
      'cash': 'Cash',
      'check': 'Check',
      'credit_card': 'Credit Card'
    };
    return methods[method] || method;
  };

  const getPaymentMethodBadge = (method) => {
    const variants = {
      'bank_transfer': 'default',
      'mobile_money': 'secondary',
      'cash': 'outline',
      'check': 'outline',
      'credit_card': 'default'
    };
    return variants[method] || 'outline';
  };

  // Reset pagination when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, supplierFilter]);

  // Loading skeleton
  if (loading) {
    return (
      <div className="w-full space-y-4">
        <div className="flex items-center justify-between">
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
    <div className="w-full space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Supplier Payments</h1>
          <p className="text-sm text-muted-foreground">
            Manage supplier payments and track payment history
          </p>
        </div>
        <div className="flex gap-2 mt-2 sm:mt-0">
          <Button onClick={openCreateDialog} size="sm">
            <Plus className="mr-2 h-4 w-4" />
            New Payment
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
                placeholder="Search by payment number, supplier, or reference..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8 h-9"
              />
            </div>
            <Select value={supplierFilter} onValueChange={setSupplierFilter}>
              <SelectTrigger className="w-full sm:w-[200px] h-9">
                <SelectValue placeholder="Filter by supplier" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Suppliers</SelectItem>
                {suppliers.map((supplier) => (
                  <SelectItem key={supplier.id} value={supplier.id.toString()}>
                    {supplier.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Payments Table */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Payment History</CardTitle>
          <CardDescription className="text-sm">
            {filteredPayments.length} payment(s) found
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-0 p-0">
          <div className="border rounded-md overflow-hidden">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead className="font-semibold">Payment Number</TableHead>
                    <TableHead className="font-semibold">Supplier</TableHead>
                    <TableHead className="font-semibold hidden md:table-cell">Payment Date</TableHead>
                    <TableHead className="font-semibold">Amount</TableHead>
                    <TableHead className="font-semibold hidden sm:table-cell">Method</TableHead>
                    <TableHead className="font-semibold hidden lg:table-cell">Reference</TableHead>
                    <TableHead className="font-semibold text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {currentPayments.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-6">
                        <div className="flex flex-col items-center gap-2">
                          <CreditCard className="h-8 w-8 text-muted-foreground" />
                          <p className="text-sm text-muted-foreground">No payments found</p>
                          {(searchTerm || supplierFilter !== 'all') && (
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => {
                                setSearchTerm('');
                                setSupplierFilter('all');
                              }}
                            >
                              Clear filters
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : (
                    currentPayments.map((payment) => (
                      <TableRow key={payment.id} className="hover:bg-muted/30">
                        <TableCell>
                          <div className="font-medium text-sm">{payment.payment_number}</div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">{payment.supplier_name}</div>
                        </TableCell>
                        <TableCell className="hidden md:table-cell">
                          <div className="flex items-center gap-1 text-sm text-muted-foreground">
                            <Calendar className="h-3 w-3" />
                            {new Date(payment.payment_date).toLocaleDateString()}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1 font-semibold">
                            <DollarSign className="h-3 w-3" />
                            Ksh {parseFloat(payment.amount).toLocaleString()}
                          </div>
                        </TableCell>
                        <TableCell className="hidden sm:table-cell">
                          <Badge variant={getPaymentMethodBadge(payment.payment_method)} className="text-xs">
                            {getPaymentMethodDisplay(payment.payment_method)}
                          </Badge>
                        </TableCell>
                        <TableCell className="hidden lg:table-cell">
                          <code className="text-xs bg-muted px-1.5 py-0.5 rounded">
                            {payment.reference_number || 'N/A'}
                          </code>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-1">
                            <Button 
                              onClick={() => setViewDialog({ open: true, payment })}
                              size="sm" 
                              variant="outline"
                              className="h-7 px-2"
                            >
                              <Eye className="h-3 w-3" />
                            </Button>
                            <Button 
                              onClick={() => openEditDialog(payment)}
                              size="sm" 
                              variant="outline"
                              className="h-7 px-2"
                            >
                              Edit
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

      {/* Create/Edit Payment Dialog */}
      <Dialog open={paymentDialog.open} onOpenChange={(open) => setPaymentDialog({ ...paymentDialog, open })}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="text-lg">
              {paymentDialog.mode === 'create' ? 'Create New Payment' : 'Edit Payment'}
            </DialogTitle>
            <DialogDescription className="text-sm">
              {paymentDialog.mode === 'create' 
                ? 'Record a new payment to a supplier'
                : `Update payment details for ${paymentDialog.payment?.payment_number}`
              }
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handlePaymentSubmit}>
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="supplier" className="text-sm">Supplier *</Label>
                <Select 
                  value={paymentForm.supplier} 
                  onValueChange={(value) => setPaymentForm({ ...paymentForm, supplier: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select supplier" />
                  </SelectTrigger>
                  <SelectContent>
                    {suppliers.map((supplier) => (
                      <SelectItem key={supplier.id} value={supplier.id.toString()}>
                        {supplier.name} {supplier.total_debt > 0 && `(Ksh ${supplier.total_debt.toLocaleString()})`}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {formErrors.supplier && <p className="text-xs text-destructive">{formErrors.supplier}</p>}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="amount" className="text-sm">Amount *</Label>
                  <Input
                    id="amount"
                    type="number"
                    step="0.01"
                    value={paymentForm.amount}
                    onChange={(e) => setPaymentForm({ ...paymentForm, amount: e.target.value })}
                    placeholder="0.00"
                    className="h-9"
                  />
                  {formErrors.amount && <p className="text-xs text-destructive">{formErrors.amount}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="payment_method" className="text-sm">Payment Method *</Label>
                  <Select 
                    value={paymentForm.payment_method} 
                    onValueChange={(value) => setPaymentForm({ ...paymentForm, payment_method: value })}
                  >
                    <SelectTrigger className="h-9">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                      <SelectItem value="mobile_money">Mobile Money</SelectItem>
                      <SelectItem value="cash">Cash</SelectItem>
                      <SelectItem value="check">Check</SelectItem>
                      <SelectItem value="credit_card">Credit Card</SelectItem>
                    </SelectContent>
                  </Select>
                  {formErrors.payment_method && <p className="text-xs text-destructive">{formErrors.payment_method}</p>}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="reference_number" className="text-sm">Reference Number</Label>
                <Input
                  id="reference_number"
                  value={paymentForm.reference_number}
                  onChange={(e) => setPaymentForm({ ...paymentForm, reference_number: e.target.value })}
                  placeholder="Transaction reference or check number"
                  className="h-9"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes" className="text-sm">Notes</Label>
                <Textarea
                  id="notes"
                  value={paymentForm.notes}
                  onChange={(e) => setPaymentForm({ ...paymentForm, notes: e.target.value })}
                  placeholder="Optional payment notes"
                  className="min-h-[60px]"
                />
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="auto_allocate"
                  checked={paymentForm.auto_allocate}
                  onChange={(e) => setPaymentForm({ ...paymentForm, auto_allocate: e.target.checked })}
                  className="rounded border-gray-300"
                />
                <Label htmlFor="auto_allocate" className="text-sm">
                  Automatically allocate to unpaid receipts
                </Label>
              </div>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setPaymentDialog({ open: false, mode: 'create', payment: null })}
              >
                Cancel
              </Button>
              <Button type="submit">
                {paymentDialog.mode === 'create' ? 'Create Payment' : 'Update Payment'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* View Payment Details Dialog */}
      <Dialog open={viewDialog.open} onOpenChange={(open) => setViewDialog({ ...viewDialog, open })}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="text-lg">Payment Details</DialogTitle>
            <DialogDescription className="text-sm">
              {viewDialog.payment?.payment_number}
            </DialogDescription>
          </DialogHeader>
          {viewDialog.payment && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-xs font-medium text-muted-foreground">Payment Number</Label>
                  <p className="text-sm font-semibold">{viewDialog.payment.payment_number}</p>
                </div>
                <div>
                  <Label className="text-xs font-medium text-muted-foreground">Payment Date</Label>
                  <p className="text-sm">{new Date(viewDialog.payment.payment_date).toLocaleDateString()}</p>
                </div>
              </div>

              <div>
                <Label className="text-xs font-medium text-muted-foreground">Supplier</Label>
                <p className="text-sm font-semibold">{viewDialog.payment.supplier_name}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-xs font-medium text-muted-foreground">Amount</Label>
                  <p className="text-lg font-bold text-green-600">
                    Ksh {parseFloat(viewDialog.payment.amount).toLocaleString()}
                  </p>
                </div>
                <div>
                  <Label className="text-xs font-medium text-muted-foreground">Payment Method</Label>
                  <Badge variant={getPaymentMethodBadge(viewDialog.payment.payment_method)}>
                    {getPaymentMethodDisplay(viewDialog.payment.payment_method)}
                  </Badge>
                </div>
              </div>

              {viewDialog.payment.reference_number && (
                <div>
                  <Label className="text-xs font-medium text-muted-foreground">Reference Number</Label>
                  <p className="text-sm font-mono">{viewDialog.payment.reference_number}</p>
                </div>
              )}

              {viewDialog.payment.notes && (
                <div>
                  <Label className="text-xs font-medium text-muted-foreground">Notes</Label>
                  <p className="text-sm bg-muted p-2 rounded">{viewDialog.payment.notes}</p>
                </div>
              )}

              <div>
                <Label className="text-xs font-medium text-muted-foreground">Processed By</Label>
                <div className="flex items-center gap-1 text-sm">
                  <User className="h-3 w-3" />
                  {viewDialog.payment.created_by_name}
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setViewDialog({ open: false, payment: null })}
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialog.open} onOpenChange={(open) => setDeleteDialog({ ...deleteDialog, open })}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="text-lg">Delete Payment</DialogTitle>
            <DialogDescription className="text-sm">
              Are you sure you want to delete payment {deleteDialog.payment?.payment_number}? 
              This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteDialog({ open: false, payment: null })}
            >
              Cancel
            </Button>
            <Button 
              variant="destructive"
              onClick={handleDeletePayment}
            >
              Delete Payment
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}