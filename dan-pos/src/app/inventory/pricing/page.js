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
  DollarSign, 
  Plus, 
  Edit, 
  Trash2, 
  Search,
  RefreshCw,
  Eye,
  Tag,
  ChevronLeft,
  ChevronRight,
  Calendar,
  CheckCircle,
  XCircle
} from 'lucide-react';
import { toast } from 'react-toastify';
import { 
  getSalesTypes,
  createSalesType,
  updateSalesType,
  deleteSalesType,
  getItemPrices,
  createItemPrice,
  updateItemPrice,
  deleteItemPrice,
  getItems,
} from '@/lib/api/inventory';
import { getCurrentUser } from '@/services/auth';

export default function PricingManagement() {
  // State management
  const [activeTab, setActiveTab] = useState('prices');
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);
  const [salesTypes, setSalesTypes] = useState([]);
  const [itemPrices, setItemPrices] = useState([]);
  const [items, setItems] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSalesType, setSelectedSalesType] = useState('all');
  const [selectedItem, setSelectedItem] = useState('all');
  
  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(3);
  
  // Dialog states
  const [salesTypeDialog, setSalesTypeDialog] = useState({ open: false, salesType: null });
  const [priceDialog, setPriceDialog] = useState({ open: false, price: null });
  const [viewDialog, setViewDialog] = useState({ open: false, price: null });
  const [deleteDialog, setDeleteDialog] = useState({ open: false, type: '', id: null });

  // Form states
  const [salesTypeForm, setSalesTypeForm] = useState({
    name: '',
    description: '',
    is_active: true
  });

  const [priceForm, setPriceForm] = useState({
    item: '',
    sales_type: '',
    price: '',
    is_active: true
  });

  const loadData = async () => {
    try {
      setLoading(true);
      
      // Get current user
      const userData = await getCurrentUser();
      setCurrentUser(userData);
      
      const [salesTypesData, pricesData, itemsData] = await Promise.all([
        getSalesTypes(),
        getItemPrices(),
        getItems()
      ]);
      
      setSalesTypes(salesTypesData.data || salesTypesData.results || []);
      setItemPrices(pricesData.data || pricesData.results || []);
      setItems(itemsData.data || itemsData.results || []);
    } catch (error) {
      toast.error(error.message || 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Sales Type operations
  const handleSalesTypeSubmit = async (e) => {
    e.preventDefault();
    
    try {
      if (salesTypeDialog.salesType) {
        // Update existing sales type
        await updateSalesType(salesTypeDialog.salesType.id, salesTypeForm);
        toast.success('Sales type updated successfully');
      } else {
        // Create new sales type
        await createSalesType(salesTypeForm);
        toast.success('Sales type created successfully');
      }
      
      setSalesTypeDialog({ open: false, salesType: null });
      resetSalesTypeForm();
      loadData();
    } catch (error) {
      toast.error(error.message || 'Failed to save sales type');
    }
  };

  // Price operations
  const handlePriceSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const priceData = {
        ...priceForm,
        price: parseFloat(priceForm.price),
        item: parseInt(priceForm.item),
        sales_type: parseInt(priceForm.sales_type)
      };

      if (priceDialog.price) {
        // Update existing price
        await updateItemPrice(priceDialog.price.id, priceData);
        toast.success('Price updated successfully');
      } else {
        // Create new price
        await createItemPrice(priceData);
        toast.success('Price created successfully');
      }
      
      setPriceDialog({ open: false, price: null });
      resetPriceForm();
      loadData();
    } catch (error) {
      toast.error(error.message || 'Failed to save price');
    }
  };

  // Delete operations
  const handleDelete = async () => {
    try {
      if (deleteDialog.type === 'salesType') {
        await deleteSalesType(deleteDialog.id);
        toast.success('Sales type deleted successfully');
      } else if (deleteDialog.type === 'price') {
        await deleteItemPrice(deleteDialog.id);
        toast.success('Price deleted successfully');
      }
      
      setDeleteDialog({ open: false, type: '', id: null });
      loadData();
    } catch (error) {
      toast.error(error.message || 'Failed to delete');
    }
  };

  // Helper functions
  const resetSalesTypeForm = () => {
    setSalesTypeForm({
      name: '',
      description: '',
      is_active: true
    });
  };

  const resetPriceForm = () => {
    setPriceForm({
      item: '',
      sales_type: '',
      price: '',
      is_active: true
    });
  };

  const openSalesTypeDialog = (salesType = null) => {
    if (salesType) {
      setSalesTypeForm({
        name: salesType.name,
        description: salesType.description,
        is_active: salesType.is_active
      });
    } else {
      resetSalesTypeForm();
    }
    setSalesTypeDialog({ open: true, salesType });
  };

  const openPriceDialog = (price = null) => {
    if (price) {
      setPriceForm({
        item: price.item?.toString(),
        sales_type: price.sales_type?.toString(),
        price: price.price?.toString(),
        is_active: price.is_active
      });
    } else {
      resetPriceForm();
    }
    setPriceDialog({ open: true, price });
  };

  const getStatusBadge = (isActive) => {
    return (
      <Badge variant={isActive ? "default" : "secondary"} className="flex items-center gap-1">
        {isActive ? <CheckCircle className="h-3 w-3" /> : <XCircle className="h-3 w-3" />}
        {isActive ? 'Active' : 'Inactive'}
      </Badge>
    );
  };

  // Filter functions
  const filteredSalesTypes = salesTypes.filter(st => 
    st.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    st.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredPrices = itemPrices.filter(price => {
    const matchesSearch = 
      price.item_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      price.sales_type_name?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSalesType = selectedSalesType === 'all' || price.sales_type?.toString() === selectedSalesType;
    const matchesItem = selectedItem === 'all' || price.item?.toString() === selectedItem;
    return matchesSearch && matchesSalesType && matchesItem;
  });

  // Pagination functions
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentSalesTypes = filteredSalesTypes.slice(indexOfFirstItem, indexOfLastItem);
  const currentPrices = filteredPrices.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(
    activeTab === 'sales-types' ? filteredSalesTypes.length / itemsPerPage : filteredPrices.length / itemsPerPage
  );

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const PaginationControls = () => {
    const totalItems = activeTab === 'sales-types' ? filteredSalesTypes.length : filteredPrices.length;
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
  }, [searchTerm, selectedSalesType, selectedItem, activeTab]);

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
          <h1 className="text-2xl font-bold tracking-tight">Pricing Management</h1>
          <p className="text-sm text-muted-foreground">
            Manage sales types and item pricing across your system
          </p>
        </div>
        <div className="flex gap-2 mt-2 sm:mt-0">
          {activeTab === 'sales-types' ? (
            <Button onClick={() => openSalesTypeDialog()} size="sm">
              <Plus className="mr-2 h-4 w-4" />
              New Sales Type
            </Button>
          ) : (
            <Button onClick={() => openPriceDialog()} size="sm">
              <Plus className="mr-2 h-4 w-4" />
              New Price
            </Button>
          )}
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
                placeholder={
                  activeTab === 'sales-types' 
                    ? "Search sales types..." 
                    : "Search by item name, sales type..."
                }
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8 h-9"
              />
            </div>
            
            {activeTab === 'prices' && (
              <>
                <Select value={selectedSalesType} onValueChange={setSelectedSalesType}>
                  <SelectTrigger className="w-full sm:w-[200px] h-9">
                    <SelectValue placeholder="Filter by sales type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Sales Types</SelectItem>
                    {salesTypes.map((st) => (
                      <SelectItem key={st.id} value={st.id.toString()}>
                        {st.name}
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
              </>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2 lg:w-[400px]">
          <TabsTrigger value="prices" className="flex items-center gap-2 text-xs">
            <DollarSign className="h-3 w-3" />
            Item Prices ({filteredPrices.length})
          </TabsTrigger>
          <TabsTrigger value="sales-types" className="flex items-center gap-2 text-xs">
            <Tag className="h-3 w-3" />
            Sales Types ({filteredSalesTypes.length})
          </TabsTrigger>
        </TabsList>

        {/* Prices Tab */}
        <TabsContent value="prices" className="space-y-3">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Item Pricing</CardTitle>
              <CardDescription className="text-sm">
                Manage pricing for items across different sales types
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-0 p-0">
              <div className="border rounded-md overflow-hidden">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-muted/50">
                        <TableHead className="font-semibold">Item</TableHead>
                        <TableHead className="font-semibold">Sales Type</TableHead>
                        <TableHead className="font-semibold">Price</TableHead>
                        <TableHead className="font-semibold hidden md:table-cell">Status</TableHead>
                        <TableHead className="font-semibold hidden lg:table-cell">Effective Date</TableHead>
                        <TableHead className="font-semibold text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {currentPrices.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={6} className="text-center py-6">
                            <div className="flex flex-col items-center gap-2">
                              <DollarSign className="h-6 w-6 text-muted-foreground" />
                              <p className="text-sm text-muted-foreground">No pricing records found</p>
                            </div>
                          </TableCell>
                        </TableRow>
                      ) : (
                        currentPrices.map((price) => (
                          <TableRow key={price.id} className="hover:bg-muted/30">
                            <TableCell>
                              <div className="font-medium text-sm">{price.item_name}</div>
                              <code className="text-xs text-muted-foreground">{price.item_sku}</code>
                            </TableCell>
                            <TableCell>
                              <Badge variant="secondary" className="text-xs">
                                {price.sales_type_name}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <div className="font-medium text-sm text-green-600">
                                Ksh. {parseFloat(price.price).toLocaleString()}
                              </div>
                            </TableCell>
                            <TableCell className="hidden md:table-cell">
                              {getStatusBadge(price.is_active)}
                            </TableCell>
                            <TableCell className="hidden lg:table-cell">
                              <span className="text-xs text-muted-foreground">
                                {new Date(price.effective_date).toLocaleDateString()}
                              </span>
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex justify-end gap-1">
                                <Button 
                                  onClick={() => setViewDialog({ open: true, price })}
                                  size="sm" 
                                  variant="outline"
                                  className="h-7 px-2"
                                >
                                  <Eye className="h-3 w-3" />
                                </Button>
                                <Button 
                                  onClick={() => openPriceDialog(price)}
                                  size="sm" 
                                  variant="outline"
                                  className="h-7 px-2"
                                >
                                  <Edit className="h-3 w-3" />
                                </Button>
                                <Button 
                                  onClick={() => setDeleteDialog({ open: true, type: 'price', id: price.id })}
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
        </TabsContent>

        {/* Sales Types Tab */}
        <TabsContent value="sales-types" className="space-y-3">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Sales Types</CardTitle>
              <CardDescription className="text-sm">
                Manage different sales types for pricing tiers (e.g., Retail, Wholesale)
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-0 p-0">
              <div className="border rounded-md overflow-hidden">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-muted/50">
                        <TableHead className="font-semibold">Name</TableHead>
                        <TableHead className="font-semibold">Description</TableHead>
                        <TableHead className="font-semibold">Status</TableHead>
                        <TableHead className="font-semibold hidden lg:table-cell">Active Prices</TableHead>
                        <TableHead className="font-semibold text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {currentSalesTypes.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={5} className="text-center py-6">
                            <div className="flex flex-col items-center gap-2">
                              <Tag className="h-6 w-6 text-muted-foreground" />
                              <p className="text-sm text-muted-foreground">No sales types found</p>
                            </div>
                          </TableCell>
                        </TableRow>
                      ) : (
                        currentSalesTypes.map((salesType) => {
                          const activePrices = itemPrices.filter(
                            price => price.sales_type === salesType.id && price.is_active
                          ).length;

                          return (
                            <TableRow key={salesType.id} className="hover:bg-muted/30">
                              <TableCell>
                                <div className="font-medium text-sm">{salesType.name}</div>
                              </TableCell>
                              <TableCell>
                                <p className="text-sm text-muted-foreground max-w-[200px] truncate">
                                  {salesType.description || 'No description'}
                                </p>
                              </TableCell>
                              <TableCell>
                                {getStatusBadge(salesType.is_active)}
                              </TableCell>
                              <TableCell className="hidden lg:table-cell">
                                <Badge variant="outline" className="text-xs">
                                  {activePrices} active prices
                                </Badge>
                              </TableCell>
                              <TableCell className="text-right">
                                <div className="flex justify-end gap-1">
                                  <Button 
                                    onClick={() => openSalesTypeDialog(salesType)}
                                    size="sm" 
                                    variant="outline"
                                    className="h-7 px-2"
                                  >
                                    <Edit className="h-3 w-3" />
                                  </Button>
                                  <Button 
                                    onClick={() => setDeleteDialog({ open: true, type: 'salesType', id: salesType.id })}
                                    size="sm" 
                                    variant="outline"
                                    className="h-7 px-2 text-red-600 hover:text-red-700"
                                  >
                                    <Trash2 className="h-3 w-3" />
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
        </TabsContent>
      </Tabs>

      {/* Sales Type Dialog */}
      <Dialog open={salesTypeDialog.open} onOpenChange={(open) => setSalesTypeDialog({ ...salesTypeDialog, open })}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="text-lg">
              {salesTypeDialog.salesType ? 'Edit Sales Type' : 'Create New Sales Type'}
            </DialogTitle>
            <DialogDescription className="text-sm">
              {salesTypeDialog.salesType 
                ? `Update ${salesTypeDialog.salesType.name} details`
                : 'Create a new sales type for pricing tiers'
              }
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSalesTypeSubmit}>
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-sm">Name *</Label>
                <Input
                  id="name"
                  value={salesTypeForm.name}
                  onChange={(e) => setSalesTypeForm({ ...salesTypeForm, name: e.target.value })}
                  placeholder="e.g., Retail, Wholesale, VIP"
                  className="h-9"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description" className="text-sm">Description</Label>
                <Textarea
                  id="description"
                  value={salesTypeForm.description}
                  onChange={(e) => setSalesTypeForm({ ...salesTypeForm, description: e.target.value })}
                  placeholder="Description of this sales type"
                  className="min-h-[80px]"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="is_active" className="text-sm">Status</Label>
                <Select 
                  value={salesTypeForm.is_active.toString()} 
                  onValueChange={(value) => setSalesTypeForm({ ...salesTypeForm, is_active: value === 'true' })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="true">Active</SelectItem>
                    <SelectItem value="false">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setSalesTypeDialog({ open: false, salesType: null });
                  resetSalesTypeForm();
                }}
              >
                Cancel
              </Button>
              <Button type="submit">
                {salesTypeDialog.salesType ? 'Update' : 'Create'} Sales Type
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Price Dialog */}
      <Dialog open={priceDialog.open} onOpenChange={(open) => setPriceDialog({ ...priceDialog, open })}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="text-lg">
              {priceDialog.price ? 'Edit Price' : 'Create New Price'}
            </DialogTitle>
            <DialogDescription className="text-sm">
              {priceDialog.price 
                ? `Update pricing for ${priceDialog.price.item_name}`
                : 'Set pricing for an item and sales type'
              }
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handlePriceSubmit}>
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="item" className="text-sm">Item *</Label>
                <Select 
                  value={priceForm.item} 
                  onValueChange={(value) => setPriceForm({ ...priceForm, item: value })}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select item" />
                  </SelectTrigger>
                  <SelectContent>
                    {items.map((item) => (
                      <SelectItem key={item.id} value={item.id.toString()}>
                        {item.name} ({item.sku})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="sales_type" className="text-sm">Sales Type *</Label>
                <Select 
                  value={priceForm.sales_type} 
                  onValueChange={(value) => setPriceForm({ ...priceForm, sales_type: value })}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select sales type" />
                  </SelectTrigger>
                  <SelectContent>
                    {salesTypes.map((st) => (
                      <SelectItem key={st.id} value={st.id.toString()}>
                        {st.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="price" className="text-sm">Price (Ksh) *</Label>
                <Input
                  id="price"
                  type="number"
                  step="0.01"
                  min="0"
                  value={priceForm.price}
                  onChange={(e) => setPriceForm({ ...priceForm, price: e.target.value })}
                  placeholder="0.00"
                  className="h-9"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="is_active" className="text-sm">Status</Label>
                <Select 
                  value={priceForm.is_active.toString()} 
                  onValueChange={(value) => setPriceForm({ ...priceForm, is_active: value === 'true' })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="true">Active</SelectItem>
                    <SelectItem value="false">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setPriceDialog({ open: false, price: null });
                  resetPriceForm();
                }}
              >
                Cancel
              </Button>
              <Button type="submit">
                {priceDialog.price ? 'Update' : 'Create'} Price
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* View Price Dialog */}
      <Dialog open={viewDialog.open} onOpenChange={(open) => setViewDialog({ ...viewDialog, open })}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="text-lg">Price Details</DialogTitle>
            <DialogDescription className="text-sm">
              {viewDialog.price?.item_name} - {viewDialog.price?.sales_type_name}
            </DialogDescription>
          </DialogHeader>
          {viewDialog.price && (
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-xs font-medium text-muted-foreground">Item</Label>
                  <p className="text-sm font-semibold">{viewDialog.price.item_name}</p>
                  <code className="text-xs text-muted-foreground">{viewDialog.price.item_sku}</code>
                </div>
                <div>
                  <Label className="text-xs font-medium text-muted-foreground">Sales Type</Label>
                  <p className="text-sm font-semibold">{viewDialog.price.sales_type_name}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-xs font-medium text-muted-foreground">Price</Label>
                  <p className="text-2xl font-bold text-green-600">
                    Ksh. {parseFloat(viewDialog.price.price).toLocaleString()}
                  </p>
                </div>
                <div>
                  <Label className="text-xs font-medium text-muted-foreground">Status</Label>
                  {getStatusBadge(viewDialog.price.is_active)}
                </div>
              </div>

              <div>
                <Label className="text-xs font-medium text-muted-foreground">Effective Date</Label>
                <div className="flex items-center gap-1 mt-1">
                  <Calendar className="h-3 w-3 text-muted-foreground" />
                  <p className="text-sm">
                    {new Date(viewDialog.price.effective_date).toLocaleString()}
                  </p>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setViewDialog({ open: false, price: null })}
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
            <DialogTitle className="text-lg">Confirm Delete</DialogTitle>
            <DialogDescription className="text-sm">
              Are you sure you want to delete this {deleteDialog.type}? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteDialog({ open: false, type: '', id: null })}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}