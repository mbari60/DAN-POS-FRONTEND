"use client";

import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import ProtectedRoute from '@/components/ProtectedRoute';
import Navbar from '@/components/Navbar';
import POSSidebar from '@/components/POSSidebar';
import { useRouter } from 'next/navigation';
import { 
  Loader2, 
  Plus, 
  Minus, 
  Trash2, 
  Scan, 
  Printer, 
  Pause, 
  Play, 
  DollarSign,
  Receipt,
  X,
  Check,
  Search,
  UserPlus,
  FileText,
  CreditCard,
  ShoppingCart
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from 'react-toastify';

const POSSale = () => {
  const { user, isAuthenticated, isInitialized } = useAuth();
  const router = useRouter();
  const barcodeInputRef = useRef(null);
  
  // State for POS system
  const [cart, setCart] = useState([]);
  const [barcodeInput, setBarcodeInput] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const [isSalePaused, setIsSalePaused] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState('');
  const [changeAmount, setChangeAmount] = useState(0);
  const [receipts, setReceipts] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeComponent, setActiveComponent] = useState('pos'); // pos, invoices, customers, receipts
  const [pausedCarts, setPausedCarts] = useState([]);

  // Sample product database (in real app, this would come from API)
  const [products] = useState([
    { id: 1, barcode: '123456789012', name: 'Milk 1L', price: 2.99, stock: 50 },
    { id: 2, barcode: '234567890123', name: 'Bread Whole Wheat', price: 3.49, stock: 30 },
    { id: 3, barcode: '345678901234', name: 'Eggs Dozen', price: 4.99, stock: 40 },
    { id: 4, barcode: '456789012345', name: 'Butter 250g', price: 3.79, stock: 25 },
    { id: 5, barcode: '567890123456', name: 'Sugar 1kg', price: 2.49, stock: 35 },
    { id: 6, barcode: '678901234567', name: 'Coffee 500g', price: 8.99, stock: 20 },
    { id: 7, barcode: '789012345678', name: 'Tea Bags 100ct', price: 5.49, stock: 15 },
    { id: 8, barcode: '890123456789', name: 'Cereal 500g', price: 4.29, stock: 28 },
  ]);

  // Additional protection for client-side navigation
  useEffect(() => {
    if (isInitialized && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, isInitialized, router]);

  // Focus on barcode input when component mounts
  useEffect(() => {
    if (barcodeInputRef.current && activeComponent === 'pos') {
      barcodeInputRef.current.focus();
    }
  }, [activeComponent]);

  // Auto-add product when barcode is fully entered
  useEffect(() => {
    if (barcodeInput.length === 12) { // Standard UPC barcode length
      handleBarcodeSubmitAuto();
    }
  }, [barcodeInput]);

  // Calculate cart totals
  const cartTotal = cart.reduce((total, item) => total + (item.price * item.quantity), 0);
  const itemsCount = cart.reduce((count, item) => count + item.quantity, 0);

  // Handle barcode input auto-submit
  const handleBarcodeSubmitAuto = () => {
    if (!barcodeInput.trim()) return;

    const product = products.find(p => p.barcode === barcodeInput);
    if (product) {
      addToCart(product);
      setBarcodeInput('');
      if (barcodeInputRef.current) {
        barcodeInputRef.current.focus();
      }
    } else {
      toast.error('Product not found!');
    }
  };

  // Handle manual barcode submit
  const handleBarcodeSubmit = (e) => {
    e.preventDefault();
    handleBarcodeSubmitAuto();
  };

  // Add product to cart
  const addToCart = (product) => {
    setCart(prevCart => {
      const existingItem = prevCart.find(item => item.id === product.id);
      if (existingItem) {
        return prevCart.map(item =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      } else {
        return [...prevCart, { ...product, quantity: 1 }];
      }
    });
  };

  // Update item quantity
  const updateQuantity = (id, newQuantity) => {
    if (newQuantity < 1) {
      removeFromCart(id);
      return;
    }
    setCart(prevCart =>
      prevCart.map(item =>
        item.id === id ? { ...item, quantity: newQuantity } : item
      )
    );
  };

  // Remove item from cart
  const removeFromCart = (id) => {
    setCart(prevCart => prevCart.filter(item => item.id !== id));
  };

  // Clear entire cart
  const clearCart = () => {
    setCart([]);
    setBarcodeInput('');
    setPaymentAmount('');
    setChangeAmount(0);
    if (barcodeInputRef.current) {
      barcodeInputRef.current.focus();
    }
  };

  // Pause current sale
  const pauseSale = () => {
    if (cart.length === 0) {
      toast.error('Cart is empty!');
      return;
    }

    const pausedCart = {
      id: Date.now(),
      date: new Date(),
      items: [...cart],
      total: cartTotal
    };

    setPausedCarts(prev => [pausedCart, ...prev]);
    clearCart();
    setIsSalePaused(false);
    toast.success('Sale paused successfully!');
  };

  // Resume a paused sale
  const resumeSale = (pausedCart) => {
    setCart(pausedCart.items);
    setPausedCarts(prev => prev.filter(cart => cart.id !== pausedCart.id));
    toast.info('Sale resumed');
  };

  // Handle payment amount change
  const handlePaymentChange = (e) => {
    const amount = e.target.value;
    setPaymentAmount(amount);
    
    if (amount && !isNaN(amount)) {
      const change = parseFloat(amount) - cartTotal;
      setChangeAmount(change >= 0 ? change : 0);
    } else {
      setChangeAmount(0);
    }
  };

  // Complete sale
  const completeSale = () => {
    if (cart.length === 0) {
      toast.error('Cart is empty!');
      return;
    }

    if (!paymentAmount || parseFloat(paymentAmount) < cartTotal) {
      toast.error('Payment amount must be at least the total amount');
      return;
    }

    // Generate receipt
    const newReceipt = {
      id: Date.now(),
      date: new Date(),
      items: [...cart],
      total: cartTotal,
      payment: parseFloat(paymentAmount),
      change: changeAmount,
      type: 'cash' // cash sale
    };

    setReceipts(prev => [newReceipt, ...prev]);
    toast.success('Sale completed successfully!');
    
    // Reset for next sale
    clearCart();
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
      case 'invoices':
        return (
          <Card className="col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center">
                <FileText className="mr-2 h-5 w-5" />
                Sales Invoicing
              </CardTitle>
              <CardDescription>
                Create and manage customer invoices
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-gray-500">
                <FileText className="h-12 w-12 mx-auto mb-4" />
                <p>Sales Invoicing System</p>
                <p className="text-sm">Create invoices for credit sales</p>
              </div>
            </CardContent>
          </Card>
        );
      
      case 'customers':
        return (
          <Card className="col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center">
                <UserPlus className="mr-2 h-5 w-5" />
                Customer Management
              </CardTitle>
              <CardDescription>
                Add and manage customers
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-gray-500">
                <UserPlus className="h-12 w-12 mx-auto mb-4" />
                <p>Customer Management System</p>
                <p className="text-sm">Add customers and view their debt records</p>
              </div>
            </CardContent>
          </Card>
        );
      
      case 'receipts':
        return (
          <Card className="col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Receipt className="mr-2 h-5 w-5" />
                Receipt Management
              </CardTitle>
              <CardDescription>
                View and print receipts
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-gray-500">
                <Receipt className="h-12 w-12 mx-auto mb-4" />
                <p>Receipt Management System</p>
                <p className="text-sm">View and print all transaction receipts</p>
              </div>
            </CardContent>
          </Card>
        );
      
      default: // POS view
        return (
          <>
            {/* Left Column - Barcode Input and Paused Carts */}
            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Scan className="mr-2 h-5 w-5" />
                    Barcode Scanner
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleBarcodeSubmit} className="space-y-2">
                    <Input
                      ref={barcodeInputRef}
                      placeholder="Scan barcode (12 digits)"
                      value={barcodeInput}
                      onChange={(e) => setBarcodeInput(e.target.value)}
                      disabled={isSalePaused}
                      maxLength={12}
                    />
                    <Button 
                      type="submit" 
                      className="w-full"
                      disabled={isSalePaused}
                    >
                      <Scan className="mr-2 h-4 w-4" />
                      Add Item
                    </Button>
                  </form>
                </CardContent>
              </Card>

              {/* Paused Carts */}
              {pausedCarts.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Paused Sales</CardTitle>
                    <CardDescription>
                      {pausedCarts.length} paused sale{pausedCarts.length !== 1 ? 's' : ''}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3 max-h-60 overflow-y-auto">
                    {pausedCarts.map(cart => (
                      <div key={cart.id} className="p-3 border rounded-lg">
                        <div className="flex justify-between items-start">
                          <div>
                            <div className="font-medium">
                              {cart.date.toLocaleTimeString()}
                            </div>
                            <div className="text-sm text-gray-500">
                              {cart.items.length} item{cart.items.length !== 1 ? 's' : ''} • ${cart.total.toFixed(2)}
                            </div>
                          </div>
                          <Button 
                            size="sm" 
                            onClick={() => resumeSale(cart)}
                          >
                            <Play className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              )}

              {/* Sales Statistics */}
              <Card>
                <CardHeader>
                  <CardTitle>Today's Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex justify-between">
                    <span>Total Sales:</span>
                    <span className="font-bold">${receipts.reduce((sum, receipt) => sum + receipt.total, 0).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Transactions:</span>
                    <span className="font-bold">{receipts.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Items Sold:</span>
                    <span className="font-bold">{receipts.reduce((sum, receipt) => sum + receipt.items.reduce((itemSum, item) => itemSum + item.quantity, 0), 0)}</span>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Middle Column - Cart Items */}
            <div>
              <Card className="h-full">
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle>Current Sale</CardTitle>
                    <CardDescription>
                      {itemsCount} item{itemsCount !== 1 ? 's' : ''} in cart
                    </CardDescription>
                  </div>
                  <Badge variant={isSalePaused ? "destructive" : "default"}>
                    {isSalePaused ? 'PAUSED' : 'ACTIVE'}
                  </Badge>
                </CardHeader>
                <CardContent className="space-y-4 max-h-96 overflow-y-auto">
                  {cart.length === 0 ? (
                    <div className="text-center text-gray-500 py-8">
                      Cart is empty. Scan or add items to begin.
                    </div>
                  ) : (
                    cart.map(item => (
                      <div key={item.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex-1">
                          <div className="font-medium">{item.name}</div>
                          <div className="text-sm text-gray-500">${item.price} each</div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            disabled={isSalePaused}
                          >
                            <Minus className="h-3 w-3" />
                          </Button>
                          <span className="w-8 text-center font-medium">{item.quantity}</span>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            disabled={isSalePaused}
                          >
                            <Plus className="h-3 w-3" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => removeFromCart(item.id)}
                            disabled={isSalePaused}
                          >
                            <Trash2 className="h-4 w-4 text-red-500" />
                          </Button>
                        </div>
                        <div className="font-bold ml-4">
                          ${(item.price * item.quantity).toFixed(2)}
                        </div>
                      </div>
                    ))
                  )}
                </CardContent>
                <CardFooter className="flex justify-between border-t pt-4">
                  <Button
                    variant="outline"
                    onClick={clearCart}
                    disabled={isSalePaused || cart.length === 0}
                  >
                    <X className="mr-2 h-4 w-4" />
                    Clear Cart
                  </Button>
                  <Button
                    variant="outline"
                    onClick={pauseSale}
                    disabled={isSalePaused || cart.length === 0}
                  >
                    <Pause className="mr-2 h-4 w-4" />
                    Pause Sale
                  </Button>
                </CardFooter>
              </Card>
            </div>

            {/* Right Column - Payment */}
            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Payment</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between text-lg">
                    <span>Total:</span>
                    <span className="font-bold">${cartTotal.toFixed(2)}</span>
                  </div>
                  
                  <div className="space-y-2">
                    <Input
                      placeholder="Enter payment amount"
                      type="number"
                      step="0.01"
                      value={paymentAmount}
                      onChange={handlePaymentChange}
                      disabled={isSalePaused || cart.length === 0}
                    />
                    {paymentAmount && (
                      <div className="flex justify-between">
                        <span>Change:</span>
                        <span className={changeAmount >= 0 ? "text-green-600 font-bold" : "text-red-600 font-bold"}>
                          ${changeAmount.toFixed(2)}
                        </span>
                      </div>
                    )}
                  </div>
                </CardContent>
                <CardFooter>
                  <Button
                    className="w-full"
                    onClick={completeSale}
                    disabled={isSalePaused || cart.length === 0 || !paymentAmount || parseFloat(paymentAmount) < cartTotal}
                  >
                    <Check className="mr-2 h-4 w-4" />
                    Complete Sale (${cartTotal.toFixed(2)})
                  </Button>
                </CardFooter>
              </Card>
            </div>
          </>
        );
    }
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-100 flex flex-col">
        {/* Top Navbar - Always visible */}
        <Navbar />
        
        <div className="flex flex-1">
          {/* Sidebar Navigation */}
          <POSSidebar 
            activeComponent={activeComponent} 
            setActiveComponent={setActiveComponent} 
          />
          
          {/* Main POS Interface */}
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

export default POSSale;