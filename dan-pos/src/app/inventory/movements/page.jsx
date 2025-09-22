import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Calendar } from "@/components/ui/calendar";
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
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { 
  ArrowUpRight,
  ArrowDownLeft,
  ArrowLeftRight,
  Package,
  Search,
  RefreshCw,
  Eye,
  Calendar as CalendarIcon,
  Download,
  TrendingUp,
  TrendingDown,
  RotateCcw,
  ShoppingCart,
  Truck,
  AlertTriangle,
  Trash2,
  Gift,
  Settings,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { toast } from 'react-toastify';
import { 
  getStockMovements,
  getStores,
  getItems,
  getMovementSummary
} from '@/lib/api/inventory';

export default function StockMovements() {
  // State management
  const [loading, setLoading] = useState(true);
  const [movements, setMovements] = useState([]);
  const [stores, setStores] = useState([]);
  const [items, setItems] = useState([]);
  const [summary, setSummary] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Filter states
  const [selectedStore, setSelectedStore] = useState('all');
  const [selectedItem, setSelectedItem] = useState('all');
  const [selectedType, setSelectedType] = useState('all');
  const [dateFrom, setDateFrom] = useState(null);
  const [dateTo, setDateTo] = useState(null);
  
  // Pagination states - 3 items per page
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(3);
  
  // Dialog states
  const [viewDialog, setViewDialog] = useState({ open: false, movement: null });
  const [summaryDialog, setSummaryDialog] = useState({ open: false });

  const loadData = async () => {
    try {
      setLoading(true);
      
      // Build query parameters for movements
      const params = {};
      if (selectedStore !== 'all') params.store = selectedStore;
      if (selectedItem !== 'all') params.item = selectedItem;
      if (selectedType !== 'all') params.type = selectedType;
      if (dateFrom) params.date_from = format(dateFrom, 'yyyy-MM-dd');
      if (dateTo) params.date_to = format(dateTo, 'yyyy-MM-dd');
      
      // Load all data in parallel
      const dataPromises = [
        getStockMovements(params),
        getStores(),
        getItems(),
        getMovementSummary(30) // Last 30 days summary
      ];
      
      const [movementsResponse, storesResponse, itemsResponse, summaryResponse] = await Promise.all(
        dataPromises.map(promise => promise.catch(error => {
          return { results: [], data: [] }; // Return empty data on error
        }))
      );
      
      // Extract data with proper fallbacks
      const movementsData = movementsResponse.results || movementsResponse.data || [];
      const storesData = storesResponse.results || storesResponse.data || [];
      const itemsData = itemsResponse.results || itemsResponse.data || [];
      const summaryData = summaryResponse.results || summaryResponse.data || summaryResponse || [];
      
      setMovements(movementsData);
      setStores(storesData);
      setItems(itemsData);
      setSummary(summaryData);
      
    } catch (error) {
      toast.error(error.message || 'Failed to load movements data');
    } finally {
      setLoading(false);
    }
  };

  // Load initial data
  useEffect(() => {
    loadData();
  }, []);

  // Reload movements when filters change
  useEffect(() => {
    if (!loading && (selectedStore !== 'all' || selectedItem !== 'all' || selectedType !== 'all' || dateFrom || dateTo)) {
      loadData();
    }
  }, [selectedStore, selectedItem, selectedType, dateFrom, dateTo]);

  // Movement type configurations
  const movementTypes = {
    'purchase': { 
      label: 'Purchase Receival', 
      icon: <ShoppingCart className="h-4 w-4" />, 
      color: 'bg-green-100 text-green-800 border-green-200',
      direction: 'in'
    },
    'sale': { 
      label: 'Sale', 
      icon: <ArrowUpRight className="h-4 w-4" />, 
      color: 'bg-red-100 text-red-800 border-red-200',
      direction: 'out'
    },
    'sale_reversal': { 
      label: 'Sale Reversal', 
      icon: <RotateCcw className="h-4 w-4" />, 
      color: 'bg-blue-100 text-blue-800 border-blue-200',
      direction: 'in'
    },
    'transfer_out': { 
      label: 'Transfer (Outgoing)', 
      icon: <ArrowDownLeft className="h-4 w-4" />, 
      color: 'bg-orange-100 text-orange-800 border-orange-200',
      direction: 'out'
    },
    'transfer_in': { 
      label: 'Transfer (Incoming)', 
      icon: <ArrowUpRight className="h-4 w-4" />, 
      color: 'bg-purple-100 text-purple-800 border-purple-200',
      direction: 'in'
    },
    'adjustment': { 
      label: 'Manual Adjustment', 
      icon: <Settings className="h-4 w-4" />, 
      color: 'bg-gray-100 text-gray-800 border-gray-200',
      direction: 'neutral'
    },
    'return': { 
      label: 'Customer Return', 
      icon: <ArrowLeftRight className="h-4 w-4" />, 
      color: 'bg-indigo-100 text-indigo-800 border-indigo-200',
      direction: 'in'
    },
    'waste': { 
      label: 'Waste/Disposal', 
      icon: <Trash2 className="h-4 w-4" />, 
      color: 'bg-gray-100 text-gray-800 border-gray-200',
      direction: 'out'
    },
    'damaged': { 
      label: 'Damaged Stock', 
      icon: <AlertTriangle className="h-4 w-4" />, 
      color: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      direction: 'out'
    },
    'expired': { 
      label: 'Expired Stock', 
      icon: <AlertTriangle className="h-4 w-4" />, 
      color: 'bg-red-100 text-red-800 border-red-200',
      direction: 'out'
    }
  };

  const getMovementTypeConfig = (type) => {
    return movementTypes[type] || { 
      label: type, 
      icon: <Package className="h-4 w-4" />, 
      color: 'bg-gray-100 text-gray-800 border-gray-200',
      direction: 'neutral'
    };
  };

  // Filter movements - only search filtering here since API handles other filters
  const filteredMovements = movements.filter(movement => {
    if (!searchTerm) return true;
    
    const searchLower = searchTerm.toLowerCase();
    return (
      movement.item_name?.toLowerCase().includes(searchLower) ||
      movement.notes?.toLowerCase().includes(searchLower) ||
      movement.movement_type?.toLowerCase().includes(searchLower) ||
      movement.movement_type_display?.toLowerCase().includes(searchLower) ||
      movement.from_store_name?.toLowerCase().includes(searchLower) ||
      movement.to_store_name?.toLowerCase().includes(searchLower) ||
      movement.created_by_name?.toLowerCase().includes(searchLower)
    );
  });

  // Pagination functions - 3 items per page
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentMovements = filteredMovements.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredMovements.length / itemsPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const PaginationControls = () => {
    const totalItems = filteredMovements.length;
    const showingFrom = indexOfFirstItem + 1;
    const showingTo = Math.min(indexOfLastItem, totalItems);

    if (totalItems === 0) return null;

    return (
      <div className="flex items-center justify-between px-4 py-3 border-t">
        <div className="text-sm text-muted-foreground">
          Showing {showingFrom}-{showingTo} of {totalItems} movements
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
  }, [searchTerm, selectedStore, selectedItem, selectedType, dateFrom, dateTo]);

  const clearFilters = () => {
    setSelectedStore('all');
    setSelectedItem('all');
    setSelectedType('all');
    setDateFrom(null);
    setDateTo(null);
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
          <h1 className="text-2xl font-bold tracking-tight">Stock Movements</h1>
          <p className="text-sm text-muted-foreground">
            Track all inventory movements and transfers across your stores
          </p>
        </div>
        <div className="flex gap-2 mt-2 sm:mt-0">
          <Button onClick={() => setSummaryDialog({ open: true })} variant="outline" size="sm">
            <TrendingUp className="mr-2 h-4 w-4" />
            Summary
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
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by item name, movement type, or notes..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8 h-9"
              />
            </div>
            
            {/* Filter Row */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
              <Select value={selectedStore} onValueChange={setSelectedStore}>
                <SelectTrigger className="h-9">
                  <SelectValue placeholder="All Stores" />
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

              <Select value={selectedType} onValueChange={setSelectedType}>
                <SelectTrigger className="h-9">
                  <SelectValue placeholder="All Types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Movement Types</SelectItem>
                  {Object.entries(movementTypes).map(([key, config]) => (
                    <SelectItem key={key} value={key}>
                      {config.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Date From */}
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="h-9 justify-start text-left font-normal">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {dateFrom ? format(dateFrom, "MMM dd") : "From Date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={dateFrom}
                    onSelect={setDateFrom}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>

              {/* Date To */}
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="h-9 justify-start text-left font-normal">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {dateTo ? format(dateTo, "MMM dd") : "To Date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={dateTo}
                    onSelect={setDateTo}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            {/* Clear Filters Button */}
            {(selectedStore !== 'all' || selectedItem !== 'all' || selectedType !== 'all' || dateFrom || dateTo || searchTerm) && (
              <div className="flex justify-end">
                <Button onClick={clearFilters} variant="ghost" size="sm">
                  Clear Filters
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Movements Table */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Stock Movements ({filteredMovements.length})</CardTitle>
          <CardDescription className="text-sm">
            Complete history of all inventory movements
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-0 p-0">
          <div className="border rounded-md overflow-hidden">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead className="font-semibold">Date & Time</TableHead>
                    <TableHead className="font-semibold">Movement Type</TableHead>
                    <TableHead className="font-semibold">Item</TableHead>
                    <TableHead className="font-semibold hidden sm:table-cell">From Store</TableHead>
                    <TableHead className="font-semibold hidden sm:table-cell">To Store</TableHead>
                    <TableHead className="font-semibold text-center">Quantity</TableHead>
                    <TableHead className="font-semibold hidden lg:table-cell">Created By</TableHead>
                    <TableHead className="font-semibold text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {currentMovements.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-6">
                        <div className="flex flex-col items-center gap-2">
                          <Package className="h-6 w-6 text-muted-foreground" />
                          <p className="text-sm text-muted-foreground">No movements found</p>
                          <p className="text-xs text-muted-foreground">
                            Try adjusting your filters or date range
                          </p>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : (
                    currentMovements.map((movement) => {
                      const config = getMovementTypeConfig(movement.movement_type);
                      return (
                        <TableRow key={movement.id} className="hover:bg-muted/30">
                          <TableCell>
                            <div className="text-sm">
                              <div className="font-medium">
                                {format(new Date(movement.timestamp), 'MMM dd, yyyy')}
                              </div>
                              <div className="text-xs text-muted-foreground">
                                {format(new Date(movement.timestamp), 'HH:mm')}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className={cn("text-xs", config.color)}>
                              <span className="flex items-center gap-1">
                                {config.icon}
                                {movement.movement_type_display || config.label}
                              </span>
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div>
                              <div className="font-medium text-sm">{movement.item_name}</div>
                            </div>
                          </TableCell>
                          <TableCell className="hidden sm:table-cell">
                            {movement.from_store_name ? (
                              <Badge variant="secondary" className="text-xs">
                                {movement.from_store_name}
                              </Badge>
                            ) : (
                              <span className="text-xs text-muted-foreground">-</span>
                            )}
                          </TableCell>
                          <TableCell className="hidden sm:table-cell">
                            {movement.to_store_name ? (
                              <Badge variant="secondary" className="text-xs">
                                {movement.to_store_name}
                              </Badge>
                            ) : (
                              <span className="text-xs text-muted-foreground">-</span>
                            )}
                          </TableCell>
                          <TableCell className="text-center">
                            <div className="flex items-center justify-center gap-1">
                              {config.direction === 'in' && (
                                <TrendingUp className="h-3 w-3 text-green-600" />
                              )}
                              {config.direction === 'out' && (
                                <TrendingDown className="h-3 w-3 text-red-600" />
                              )}
                              <span className="font-medium text-sm">{movement.quantity}</span>
                            </div>
                          </TableCell>
                          <TableCell className="hidden lg:table-cell">
                            <span className="text-xs text-muted-foreground">
                              {movement.created_by_name || 'System'}
                            </span>
                          </TableCell>
                          <TableCell className="text-right">
                            <Button 
                              onClick={() => setViewDialog({ open: true, movement })}
                              size="sm" 
                              variant="outline"
                              className="h-7 px-2"
                            >
                              <Eye className="h-3 w-3" />
                            </Button>
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

      {/* View Movement Dialog */}
      <Dialog open={viewDialog.open} onOpenChange={(open) => setViewDialog({ ...viewDialog, open })}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-lg">Movement Details</DialogTitle>
            <DialogDescription className="text-sm">
              Complete information about this stock movement
            </DialogDescription>
          </DialogHeader>
          {viewDialog.movement && (
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-xs font-medium text-muted-foreground">Movement ID</Label>
                  <p className="text-sm font-mono">{viewDialog.movement.id}</p>
                </div>
                <div>
                  <Label className="text-xs font-medium text-muted-foreground">Date & Time</Label>
                  <p className="text-sm">{new Date(viewDialog.movement.timestamp).toLocaleString()}</p>
                </div>
              </div>

              <div>
                <Label className="text-xs font-medium text-muted-foreground">Movement Type</Label>
                <div className="mt-1">
                  {(() => {
                    const config = getMovementTypeConfig(viewDialog.movement.movement_type);
                    return (
                      <Badge variant="outline" className={cn("text-sm", config.color)}>
                        <span className="flex items-center gap-2">
                          {config.icon}
                          {viewDialog.movement.movement_type_display || config.label}
                        </span>
                      </Badge>
                    );
                  })()}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-xs font-medium text-muted-foreground">Item</Label>
                  <p className="text-sm font-semibold">{viewDialog.movement.item_name}</p>
                </div>
                <div>
                  <Label className="text-xs font-medium text-muted-foreground">Quantity</Label>
                  <p className="text-sm font-semibold">{viewDialog.movement.quantity}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-xs font-medium text-muted-foreground">From Store</Label>
                  <p className="text-sm">
                    {viewDialog.movement.from_store_name || 'N/A'}
                  </p>
                </div>
                <div>
                  <Label className="text-xs font-medium text-muted-foreground">To Store</Label>
                  <p className="text-sm">
                    {viewDialog.movement.to_store_name || 'N/A'}
                  </p>
                </div>
              </div>

              {viewDialog.movement.related_document_id && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-xs font-medium text-muted-foreground">Related Document</Label>
                    <p className="text-sm">#{viewDialog.movement.related_document_id}</p>
                  </div>
                  <div>
                    <Label className="text-xs font-medium text-muted-foreground">Document Type</Label>
                    <p className="text-sm">{viewDialog.movement.related_document_type || 'N/A'}</p>
                  </div>
                </div>
              )}

              {viewDialog.movement.notes && (
                <div>
                  <Label className="text-xs font-medium text-muted-foreground">Notes</Label>
                  <p className="text-sm bg-muted p-3 rounded mt-1">{viewDialog.movement.notes}</p>
                </div>
              )}

              <div>
                <Label className="text-xs font-medium text-muted-foreground">Created By</Label>
                <p className="text-sm">{viewDialog.movement.created_by_name || 'System'}</p>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setViewDialog({ open: false, movement: null })}
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Summary Dialog */}
      <Dialog open={summaryDialog.open} onOpenChange={(open) => setSummaryDialog({ ...summaryDialog, open })}>
        <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-lg">Movement Summary (Last 30 Days)</DialogTitle>
            <DialogDescription className="text-sm">
              Overview of all movement types and their quantities
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <div className="grid gap-4">
              {summary.length === 0 ? (
                <div className="text-center py-6">
                  <TrendingUp className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                  <p className="text-sm text-muted-foreground">No movement data available</p>
                </div>
              ) : (
                summary.map((item) => {
                  const config = getMovementTypeConfig(item.movement_type);
                  return (
                    <Card key={item.movement_type}>
                      <CardContent className="pt-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className={cn("p-2 rounded-lg", config.color)}>
                              {config.icon}
                            </div>
                            <div>
                              <p className="font-medium text-sm">{item.movement_type_display || config.label}</p>
                              <p className="text-xs text-muted-foreground">
                                {item.count} transaction{item.count !== 1 ? 's' : ''}
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-semibold text-lg">{item.total_quantity}</p>
                            <p className="text-xs text-muted-foreground">units</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })
              )}
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setSummaryDialog({ open: false })}
            >
              Close
            </Button>
            <Button onClick={() => window.print()}>
              <Download className="mr-2 h-4 w-4" />
              Export
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}