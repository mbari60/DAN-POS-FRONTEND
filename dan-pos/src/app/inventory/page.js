// app/inventory/page.jsx
"use client";

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import ProtectedRoute from '@/components/ProtectedRoute';
import Navbar from '@/components/Navbar';
import InventorySidebar from '@/components/InventorySidebar';
import { useRouter } from 'next/navigation';
import ItemManagement from './itemManagement/page';
import StoreManagement from './stores/page';
import StockManagement from './adjustment/page';
import StockMovements from './movements/page';
import PricingManagement from './pricing/page';

const InventorySystem = () => {
  const { isAuthenticated, isInitialized } = useAuth();
  const router = useRouter();
  
  // State for inventory system
  const [activeComponent, setActiveComponent] = useState('stores');

  // Additional protection
  useEffect(() => {
    if (isInitialized && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, isInitialized, router]);


  // Render different components based on active selection
  const renderActiveComponent = () => {
    switch (activeComponent) {
      case 'stores':
        return <StoreManagement />;

      case 'items':
        return <ItemManagement />;

      case 'movements':
        return (
         <StockMovements />
        );

      case 'adjustments':
        return (
          <StockManagement />
        );

      case 'pricing':
        return (
          <PricingManagement />
        );

      default:
        return <StoreManagement />;
    }
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <Navbar />
        
        <div className="flex flex-1">
          <InventorySidebar 
            activeComponent={activeComponent} 
            setActiveComponent={setActiveComponent} 
          />
          
          {/* Fixed main content area */}
          <main className="flex-1 lg:ml-64 mt-16 transition-all duration-300">
            {/* Container with proper responsive spacing */}
            <div className="w-full max-w-none px-4 py-6 lg:px-6">
              {/* Conditional layout - no grid for item management */}
              {activeComponent === 'items' ? (
                <div className="w-full">
                  {renderActiveComponent()}
                </div>
              ) : (
                <div className="w-full">
                  {renderActiveComponent()}
                </div>
              )}
            </div>
          </main>
        </div>
      </div>
    </ProtectedRoute>
  );
};

export default InventorySystem;

