// components/procurement/SuppliersManagement.js
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
  Building, 
  Plus, 
  Edit, 
  Trash2, 
  Search,
  RefreshCw,
  Mail,
  Phone,
  MapPin,
  FileText,
  CreditCard,
  ChevronLeft,
  ChevronRight,
  Eye
} from 'lucide-react';
import { toast } from 'react-toastify';
import { 
  getSuppliers,
  getSupplier,
  createSupplier,
  updateSupplier,
  deleteSupplier,
  getSupplierDebtSummary,
  getSupplierPurchaseHistory
} from '@/lib/api/procurement';

export default function SuppliersManagement() {
  // State management
  const [loading, setLoading] = useState(true);
  const [suppliers, setSuppliers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  
  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(5);
  
  // Dialog states
  const [supplierDialog, setSupplierDialog] = useState({ 
    open: false, 
    mode: 'create', // 'create' or 'edit'
    supplier: null 
  });
  const [viewDialog, setViewDialog] = useState({ 
    open: false, 
    supplier: null,
    debtSummary: null,
    purchaseHistory: []
  });
  const [deleteDialog, setDeleteDialog] = useState({ 
    open: false, 
    supplier: null 
  });

  // Form state
  const [supplierForm, setSupplierForm] = useState({
    name: '',
    contact_person: '',
    email: '',
    phone: '',
    address: '',
    tax_number: '',
    payment_terms: 'Net 30',
    is_active: true
  });

  const [formErrors, setFormErrors] = useState({});

  // Load suppliers data
  const loadSuppliers = async () => {
    try {
      setLoading(true);
      const response = await getSuppliers();
      setSuppliers(response.data || []);
    } catch (error) {
      toast.error(error.message || 'Failed to load suppliers');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSuppliers();
  }, []);

  // Load supplier details for view dialog
  const loadSupplierDetails = async (supplier) => {
    try {
      const [debtSummary, purchaseHistory] = await Promise.all([
        getSupplierDebtSummary(supplier.id),
        getSupplierPurchaseHistory(supplier.id)
      ]);
      
      setViewDialog({ 
        open: true, 
        supplier,
        debtSummary,
        purchaseHistory: purchaseHistory || []
      });
    } catch (error) {
      toast.error(error.message || 'Failed to load supplier details');
    }
  };

  // Form handlers
  const handleSupplierSubmit = async (e) => {
    e.preventDefault();
    
    // Basic validation
    const errors = {};
    if (!supplierForm.name.trim()) errors.name = 'Supplier name is required';
    if (supplierForm.email && !/\S+@\S+\.\S+/.test(supplierForm.email)) {
      errors.email = 'Invalid email format';
    }

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    try {
      if (supplierDialog.mode === 'create') {
        await createSupplier(supplierForm);
        toast.success('Supplier created successfully');
      } else {
        await updateSupplier(supplierDialog.supplier.id, supplierForm);
        toast.success('Supplier updated successfully');
      }
      
      setSupplierDialog({ open: false, mode: 'create', supplier: null });
      resetSupplierForm();
      loadSuppliers();
    } catch (error) {
      toast.error(error.message || `Failed to ${supplierDialog.mode} supplier`);
    }
  };

  const handleDeleteSupplier = async () => {
    try {
      await deleteSupplier(deleteDialog.supplier.id);
      toast.success('Supplier deleted successfully');
      setDeleteDialog({ open: false, supplier: null });
      loadSuppliers();
    } catch (error) {
      toast.error(error.message || 'Failed to delete supplier');
    }
  };

  const resetSupplierForm = () => {
    setSupplierForm({
      name: '',
      contact_person: '',
      email: '',
      phone: '',
      address: '',
      tax_number: '',
      payment_terms: 'Net 30',
      is_active: true
    });
    setFormErrors({});
  };

  const openCreateDialog = () => {
    resetSupplierForm();
    setSupplierDialog({ open: true, mode: 'create', supplier: null });
  };

  const openEditDialog = (supplier) => {
    setSupplierForm({
      name: supplier.name,
      contact_person: supplier.contact_person || '',
      email: supplier.email || '',
      phone: supplier.phone || '',
      address: supplier.address || '',
      tax_number: supplier.tax_number || '',
      payment_terms: supplier.payment_terms || 'Net 30',
      is_active: supplier.is_active
    });
    setSupplierDialog({ open: true, mode: 'edit', supplier });
  };

  // Filter functions
  const filteredSuppliers = suppliers.filter(supplier => {
    const matchesSearch = supplier.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         supplier.contact_person?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         supplier.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         supplier.phone?.includes(searchTerm);
    
    const matchesStatus = statusFilter === 'all' || 
                         (statusFilter === 'active' && supplier.is_active) ||
                         (statusFilter === 'inactive' && !supplier.is_active);
    
    return matchesSearch && matchesStatus;
  });

  // Pagination functions
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentSuppliers = filteredSuppliers.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredSuppliers.length / itemsPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const PaginationControls = () => {
    const totalItems = filteredSuppliers.length;
    const showingFrom = indexOfFirstItem + 1;
    const showingTo = Math.min(indexOfLastItem, totalItems);

    if (totalItems === 0) return null;

    return (
      <div className="flex items-center justify-between px-4 py-3 border-t">
        <div className="text-sm text-muted-foreground">
          Showing {showingFrom}-{showingTo} of {totalItems} suppliers
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

  // Loading skeleton
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
          <h1 className="text-2xl font-bold tracking-tight">Suppliers Management</h1>
          <p className="text-sm text-muted-foreground">
            Manage your suppliers and their information
          </p>
        </div>
        <div className="flex gap-2 mt-2 sm:mt-0">
          <Button onClick={openCreateDialog} size="sm">
            <Plus className="mr-2 h-4 w-4" />
            New Supplier
          </Button>
          <Button onClick={loadSuppliers} variant="outline" size="sm">
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
                placeholder="Search by name, contact person, email, or phone..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8 h-9"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-[180px] h-9">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Suppliers Table */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Suppliers List</CardTitle>
          <CardDescription className="text-sm">
            {filteredSuppliers.length} supplier(s) found
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-0 p-0">
          <div className="border rounded-md overflow-hidden">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead className="font-semibold">Supplier</TableHead>
                    <TableHead className="font-semibold hidden sm:table-cell">Contact</TableHead>
                    <TableHead className="font-semibold hidden md:table-cell">Contact Info</TableHead>
                    <TableHead className="font-semibold">Payment Terms</TableHead>
                    <TableHead className="font-semibold">Status</TableHead>
                    <TableHead className="font-semibold text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {currentSuppliers.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-6">
                        <div className="flex flex-col items-center gap-2">
                          <Building className="h-6 w-6 text-muted-foreground" />
                          <p className="text-sm text-muted-foreground">No suppliers found</p>
                          {searchTerm || statusFilter !== 'all' ? (
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => {
                                setSearchTerm('');
                                setStatusFilter('all');
                              }}
                            >
                              Clear filters
                            </Button>
                          ) : null}
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : (
                    currentSuppliers.map((supplier) => (
                      <TableRow key={supplier.id} className="hover:bg-muted/30">
                        <TableCell>
                          <div className="font-medium text-sm">{supplier.name}</div>
                          {supplier.tax_number && (
                            <div className="text-xs text-muted-foreground mt-1">
                              Tax: {supplier.tax_number}
                            </div>
                          )}
                        </TableCell>
                        <TableCell className="hidden sm:table-cell">
                          <div className="text-sm">
                            {supplier.contact_person || 'N/A'}
                          </div>
                        </TableCell>
                        <TableCell className="hidden md:table-cell">
                          <div className="space-y-1">
                            {supplier.email && (
                              <div className="flex items-center gap-1 text-xs">
                                <Mail className="h-3 w-3" />
                                {supplier.email}
                              </div>
                            )}
                            {supplier.phone && (
                              <div className="flex items-center gap-1 text-xs">
                                <Phone className="h-3 w-3" />
                                {supplier.phone}
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary" className="text-xs">
                            {supplier.payment_terms}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant={supplier.is_active ? "default" : "secondary"}>
                            {supplier.is_active ? 'Active' : 'Inactive'}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-1">
                            <Button 
                              onClick={() => loadSupplierDetails(supplier)}
                              size="sm" 
                              variant="outline"
                              className="h-7 px-2"
                            >
                              <Eye className="h-3 w-3" />
                            </Button>
                            <Button 
                              onClick={() => openEditDialog(supplier)}
                              size="sm" 
                              variant="outline"
                              className="h-7 px-2"
                            >
                              <Edit className="h-3 w-3" />
                            </Button>
                            <Button 
                              onClick={() => setDeleteDialog({ open: true, supplier })}
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

      {/* Create/Edit Supplier Dialog */}
      <Dialog open={supplierDialog.open} onOpenChange={(open) => setSupplierDialog({ ...supplierDialog, open })}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-lg">
              {supplierDialog.mode === 'create' ? 'Create New Supplier' : 'Edit Supplier'}
            </DialogTitle>
            <DialogDescription className="text-sm">
              {supplierDialog.mode === 'create' 
                ? 'Add a new supplier to your procurement system'
                : `Update details for ${supplierDialog.supplier?.name}`
              }
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSupplierSubmit}>
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-sm">Supplier Name *</Label>
                <Input
                  id="name"
                  value={supplierForm.name}
                  onChange={(e) => setSupplierForm({ ...supplierForm, name: e.target.value })}
                  placeholder="Enter supplier name"
                  className="h-9"
                />
                {formErrors.name && <p className="text-xs text-destructive">{formErrors.name}</p>}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="contact_person" className="text-sm">Contact Person</Label>
                  <Input
                    id="contact_person"
                    value={supplierForm.contact_person}
                    onChange={(e) => setSupplierForm({ ...supplierForm, contact_person: e.target.value })}
                    placeholder="Contact person name"
                    className="h-9"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="tax_number" className="text-sm">Tax Number (KRA PIN)</Label>
                  <Input
                    id="tax_number"
                    value={supplierForm.tax_number}
                    onChange={(e) => setSupplierForm({ ...supplierForm, tax_number: e.target.value })}
                    placeholder="Tax identification number"
                    className="h-9"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={supplierForm.email}
                    onChange={(e) => setSupplierForm({ ...supplierForm, email: e.target.value })}
                    placeholder="supplier@email.com"
                    className="h-9"
                  />
                  {formErrors.email && <p className="text-xs text-destructive">{formErrors.email}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone" className="text-sm">Phone</Label>
                  <Input
                    id="phone"
                    value={supplierForm.phone}
                    onChange={(e) => setSupplierForm({ ...supplierForm, phone: e.target.value })}
                    placeholder="Phone number"
                    className="h-9"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="address" className="text-sm">Address</Label>
                <Textarea
                  id="address"
                  value={supplierForm.address}
                  onChange={(e) => setSupplierForm({ ...supplierForm, address: e.target.value })}
                  placeholder="Supplier address"
                  className="min-h-[60px]"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="payment_terms" className="text-sm">Payment Terms</Label>
                  <Select 
                    value={supplierForm.payment_terms} 
                    onValueChange={(value) => setSupplierForm({ ...supplierForm, payment_terms: value })}
                  >
                    <SelectTrigger className="h-9">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Net 15">Net 15</SelectItem>
                      <SelectItem value="Net 30">Net 30</SelectItem>
                      <SelectItem value="Net 60">Net 60</SelectItem>
                      <SelectItem value="Due on receipt">Due on receipt</SelectItem>
                      <SelectItem value="Cash on delivery">Cash on delivery</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="is_active" className="text-sm">Status</Label>
                  <Select 
                    value={supplierForm.is_active.toString()} 
                    onValueChange={(value) => setSupplierForm({ ...supplierForm, is_active: value === 'true' })}
                  >
                    <SelectTrigger className="h-9">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="true">Active</SelectItem>
                      <SelectItem value="false">Inactive</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setSupplierDialog({ open: false, mode: 'create', supplier: null })}
              >
                Cancel
              </Button>
              <Button type="submit">
                {supplierDialog.mode === 'create' ? 'Create Supplier' : 'Update Supplier'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* View Supplier Details Dialog */}
      <Dialog open={viewDialog.open} onOpenChange={(open) => setViewDialog({ ...viewDialog, open })}>
        <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-lg">Supplier Details</DialogTitle>
            <DialogDescription className="text-sm">
              {viewDialog.supplier?.name}
            </DialogDescription>
          </DialogHeader>
          {viewDialog.supplier && (
            <div className="space-y-6">
              {/* Basic Information */}
              <div>
                <h3 className="text-sm font-medium mb-3">Basic Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-xs font-medium text-muted-foreground">Supplier Name</Label>
                    <p className="text-sm font-semibold">{viewDialog.supplier.name}</p>
                  </div>
                  <div>
                    <Label className="text-xs font-medium text-muted-foreground">Tax Number</Label>
                    <p className="text-sm">{viewDialog.supplier.tax_number || 'N/A'}</p>
                  </div>
                  <div>
                    <Label className="text-xs font-medium text-muted-foreground">Contact Person</Label>
                    <p className="text-sm">{viewDialog.supplier.contact_person || 'N/A'}</p>
                  </div>
                  <div>
                    <Label className="text-xs font-medium text-muted-foreground">Payment Terms</Label>
                    <Badge variant="secondary" className="text-xs">
                      {viewDialog.supplier.payment_terms}
                    </Badge>
                  </div>
                </div>
              </div>

              {/* Contact Information */}
              <div>
                <h3 className="text-sm font-medium mb-3">Contact Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <Label className="text-xs font-medium text-muted-foreground">Email</Label>
                      <p className="text-sm">{viewDialog.supplier.email || 'N/A'}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <Label className="text-xs font-medium text-muted-foreground">Phone</Label>
                      <p className="text-sm">{viewDialog.supplier.phone || 'N/A'}</p>
                    </div>
                  </div>
                  {viewDialog.supplier.address && (
                    <div className="flex items-start gap-2 md:col-span-2">
                      <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                      <div>
                        <Label className="text-xs font-medium text-muted-foreground">Address</Label>
                        <p className="text-sm">{viewDialog.supplier.address}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Debt Summary */}
              {viewDialog.debtSummary && (
                <div>
                  <h3 className="text-sm font-medium mb-3">Financial Summary</h3>
                  <Card>
                    <CardContent className="pt-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label className="text-xs font-medium text-muted-foreground">Total Debt</Label>
                          <p className="text-lg font-bold text-destructive">
                            Ksh {parseFloat(viewDialog.debtSummary.total_debt || 0).toLocaleString()}
                          </p>
                        </div>
                        <div>
                          <Label className="text-xs font-medium text-muted-foreground">Unpaid Receipts</Label>
                          <p className="text-lg font-bold">
                            {viewDialog.debtSummary.unpaid_receipts_count || 0}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}

              {/* Recent Purchases */}
              <div>
                <h3 className="text-sm font-medium mb-3">Recent Purchases</h3>
                {viewDialog.purchaseHistory.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No purchase history available</p>
                ) : (
                  <div className="border rounded-md">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Receipt</TableHead>
                          <TableHead>Date</TableHead>
                          <TableHead>Amount</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {viewDialog.purchaseHistory.slice(0, 5).map((purchase, index) => (
                          <TableRow key={index}>
                            <TableCell className="text-xs">{purchase.receipt_number}</TableCell>
                            <TableCell className="text-xs">
                              {new Date(purchase.receipt_date).toLocaleDateString()}
                            </TableCell>
                            <TableCell className="text-xs font-medium">
                              Ksh {parseFloat(purchase.total_cost || 0).toLocaleString()}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </div>
            </div>
          )}
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setViewDialog({ open: false, supplier: null, debtSummary: null, purchaseHistory: [] })}
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
            <DialogTitle className="text-lg">Delete Supplier</DialogTitle>
            <DialogDescription className="text-sm">
              Are you sure you want to delete {deleteDialog.supplier?.name}? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteDialog({ open: false, supplier: null })}
            >
              Cancel
            </Button>
            <Button 
              variant="destructive"
              onClick={handleDeleteSupplier}
            >
              Delete Supplier
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

