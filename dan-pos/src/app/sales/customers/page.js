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
  Users, 
  Plus, 
  Edit, 
  Search,
  RefreshCw,
  Eye,
  Mail,
  Phone,
  CreditCard,
  ChevronLeft,
  ChevronRight,
  Trash2
} from 'lucide-react';
import { toast } from 'react-toastify';
import { 
  getCustomers,
  getCustomer,
  createCustomer,
  updateCustomer,
  deleteCustomer,
  getCustomerBalanceSummary,
  getCustomerAgingReport
} from '@/lib/api/sales';
import { getCurrentUser } from '@/services/auth';

export default function CustomerManagement() {
  // State management
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);
  const [customers, setCustomers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  
  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(5);
  
  // Dialog states
  const [customerDialog, setCustomerDialog] = useState({ 
    open: false, 
    customer: null, 
    mode: 'create' 
  });
  const [viewDialog, setViewDialog] = useState({ open: false, customer: null });
  const [deleteDialog, setDeleteDialog] = useState({ open: false, customer: null });

  // Form states
  const [customerForm, setCustomerForm] = useState({
    name: '',
    email: '',
    phone: '',
    contact_info: '',
    credit_limit: '',
    notes: ''
  });

  // Reports data
  const [balanceSummary, setBalanceSummary] = useState([]);
  const [agingReport, setAgingReport] = useState([]);

  const loadData = async () => {
    try {
      setLoading(true);
      
      // Get current user first
      const userData = await getCurrentUser();
      setCurrentUser(userData);
      
      const [customersData, summaryData, agingData] = await Promise.all([
        getCustomers(),
        getCustomerBalanceSummary(),
        getCustomerAgingReport()
      ]);
      
      setCustomers(customersData.data || []);
      setBalanceSummary(summaryData || []);
      setAgingReport(agingData || []);
    } catch (error) {
      toast.error(error.message || 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Customer operations
  const handleCreateCustomer = async (e) => {
    e.preventDefault();
    
    try {
      const customerData = {
        ...customerForm,
        credit_limit: parseFloat(customerForm.credit_limit) || 0
      };

      if (customerDialog.mode === 'create') {
        await createCustomer(customerData);
        toast.success('Customer created successfully');
      } else {
        await updateCustomer(customerDialog.customer.id, customerData);
        toast.success('Customer updated successfully');
      }
      
      setCustomerDialog({ open: false, customer: null, mode: 'create' });
      resetCustomerForm();
      loadData();
    } catch (error) {
      toast.error(error.message || 'Failed to save customer');
    }
  };

  const handleDeleteCustomer = async () => {
    try {
      await deleteCustomer(deleteDialog.customer.id);
      toast.success('Customer deleted successfully');
      setDeleteDialog({ open: false, customer: null });
      loadData();
    } catch (error) {
      toast.error(error.message || 'Failed to delete customer');
    }
  };

  // Helper functions
  const resetCustomerForm = () => {
    setCustomerForm({
      name: '',
      email: '',
      phone: '',
      contact_info: '',
      credit_limit: '',
      notes: ''
    });
  };

  const openCreateDialog = () => {
    resetCustomerForm();
    setCustomerDialog({ open: true, customer: null, mode: 'create' });
  };

  const openEditDialog = (customer) => {
    setCustomerForm({
      name: customer.name || '',
      email: customer.email || '',
      phone: customer.phone || '',
      contact_info: customer.contact_info || '',
      credit_limit: customer.credit_limit?.toString() || '',
      notes: customer.notes || ''
    });
    setCustomerDialog({ open: true, customer, mode: 'edit' });
  };

  const openViewDialog = (customer) => {
    setViewDialog({ open: true, customer });
  };

  const getStatusBadge = (customer) => {
    if (!customer.is_active) {
      return <Badge variant="destructive">Inactive</Badge>;
    }
    
    if (customer.current_balance > customer.credit_limit) {
      return <Badge variant="destructive">Over Limit</Badge>;
    }
    
    if (customer.current_balance > 0) {
      return <Badge variant="outline">Has Balance</Badge>;
    }
    
    return <Badge variant="secondary">Active</Badge>;
  };

  const getCreditUtilization = (customer) => {
    if (customer.credit_limit === 0) return 0;
    return (customer.current_balance / customer.credit_limit) * 100;
  };

  // Filter functions
  const filteredCustomers = customers.filter(customer => {
    const matchesSearch = customer.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         customer.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         customer.phone?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         customer.customer_code?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || 
                         (statusFilter === 'active' && customer.is_active) ||
                         (statusFilter === 'inactive' && !customer.is_active) ||
                         (statusFilter === 'over_limit' && customer.current_balance > customer.credit_limit);
    
    return matchesSearch && matchesStatus;
  });

  // Pagination functions
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentCustomers = filteredCustomers.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredCustomers.length / itemsPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const PaginationControls = () => {
    const totalItems = filteredCustomers.length;
    const showingFrom = indexOfFirstItem + 1;
    const showingTo = Math.min(indexOfLastItem, totalItems);

    if (totalItems === 0) return null;

    return (
      <div className="flex items-center justify-between px-4 py-3 border-t">
        <div className="text-sm text-muted-foreground">
          Showing {showingFrom}-{showingTo} of {totalItems} customers
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
  }, [searchTerm, statusFilter]);

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
          <h1 className="text-2xl font-bold tracking-tight">Customer Management</h1>
          <p className="text-sm text-muted-foreground">
            Manage your customers, credit limits, and balances
          </p>
        </div>
        <div className="flex gap-2 mt-2 sm:mt-0">
          <Button onClick={openCreateDialog} size="sm">
            <Plus className="mr-2 h-4 w-4" />
            New Customer
          </Button>
          <Button onClick={loadData} variant="outline" size="sm">
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Customers</p>
                <p className="text-2xl font-bold">{customers.length}</p>
              </div>
              <Users className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Active Customers</p>
                <p className="text-2xl font-bold">
                  {customers.filter(c => c.is_active).length}
                </p>
              </div>
              <CreditCard className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Over Limit</p>
                <p className="text-2xl font-bold text-red-600">
                  {customers.filter(c => c.current_balance > c.credit_limit).length}
                </p>
              </div>
              <CreditCard className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name, email, phone, or code..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8 h-9"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-[200px] h-9">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
                <SelectItem value="over_limit">Over Limit</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Customers Table */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Customers</CardTitle>
          <CardDescription className="text-sm">
            Manage your customer accounts and credit information
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-0 p-0">
          <div className="border rounded-md overflow-hidden">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead className="font-semibold">Customer</TableHead>
                    <TableHead className="font-semibold hidden sm:table-cell">Contact</TableHead>
                    <TableHead className="font-semibold">Balance</TableHead>
                    <TableHead className="font-semibold hidden md:table-cell">Credit Limit</TableHead>
                    <TableHead className="font-semibold">Status</TableHead>
                    <TableHead className="font-semibold text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {currentCustomers.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-6">
                        <div className="flex flex-col items-center gap-2">
                          <Users className="h-6 w-6 text-muted-foreground" />
                          <p className="text-sm text-muted-foreground">No customers found</p>
                          <Button onClick={openCreateDialog} size="sm" variant="outline">
                            <Plus className="mr-2 h-3 w-3" />
                            Add First Customer
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : (
                    currentCustomers.map((customer) => (
                      <TableRow key={customer.id} className="hover:bg-muted/30">
                        <TableCell>
                          <div>
                            <div className="font-medium text-sm">{customer.name}</div>
                            <div className="text-xs text-muted-foreground">
                              {customer.customer_code}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="hidden sm:table-cell">
                          <div className="space-y-1">
                            {customer.email && (
                              <div className="flex items-center gap-1 text-xs">
                                <Mail className="h-3 w-3" />
                                {customer.email}
                              </div>
                            )}
                            {customer.phone && (
                              <div className="flex items-center gap-1 text-xs">
                                <Phone className="h-3 w-3" />
                                {customer.phone}
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="font-medium text-sm">
                            ${parseFloat(customer.current_balance || 0).toFixed(2)}
                          </div>
                        </TableCell>
                        <TableCell className="hidden md:table-cell">
                          <div className="text-sm">
                            ${parseFloat(customer.credit_limit || 0).toFixed(2)}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {getCreditUtilization(customer).toFixed(1)}% utilized
                          </div>
                        </TableCell>
                        <TableCell>
                          {getStatusBadge(customer)}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-1">
                            <Button 
                              onClick={() => openViewDialog(customer)}
                              size="sm" 
                              variant="outline"
                              className="h-7 px-2"
                            >
                              <Eye className="h-3 w-3" />
                            </Button>
                            <Button 
                              onClick={() => openEditDialog(customer)}
                              size="sm" 
                              variant="outline"
                              className="h-7 px-2"
                            >
                              <Edit className="h-3 w-3" />
                            </Button>
                            <Button 
                              onClick={() => setDeleteDialog({ open: true, customer })}
                              size="sm" 
                              variant="outline"
                              className="h-7 px-2 text-red-600 hover:text-red-700"
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

      {/* Create/Edit Customer Dialog */}
      <Dialog open={customerDialog.open} onOpenChange={(open) => setCustomerDialog({ ...customerDialog, open })}>
        <DialogContent className="sm:max-w-[550px]">
          <DialogHeader>
            <DialogTitle className="text-lg">
              {customerDialog.mode === 'create' ? 'Create New Customer' : 'Edit Customer'}
            </DialogTitle>
            <DialogDescription className="text-sm">
              {customerDialog.mode === 'create' 
                ? 'Add a new customer to your system' 
                : `Update details for ${customerDialog.customer?.name}`
              }
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreateCustomer}>
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-sm">Customer Name *</Label>
                <Input
                  id="name"
                  value={customerForm.name}
                  onChange={(e) => setCustomerForm({ ...customerForm, name: e.target.value })}
                  placeholder="Enter customer name"
                  className="h-9"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={customerForm.email}
                    onChange={(e) => setCustomerForm({ ...customerForm, email: e.target.value })}
                    placeholder="customer@email.com"
                    className="h-9"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone" className="text-sm">Phone</Label>
                  <Input
                    id="phone"
                    value={customerForm.phone}
                    onChange={(e) => setCustomerForm({ ...customerForm, phone: e.target.value })}
                    placeholder="Phone number"
                    className="h-9"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="credit_limit" className="text-sm">Credit Limit</Label>
                <Input
                  id="credit_limit"
                  type="number"
                  step="0.01"
                  value={customerForm.credit_limit}
                  onChange={(e) => setCustomerForm({ ...customerForm, credit_limit: e.target.value })}
                  placeholder="0.00"
                  className="h-9"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="contact_info" className="text-sm">Contact Information</Label>
                <Textarea
                  id="contact_info"
                  value={customerForm.contact_info}
                  onChange={(e) => setCustomerForm({ ...customerForm, contact_info: e.target.value })}
                  placeholder="Additional contact details..."
                  className="min-h-[60px]"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes" className="text-sm">Notes</Label>
                <Textarea
                  id="notes"
                  value={customerForm.notes}
                  onChange={(e) => setCustomerForm({ ...customerForm, notes: e.target.value })}
                  placeholder="Customer notes..."
                  className="min-h-[80px]"
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setCustomerDialog({ open: false, customer: null, mode: 'create' })}
              >
                Cancel
              </Button>
              <Button type="submit">
                {customerDialog.mode === 'create' ? 'Create Customer' : 'Update Customer'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* View Customer Dialog */}
      <Dialog open={viewDialog.open} onOpenChange={(open) => setViewDialog({ ...viewDialog, open })}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-lg">Customer Details</DialogTitle>
            <DialogDescription className="text-sm">
              {viewDialog.customer?.customer_code}
            </DialogDescription>
          </DialogHeader>
          {viewDialog.customer && (
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-xs font-medium text-muted-foreground">Customer Code</Label>
                  <p className="text-sm font-mono">{viewDialog.customer.customer_code}</p>
                </div>
                <div>
                  <Label className="text-xs font-medium text-muted-foreground">Status</Label>
                  <div className="mt-1">{getStatusBadge(viewDialog.customer)}</div>
                </div>
              </div>

              <div>
                <Label className="text-xs font-medium text-muted-foreground">Customer Name</Label>
                <p className="text-lg font-semibold">{viewDialog.customer.name}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-xs font-medium text-muted-foreground">Email</Label>
                  <p className="text-sm flex items-center gap-1 mt-1">
                    <Mail className="h-3 w-3" />
                    {viewDialog.customer.email || 'Not provided'}
                  </p>
                </div>
                <div>
                  <Label className="text-xs font-medium text-muted-foreground">Phone</Label>
                  <p className="text-sm flex items-center gap-1 mt-1">
                    <Phone className="h-3 w-3" />
                    {viewDialog.customer.phone || 'Not provided'}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label className="text-xs font-medium text-muted-foreground">Current Balance</Label>
                  <p className="text-lg font-semibold">
                    ${parseFloat(viewDialog.customer.current_balance || 0).toFixed(2)}
                  </p>
                </div>
                <div>
                  <Label className="text-xs font-medium text-muted-foreground">Credit Limit</Label>
                  <p className="text-lg font-semibold">
                    ${parseFloat(viewDialog.customer.credit_limit || 0).toFixed(2)}
                  </p>
                </div>
                <div>
                  <Label className="text-xs font-medium text-muted-foreground">Utilization</Label>
                  <p className="text-lg font-semibold">
                    {getCreditUtilization(viewDialog.customer).toFixed(1)}%
                  </p>
                </div>
              </div>

              {viewDialog.customer.contact_info && (
                <div>
                  <Label className="text-xs font-medium text-muted-foreground">Contact Information</Label>
                  <p className="text-sm bg-muted p-2 rounded mt-1">{viewDialog.customer.contact_info}</p>
                </div>
              )}

              {viewDialog.customer.notes && (
                <div>
                  <Label className="text-xs font-medium text-muted-foreground">Notes</Label>
                  <p className="text-sm bg-muted p-2 rounded mt-1">{viewDialog.customer.notes}</p>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-xs font-medium text-muted-foreground">Created</Label>
                  <p className="text-sm">
                    {new Date(viewDialog.customer.created_at).toLocaleDateString()}
                  </p>
                </div>
                <div>
                  <Label className="text-xs font-medium text-muted-foreground">Active</Label>
                  <p className="text-sm">{viewDialog.customer.is_active ? 'Yes' : 'No'}</p>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setViewDialog({ open: false, customer: null })}
            >
              Close
            </Button>
            {viewDialog.customer && (
              <Button onClick={() => {
                setViewDialog({ open: false, customer: null });
                openEditDialog(viewDialog.customer);
              }}>
                Edit Customer
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialog.open} onOpenChange={(open) => setDeleteDialog({ ...deleteDialog, open })}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="text-lg">Delete Customer</DialogTitle>
            <DialogDescription className="text-sm">
              Are you sure you want to delete {deleteDialog.customer?.name}? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteDialog({ open: false, customer: null })}
            >
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleDeleteCustomer}
            >
              Delete Customer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
