"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Download, Eye, AlertCircle, RefreshCw, TrendingUp, BarChart3 } from "lucide-react";
import {
  getStockLevelReport,
  getMovementReport,
  getValuationReport,
  getLowStockReport,
  exportStockLevelExcel,
  exportMovementExcel,
  exportValuationExcel,
  exportLowStockExcel,
  exportStockLevelPDF,
  exportMovementPDF,
  getStockMovements,
  getLowStockItems,
  getStores,
  getStoreInventory,
  downloadBlob,
  getItems,
} from "@/lib/api/inventory";

// Data mapping utility to handle API response field name inconsistencies
const mapApiData = (data, mappingConfig) => {
  if (!data || !Array.isArray(data)) return [];

  return data.map((item) => {
    const mappedItem = {};
    Object.keys(mappingConfig).forEach((targetKey) => {
      const sourceKey = mappingConfig[targetKey];
      mappedItem[targetKey] =
        item[sourceKey] !== undefined ? item[sourceKey] : null;
    });
    return mappedItem;
  });
};

// Mapping configurations for different API responses
const STOCK_LEVEL_MAPPING = {
  store: "store",
  item_name: "item_name",
  sku: "sku",
  category: "category",
  quantity: "quantity",
  reorder_level: "reorder_level",
  total_value: "total_value",
  status: "status",
};

const MOVEMENT_MAPPING = {
  date: "timestamp",
  movement_type: "movement_type_display",
  item_name: "item_name",
  sku: "sku",
  from_store: "from_store_name",
  to_store: "to_store_name",
  quantity: "quantity",
  created_by: "created_by_name",
};


const LOW_STOCK_MAPPING = {
  store: "store",
  item_name: "item_name",
  sku: "sku",
  category: "category",
  current_quantity: "current_quantity",
  reorder_level: "reorder_level",
  needed_quantity: "needed_quantity",
  estimated_cost: "estimated_cost",
};

const STORE_INVENTORY_MAPPING = {
  item_name: "item_name",
  sku: "sku",
  quantity: "quantity",
  reorder_level: "reorder_level",
};

