"use client"

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { 
  Search, 
  RefreshCw, 
  ArrowLeftRight, 
  Package, 
  Truck, 
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  Eye // Added missing import
} from 'lucide-react';
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { toast } from 'react-toastify';
import { 
  getStores, 
  getItems, 
  recordTransfer, 
  getStockMovements 
} from '@/lib/api/inventory';

export default function LocationTransfer() {
  // State management
  const [loading, setLoading] = useState(true);
  const [transfers, setTransfers] = useState([]);
  const [stores, setStores] = useState([]);
  const [items, setItems] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Filter states
  const [selectedFromStore, setSelectedFromStore] = useState('all');
  const [selectedToStore, setSelectedToStore] = useState('all');
  const [selectedItem, setSelectedItem] = useState('all');
  
  const [transferForm, setTransferForm] = useState({
    item_id: '',
    from_store_id: '',
    to_store_id: '',
    quantity: '',
    notes: '',
    document_id: '',
    document_type: 'Transfer Request'
  });
  
  // Dialog states
  const [transferDialog, setTransferDialog] = useState({ open: false });
  const [viewDialog, setViewDialog] = useState({ open: false, transfer: null });
  
  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(3);
  
  const loadData = async () => {
    try {
      setLoading(true);
      
      // Build query parameters for transfers
      const params = {
        type: 'transfer_out' // Only show transfer-related movements
      };
      if (selectedFromStore !== 'all') params.store = selectedFromStore;
      if (selectedToStore !== 'all') params.store = selectedToStore;
      if (selectedItem !== 'all') params.item = selectedItem;
      
      // Load data in parallel
      const [movementsResponse, storesResponse, itemsResponse] = await Promise.all([
        getStockMovements(params),
        getStores(),
        getItems()
      ].map(promise => promise.catch(error => ({ results: [], data: [] }))));
      
      // Filter for transfer movements
      const transferMovements = (movementsResponse.results || movementsResponse.data || [])
        .filter(movement => ['transfer_out', 'transfer_in'].includes(movement.movement_type));
      
      setTransfers(transferMovements);
      setStores(storesResponse.results || storesResponse.data || []);
      setItems(itemsResponse.results || itemsResponse.data || []);
      
    } catch (error) {
      toast.error(error.message || 'Failed to load transfer data');
    } finally {
      setLoading(false);
    }
  };

  // Load initial data
  useEffect(() => {
    loadData();
  }, []);

  // Reload transfers when filters change
  useEffect(() => {
    if (!loading && (selectedFromStore !== 'all' || selectedToStore !== 'all' || selectedItem !== 'all')) {
      loadData();
    }
  }, [selectedFromStore, selectedToStore, selectedItem]);

  // Handle form submission - CORRECTED: Added proper data validation and debugging
  const handleTransferSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      
      // Validate form
      if (!transferForm.item_id || !transferForm.from_store_id || !transferForm.to_store_id || !transferForm.quantity || !transferForm.document_id || !transferForm.notes) {
        toast.error('All required fields must be filled');
        return;
      }
      
      if (parseInt(transferForm.quantity) <= 0) {
        toast.error('Quantity must be positive');
        return;
      }
      
      if (transferForm.from_store_id === transferForm.to_store_id) {
        toast.error('Source and destination stores cannot be the same');
        return;
      }
      
      // Prepare data with proper types
      const submitData = {
        ...transferForm,
        item_id: parseInt(transferForm.item_id),
        from_store_id: parseInt(transferForm.from_store_id),
        to_store_id: parseInt(transferForm.to_store_id),
        quantity: parseInt(transferForm.quantity)
      };
      
      // Debug: Check what's being sent
      console.log('Sending transfer data:', submitData);
      
      // Submit transfer
      const response = await recordTransfer(submitData);
      toast.success('Transfer recorded successfully');
      
      // Reset form
      setTransferForm({
        item_id: '',
        from_store_id: '',
        to_store_id: '',
        quantity: '',
        notes: '',
        document_id: '',
        document_type: 'Transfer Request'
      });
      setTransferDialog({ open: false });
      await loadData();
      
    } catch (error) {
      console.error('Transfer error:', error);
      toast.error(error.message || 'Failed to record transfer kindly ensure quantities and other paramaters are checked before submitting');
    } finally {
      setLoading(false);
    }
  };

  // Filter transfers
  const filteredTransfers = transfers.filter(transfer => {
    if (!searchTerm) return true;
    
    const searchLower = searchTerm.toLowerCase();
    return (
      transfer.item_name?.toLowerCase().includes(searchLower) ||
      transfer.notes?.toLowerCase().includes(searchLower) ||
      transfer.from_store_name?.toLowerCase().includes(searchLower) ||
      transfer.to_store_name?.toLowerCase().includes(searchLower) ||
      transfer.created_by_name?.toLowerCase().includes(searchLower)
    );
  });

  // Pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentTransfers = filteredTransfers.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredTransfers.length / itemsPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const PaginationControls = () => {
    const totalItems = filteredTransfers.length;
    const showingFrom = indexOfFirstItem + 1;
    const showingTo = Math.min(indexOfLastItem, totalItems);

    if (totalItems === 0) return null;

    return (
      <div className="flex items-center justify-between px-4 py-3 border-t">
        <div className="text-sm text-muted-foreground">
          Showing {showingFrom}-{showingTo} of {totalItems} transfers
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
  }, [searchTerm, selectedFromStore, selectedToStore, selectedItem]);

  const clearFilters = () => {
    setSelectedFromStore('all');
    setSelectedToStore('all');
    setSelectedItem('all');
    setSearchTerm('');
  };

  if (loading) {
    return (
      <div className="w-full">
        <div className="flex items-center justify-between mb-4">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-10 w-32" />
        </div>
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
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
          <h1 className="text-2xl font-bold tracking-tight">Location Transfers</h1>
          <p className="text-sm text-muted-foreground">
            Manage inventory transfers between different store locations
          </p>
        </div>
        <div className="flex gap-2 mt-2 sm:mt-0">
          <Button onClick={() => setTransferDialog({ open: true })} size="sm">
            <Truck className="mr-2 h-4 w-4" />
            New Transfer
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
          <div className="space-y-3">
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by item name or notes..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8 h-9"
              />
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <Select value={selectedFromStore} onValueChange={setSelectedFromStore}>
                <SelectTrigger className="h-9">
                  <SelectValue placeholder="All From Stores" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All From Stores</SelectItem>
                  {stores.map((store) => (
                    <SelectItem key={store.id} value={store.id.toString()}>
                      {store.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={selectedToStore} onValueChange={setSelectedToStore}>
                <SelectTrigger className="h-9">
                  <SelectValue placeholder="All To Stores" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All To Stores</SelectItem>
                  {stores.map((store) => (
                    <SelectItem key={store.id} value={store.id.toString()}>
                      {store.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={selectedItem} onValueChange={setSelectedItem}>
                <SelectTrigger className="h-9">
                  <SelectValue placeholder="All Items" />
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

            {(selectedFromStore !== 'all' || selectedToStore !== 'all' || selectedItem !== 'all' || searchTerm) && (
              <div className="flex justify-end">
                <Button onClick={clearFilters} variant="ghost" size="sm">
                  Clear Filters
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Transfers Table */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Transfer History ({filteredTransfers.length})</CardTitle>
          <CardDescription className="text-sm">
            Record of all inventory transfers between stores
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-0 p-0">
          <div className="border rounded-md overflow-hidden">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead className="font-semibold">Date & Time</TableHead>
                    <TableHead className="font-semibold">Item</TableHead>
                    <TableHead className="font-semibold">From Store</TableHead>
                    <TableHead className="font-semibold">To Store</TableHead>
                    <TableHead className="font-semibold text-center">Quantity</TableHead>
                    <TableHead className="font-semibold hidden lg:table-cell">Created By</TableHead>
                    <TableHead className="font-semibold text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {currentTransfers.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-6">
                        <div className="flex flex-col items-center gap-2">
                          <Package className="h-6 w-6 text-muted-foreground" />
                          <p className="text-sm text-muted-foreground">No transfers found</p>
                          <p className="text-xs text-muted-foreground">
                            Try adjusting your filters
                          </p>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : (
                    currentTransfers.map((transfer) => (
                      <TableRow key={transfer.id} className="hover:bg-muted/30">
                        <TableCell>
                          <div className="text-sm">
                            <div className="font-medium">
                              {format(new Date(transfer.timestamp), 'MMM dd, yyyy')}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {format(new Date(transfer.timestamp), 'HH:mm')}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="font-medium text-sm">{transfer.item_name}</div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary" className="text-xs">
                            {transfer.from_store_name || 'N/A'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary" className="text-xs">
                            {transfer.to_store_name || 'N/A'}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-center">
                          <div className="flex items-center justify-center gap-1">
                            <ArrowLeftRight className="h-3 w-3 text-blue-600" />
                            <span className="font-medium text-sm">{transfer.quantity}</span>
                          </div>
                        </TableCell>
                        <TableCell className="hidden lg:table-cell">
                          <span className="text-xs text-muted-foreground">
                            {transfer.created_by_name || 'System'}
                          </span>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button 
                            onClick={() => setViewDialog({ open: true, transfer })}
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

      {/* New Transfer Dialog */}
      <Dialog open={transferDialog.open} onOpenChange={(open) => setTransferDialog({ ...transferDialog, open })}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-lg">New Inventory Transfer</DialogTitle>
            <DialogDescription className="text-sm">
              Transfer stock between store locations
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleTransferSubmit} className="grid gap-4 py-4">
            <div>
              <Label htmlFor="item_id" className="text-xs font-medium text-muted-foreground">Item *</Label>
              <Select
                value={transferForm.item_id}
                onValueChange={(value) => setTransferForm({ ...transferForm, item_id: value })}
                required
              >
                <SelectTrigger className="h-9 mt-1">
                  <SelectValue placeholder="Select Item" />
                </SelectTrigger>
                <SelectContent>
                  {items.map((item) => (
                    <SelectItem key={item.id} value={item.id.toString()}>
                      {item.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="from_store_id" className="text-xs font-medium text-muted-foreground">From Store *</Label>
                <Select
                  value={transferForm.from_store_id}
                  onValueChange={(value) => setTransferForm({ ...transferForm, from_store_id: value })}
                  required
                >
                  <SelectTrigger className="h-9 mt-1">
                    <SelectValue placeholder="Select Source Store" />
                  </SelectTrigger>
                  <SelectContent>
                    {stores.map((store) => (
                      <SelectItem key={store.id} value={store.id.toString()}>
                        {store.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="to_store_id" className="text-xs font-medium text-muted-foreground">To Store *</Label>
                <Select
                  value={transferForm.to_store_id}
                  onValueChange={(value) => setTransferForm({ ...transferForm, to_store_id: value })}
                  required
                >
                  <SelectTrigger className="h-9 mt-1">
                    <SelectValue placeholder="Select Destination Store" />
                  </SelectTrigger>
                  <SelectContent>
                    {stores.map((store) => (
                      <SelectItem key={store.id} value={store.id.toString()}>
                        {store.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label htmlFor="quantity" className="text-xs font-medium text-muted-foreground">Quantity *</Label>
              <Input
                id="quantity"
                type="number"
                value={transferForm.quantity}
                onChange={(e) => setTransferForm({ ...transferForm, quantity: e.target.value })}
                className="h-9 mt-1"
                min="1"
                required
              />
            </div>

            <div>
              <Label htmlFor="document_id" className="text-xs font-medium text-muted-foreground">Document ID</Label>
              <Input
                id="document_id"
                type="number"
                value={transferForm.document_id}
                onChange={(e) => setTransferForm({ ...transferForm, document_id: e.target.value })}
                className="h-9 mt-1"
                placeholder="e.g., 001"
                required
              />
            </div>

            <div>
              <Label htmlFor="notes" className="text-xs font-medium text-muted-foreground">Notes</Label>
              <Input
                id="notes"
                value={transferForm.notes}
                onChange={(e) => setTransferForm({ ...transferForm, notes: e.target.value })}
                className="h-9 mt-1"
                placeholder="Additional notes about this transfer"
                required
              />
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setTransferDialog({ open: false })}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? (
                  <RefreshCw className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <Truck className="h-4 w-4 mr-2" />
                )}
                Record Transfer
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* View Transfer Dialog */}
      <Dialog open={viewDialog.open} onOpenChange={(open) => setViewDialog({ ...viewDialog, open })}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-lg">Transfer Details</DialogTitle>
            <DialogDescription className="text-sm">
              Complete information about this inventory transfer
            </DialogDescription>
          </DialogHeader>
          {viewDialog.transfer && (
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-xs font-medium text-muted-foreground">Transfer ID</Label>
                  <p className="text-sm font-mono">{viewDialog.transfer.id}</p>
                </div>
                <div>
                  <Label className="text-xs font-medium text-muted-foreground">Date & Time</Label>
                  <p className="text-sm">{new Date(viewDialog.transfer.timestamp).toLocaleString()}</p>
                </div>
              </div>

              <div>
                <Label className="text-xs font-medium text-muted-foreground">Item</Label>
                <p className="text-sm font-semibold">{viewDialog.transfer.item_name}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-xs font-medium text-muted-foreground">From Store</Label>
                  <p className="text-sm">{viewDialog.transfer.from_store_name || 'N/A'}</p>
                </div>
                <div>
                  <Label className="text-xs font-medium text-muted-foreground">To Store</Label>
                  <p className="text-sm">{viewDialog.transfer.to_store_name || 'N/A'}</p>
                </div>
              </div>

              <div>
                <Label className="text-xs font-medium text-muted-foreground">Quantity</Label>
                <p className="text-sm font-semibold">{viewDialog.transfer.quantity}</p>
              </div>

              {viewDialog.transfer.related_document_id && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-xs font-medium text-muted-foreground">Related Document</Label>
                    <p className="text-sm">#{viewDialog.transfer.related_document_id}</p>
                  </div>
                  <div>
                    <Label className="text-xs font-medium text-muted-foreground">Document Type</Label>
                    <p className="text-sm">{viewDialog.transfer.related_document_type || 'N/A'}</p>
                  </div>
                </div>
              )}

              {viewDialog.transfer.notes && (
                <div>
                  <Label className="text-xs font-medium text-muted-foreground">Notes</Label>
                  <p className="text-sm bg-muted p-3 rounded mt-1">{viewDialog.transfer.notes}</p>
                </div>
              )}

              <div>
                <Label className="text-xs font-medium text-muted-foreground">Created By</Label>
                <p className="text-sm">{viewDialog.transfer.created_by_name || 'System'}</p>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setViewDialog({ open: false, transfer: null })}
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
