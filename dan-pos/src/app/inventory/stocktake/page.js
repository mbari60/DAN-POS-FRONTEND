'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
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
  ClipboardList,
  RefreshCw,
  Save,
  Search,
  Package,
  TrendingUp,
  TrendingDown,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { toast } from 'react-toastify';
import { 
  getStores,
  getStock,
  bulkStockTake
} from '@/lib/api/inventory';

// // Add this API function to your lib/api/inventory.js
// const bulkStockTake = async (data) => {
//   try {
//     const response = await api.post('/api/inventory/bulk-stock-adjustments/bulk_stock_take/', data);
//     return response.data;
//   } catch (error) {
//     throw new Error(error.response?.data?.message || 'Failed to update stock counts');
//   }
// };

export default function SimpleStockTake() {
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [stores, setStores] = useState([]);
  const [stock, setStock] = useState([]);
  const [selectedStore, setSelectedStore] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [physicalCounts, setPhysicalCounts] = useState({});

  const loadData = async () => {
    try {
      setLoading(true);
      const [storesData, stockData] = await Promise.all([
        getStores(),
        getStock()
      ]);
      
      setStores(storesData.data || []);
      setStock(stockData.data || []);
    } catch (error) {
      toast.error(error.message || 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Filter stock for selected store
  const filteredStock = selectedStore 
    ? stock.filter(item => item.store.toString() === selectedStore)
    : [];

  // Filter by search term
  const searchedStock = filteredStock.filter(item =>
    item.item_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.item_sku?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Handle physical count input
  const handlePhysicalCountChange = (itemId, value) => {
    setPhysicalCounts(prev => ({
      ...prev,
      [itemId]: parseInt(value) || 0
    }));
  };

  // Submit stock take
  const handleSubmitStockTake = async () => {
    if (!selectedStore) {
      toast.error('Please select a store first');
      return;
    }

    const itemsToUpdate = Object.entries(physicalCounts)
      .filter(([itemId, count]) => {
        const stockItem = filteredStock.find(s => s.item.toString() === itemId);
        return stockItem && stockItem.quantity !== count;
      })
      .map(([itemId, count]) => ({
        item_id: parseInt(itemId),
        physical_count: count
      }));

    if (itemsToUpdate.length === 0) {
      toast.info('No changes detected. All counts match system quantities.');
      return;
    }

    try {
      setSubmitting(true);
      const result = await bulkStockTake({
        store_id: parseInt(selectedStore),
        items: itemsToUpdate
      });

      toast.success(`Successfully updated ${result.items_adjusted} items`);
      
      // Reload data to show updated quantities
      loadData();
      setPhysicalCounts({});
      
    } catch (error) {
      toast.error(error.message || 'Failed to update stock counts');
    } finally {
      setSubmitting(false);
    }
  };

  // Calculate totals
  const getTotals = () => {
    let totalVariance = 0;
    let itemsWithVariance = 0;
    let totalValueVariance = 0;

    filteredStock.forEach(item => {
      const physicalCount = physicalCounts[item.item] || item.quantity;
      const variance = physicalCount - item.quantity;
      
      if (variance !== 0) {
        itemsWithVariance++;
        totalVariance += variance;
        // You might want to calculate value variance if you have prices
      }
    });

    return { totalVariance, itemsWithVariance };
  };

  if (loading) {
    return (
      <div className="w-full space-y-4 p-4 lg:p-6">
        <Skeleton className="h-8 w-48" />
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
          <h1 className="text-2xl font-bold tracking-tight">Simple Stock Take</h1>
          <p className="text-sm text-muted-foreground">
            Compare physical counts with system inventory and update
          </p>
        </div>
        <Button onClick={loadData} className="mt-2 sm:mt-0" size="sm" variant="outline">
          <RefreshCw className="mr-2 h-4 w-4" />
          Refresh
        </Button>
      </div>

      {/* Store Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Select Store</CardTitle>
          <CardDescription>
            Choose a store to conduct stock take
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Select value={selectedStore} onValueChange={setSelectedStore}>
            <SelectTrigger className="w-full sm:w-[300px]">
              <SelectValue placeholder="Select a store" />
            </SelectTrigger>
            <SelectContent>
              {stores.filter(store => store.is_active).map((store) => (
                <SelectItem key={store.id} value={store.id.toString()}>
                  {store.name} - {store.location}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {selectedStore && (
        <>
          {/* Summary Card */}
          <Card>
            <CardContent className="pt-4">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-700">{filteredStock.length}</div>
                  <div className="text-sm text-blue-900">Total Items</div>
                </div>
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-700">
                    {filteredStock.filter(item => {
                      const physicalCount = physicalCounts[item.item] || item.quantity;
                      return physicalCount === item.quantity;
                    }).length}
                  </div>
                  <div className="text-sm text-green-900">Matching Counts</div>
                </div>
                <div className="text-center p-4 bg-orange-50 rounded-lg">
                  <div className="text-2xl font-bold text-orange-700">
                    {filteredStock.filter(item => {
                      const physicalCount = physicalCounts[item.item] || item.quantity;
                      return physicalCount !== item.quantity;
                    }).length}
                  </div>
                  <div className="text-sm text-orange-900">Variances</div>
                </div>
                <div className="text-center p-4 bg-purple-50 rounded-lg">
                  <div className="text-2xl font-bold text-purple-700">
                    {getTotals().totalVariance > 0 ? '+' : ''}{getTotals().totalVariance}
                  </div>
                  <div className="text-sm text-purple-900">Total Variance</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search items by name or SKU..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8"
            />
          </div>

          {/* Items Table */}
          <Card>
            <CardHeader>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <CardTitle>Stock Items</CardTitle>
                  <CardDescription>
                    Enter physical counts. System will update automatically when you submit.
                  </CardDescription>
                </div>
                <Button 
                  onClick={handleSubmitStockTake}
                  disabled={submitting || Object.keys(physicalCounts).length === 0}
                  className="mt-2 sm:mt-0"
                >
                  <Save className="mr-2 h-4 w-4" />
                  {submitting ? 'Updating...' : 'Update Stock Counts'}
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="border rounded-md overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Item</TableHead>
                      <TableHead>SKU</TableHead>
                      <TableHead>System Quantity</TableHead>
                      <TableHead>Physical Count</TableHead>
                      <TableHead>Variance</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {searchedStock.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-6">
                          <div className="flex flex-col items-center gap-2">
                            <Package className="h-6 w-6 text-muted-foreground" />
                            <p className="text-sm text-muted-foreground">
                              {selectedStore ? 'No items found in this store' : 'Select a store to view items'}
                            </p>
                          </div>
                        </TableCell>
                      </TableRow>
                    ) : (
                      searchedStock.map((item) => {
                        const physicalCount = physicalCounts[item.item] !== undefined 
                          ? physicalCounts[item.item] 
                          : item.quantity;
                        const variance = physicalCount - item.quantity;
                        const hasVariance = variance !== 0;
                        
                        return (
                          <TableRow key={item.id} className={hasVariance ? 'bg-amber-50' : ''}>
                            <TableCell>
                              <div className="font-medium">{item.item_name}</div>
                            </TableCell>
                            <TableCell>
                              <code className="text-xs bg-muted px-1.5 py-0.5 rounded">
                                {item.item_sku}
                              </code>
                            </TableCell>
                            <TableCell>
                              <div className="font-medium">{item.quantity}</div>
                            </TableCell>
                            <TableCell>
                              <Input
                                type="number"
                                min="0"
                                value={physicalCount}
                                onChange={(e) => handlePhysicalCountChange(item.item, e.target.value)}
                                className="w-24"
                              />
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-1">
                                {hasVariance ? (
                                  variance > 0 ? (
                                    <TrendingUp className="h-3 w-3 text-green-600" />
                                  ) : (
                                    <TrendingDown className="h-3 w-3 text-red-600" />
                                  )
                                ) : null}
                                <span className={
                                  variance > 0 ? 'text-green-600 font-medium' :
                                  variance < 0 ? 'text-red-600 font-medium' : 'text-gray-500'
                                }>
                                  {variance > 0 ? '+' : ''}{variance}
                                </span>
                              </div>
                            </TableCell>
                            <TableCell>
                              {hasVariance ? (
                                <Badge variant="outline" className="bg-amber-100 text-amber-800">
                                  <AlertCircle className="h-3 w-3 mr-1" />
                                  Variance
                                </Badge>
                              ) : (
                                <Badge variant="outline" className="bg-green-100 text-green-800">
                                  <CheckCircle className="h-3 w-3 mr-1" />
                                  Matching
                                </Badge>
                              )}
                            </TableCell>
                          </TableRow>
                        );
                      })
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>

          {/* Instructions */}
          <Alert>
            <ClipboardList className="h-4 w-4" />
            <AlertDescription>
              <strong>How it works:</strong> Enter physical counts in the "Physical Count" column. 
              When you click "Update Stock Counts", the system will automatically create stock adjustments 
              and update inventory levels. All changes will appear in stock movements.
            </AlertDescription>
          </Alert>
        </>
      )}
    </div>
  );
}