const InventoryDashboard = () => {
  const [activeTab, setActiveTab] = useState("overview");
  const [loading, setLoading] = useState(false);
  const [dashboardData, setDashboardData] = useState({
    stockSummary: {
      totalItems: 0,
      totalValue: 0,
      lowStockItems: 0,
      totalQuantity: 0,
    },
    recentMovements: [],
    stores: [],
    uniqueItems: [], // Store unique items for accurate counting
  });
  const [reports, setReports] = useState({
    stockLevel: [],
    movements: [],
    valuation: [],
    lowStock: [],
  });
  const [filters, setFilters] = useState({
    storeId: "",
    categoryId: "",
    dateFrom: "",
    dateTo: "",
  });
  const [selectedStore, setSelectedStore] = useState(null);
  const [storeInventory, setStoreInventory] = useState([]);
  const [lowStockAlerts, setLowStockAlerts] = useState([]);
  const [showStoreDialog, setShowStoreDialog] = useState(false);
  const [showAlertsDialog, setShowAlertsDialog] = useState(false);
  const [exportLoading, setExportLoading] = useState(false);

  // Fetch unique items to count distinct SKUs
  const fetchUniqueItems = async () => {
    try {
      const itemsRes = await getItems();
      const items = itemsRes.data || itemsRes.results || [];

      // Remove duplicates by SKU
      const uniqueItemsMap = new Map();
      items.forEach((item) => {
        if (item.sku && !uniqueItemsMap.has(item.sku)) {
          uniqueItemsMap.set(item.sku, item);
        }
      });

      return Array.from(uniqueItemsMap.values());
    } catch (error) {
      console.error("Error fetching unique items:", error);
      return [];
    }
  };

  // Calculate accurate totals from stock level data
  const calculateAccurateTotals = (stockLevelData, uniqueItems) => {
    if (!stockLevelData || !Array.isArray(stockLevelData)) {
      return {
        totalItems: 0,
        totalValue: 0,
        lowStockItems: 0,
        totalQuantity: 0,
      };
    }

    const totalValue = stockLevelData.reduce(
      (sum, item) => sum + (Number(item.total_value) || 0),
      0
    );
    const totalQuantity = stockLevelData.reduce(
      (sum, item) => sum + (Number(item.quantity) || 0),
      0
    );
    const lowStockItems = stockLevelData.filter(
      (item) =>
        (Number(item.quantity) || 0) <= (Number(item.reorder_level) || 0)
    ).length;

    return {
      totalItems: uniqueItems.length, // Use unique items count instead of stock records
      totalValue,
      lowStockItems,
      totalQuantity,
    };
  };

  // Fetch dashboard overview data
  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const [
        storesRes,
        movementsRes,
        lowStockRes,
        valuationRes,
        stockLevelRes,
        uniqueItems,
      ] = await Promise.all([
        getStores(),
        getStockMovements({ limit: 10 }),
        getLowStockItems(),
        getValuationReport(),
        getStockLevelReport(),
        fetchUniqueItems(),
      ]);

      // Map API data to consistent field names
      const mappedMovements = mapApiData(
        movementsRes.data?.slice(0, 5) || movementsRes.results?.slice(0, 5),
        MOVEMENT_MAPPING
      );
      const stockLevelData = stockLevelRes.data || stockLevelRes.results || [];

      const accurateTotals = calculateAccurateTotals(
        stockLevelData,
        uniqueItems
      );

      // Use the accurate low stock data from the modal/API
      let mappedLowStock = [];
      if (lowStockRes.data && lowStockRes.data.length > 0) {
        // Use the actual low stock data from API
        mappedLowStock = lowStockRes.data.map(item => ({
          store: item.store,
          item_name: item.item_name,
          sku: item.sku,
          category: item.category,
          current_quantity: item.quantity,
          reorder_level: item.reorder_level,
          needed_quantity: Math.max(0, (item.reorder_level || 0) - (item.quantity || 0) + 10),
          estimated_cost: item.total_value || 0,
        }));
      } else {
        // Fallback to calculating from stock level data
        const lowStockItems = stockLevelData.filter(
          (item) => (Number(item.quantity) || 0) <= (Number(item.reorder_level) || 0)
        );
        const buffer = 10;
        mappedLowStock = lowStockItems.map((item) => {
          const qty = Number(item.quantity) || 0;
          const reorder = Number(item.reorder_level) || 0;
          const price = qty > 0 ? (Number(item.total_value) || 0) / qty : 700;
          const needed = Math.max(0, reorder - qty + buffer);
          const estCost = needed * price;
          return {
            store: item.store,
            item_name: item.item_name,
            sku: item.sku,
            category: item.category,
            current_quantity: qty,
            reorder_level: reorder,
            needed_quantity: needed,
            estimated_cost: estCost,
          };
        });
      }

      setDashboardData({
        stockSummary: accurateTotals,
        recentMovements: mappedMovements,
        stores: storesRes.data || storesRes.results || [],
        uniqueItems,
      });
      setLowStockAlerts(mappedLowStock);
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    try {
      const date = new Date(dateString);
      return isNaN(date.getTime())
        ? dateString
        : date.toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          });
    } catch {
      return dateString;
    }
  };

  // Generate report function with proper error handling
  const generateReport = async (reportType) => {
    setLoading(true);
    try {
      let data;
      let mappedData = [];

      switch (reportType) {
        case "stockLevel":
          data = await getStockLevelReport(filters);
          // Correct the stock level data structure based on the provided response
          const stockData = data.data || data.results || [];
          mappedData = stockData.map(item => ({
            store: item.store,
            item_name: item.item_name,
            sku: item.sku,
            category: item.category,
            quantity: item.quantity,
            reorder_level: item.reorder_level,
            total_value: item.total_value,
            status: item.status || ((Number(item.quantity) || 0) <= (Number(item.reorder_level) || 0) ? "Low Stock" : "Adequate"),
          }));
          setReports((prev) => ({ ...prev, stockLevel: mappedData }));
          break;
        case "movements":
          data = await getMovementReport(filters);
          mappedData = mapApiData(data.data || data.results || [], MOVEMENT_MAPPING);
          setReports((prev) => ({ ...prev, movements: mappedData }));
          break;
        case "valuation":
          data = await getValuationReport(filters);
          // Valuation report has different structure - store-based
          setReports((prev) => ({
            ...prev,
            valuation: data.data || data.results || [],
          }));
          break;
        case "lowStock":
          let lowData = await getLowStockReport(filters);
          let mappedLow = [];
          
          if (lowData.data && lowData.data.length > 0) {
            // Use the accurate low stock data from API
            mappedLow = lowData.data.map(item => ({
              store: item.store,
              item_name: item.item_name,
              sku: item.sku,
              category: item.category,
              current_quantity: item.quantity,
              reorder_level: item.reorder_level,
              needed_quantity: Math.max(0, (item.reorder_level || 0) - (item.quantity || 0) + 10),
              estimated_cost: item.total_value || 0,
            }));
          } else {
            // Fallback to calculating from stock level data
            const stockData = await getStockLevelReport(filters);
            const stockLevelItems = stockData.data || stockData.results || [];
            const lowStockItems = stockLevelItems.filter(
              (item) => (Number(item.quantity) || 0) <= (Number(item.reorder_level) || 0)
            );
            const buffer = 10;
            mappedLow = lowStockItems.map((item) => {
              const qty = Number(item.quantity) || 0;
              const reorder = Number(item.reorder_level) || 0;
              const price = qty > 0 ? (Number(item.total_value) || 0) / qty : 700;
              const needed = Math.max(0, reorder - qty + buffer);
              const estCost = needed * price;
              return {
                store: item.store,
                item_name: item.item_name,
                sku: item.sku,
                category: item.category,
                current_quantity: qty,
                reorder_level: reorder,
                needed_quantity: needed,
                estimated_cost: estCost,
              };
            });
          }
          setReports((prev) => ({ ...prev, lowStock: mappedLow }));
          break;
      }
    } catch (error) {
      console.error(`Error generating ${reportType} report:`, error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStoreInventory = async (storeId) => {
    try {
      setLoading(true);
      const res = await getStoreInventory(storeId);
      
      if (!res || (!res.data && !res.results)) {
        throw new Error('Invalid response format from server');
      }
      
      const inventoryData = res.data || res.results || [];
      const mappedInventory = mapApiData(inventoryData, STORE_INVENTORY_MAPPING);
      setStoreInventory(mappedInventory);
      
    } catch (error) {
      console.error('Error fetching store inventory:', error);
      setStoreInventory([]);
    } finally {
      setLoading(false);
    }
  };

  // Handle store click
  const handleStoreClick = async (store) => {
    setSelectedStore(store);
    await fetchStoreInventory(store.id);
    setShowStoreDialog(true);
  };

  // Handle low stock alert click
  const handleAlertClick = () => {
    setShowAlertsDialog(true);
  };

  // Enhanced export function with proper filters and error handling
  const handleExport = async (type, format, extraFilters = {}) => {
    setExportLoading(true);
    const exportFilters = { ...filters, ...extraFilters };
    const filename = `${type}_report_${
      new Date().toISOString().split("T")[0]
    }.${format}`;

    try {
      let blob;
      switch (type) {
        case "stockLevel":
          blob =
            format === "excel"
              ? await exportStockLevelExcel(exportFilters)
              : await exportStockLevelPDF(exportFilters);
          break;
        case "movements":
          blob =
            format === "excel"
              ? await exportMovementExcel(exportFilters)
              : await exportMovementPDF(exportFilters);
          break;
        case "valuation":
          blob = await exportValuationExcel(exportFilters);
          break;
        case "lowStock":
          blob = await exportLowStockExcel(exportFilters);
          break;
        default:
          throw new Error(`Unsupported export type: ${type}`);
      }

      if (blob) {
        downloadBlob(blob, filename);
      }
    } catch (error) {
      console.error("Export error:", error);
      alert(`Export failed: ${error.message}`);
    } finally {
      setExportLoading(false);
    }
  };

  // Enhanced store inventory export
  const exportStoreInventory = async () => {
    if (!selectedStore) return;
    await handleExport("stockLevel", "excel", {
      storeId: selectedStore.id,
      includeDetails: true,
    });
  };

  // Reset filters
  const resetFilters = () => {
    setFilters({
      storeId: "",
      categoryId: "",
      dateFrom: "",
      dateTo: "",
    });
  };

  // Compute status for items
  const getStatus = (quantity, reorderLevel) => {
    const qty = Number(quantity) || 0;
    const level = Number(reorderLevel) || 0;
    return qty <= level ? "Low Stock" : "Adequate";
  };

  if (loading && activeTab === "overview") {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <RefreshCw className="h-8 w-8 animate-spin mr-2" />
        Loading dashboard...
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Inventory Dashboard
          </h1>
          <p className="text-muted-foreground">
            Monitor and manage your inventory efficiently.
          </p>
        </div>
        <Button
          onClick={fetchDashboardData}
          variant="outline"
          disabled={loading}
        >
          <RefreshCw
            className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`}
          />
          Refresh
        </Button>
      </div>

      {/* Overview Tab */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2 md:grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="stockLevel">Stock Levels</TabsTrigger>
          <TabsTrigger value="movements">Movements</TabsTrigger>
          <TabsTrigger value="valuation">Valuation</TabsTrigger>
          <TabsTrigger value="lowStock">Low Stock</TabsTrigger>
        </TabsList>

        {/* Overview Content */}
        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Total Items
                </CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {dashboardData.stockSummary.totalItems}
                </div>
                <p className="text-xs text-muted-foreground">
                  Unique items across all stores
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Total Value
                </CardTitle>
                <BarChart3 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  Ksh {dashboardData.stockSummary.totalValue.toLocaleString()}
                </div>
                <p className="text-xs text-muted-foreground">
                  Current inventory value
                </p>
              </CardContent>
            </Card>
            <Card className="cursor-pointer" onClick={handleAlertClick}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Low Stock Alerts
                </CardTitle>
                <AlertCircle className="h-4 w-4 text-destructive" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-destructive">
                  {dashboardData.stockSummary.lowStockItems}
                </div>
                <p className="text-xs text-muted-foreground">
                  Items needing reorder
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Total Quantity
                </CardTitle>
                <Download className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {dashboardData.stockSummary.totalQuantity.toLocaleString()}
                </div>
                <p className="text-xs text-muted-foreground">Units in stock</p>
              </CardContent>
            </Card>
          </div>

          {/* Recent Movements */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Stock Movements</CardTitle>
              <CardDescription>Last 5 movements</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Item</TableHead>
                    <TableHead>Quantity</TableHead>
                    <TableHead>From/To</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {dashboardData.recentMovements.map((movement, idx) => (
                    <TableRow key={movement.id || idx}>
                      <TableCell>{formatDate(movement.date)}</TableCell>
                      <TableCell>
                        <Badge variant="secondary">
                          {movement.movement_type || "N/A"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {movement.item_name || "Unknown Item"}
                      </TableCell>
                      <TableCell>{movement.quantity || 0}</TableCell>
                      <TableCell>
                        {movement.from_store || "N/A"} →{" "}
                        {movement.to_store || "N/A"}
                      </TableCell>
                    </TableRow>
                  ))}
                  {dashboardData.recentMovements.length === 0 && (
                    <TableRow>
                      <TableCell
                        colSpan={5}
                        className="text-center text-muted-foreground"
                      >
                        No recent movements
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* Stores Overview */}
          <Card>
            <CardHeader>
              <CardTitle>Stores Overview</CardTitle>
              <CardDescription>
                Click a store to view detailed inventory
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Items</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {dashboardData.stores.slice(0, 5).map((store, idx) => (
                    <TableRow key={store.id || idx}>
                      <TableCell className="font-medium">
                        {store.name}
                      </TableCell>
                      <TableCell>{store.location}</TableCell>
                      <TableCell>{store.total_items || 0}</TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleStoreClick(store)}
                        >
                          <Eye className="h-4 w-4 mr-1" /> View
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                  {dashboardData.stores.length === 0 && (
                    <TableRow>
                      <TableCell
                        colSpan={4}
                        className="text-center text-muted-foreground"
                      >
                        No stores available
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Stock Level Report */}
        <TabsContent value="stockLevel" className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
            <div className="space-x-2">
              <Button
                onClick={() => generateReport("stockLevel")}
                disabled={loading}
              >
                {loading ? "Generating..." : "Generate Report"}
              </Button>
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="outline" disabled={exportLoading}>
                    <Download className="mr-2 h-4 w-4" />
                    {exportLoading ? "Exporting..." : "Export"}
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Export Options</DialogTitle>
                    <DialogDescription>
                      Choose format for Stock Level Report
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-2">
                    <Button
                      onClick={() => handleExport("stockLevel", "excel")}
                      className="w-full"
                      disabled={exportLoading}
                    >
                      Excel
                    </Button>
                    <Button
                      onClick={() => handleExport("stockLevel", "pdf")}
                      className="w-full"
                      disabled={exportLoading}
                    >
                      PDF
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
            {/* Enhanced Filters */}
            <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
              <Select
                value={filters.storeId}
                onValueChange={(v) =>
                  setFilters((prev) => ({
                    ...prev,
                    storeId: v === "all" ? "" : v,
                  }))
                }
              >
                <SelectTrigger className="w-full sm:w-48">
                  <SelectValue placeholder="Filter by Store" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Stores</SelectItem>
                  {dashboardData.stores.map((store) => (
                    <SelectItem key={store.id} value={store.id.toString()}>
                      {store.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Input
                type="date"
                placeholder="From Date"
                value={filters.dateFrom}
                onChange={(e) =>
                  setFilters((prev) => ({ ...prev, dateFrom: e.target.value }))
                }
                className="w-full sm:w-32"
              />
              <Input
                type="date"
                placeholder="To Date"
                value={filters.dateTo}
                onChange={(e) =>
                  setFilters((prev) => ({ ...prev, dateTo: e.target.value }))
                }
                className="w-full sm:w-32"
              />
              <Button variant="outline" onClick={resetFilters}>
                Clear
              </Button>
            </div>
          </div>
          <Card>
            <CardHeader>
              <CardTitle>Stock Level Report</CardTitle>
              <CardDescription>
                Showing {reports.stockLevel.length} items
                {filters.storeId && ` for selected store`}
                {filters.dateFrom && ` from ${filters.dateFrom}`}
                {filters.dateTo && ` to ${filters.dateTo}`}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Store</TableHead>
                    <TableHead>Item</TableHead>
                    <TableHead>SKU</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Quantity</TableHead>
                    <TableHead>Reorder Level</TableHead>
                    <TableHead>Value</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {reports.stockLevel.map((item, idx) => (
                    <TableRow key={idx}>
                      <TableCell>{item.store || "N/A"}</TableCell>
                      <TableCell>{item.item_name || "Unknown"}</TableCell>
                      <TableCell>{item.sku || "N/A"}</TableCell>
                      <TableCell>{item.category || "Uncategorized"}</TableCell>
                      <TableCell>{item.quantity || 0}</TableCell>
                      <TableCell>{item.reorder_level || 0}</TableCell>
                      <TableCell>
                        Ksh{" "}
                        {item.total_value
                          ? Number(item.total_value).toLocaleString()
                          : "0"}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            item.status === "Low Stock" || getStatus(item.quantity, item.reorder_level) === "Low Stock"
                              ? "destructive"
                              : "default"
                          }
                        >
                          {item.status || getStatus(item.quantity, item.reorder_level)}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                  {reports.stockLevel.length === 0 && (
                    <TableRow>
                      <TableCell
                        colSpan={8}
                        className="text-center text-muted-foreground"
                      >
                        No stock data available. Generate a report to see data.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Movements Report Content */}
        <TabsContent value="movements" className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
            <div className="space-x-2">
              <Button onClick={() => generateReport('movements')} disabled={loading}>
                {loading ? 'Generating...' : 'Generate Report'}
              </Button>
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="outline" disabled={exportLoading}>
                    <Download className="mr-2 h-4 w-4" /> 
                    {exportLoading ? 'Exporting...' : 'Export'}
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Export Options</DialogTitle>
                    <DialogDescription>Choose format for Movements Report</DialogDescription>
                  </DialogHeader>
                  <div className="space-y-2">
                    <Button 
                      onClick={() => handleExport('movements', 'excel')} 
                      className="w-full"
                      disabled={exportLoading}
                    >
                      Excel
                    </Button>
                    <Button 
                      onClick={() => handleExport('movements', 'pdf')} 
                      className="w-full"
                      disabled={exportLoading}
                    >
                      PDF
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
            
            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
              <Select 
                value={filters.storeId} 
                onValueChange={(v) => setFilters(prev => ({ ...prev, storeId: v === 'all' ? '' : v }))}
              >
                <SelectTrigger className="w-full sm:w-48">
                  <SelectValue placeholder="Filter by Store" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Stores</SelectItem>
                  {dashboardData.stores.map(store => (
                    <SelectItem key={store.id} value={store.id.toString()}>{store.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Input 
                type="date" 
                placeholder="From Date" 
                value={filters.dateFrom}
                onChange={(e) => setFilters(prev => ({ ...prev, dateFrom: e.target.value }))}
                className="w-full sm:w-32"
              />
              <Input 
                type="date" 
                placeholder="To Date" 
                value={filters.dateTo}
                onChange={(e) => setFilters(prev => ({ ...prev, dateTo: e.target.value }))}
                className="w-full sm:w-32"
              />
              <Button variant="outline" onClick={resetFilters}>
                Clear
              </Button>
            </div>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Stock Movement Report</CardTitle>
              <CardDescription>
                Showing {reports.movements.length} movements
                {filters.storeId && ` for selected store`}
                {filters.dateFrom && ` from ${filters.dateFrom}`}
                {filters.dateTo && ` to ${filters.dateTo}`}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date & Time</TableHead>
                      <TableHead>Movement Type</TableHead>
                      <TableHead>Item</TableHead>
                      <TableHead>SKU</TableHead>
                      <TableHead>From Store</TableHead>
                      <TableHead>To Store</TableHead>
                      <TableHead>Quantity</TableHead>
                      <TableHead>Created By</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {reports.movements.map((movement, idx) => (
                      <TableRow key={idx}>
                        <TableCell className="whitespace-nowrap">
                          {formatDate(movement.date)}
                        </TableCell>
                        <TableCell>
                          <Badge variant={
                            movement.movement_type?.toLowerCase().includes('sale') ? 'destructive' : 
                            movement.movement_type?.toLowerCase().includes('purchase') ? 'default' : 'secondary'
                          }>
                            {movement.movement_type || 'N/A'}
                          </Badge>
                        </TableCell>
                        <TableCell className="font-medium">{movement.item_name || 'Unknown Item'}</TableCell>
                        <TableCell>{movement.sku || 'N/A'}</TableCell>
                        <TableCell>{movement.from_store || 'N/A'}</TableCell>
                        <TableCell>{movement.to_store || 'N/A'}</TableCell>
                        <TableCell className={
                          movement.movement_type?.toLowerCase().includes('sale') || movement.movement_type?.toLowerCase().includes('out') ? 
                          'text-destructive' : 'text-green-600'
                        }>
                          {movement.quantity || 0}
                        </TableCell>
                        <TableCell>{movement.created_by || 'System'}</TableCell>
                      </TableRow>
                    ))}
                    {reports.movements.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={8} className="text-center text-muted-foreground py-8">
                          No movement data available. Generate a report to see movement history.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Valuation Report Content */}
        <TabsContent value="valuation" className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
            <div className="space-x-2">
              <Button onClick={() => generateReport('valuation')} disabled={loading}>
                {loading ? 'Generating...' : 'Generate Report'}
              </Button>
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="outline" disabled={exportLoading}>
                    <Download className="mr-2 h-4 w-4" /> 
                    {exportLoading ? 'Exporting...' : 'Export'}
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Export Options</DialogTitle>
                    <DialogDescription>Choose format for Valuation Report</DialogDescription>
                  </DialogHeader>
                  <div className="space-y-2">
                    <Button 
                      onClick={() => handleExport('valuation', 'excel')} 
                      className="w-full"
                      disabled={exportLoading}
                    >
                      Excel
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
            
            {/* Store Filter */}
            <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
              <Select 
                value={filters.storeId} 
                onValueChange={(v) => setFilters(prev => ({ ...prev, storeId: v === 'all' ? '' : v }))}
              >
                <SelectTrigger className="w-full sm:w-48">
                  <SelectValue placeholder="Filter by Store" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Stores</SelectItem>
                  {dashboardData.stores.map(store => (
                    <SelectItem key={store.id} value={store.id.toString()}>{store.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button variant="outline" onClick={() => setFilters(prev => ({ ...prev, storeId: '' }))}>
                Clear
              </Button>
            </div>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Inventory Valuation Report</CardTitle>
              <CardDescription>
                Total value: Ksh {reports.valuation.reduce((sum, store) => sum + (Number(store.total_value) || 0), 0).toLocaleString()}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Store Name</TableHead>
                      <TableHead>Location</TableHead>
                      <TableHead>Total Items</TableHead>
                      <TableHead>Total Quantity</TableHead>
                      <TableHead>Total Value</TableHead>
                      <TableHead>Average Item Value</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {reports.valuation.map((store, idx) => {
                      const avgValue = (Number(store.total_value) || 0) / (Math.max(store.total_items || 1, 1));
                      return (
                        <TableRow key={idx} className="hover:bg-muted/50">
                          <TableCell className="font-medium">{store.store_name || store.name}</TableCell>
                          <TableCell>{store.location || 'N/A'}</TableCell>
                          <TableCell>{store.total_items || 0}</TableCell>
                          <TableCell>{store.total_quantity?.toLocaleString() || 0}</TableCell>
                          <TableCell className="font-semibold">
                            Ksh {Number(store.total_value || 0).toLocaleString()}
                          </TableCell>
                          <TableCell className="text-muted-foreground">
                            Ksh {avgValue.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                    {reports.valuation.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                          No valuation data available. Generate a report to see inventory values.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
              
              {/* Valuation Summary */}
              {reports.valuation.length > 0 && (
                <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
                  <Card>
                    <CardContent className="p-4">
                      <div className="text-2xl font-bold text-primary">
                        {reports.valuation.length}
                      </div>
                      <p className="text-xs text-muted-foreground">Stores</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4">
                      <div className="text-2xl font-bold text-green-600">
                        Ksh {reports.valuation.reduce((sum, store) => sum + (Number(store.total_value) || 0), 0).toLocaleString()}
                      </div>
                      <p className="text-xs text-muted-foreground">Total Inventory Value</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4">
                      <div className="text-2xl font-bold text-blue-600">
                        {reports.valuation.reduce((sum, store) => sum + (store.total_items || 0), 0)}
                      </div>
                      <p className="text-xs text-muted-foreground">Total Items</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4">
                      <div className="text-2xl font-bold text-orange-600">
                        {reports.valuation.reduce((sum, store) => sum + (store.total_quantity || 0), 0).toLocaleString()}
                      </div>
                      <p className="text-xs text-muted-foreground">Total Quantity</p>
                    </CardContent>
                  </Card>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Low Stock Report Content */}
        <TabsContent value="lowStock" className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
            <div className="space-x-2">
              <Button onClick={() => generateReport('lowStock')} disabled={loading}>
                {loading ? 'Generating...' : 'Generate Report'}
              </Button>
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="outline" disabled={exportLoading}>
                    <Download className="mr-2 h-4 w-4" /> 
                    {exportLoading ? 'Exporting...' : 'Export'}
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Export Options</DialogTitle>
                    <DialogDescription>Choose format for Low Stock Report</DialogDescription>
                  </DialogHeader>
                  <div className="space-y-2">
                    <Button 
                      onClick={() => handleExport('lowStock', 'excel')} 
                      className="w-full"
                      disabled={exportLoading}
                    >
                      Excel
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
            
            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
              <Select 
                value={filters.storeId} 
                onValueChange={(v) => setFilters(prev => ({ ...prev, storeId: v === 'all' ? '' : v }))}
              >
                <SelectTrigger className="w-full sm:w-48">
                  <SelectValue placeholder="Filter by Store" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Stores</SelectItem>
                  {dashboardData.stores.map(store => (
                    <SelectItem key={store.id} value={store.id.toString()}>{store.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button variant="outline" onClick={resetFilters}>
                Clear
              </Button>
            </div>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Low Stock Report</CardTitle>
              <CardDescription>
                Showing {reports.lowStock.length} items below reorder levels
                {filters.storeId && ` for selected store`}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Store</TableHead>
                      <TableHead>Item</TableHead>
                      <TableHead>SKU</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Current Quantity</TableHead>
                      <TableHead>Reorder Level</TableHead>
                      <TableHead>Needed Quantity</TableHead>
                      <TableHead>Estimated Cost</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {reports.lowStock.map((item, idx) => (
                      <TableRow key={idx}>
                        <TableCell>{item.store || 'N/A'}</TableCell>
                        <TableCell className="font-medium">{item.item_name || 'Unknown Item'}</TableCell>
                        <TableCell>{item.sku || 'N/A'}</TableCell>
                        <TableCell>{item.category || 'Uncategorized'}</TableCell>
                        <TableCell className="text-destructive font-bold">
                          {item.current_quantity || 0}
                        </TableCell>
                        <TableCell>{item.reorder_level || 0}</TableCell>
                        <TableCell className="text-orange-600">{item.needed_quantity || 0}</TableCell>
                        <TableCell>Ksh {Number(item.estimated_cost || 0).toLocaleString()}</TableCell>
                        <TableCell>
                          <Badge variant="destructive">Low Stock</Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                    {reports.lowStock.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={9} className="text-center text-muted-foreground py-8">
                          No low stock items. All inventory is adequately stocked. Generate a report to check.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Store Inventory Dialog */}
      <Dialog open={showStoreDialog} onOpenChange={setShowStoreDialog}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{selectedStore?.name} Inventory</DialogTitle>
            <DialogDescription>
              Detailed view of items and quantities in {selectedStore?.name}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <Button
              onClick={exportStoreInventory}
              variant="outline"
              disabled={exportLoading}
            >
              <Download className="mr-2 h-4 w-4" />
              {exportLoading ? "Exporting..." : "Export to Excel"}
            </Button>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Item Name</TableHead>
                  <TableHead>SKU</TableHead>
                  <TableHead>Quantity</TableHead>
                  <TableHead>Reorder Level</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {storeInventory.map((stock, idx) => (
                  <TableRow key={idx}>
                    <TableCell className="font-medium">{stock.item_name || "Unknown Item"}</TableCell>
                    <TableCell>{stock.sku || "N/A"}</TableCell>
                    <TableCell>{stock.quantity || 0}</TableCell>
                    <TableCell>{stock.reorder_level || 0}</TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          (stock.quantity || 0) <= (stock.reorder_level || 0)
                            ? "destructive"
                            : "default"
                        }
                      >
                        {getStatus(stock.quantity, stock.reorder_level)}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
                {storeInventory.length === 0 && (
                  <TableRow>
                    <TableCell
                      colSpan={5}
                      className="text-center text-muted-foreground py-8"
                    >
                      No inventory data available for this store
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
          <DialogFooter>
            <div className="flex justify-between items-center w-full">
              <span className="text-sm text-muted-foreground">
                Total items: {storeInventory.length}
              </span>
              <Button onClick={() => setShowStoreDialog(false)}>Close</Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Low Stock Alerts Dialog - Made Bigger */}
      <Dialog open={showAlertsDialog} onOpenChange={setShowAlertsDialog}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Low Stock Alerts</DialogTitle>
            <DialogDescription>
              Items below reorder level across all stores - Immediate attention required
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4">
              <div className="flex items-center">
                <AlertCircle className="h-5 w-5 text-destructive mr-2" />
                <span className="font-semibold text-destructive">
                  {lowStockAlerts.length} items require immediate restocking
                </span>
              </div>
            </div>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Store</TableHead>
                  <TableHead>Item Name</TableHead>
                  <TableHead>SKU</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Current Quantity</TableHead>
                  <TableHead>Reorder Level</TableHead>
                  <TableHead>Needed Quantity</TableHead>
                  <TableHead>Estimated Cost</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {lowStockAlerts.map((alert, index) => (
                  <TableRow key={index} className="hover:bg-destructive/5">
                    <TableCell className="font-medium">
                      {alert.store || "Unknown Store"}
                    </TableCell>
                    <TableCell>
                      {alert.item_name || "Unknown Item"}
                    </TableCell>
                    <TableCell>{alert.sku || "N/A"}</TableCell>
                    <TableCell>{alert.category || "Uncategorized"}</TableCell>
                    <TableCell
                      className="text-destructive font-bold"
                    >
                      {alert.current_quantity || 0}
                    </TableCell>
                    <TableCell>{alert.reorder_level || 0}</TableCell>
                    <TableCell className="text-orange-600 font-semibold">
                      {alert.needed_quantity || 0}
                    </TableCell>
                    <TableCell>
                      Ksh {Number(alert.estimated_cost || 0).toLocaleString()}
                    </TableCell>
                    <TableCell>
                      <Badge variant="destructive" className="whitespace-nowrap">
                        Low Stock
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
                {lowStockAlerts.length === 0 && (
                  <TableRow>
                    <TableCell
                      colSpan={9}
                      className="text-center text-muted-foreground py-8"
                    >
                      <div className="flex flex-col items-center justify-center space-y-2">
                        <AlertCircle className="h-8 w-8 text-muted-foreground" />
                        <div>
                          <p className="font-medium">No low stock alerts</p>
                          <p className="text-sm">All items are adequately stocked at this time.</p>
                        </div>
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
          <DialogFooter>
            <div className="flex justify-between items-center w-full">
              <div className="space-y-1">
                <span className="text-sm text-muted-foreground block">
                  Total alerts: {lowStockAlerts.length}
                </span>
                {lowStockAlerts.length > 0 && (
                  <span className="text-sm text-destructive block">
                    Estimated restocking cost: Ksh{" "}
                    {lowStockAlerts.reduce((sum, alert) => sum + (Number(alert.estimated_cost) || 0), 0).toLocaleString()}
                  </span>
                )}
              </div>
              <Button onClick={() => setShowAlertsDialog(false)}>Close</Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default InventoryDashboard;