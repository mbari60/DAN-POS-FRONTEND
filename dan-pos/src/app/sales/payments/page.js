// app/sales/payments/page.jsx
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
  User,
  FileText,
  CheckCircle,
  XCircle
} from 'lucide-react';
import { toast } from 'react-toastify';
import { 
  getCustomerPayments, 
  getCustomerPayment,
  createCustomerPayment,
  updateCustomerPayment,
  deleteCustomerPayment,
  getCustomers,
  autoAllocatePayment,
  manualAllocatePayment,
  getPaymentAllocations
} from '@/lib/api/sales';
import { getCurrentUser } from '@/services/auth';


export default function CustomerPaymentsManagement() {
  // State management
  const [loading, setLoading] = useState(true);
  const [payments, setPayments] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [customerFilter, setCustomerFilter] = useState('all');
  const [paymentMethodFilter, setPaymentMethodFilter] = useState('all');
  const [currentUser, setCurrentUser] = useState(null);
  
  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  
  // Dialog states
  const [paymentDialog, setPaymentDialog] = useState({ 
    open: false, 
    mode: 'create',
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
  const [allocationDialog, setAllocationDialog] = useState({ 
    open: false, 
    payment: null,
    allocations: []
  });

  const [allocationForm, setAllocationForm] = useState({
    invoice_id: '',
    amount: ''
  });

  const [formErrors, setFormErrors] = useState({});

  // Load data
  const loadData = async () => {
    try {

      // getting the current user
      // Get current user first
      const userData = await getCurrentUser();
      setCurrentUser(userData);

      setLoading(true);
      const [paymentsResponse, customersResponse] = await Promise.all([
        getCustomerPayments(),
        getCustomers()
      ]);
      
      setPayments(paymentsResponse.data || []);
      setCustomers(customersResponse.data || []);
    } catch (error) {
      toast.error(error.message || 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Load payment allocations
  const loadPaymentAllocations = async (paymentId) => {
    try {
      const allocations = await getPaymentAllocations(paymentId);
      return allocations;
    } catch (error) {
      toast.error('Failed to load payment allocations');
      return [];
    }
  };


useEffect(() => {
  if (currentUser?.id) {
    setPaymentForm(prev => ({ ...prev, received_by: currentUser.id }));
  }
}, [currentUser]);


  // what to be sent 
    // Form state
  const [paymentForm, setPaymentForm] = useState({
    customer: '',
    amount: '',
    payment_method: 'cash',
    reference: '',
    notes: '',
    received_by: currentUser?.id,
    auto_allocate: true
  });


  // Form handlers
  const handlePaymentSubmit = async (e) => {
    e.preventDefault();
    
    // Validation
    const errors = {};
    if (!paymentForm.customer) errors.customer = 'Customer is required';
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
        console.log("paymentForm", paymentForm);
        await createCustomerPayment(paymentForm);
        toast.success('Payment recorded successfully');
      } else {
        await updateCustomerPayment(paymentDialog.payment.id, paymentForm);
        toast.success('Payment updated successfully');
      }
      
      setPaymentDialog({ open: false, mode: 'create', payment: null });
      resetPaymentForm();
      loadData();
    } catch (error) {
      toast.error(error.message || `Failed to ${paymentDialog.mode} payment`);
    }
  };

  const handleAutoAllocate = async (paymentId) => {
    try {
      const result = await autoAllocatePayment(paymentId);
      toast.success(result.message || 'Payment allocated successfully');
      loadData();
    } catch (error) {
      toast.error(error.message || 'Failed to auto-allocate payment');
    }
  };

  const handleManualAllocate = async (e) => {
    e.preventDefault();
    
    if (!allocationForm.invoice_id || !allocationForm.amount) {
      toast.error('Please select an invoice and amount');
      return;
    }

    try {
      await manualAllocatePayment(allocationDialog.payment.id, allocationForm);
      toast.success('Payment allocated successfully');
      setAllocationDialog({ open: false, payment: null, allocations: [] });
      setAllocationForm({ invoice_id: '', amount: '' });
      loadData();
    } catch (error) {
      toast.error(error.message || 'Failed to allocate payment');
    }
  };

  const handleDeletePayment = async () => {
    try {
      await deleteCustomerPayment(deleteDialog.payment.id);
      toast.success('Payment deleted successfully');
      setDeleteDialog({ open: false, payment: null });
      loadData();
    } catch (error) {
      toast.error(error.message || 'Failed to delete payment');
    }
  };

const resetPaymentForm = () => {
  setPaymentForm({
    customer: '',
    amount: '',
    payment_method: 'cash',
    reference: '',
    notes: '',
    received_by: currentUser?.id,
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
      customer: payment.customer_id.toString(),
      amount: payment.amount,
      payment_method: payment.payment_method,
      reference: payment.reference || '',
      notes: payment.notes || '',
      auto_allocate: true
    });
    setPaymentDialog({ open: true, mode: 'edit', payment });
  };

  const openAllocationDialog = async (payment) => {
    const allocations = await loadPaymentAllocations(payment.id);
    setAllocationDialog({ open: true, payment, allocations });
  };

  // Filter functions
  const filteredPayments = payments.filter(payment => {
    const matchesSearch = payment.payment_reference?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         payment.customer_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         payment.reference?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCustomer = customerFilter === 'all' || 
                           payment.customer_id?.toString() === customerFilter;
    
    const matchesPaymentMethod = paymentMethodFilter === 'all' || 
                                payment.payment_method === paymentMethodFilter;
    
    return matchesSearch && matchesCustomer && matchesPaymentMethod;
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
      'cash': 'Cash',
      'mpesa': 'M-Pesa',
      'bank': 'Bank Transfer',
      'cheque': 'Cheque',
      'card': 'Card Payment'
    };
    return methods[method] || method;
  };

  const getPaymentMethodBadge = (method) => {
    const variants = {
      'cash': 'default',
      'mpesa': 'secondary',
      'bank': 'outline',
      'cheque': 'outline',
      'card': 'default'
    };
    return variants[method] || 'outline';
  };

  const getReconciliationStatus = (payment) => {
    return payment.is_reconciled ? 
      { text: 'Reconciled', variant: 'default' } : 
      { text: 'Pending', variant: 'outline' };
  };

  const getAllocationStatus = (payment) => {
    if (payment.unallocated_amount === '0.00') {
      return { text: 'Fully Allocated', variant: 'default', icon: CheckCircle };
    } else if (parseFloat(payment.allocated_amount) > 0) {
      return { text: 'Partially Allocated', variant: 'secondary', icon: FileText };
    } else {
      return { text: 'Not Allocated', variant: 'outline', icon: XCircle };
    }
  };

  // Reset pagination when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, customerFilter, paymentMethodFilter]);

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
          <h1 className="text-2xl font-bold tracking-tight">Customer Payments</h1>
          <p className="text-sm text-muted-foreground">
            Manage customer payments, allocations, and reconciliation
          </p>
        </div>
        <div className="flex gap-2 mt-2 sm:mt-0">
          <Button onClick={openCreateDialog} size="sm">
            <Plus className="mr-2 h-4 w-4" />
            Record Payment
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
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by reference, customer, or notes..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8 h-9"
              />
            </div>
            <Select value={customerFilter} onValueChange={setCustomerFilter}>
              <SelectTrigger className="h-9">
                <SelectValue placeholder="Filter by customer" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Customers</SelectItem>
                {customers.map((customer) => (
                  <SelectItem key={customer.id} value={customer.id.toString()}>
                    {customer.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={paymentMethodFilter} onValueChange={setPaymentMethodFilter}>
              <SelectTrigger className="h-9">
                <SelectValue placeholder="Filter by method" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Methods</SelectItem>
                <SelectItem value="cash">Cash</SelectItem>
                <SelectItem value="mpesa">M-Pesa</SelectItem>
                <SelectItem value="bank">Bank Transfer</SelectItem>
                <SelectItem value="cheque">Cheque</SelectItem>
                <SelectItem value="card">Card</SelectItem>
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
                    <TableHead className="font-semibold">Payment Ref</TableHead>
                    <TableHead className="font-semibold">Customer</TableHead>
                    <TableHead className="font-semibold hidden md:table-cell">Date</TableHead>
                    <TableHead className="font-semibold">Amount</TableHead>
                    <TableHead className="font-semibold hidden sm:table-cell">Method</TableHead>
                    <TableHead className="font-semibold hidden lg:table-cell">Allocation</TableHead>
                    <TableHead className="font-semibold hidden xl:table-cell">Status</TableHead>
                    <TableHead className="font-semibold text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {currentPayments.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-6">
                        <div className="flex flex-col items-center gap-2">
                          <CreditCard className="h-8 w-8 text-muted-foreground" />
                          <p className="text-sm text-muted-foreground">No payments found</p>
                          {(searchTerm || customerFilter !== 'all' || paymentMethodFilter !== 'all') && (
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => {
                                setSearchTerm('');
                                setCustomerFilter('all');
                                setPaymentMethodFilter('all');
                              }}
                            >
                              Clear filters
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : (
                    currentPayments.map((payment) => {
                      const allocationStatus = getAllocationStatus(payment);
                      const reconciliationStatus = getReconciliationStatus(payment);
                      const AllocationIcon = allocationStatus.icon;

                      return (
                        <TableRow key={payment.id} className="hover:bg-muted/30">
                          <TableCell>
                            <div className="font-medium text-sm">{payment.payment_reference}</div>
                          </TableCell>
                          <TableCell>
                            <div className="text-sm">{payment.customer_name}</div>
                          </TableCell>
                          <TableCell className="hidden md:table-cell">
                            <div className="flex items-center gap-1 text-sm text-muted-foreground">
                              <Calendar className="h-3 w-3" />
                              {new Date(payment.received_at).toLocaleDateString()}
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
                            <Badge variant={allocationStatus.variant} className="text-xs">
                              <AllocationIcon className="h-3 w-3 mr-1" />
                              {allocationStatus.text}
                            </Badge>
                          </TableCell>
                          <TableCell className="hidden xl:table-cell">
                            <Badge variant={reconciliationStatus.variant} className="text-xs">
                              {reconciliationStatus.text}
                            </Badge>
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
                                onClick={() => openAllocationDialog(payment)}
                                size="sm" 
                                variant="outline"
                                className="h-7 px-2"
                                disabled={parseFloat(payment.unallocated_amount) === 0}
                              >
                                Allocate
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })
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
              {paymentDialog.mode === 'create' ? 'Record Customer Payment' : 'Edit Payment'}
            </DialogTitle>
            <DialogDescription className="text-sm">
              {paymentDialog.mode === 'create' 
                ? 'Record a new payment received from a customer'
                : `Update payment details for ${paymentDialog.payment?.payment_reference}`
              }
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handlePaymentSubmit}>
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="customer" className="text-sm">Customer *</Label>
                <Select 
                  value={paymentForm.customer} 
                  onValueChange={(value) => setPaymentForm({ ...paymentForm, customer: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select customer" />
                  </SelectTrigger>
                  <SelectContent>
                    {customers.map((customer) => (
                      <SelectItem key={customer.id} value={customer.id.toString()}>
                        {customer.name} (Balance: Ksh {customer.current_balance?.toLocaleString()})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {formErrors.customer && <p className="text-xs text-destructive">{formErrors.customer}</p>}
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
                      <SelectItem value="cash">Cash</SelectItem>
                      <SelectItem value="mpesa">M-Pesa</SelectItem>
                      <SelectItem value="bank">Bank Transfer</SelectItem>
                      <SelectItem value="cheque">Cheque</SelectItem>
                      <SelectItem value="card">Card Payment</SelectItem>
                    </SelectContent>
                  </Select>
                  {formErrors.payment_method && <p className="text-xs text-destructive">{formErrors.payment_method}</p>}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="reference" className="text-sm">Reference Number</Label>
                <Input
                  id="reference"
                  value={paymentForm.reference}
                  onChange={(e) => setPaymentForm({ ...paymentForm, reference: e.target.value })}
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
                  Automatically allocate to unpaid invoices
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
                {paymentDialog.mode === 'create' ? 'Record Payment' : 'Update Payment'}
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
              {viewDialog.payment?.payment_reference}
            </DialogDescription>
          </DialogHeader>
          {viewDialog.payment && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-xs font-medium text-muted-foreground">Payment Reference</Label>
                  <p className="text-sm font-semibold">{viewDialog.payment.payment_reference}</p>
                </div>
                <div>
                  <Label className="text-xs font-medium text-muted-foreground">Payment Date</Label>
                  <p className="text-sm">{new Date(viewDialog.payment.received_at).toLocaleDateString()}</p>
                </div>
              </div>

              <div>
                <Label className="text-xs font-medium text-muted-foreground">Customer</Label>
                <p className="text-sm font-semibold">{viewDialog.payment.customer_name}</p>
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

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-xs font-medium text-muted-foreground">Allocated Amount</Label>
                  <p className="text-sm font-semibold">
                    Ksh {parseFloat(viewDialog.payment.allocated_amount || 0).toLocaleString()}
                  </p>
                </div>
                <div>
                  <Label className="text-xs font-medium text-muted-foreground">Unallocated Amount</Label>
                  <p className="text-sm font-semibold">
                    Ksh {parseFloat(viewDialog.payment.unallocated_amount || 0).toLocaleString()}
                  </p>
                </div>
              </div>

              {viewDialog.payment.reference && (
                <div>
                  <Label className="text-xs font-medium text-muted-foreground">Reference Number</Label>
                  <p className="text-sm font-mono">{viewDialog.payment.reference}</p>
                </div>
              )}

              {viewDialog.payment.notes && (
                <div>
                  <Label className="text-xs font-medium text-muted-foreground">Notes</Label>
                  <p className="text-sm bg-muted p-2 rounded">{viewDialog.payment.notes}</p>
                </div>
              )}

              <div>
                <Label className="text-xs font-medium text-muted-foreground">Received By</Label>
                <div className="flex items-center gap-1 text-sm">
                  <User className="h-3 w-3" />
                  {viewDialog.payment.received_by_name}
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

      {/* Payment Allocation Dialog */}
      <Dialog open={allocationDialog.open} onOpenChange={(open) => setAllocationDialog({ ...allocationDialog, open })}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle className="text-lg">Allocate Payment</DialogTitle>
            <DialogDescription className="text-sm">
              Allocate payment {allocationDialog.payment?.payment_reference} to customer invoices
            </DialogDescription>
          </DialogHeader>
          
          {allocationDialog.payment && (
            <div className="space-y-4">
              <div className="bg-muted p-3 rounded">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium">Payment Amount:</span>
                    <p className="font-semibold">Ksh {parseFloat(allocationDialog.payment.amount).toLocaleString()}</p>
                  </div>
                  <div>
                    <span className="font-medium">Available to Allocate:</span>
                    <p className="font-semibold">
                      Ksh {parseFloat(allocationDialog.payment.unallocated_amount || allocationDialog.payment.amount).toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex gap-2">
                  <Button 
                    onClick={() => handleAutoAllocate(allocationDialog.payment.id)}
                    variant="outline"
                    size="sm"
                  >
                    Auto-allocate
                  </Button>
                  <Button 
                    onClick={() => setAllocationForm({ invoice_id: '', amount: '' })}
                    variant="outline"
                    size="sm"
                  >
                    Manual Allocation
                  </Button>
                </div>

                {/* Allocation form */}
                <form onSubmit={handleManualAllocate} className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-2">
                      <Label className="text-sm">Invoice</Label>
                      <Select 
                        value={allocationForm.invoice_id} 
                        onValueChange={(value) => setAllocationForm({ ...allocationForm, invoice_id: value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select invoice" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1">INV-000123 (Ksh 2,500.00)</SelectItem>
                          <SelectItem value="2">INV-000124 (Ksh 5,000.00)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-sm">Amount</Label>
                      <Input
                        type="number"
                        step="0.01"
                        value={allocationForm.amount}
                        onChange={(e) => setAllocationForm({ ...allocationForm, amount: e.target.value })}
                        placeholder="0.00"
                        className="h-9"
                      />
                    </div>
                  </div>
                  <Button type="submit" size="sm">
                    Allocate
                  </Button>
                </form>

                {/* Existing allocations */}
                {allocationDialog.allocations.length > 0 && (
                  <div>
                    <Label className="text-sm font-medium">Current Allocations</Label>
                    <div className="border rounded mt-2">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Invoice</TableHead>
                            <TableHead>Amount</TableHead>
                            <TableHead>Date</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {allocationDialog.allocations.map((allocation) => (
                            <TableRow key={allocation.id}>
                              <TableCell>{allocation.invoice_reference}</TableCell>
                              <TableCell>Ksh {parseFloat(allocation.amount_allocated).toLocaleString()}</TableCell>
                              <TableCell>{new Date(allocation.allocated_at).toLocaleDateString()}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
          
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setAllocationDialog({ open: false, payment: null, allocations: [] })}
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
              Are you sure you want to delete payment {deleteDialog.payment?.payment_reference}? 
              This action cannot be undone and may affect customer balances.
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
