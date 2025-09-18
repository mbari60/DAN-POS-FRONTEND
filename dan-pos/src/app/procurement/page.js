"use client";

import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import ProtectedRoute from '@/components/ProtectedRoute';
import Navbar from '@/components/Navbar';
import ProcurementSidebar from '@/components/ProcurementSidebar';
import { useRouter } from 'next/navigation';
import { 
  Loader2, 
  Plus, 
  Minus, 
  Trash2, 
  Search, 
  Printer, 
  Send, 
  Check,
  Package,
  ShoppingCart,
  FileText,
  Users,
  CreditCard,
  AlertCircle,
  Calendar,
  DollarSign,
  TrendingUp,
  X,
  Edit
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'react-toastify';

const ProcurementSystem = () => {
  const { user, isAuthenticated, isInitialized } = useAuth();
  const router = useRouter();
  const searchInputRef = useRef(null);
  
  // State for procurement system
  const [currentPO, setCurrentPO] = useState({
    items: [],
    supplier: null,
    notes: '',
    expectedDelivery: ''
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSupplier, setSelectedSupplier] = useState(null);
  const [activeComponent, setActiveComponent] = useState('purchase_orders');
  const [purchaseOrders, setPurchaseOrders] = useState([]);
  const [goodsReceipts, setGoodsReceipts] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [paymentAmount, setPaymentAmount] = useState('');

  // Sample data (in real app, this would come from API)
  const [sampleProducts] = useState([
    { id: 1, name: 'Office Paper A4', unit: 'pack', lastCost: 12.50, supplier: 'Office Supplies Ltd' },
    { id: 2, name: 'Printer Ink Black', unit: 'cartridge', lastCost: 45.99, supplier: 'Tech Solutions' },
    { id: 3, name: 'Pens Blue', unit: 'box', lastCost: 8.75, supplier: 'Office Supplies Ltd' },
    { id: 4, name: 'Cleaning Supplies', unit: 'set', lastCost: 25.00, supplier: 'Clean Pro' },
    { id: 5, name: 'Coffee Beans', unit: 'kg', lastCost: 18.50, supplier: 'Coffee Direct' },
  ]);

  const [sampleSuppliers] = useState([
    { id: 1, name: 'Office Supplies Ltd', contact: 'John Doe', phone: '+254700123456', debt: 1250.00 },
    { id: 2, name: 'Tech Solutions', contact: 'Jane Smith', phone: '+254700234567', debt: 800.50 },
    { id: 3, name: 'Clean Pro', contact: 'Mike Johnson', phone: '+254700345678', debt: 0.00 },
    { id: 4, name: 'Coffee Direct', contact: 'Sarah Wilson', phone: '+254700456789', debt: 450.75 },
  ]);

  // Additional protection
  useEffect(() => {
    if (isInitialized && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, isInitialized, router]);

  // Calculate PO totals
  const poTotal = currentPO.items.reduce((total, item) => total + (item.unitCost * item.quantity), 0);
  const itemsCount = currentPO.items.reduce((count, item) => count + item.quantity, 0);

  // Add product to PO
  const addToPO = (product, quantity = 1) => {
    setCurrentPO(prevPO => {
      const existingItem = prevPO.items.find(item => item.id === product.id);
      if (existingItem) {
        return {
          ...prevPO,
          items: prevPO.items.map(item =>
            item.id === product.id
              ? { ...item, quantity: item.quantity + quantity }
              : item
          )
        };
      } else {
        return {
          ...prevPO,
          items: [...prevPO.items, { 
            ...product, 
            quantity, 
            unitCost: product.lastCost,
            notes: ''
          }]
        };
      }
    });
  };

  // Update item in PO
  const updatePOItem = (id, field, value) => {
    setCurrentPO(prevPO => ({
      ...prevPO,
      items: prevPO.items.map(item =>
        item.id === id ? { ...item, [field]: value } : item
      )
    }));
  };

  // Remove item from PO
  const removeFromPO = (id) => {
    setCurrentPO(prevPO => ({
      ...prevPO,
      items: prevPO.items.filter(item => item.id !== id)
    }));
  };

  // Clear current PO
  const clearPO = () => {
    setCurrentPO({
      items: [],
      supplier: null,
      notes: '',
      expectedDelivery: ''
    });
    setSelectedSupplier(null);
  };

  // Create Purchase Order
  const createPurchaseOrder = () => {
    if (currentPO.items.length === 0) {
      toast.error('Please add items to the purchase order');
      return;
    }
    if (!selectedSupplier) {
      toast.error('Please select a supplier');
      return;
    }

    const newPO = {
      id: Date.now(),
      poNumber: `PO-${String(purchaseOrders.length + 1).padStart(6, '0')}`,
      supplier: selectedSupplier,
      items: [...currentPO.items],
      total: poTotal,
      status: 'draft',
      orderDate: new Date(),
      expectedDelivery: currentPO.expectedDelivery,
      notes: currentPO.notes,
      createdBy: user?.username || 'User'
    };

    setPurchaseOrders(prev => [newPO, ...prev]);
    toast.success(`Purchase Order ${newPO.poNumber} created successfully!`);
    clearPO();
  };

  // Process Goods Receipt
  const processGoodsReceipt = (po, receivedItems) => {
    const newReceipt = {
      id: Date.now(),
      receiptNumber: `GR-${String(goodsReceipts.length + 1).padStart(6, '0')}`,
      supplier: po.supplier,
      purchaseOrder: po,
      items: receivedItems,
      total: receivedItems.reduce((sum, item) => sum + (item.quantityReceived * item.unitCost), 0),
      receiptDate: new Date(),
      isPaid: false,
      receivedBy: user?.username || 'User'
    };

    setGoodsReceipts(prev => [newReceipt, ...prev]);
    
    // Update PO status
    setPurchaseOrders(prev => prev.map(order =>
      order.id === po.id 
        ? { ...order, status: 'partially_received' }
        : order
    ));

    toast.success(`Goods Receipt ${newReceipt.receiptNumber} created successfully!`);
  };

  // Filter products based on search
  const filteredProducts = sampleProducts.filter(product =>
    product.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
      case 'goods_receipt':
        return (
          <div className="space-y-4">
            <Card className="col-span-full">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Package className="mr-2 h-5 w-5" />
                  Goods Receipt
                </CardTitle>
                <CardDescription>
                  Receive items from suppliers and update inventory
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-gray-500">
                  <Package className="h-12 w-12 mx-auto mb-4" />
                  <p>Goods Receipt System</p>
                  <p className="text-sm">Receive and process incoming inventory</p>
                </div>
              </CardContent>
            </Card>
          </div>
        );

      case 'suppliers':
        return (
          <div className="space-y-4">
            <Card className="col-span-full">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Users className="mr-2 h-5 w-5" />
                  Supplier Management
                </CardTitle>
                <CardDescription>
                  Add and manage supplier information
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {sampleSuppliers.map(supplier => (
                    <div key={supplier.id} className="border rounded-lg p-4">
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-medium">{supplier.name}</h3>
                        <Badge variant={supplier.debt > 0 ? "destructive" : "default"}>
                          ${supplier.debt.toFixed(2)}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600">{supplier.contact}</p>
                      <p className="text-sm text-gray-500">{supplier.phone}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        );

      case 'payments':
        return (
          <div className="space-y-4">
            <Card className="col-span-full">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <CreditCard className="mr-2 h-5 w-5" />
                  Supplier Payments
                </CardTitle>
                <CardDescription>
                  Process payments to suppliers
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-gray-500">
                  <CreditCard className="h-12 w-12 mx-auto mb-4" />
                  <p>Supplier Payment System</p>
                  <p className="text-sm">Manage payments and outstanding balances</p>
                </div>
              </CardContent>
            </Card>
          </div>
        );

      default: // Purchase Orders view
        return (
          <>
            {/* Left Column - Product Search and Supplier Selection */}
            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Search className="mr-2 h-5 w-5" />
                    Product Search
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Input
                    ref={searchInputRef}
                    placeholder="Search products..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                  
                  <div className="max-h-60 overflow-y-auto space-y-2">
                    {filteredProducts.map(product => (
                      <div key={product.id} className="flex items-center justify-between p-2 border rounded">
                        <div className="flex-1">
                          <div className="font-medium text-sm">{product.name}</div>
                          <div className="text-xs text-gray-500">${product.lastCost} per {product.unit}</div>
                        </div>
                        <Button
                          size="sm"
                          onClick={() => addToPO(product)}
                        >
                          <Plus className="h-3 w-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Select Supplier</CardTitle>
                </CardHeader>
                <CardContent>
                  <Select 
                    onValueChange={(value) => {
                      const supplier = sampleSuppliers.find(s => s.id === parseInt(value));
                      setSelectedSupplier(supplier);
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Choose supplier..." />
                    </SelectTrigger>
                    <SelectContent>
                      {sampleSuppliers.map(supplier => (
                        <SelectItem key={supplier.id} value={supplier.id.toString()}>
                          {supplier.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {selectedSupplier && (
                    <div className="mt-2 p-2 bg-gray-50 rounded text-sm">
                      <div>Contact: {selectedSupplier.contact}</div>
                      <div>Phone: {selectedSupplier.phone}</div>
                      <div className="flex items-center">
                        Outstanding: 
                        <Badge variant={selectedSupplier.debt > 0 ? "destructive" : "default"} className="ml-1">
                          ${selectedSupplier.debt.toFixed(2)}
                        </Badge>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Procurement Statistics */}
              <Card>
                <CardHeader>
                  <CardTitle>Procurement Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex justify-between">
                    <span>Active POs:</span>
                    <span className="font-bold">{purchaseOrders.filter(po => po.status !== 'completed').length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Total Orders:</span>
                    <span className="font-bold">{purchaseOrders.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Pending Receipts:</span>
                    <span className="font-bold">{purchaseOrders.filter(po => po.status === 'sent').length}</span>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Middle Column - Purchase Order Items */}
            <div>
              <Card className="h-full">
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle>Purchase Order</CardTitle>
                    <CardDescription>
                      {itemsCount} item{itemsCount !== 1 ? 's' : ''} • {selectedSupplier?.name || 'No supplier selected'}
                    </CardDescription>
                  </div>
                  <Badge variant="outline">DRAFT</Badge>
                </CardHeader>
                <CardContent className="space-y-4 max-h-96 overflow-y-auto">
                  {currentPO.items.length === 0 ? (
                    <div className="text-center text-gray-500 py-8">
                      No items added. Search and add products to create a purchase order.
                    </div>
                  ) : (
                    currentPO.items.map(item => (
                      <div key={item.id} className="border rounded-lg p-3 space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="font-medium">{item.name}</div>
                            <div className="text-sm text-gray-500">per {item.unit}</div>
                          </div>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => removeFromPO(item.id)}
                          >
                            <Trash2 className="h-4 w-4 text-red-500" />
                          </Button>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label className="text-xs text-gray-500">Quantity</label>
                            <div className="flex items-center space-x-1">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => updatePOItem(item.id, 'quantity', Math.max(1, item.quantity - 1))}
                              >
                                <Minus className="h-3 w-3" />
                              </Button>
                              <Input
                                type="number"
                                value={item.quantity}
                                onChange={(e) => updatePOItem(item.id, 'quantity', parseInt(e.target.value) || 1)}
                                className="w-16 text-center"
                                min="1"
                              />
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => updatePOItem(item.id, 'quantity', item.quantity + 1)}
                              >
                                <Plus className="h-3 w-3" />
                              </Button>
                            </div>
                          </div>
                          
                          <div>
                            <label className="text-xs text-gray-500">Unit Cost</label>
                            <Input
                              type="number"
                              step="0.01"
                              value={item.unitCost}
                              onChange={(e) => updatePOItem(item.id, 'unitCost', parseFloat(e.target.value) || 0)}
                            />
                          </div>
                        </div>
                        
                        <div className="flex justify-between items-center pt-2 border-t">
                          <span className="text-sm">Line Total:</span>
                          <span className="font-bold">${(item.quantity * item.unitCost).toFixed(2)}</span>
                        </div>
                      </div>
                    ))
                  )}
                </CardContent>
                <CardFooter className="flex justify-between border-t pt-4">
                  <Button
                    variant="outline"
                    onClick={clearPO}
                    disabled={currentPO.items.length === 0}
                  >
                    <X className="mr-2 h-4 w-4" />
                    Clear PO
                  </Button>
                  <div className="font-bold text-lg">
                    Total: ${poTotal.toFixed(2)}
                  </div>
                </CardFooter>
              </Card>
            </div>

            {/* Right Column - PO Details and Actions */}
            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Order Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="text-sm font-medium">Expected Delivery Date</label>
                    <Input
                      type="date"
                      value={currentPO.expectedDelivery}
                      onChange={(e) => setCurrentPO(prev => ({
                        ...prev,
                        expectedDelivery: e.target.value
                      }))}
                    />
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium">Notes</label>
                    <Textarea
                      placeholder="Add any special instructions or notes..."
                      value={currentPO.notes}
                      onChange={(e) => setCurrentPO(prev => ({
                        ...prev,
                        notes: e.target.value
                      }))}
                      rows={3}
                    />
                  </div>
                </CardContent>
                <CardFooter>
                  <Button
                    className="w-full"
                    onClick={createPurchaseOrder}
                    disabled={currentPO.items.length === 0 || !selectedSupplier}
                  >
                    <FileText className="mr-2 h-4 w-4" />
                    Create Purchase Order
                  </Button>
                </CardFooter>
              </Card>

              {/* Recent Purchase Orders */}
              {purchaseOrders.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Recent Purchase Orders</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3 max-h-60 overflow-y-auto">
                    {purchaseOrders.slice(0, 5).map(po => (
                      <div key={po.id} className="p-3 border rounded-lg">
                        <div className="flex justify-between items-start mb-1">
                          <div className="font-medium text-sm">{po.poNumber}</div>
                          <Badge variant="outline" className="text-xs">
                            {po.status.replace('_', ' ').toUpperCase()}
                          </Badge>
                        </div>
                        <div className="text-xs text-gray-500">
                          {po.supplier.name} • ${po.total.toFixed(2)}
                        </div>
                        <div className="text-xs text-gray-400">
                          {new Date(po.orderDate).toLocaleDateString()}
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              )}
            </div>
          </>
        );
    }
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-100 flex flex-col">
        <Navbar />
        
        <div className="flex flex-1">
          <ProcurementSidebar 
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

export default ProcurementSystem;

