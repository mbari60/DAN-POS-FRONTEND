// app/procurement/page.jsx
"use client";

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import ProtectedRoute from '@/components/ProtectedRoute';
import Navbar from '@/components/Navbar';
import ProcurementSidebar from '@/components/ProcurementSidebar';
import { useRouter } from 'next/navigation';
import SuppliersManagement from './Suppliers/SuppliersManagement';
import PurchaseOrdersManagement from './purchaseorders/page';
import GoodsReceiptsManagement from './grn/page';
import SupplierPaymentsManagement from './SupplierPayments/page';

const ProcurementSystem = () => {
  const { isAuthenticated, isInitialized } = useAuth();
  const router = useRouter();
  
  // State for procurement system
  const [activeComponent, setActiveComponent] = useState('purchase_orders');

  // Additional protection
  useEffect(() => {
    if (isInitialized && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, isInitialized, router]);

  // Render different components based on active selection
  const renderActiveComponent = () => {
    switch (activeComponent) {
      case 'purchase_orders':
        return <PurchaseOrdersManagement />;

      case 'goods_receipt':
        return <GoodsReceiptsManagement />;

      case 'suppliers':
        return <SuppliersManagement />;

      case 'payments':
        return <SupplierPaymentsManagement />;

      case 'reports':
        return <SuppliersManagement />;

      default:
        return <SuppliersManagement />;
    }
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <Navbar />
        
        <div className="flex flex-1">
          <ProcurementSidebar 
            activeComponent={activeComponent} 
            setActiveComponent={setActiveComponent} 
          />
          
          {/* Fixed main content area */}
          <main className="flex-1 lg:ml-64 mt-16 transition-all duration-300">
            {/* Container with proper responsive spacing */}
            <div className="w-full max-w-none px-4 py-6 lg:px-6">
              <div className="w-full">
                {renderActiveComponent()}
              </div>
            </div>
          </main>
        </div>
      </div>
    </ProtectedRoute>
  );
};

export default ProcurementSystem;