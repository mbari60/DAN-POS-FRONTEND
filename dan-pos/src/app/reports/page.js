"use client";

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import ProtectedRoute from '@/components/ProtectedRoute';
import Navbar from '@/components/Navbar';
import { useRouter } from 'next/navigation';
import { 
  Loader2, 
  Download,
  Filter,
  BarChart3,
  TrendingUp,
  PieChart,
  Calendar,
  FileText,
  DollarSign,
  ShoppingCart
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const ReportsSystem = () => {
  const { user, isAuthenticated, isInitialized } = useAuth();
  const router = useRouter();
  
  // State for reports system
  const [activeReport, setActiveReport] = useState('sales');
  const [dateRange, setDateRange] = useState({
    from: new Date(new Date().setDate(new Date().getDate() - 30)),
    to: new Date()
  });
  const [storeFilter, setStoreFilter] = useState('all');
  const [isLoading, setIsLoading] = useState(false);

  // Sample data
  const [salesData] = useState([
    { date: '2023-10-01', amount: 12500, transactions: 45 },
    { date: '2023-10-02', amount: 14320, transactions: 52 },
    { date: '2023-10-03', amount: 9870, transactions: 38 },
    { date: '2023-10-04', amount: 15680, transactions: 58 },
    { date: '2023-10-05', amount: 11240, transactions: 42 },
  ]);

  const [inventoryData] = useState([
    { category: 'Office Supplies', value: 45000, items: 125 },
    { category: 'Cleaning', value: 12000, items: 35 },
    { category: 'Refreshments', value: 8500, items: 28 },
    { category: 'Electronics', value: 89000, items: 42 },
  ]);

  const [stores] = useState([
    { id: 1, name: 'Nairobi Main', location: 'Nairobi CBD' },
    { id: 2, name: 'Mombasa Branch', location: 'Mombasa Island' },
    { id: 3, name: 'Kisumu Store', location: 'Kisumu Central' },
  ]);

  // Additional protection
  useEffect(() => {
    if (isInitialized && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, isInitialized, router]);

  if (!isInitialized) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  const handleExport = () => {
    setIsLoading(true);
    // Simulate export process
    setTimeout(() => {
      setIsLoading(false);
      // In a real app, this would trigger a download
      alert('Report exported successfully!');
    }, 1500);
  };

  // Render different reports based on selection
  const renderActiveReport = () => {
    switch (activeReport) {
      case 'sales':
        return (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Sales Report</CardTitle>
                <CardDescription>
                  Analyze sales performance over time
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                  <Card>
                    <CardContent className="pt-6">
                      <div className="flex items-center">
                        <DollarSign className="h-8 w-8 text-blue-500 mr-3" />
                        <div>
                          <p className="text-xs text-gray-500">Total Sales</p>
                          <p className="text-lg font-bold">Ksh. 62,410</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="pt-6">
                      <div className="flex items-center">
                        <ShoppingCart className="h-8 w-8 text-green-500 mr-3" />
                        <div>
                          <p className="text-xs text-gray-500">Transactions</p>
                          <p className="text-lg font-bold">235</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="pt-6">
                      <div className="flex items-center">
                        <TrendingUp className="h-8 w-8 text-amber-500 mr-3" />
                        <div>
                          <p className="text-xs text-gray-500">Avg. Sale</p>
                          <p className="text-lg font-bold">Ksh. 265.57</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="pt-6">
                      <div className="flex items-center">
                        <BarChart3 className="h-8 w-8 text-purple-500 mr-3" />
                        <div>
                          <p className="text-xs text-gray-500">Growth</p>
                          <p className="text-lg font-bold text-green-600">+12.4%</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <div className="border rounded-lg p-4">
                  <h3 className="font-semibold mb-4">Daily Sales</h3>
                  <div className="space-y-3">
                    {salesData.map((day, index) => (
                      <div key={index} className="flex justify-between items-center p-2 border-b">
                        <span>{new Date(day.date).toLocaleDateString()}</span>
                        <span className="font-medium">Ksh. {day.amount.toLocaleString()}</span>
                        <span className="text-sm text-gray-500">{day.transactions} transactions</span>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        );

      case 'inventory':
        return (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Inventory Report</CardTitle>
                <CardDescription>
                  Current inventory status and valuation
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm">Inventory by Category</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {inventoryData.map((item, index) => (
                          <div key={index}>
                            <div className="flex justify-between mb-1">
                              <span className="text-sm">{item.category}</span>
                              <span className="text-sm font-medium">Ksh. {item.value.toLocaleString()}</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div 
                                className="bg-blue-500 h-2 rounded-full" 
                                style={{ width: `${(item.value / 150000) * 100}%` }}
                              ></div>
                            </div>
                            <div className="text-xs text-gray-500 mt-1">
                              {item.items} items
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm">Stock Status</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                          <div>
                            <div className="font-medium">In Stock</div>
                            <div className="text-sm text-gray-500">Good inventory levels</div>
                          </div>
                          <div className="text-2xl font-bold text-green-600">178</div>
                        </div>
                        <div className="flex items-center justify-between p-3 bg-amber-50 rounded-lg">
                          <div>
                            <div className="font-medium">Low Stock</div>
                            <div className="text-sm text-gray-500">Needs reordering</div>
                          </div>
                          <div className="text-2xl font-bold text-amber-600">12</div>
                        </div>
                        <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                          <div>
                            <div className="font-medium">Out of Stock</div>
                            <div className="text-sm text-gray-500">Urgent attention needed</div>
                          </div>
                          <div className="text-2xl font-bold text-red-600">5</div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </CardContent>
            </Card>
          </div>
        );

      case 'financial':
        return (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Financial Reports</CardTitle>
                <CardDescription>
                  Financial performance and analytics
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12 text-gray-500">
                  <FileText className="h-16 w-16 mx-auto mb-4" />
                  <p>Financial Reports</p>
                  <p className="text-sm">Profit & Loss, Balance Sheets, Cash Flow</p>
                </div>
              </CardContent>
            </Card>
          </div>
        );

      default:
        return (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Report Dashboard</CardTitle>
                <CardDescription>
                  Select a report type from the buttons above
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setActiveReport('sales')}>
                    <CardContent className="pt-6 text-center">
                      <DollarSign className="h-12 w-12 mx-auto mb-4 text-blue-500" />
                      <h3 className="font-semibold">Sales Reports</h3>
                      <p className="text-sm text-gray-500 mt-2">Daily, weekly, and monthly sales data</p>
                    </CardContent>
                  </Card>
                  <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setActiveReport('inventory')}>
                    <CardContent className="pt-6 text-center">
                      <BarChart3 className="h-12 w-12 mx-auto mb-4 text-green-500" />
                      <h3 className="font-semibold">Inventory Reports</h3>
                      <p className="text-sm text-gray-500 mt-2">Stock levels, valuation, and turnover</p>
                    </CardContent>
                  </Card>
                  <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setActiveReport('financial')}>
                    <CardContent className="pt-6 text-center">
                      <FileText className="h-12 w-12 mx-auto mb-4 text-purple-500" />
                      <h3 className="font-semibold">Financial Reports</h3>
                      <p className="text-sm text-gray-500 mt-2">P&L, balance sheets, and cash flow</p>
                    </CardContent>
                  </Card>
                </div>
              </CardContent>
            </Card>
          </div>
        );
    }
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-100 flex flex-col">
        <Navbar />
        
        <main className="flex-1 p-4 mt-16">
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
              <h1 className="text-2xl font-bold">Reports & Analytics</h1>
              
              <div className="flex flex-wrap gap-2">
                <Button 
                  variant={activeReport === 'sales' ? 'default' : 'outline'} 
                  onClick={() => setActiveReport('sales')}
                  size="sm"
                >
                  <DollarSign className="h-4 w-4 mr-2" />
                  Sales
                </Button>
                <Button 
                  variant={activeReport === 'inventory' ? 'default' : 'outline'} 
                  onClick={() => setActiveReport('inventory')}
                  size="sm"
                >
                  <BarChart3 className="h-4 w-4 mr-2" />
                  Inventory
                </Button>
                <Button 
                  variant={activeReport === 'financial' ? 'default' : 'outline'} 
                  onClick={() => setActiveReport('financial')}
                  size="sm"
                >
                  <FileText className="h-4 w-4 mr-2" />
                  Financial
                </Button>
              </div>
            </div>

            {/* Filters */}
            <Card className="mb-6">
              <CardHeader className="pb-3">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div>
                    <CardTitle className="text-lg">Report Filters</CardTitle>
                    <CardDescription>Customize your report parameters</CardDescription>
                  </div>
                  <Button onClick={handleExport} disabled={isLoading}>
                    {isLoading ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <Download className="h-4 w-4 mr-2" />
                    )}
                    Export Report
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium mb-1 block">Date Range</label>
                      <div className="flex gap-2">
                        <Input 
                          type="date" 
                          value={dateRange.from.toISOString().split('T')[0]} 
                          onChange={(e) => setDateRange({ ...dateRange, from: new Date(e.target.value) })}
                          className="w-full" 
                        />
                        <span className="self-center">to</span>
                        <Input 
                          type="date" 
                          value={dateRange.to.toISOString().split('T')[0]} 
                          onChange={(e) => setDateRange({ ...dateRange, to: new Date(e.target.value) })}
                          className="w-full"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-1 block">Store</label>
                      <Select value={storeFilter} onValueChange={setStoreFilter}>
                        <SelectTrigger>
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
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Report Content */}
            {renderActiveReport()}
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
};

export default ReportsSystem;
