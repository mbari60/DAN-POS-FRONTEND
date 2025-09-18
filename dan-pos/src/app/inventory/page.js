"use client";

import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import ProtectedRoute from '@/components/ProtectedRoute';
import Navbar from '@/components/Navbar';
import InventorySidebar from '@/components/InventorySidebar';
import { useRouter } from 'next/navigation';
import { 
  Loader2, 
  Plus, 
  Minus, 
  Search, 
  Package,
  BarChart3,
  TrendingUp,
  X,
  Edit,
  Eye,
  List,
  Grid,
  Filter,
  Download,
  Upload
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'react-toastify';

const InventorySystem = () => {
  const { user, isAuthenticated, isInitialized } = useAuth();
  const router = useRouter();
  const searchInputRef = useRef(null);
  
  // State for inventory system
  const [searchQuery, setSearchQuery] = useState('');
  const [activeComponent, setActiveComponent] = useState('overview');
  const [items, setItems] = useState([]);
  const [stores, setStores] = useState([]);
  const [selectedStore, setSelectedStore] = useState(null);
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'
  const [selectedCategory, setSelectedCategory] = useState('all');

  // Sample data (in real app, this would come from API)
  const [sampleItems] = useState([
    { 
      id: 1, 
      name: 'Office Paper A4', 
      sku: 'OFF-PAP-A4-001', 
      category: 'Office Supplies',
      currentStock: 45,
      reorderLevel: 20,
      cost: 12.50,
      price: 18.99,
      store: 'Nairobi Main'
    },
    { 
      id: 2, 
      name: 'Printer Ink Black', 
      sku: 'INK-BLK-002', 
      category: 'Office Supplies',
      currentStock: 12,
      reorderLevel: 10,
      cost: 45.99,
      price: 69.99,
      store: 'Nairobi Main'
    },
    { 
      id: 3, 
      name: 'Pens Blue', 
      sku: 'PEN-BLU-003', 
      category: 'Office Supplies',
      currentStock: 120,
      reorderLevel: 50,
      cost: 8.75,
      price: 12.99,
      store: 'Mombasa Branch'
    },
    { 
      id: 4, 
      name: 'Cleaning Supplies', 
      sku: 'CLN-SUP-004', 
      category: 'Cleaning',
      currentStock: 25,
      reorderLevel: 15,
      cost: 25.00,
      price: 39.99,
      store: 'Nairobi Main'
    },
    { 
      id: 5, 
      name: 'Coffee Beans', 
      sku: 'COF-BNS-005', 
      category: 'Refreshments',
      currentStock: 8,
      reorderLevel: 5,
      cost: 18.50,
      price: 28.99,
      store: 'Mombasa Branch'
    },
  ]);

  const [sampleStores] = useState([
    { id: 1, name: 'Nairobi Main', location: 'Nairobi CBD' },
    { id: 2, name: 'Mombasa Branch', location: 'Mombasa Island' },
    { id: 3, name: 'Kisumu Store', location: 'Kisumu Central' },
  ]);

  const categories = ['all', 'Office Supplies', 'Cleaning', 'Refreshments'];

  // Additional protection
  useEffect(() => {
    if (isInitialized && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, isInitialized, router]);

  // Initialize data
  useEffect(() => {
    setItems(sampleItems);
    setStores(sampleStores);
    if (sampleStores.length > 0) {
      setSelectedStore(sampleStores[0]);
    }
  }, []);

  // Filter items based on search, store, and category
  const filteredItems = items.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          item.sku.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStore = selectedStore ? item.store === selectedStore.name : true;
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
    
    return matchesSearch && matchesStore && matchesCategory;
  });

  // Calculate inventory statistics
  const inventoryStats = {
    totalItems: items.length,
    lowStockItems: items.filter(item => item.currentStock <= item.reorderLevel).length,
    outOfStockItems: items.filter(item => item.currentStock === 0).length,
    totalValue: items.reduce((sum, item) => sum + (item.currentStock * item.cost), 0)
  };

  if (!isInitialized) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  // Render different components based on active selection
  const renderActiveComponent = () => {
    switch (activeComponent) {
      case 'items':
        return (
          <div className="space-y-4">
            <Card className="col-span-full">
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Inventory Items</CardTitle>
                  <CardDescription>
                    Manage all inventory items across stores
                  </CardDescription>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm">
                    <Download className="h-4 w-4 mr-2" />
                    Export
                  </Button>
                  <Button size="sm">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Item
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col sm:flex-row gap-4 mb-4">
                  <div className="relative flex-1">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                    <Input
                      ref={searchInputRef}
                      placeholder="Search items..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-8"
                    />
                  </div>
                  <Select 
                    value={selectedStore?.id?.toString()} 
                    onValueChange={(value) => {
                      const store = stores.find(s => s.id === parseInt(value));
                      setSelectedStore(store);
                    }}
                  >
                    <SelectTrigger className="w-[180px]">
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
                  <Select 
                    value={selectedCategory} 
                    onValueChange={setSelectedCategory}
                  >
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="All Categories" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map(category => (
                        <SelectItem key={category} value={category}>
                          {category === 'all' ? 'All Categories' : category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <div className="flex">
                    <Button 
                      variant={viewMode === 'grid' ? 'default' : 'outline'} 
                      size="icon"
                      onClick={() => setViewMode('grid')}
                    >
                      <Grid className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant={viewMode === 'list' ? 'default' : 'outline'} 
                      size="icon"
                      onClick={() => setViewMode('list')}
                    >
                      <List className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                {viewMode === 'grid' ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredItems.map(item => (
                      <Card key={item.id} className="overflow-hidden">
                        <CardHeader className="pb-3">
                          <div className="flex justify-between items-start">
                            <div>
                              <CardTitle className="text-lg">{item.name}</CardTitle>
                              <CardDescription>{item.sku}</CardDescription>
                            </div>
                            <Badge 
                              variant={
                                item.currentStock === 0 ? 'destructive' : 
                                item.currentStock <= item.reorderLevel ? 'outline' : 'default'
                              }
                            >
                              {item.currentStock} in stock
                            </Badge>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                              <span>Category:</span>
                              <span>{item.category}</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Store:</span>
                              <span>{item.store}</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Cost:</span>
                              <span>Ksh. {item.cost.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Price:</span>
                              <span>Ksh. {item.price.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Reorder Level:</span>
                              <span>{item.reorderLevel}</span>
                            </div>
                          </div>
                        </CardContent>
                        <CardFooter className="flex justify-between">
                          <Button variant="outline" size="sm">
                            <Eye className="h-4 w-4 mr-2" />
                            View
                          </Button>
                          <Button size="sm">
                            <Edit className="h-4 w-4 mr-2" />
                            Edit
                          </Button>
                        </CardFooter>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="border rounded-lg">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b bg-gray-50">
                          <th className="p-3 text-left">Item</th>
                          <th className="p-3 text-left">SKU</th>
                          <th className="p-3 text-left">Category</th>
                          <th className="p-3 text-left">Store</th>
                          <th className="p-3 text-right">Stock</th>
                          <th className="p-3 text-right">Cost</th>
                          <th className="p-3 text-right">Price</th>
                          <th className="p-3 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredItems.map(item => (
                          <tr key={item.id} className="border-b">
                            <td className="p-3 font-medium">{item.name}</td>
                            <td className="p-3 text-gray-500">{item.sku}</td>
                            <td className="p-3">{item.category}</td>
                            <td className="p-3">{item.store}</td>
                            <td className="p-3 text-right">
                              <Badge 
                                variant={
                                  item.currentStock === 0 ? 'destructive' : 
                                  item.currentStock <= item.reorderLevel ? 'outline' : 'default'
                                }
                              >
                                {item.currentStock}
                              </Badge>
                            </td>
                            <td className="p-3 text-right">Ksh. {item.cost.toFixed(2)}</td>
                            <td className="p-3 text-right">Ksh. {item.price.toFixed(2)}</td>
                            <td className="p-3 text-right">
                              <Button variant="ghost" size="sm">
                                <Edit className="h-4 w-4" />
                              </Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}

                {filteredItems.length === 0 && (
                  <div className="text-center py-12 text-gray-500">
                    <Package className="h-12 w-12 mx-auto mb-4" />
                    <p>No items found</p>
                    <p className="text-sm">Try adjusting your search or filters</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        );

      case 'movements':
        return (
          <div className="space-y-4">
            <Card className="col-span-full">
              <CardHeader>
                <CardTitle>Stock Movements</CardTitle>
                <CardDescription>
                  Track all inventory movements and changes
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-gray-500">
                  <TrendingUp className="h-12 w-12 mx-auto mb-4" />
                  <p>Stock Movement History</p>
                  <p className="text-sm">Track incoming and outgoing inventory</p>
                </div>
              </CardContent>
            </Card>
          </div>
        );

      case 'adjustments':
        return (
          <div className="space-y-4">
            <Card className="col-span-full">
              <CardHeader>
                <CardTitle>Stock Adjustments</CardTitle>
                <CardDescription>
                  Make manual adjustments to inventory counts
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-gray-500">
                  <Edit className="h-12 w-12 mx-auto mb-4" />
                  <p>Stock Adjustment System</p>
                  <p className="text-sm">Adjust inventory quantities and record reasons</p>
                </div>
              </CardContent>
            </Card>
          </div>
        );

      default: // Overview
        return (
          <>
            {/* Inventory Summary Cards */}
            <div className="col-span-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">Total Items</CardTitle>
                  <Package className="h-4 w-4 text-gray-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{inventoryStats.totalItems}</div>
                  <p className="text-xs text-gray-500">Across all stores</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">Low Stock</CardTitle>
                  <BarChart3 className="h-4 w-4 text-amber-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-amber-600">{inventoryStats.lowStockItems}</div>
                  <p className="text-xs text-gray-500">Items need reordering</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">Out of Stock</CardTitle>
                  <X className="h-4 w-4 text-red-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-red-600">{inventoryStats.outOfStockItems}</div>
                  <p className="text-xs text-gray-500">Items need restocking</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">Total Value</CardTitle>
                  <TrendingUp className="h-4 w-4 text-green-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">Ksh. {inventoryStats.totalValue.toFixed(2)}</div>
                  <p className="text-xs text-gray-500">Inventory at cost</p>
                </CardContent>
              </Card>
            </div>

            {/* Low Stock Alert */}
            <Card className="col-span-full lg:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <BarChart3 className="mr-2 h-5 w-5 text-amber-500" />
                  Low Stock Alert
                </CardTitle>
                <CardDescription>
                  Items that need to be reordered soon
                </CardDescription>
              </CardHeader>
              <CardContent>
                {items.filter(item => item.currentStock <= item.reorderLevel && item.currentStock > 0).length > 0 ? (
                  <div className="space-y-3">
                    {items.filter(item => item.currentStock <= item.reorderLevel && item.currentStock > 0)
                      .slice(0, 5).map(item => (
                      <div key={item.id} className="flex items-center justify-between p-2 border rounded">
                        <div className="flex-1">
                          <div className="font-medium text-sm">{item.name}</div>
                          <div className="text-xs text-gray-500">{item.sku} • {item.store}</div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-medium text-amber-600">{item.currentStock} / {item.reorderLevel}</div>
                          <div className="text-xs text-gray-500">in stock</div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-4 text-gray-500">
                    <p>No low stock items</p>
                    <p className="text-sm">All items are sufficiently stocked</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Out of Stock Items */}
            <Card className="col-span-full lg:col-span-1">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <X className="mr-2 h-5 w-5 text-red-500" />
                  Out of Stock
                </CardTitle>
                <CardDescription>
                  Items that need immediate attention
                </CardDescription>
              </CardHeader>
              <CardContent>
                {items.filter(item => item.currentStock === 0).length > 0 ? (
                  <div className="space-y-3">
                    {items.filter(item => item.currentStock === 0)
                      .slice(0, 3).map(item => (
                      <div key={item.id} className="p-2 border rounded bg-red-50">
                        <div className="font-medium text-sm">{item.name}</div>
                        <div className="text-xs text-gray-500">{item.sku} • {item.store}</div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-4 text-gray-500">
                    <p>No out of stock items</p>
                    <p className="text-sm">All items are available</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Recent Items */}
            <Card className="col-span-full">
              <CardHeader>
                <CardTitle>Recent Inventory Items</CardTitle>
                <CardDescription>
                  Recently added or updated items
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="border rounded-lg">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b bg-gray-50">
                        <th className="p-3 text-left">Item</th>
                        <th className="p-3 text-left">SKU</th>
                        <th className="p-3 text-left">Category</th>
                        <th className="p-3 text-left">Store</th>
                        <th className="p-3 text-right">Stock</th>
                        <th className="p-3 text-right">Cost</th>
                        <th className="p-3 text-right">Price</th>
                      </tr>
                    </thead>
                    <tbody>
                      {items.slice(0, 5).map(item => (
                        <tr key={item.id} className="border-b">
                          <td className="p-3 font-medium">{item.name}</td>
                          <td className="p-3 text-gray-500">{item.sku}</td>
                          <td className="p-3">{item.category}</td>
                          <td className="p-3">{item.store}</td>
                          <td className="p-3 text-right">
                            <Badge 
                              variant={
                                item.currentStock === 0 ? 'destructive' : 
                                item.currentStock <= item.reorderLevel ? 'outline' : 'default'
                              }
                            >
                              {item.currentStock}
                            </Badge>
                          </td>
                          <td className="p-3 text-right">Ksh. {item.cost.toFixed(2)}</td>
                          <td className="p-3 text-right">Ksh. {item.price.toFixed(2)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </>
        );
    }
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-100 flex flex-col">
        <Navbar />
        
        <div className="flex flex-1">
          <InventorySidebar 
            activeComponent={activeComponent} 
            setActiveComponent={setActiveComponent} 
          />
          
          <main className="flex-1 p-4 ml-0 lg:ml-64 mt-16">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {renderActiveComponent()}
            </div>
          </main>
        </div>
      </div>
    </ProtectedRoute>
  );
};

export default InventorySystem;

