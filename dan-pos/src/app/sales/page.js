"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import Navbar from "@/components/Navbar";
import { useRouter } from "next/navigation";
import CustomerManagement from "./customers/page";
import POSSidebar from "@/components/POSSidebar";
import CreateSaleInvoice from "./invoices/page";
import POSCreateSale from "./pos-sale/page";
import POSSystem from "./pos-sale/page";
import CustomerPaymentsManagement from "./payments/page";
import ExpensesManagement from "./expenses/page";
import CustomerBalancesManagement from "./balances/page";
import ReturnsManagement from "./returns/page";


const SalesSystem = () => {
  const { isAuthenticated, isInitialized } = useAuth();
  const router = useRouter();

  // which section to show
  const [activeComponent, setActiveComponent] = useState("pos");

  // Protect route if user not logged in
  useEffect(() => {
    if (isInitialized && !isAuthenticated) {
      router.push("/login");
    }
  }, [isAuthenticated, isInitialized, router]);

  // Decide which component to render
  const renderActiveComponent = () => {
    switch (activeComponent) {
      case "pos":
        return <POSSystem />;
      case "invoices":
        return <CreateSaleInvoice />;
      case "customers":
        return <CustomerManagement />;
      case "returns":
        return <ReturnsManagement />;
      case "payments":
        return <CustomerPaymentsManagement />;
      case "expenses":
        return <ExpensesManagement />;
      case "balances":
        return <CustomerBalancesManagement />;
      default:
        return <POSSystem />;
    }
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50 flex flex-col">
        {/* <Navbar /> */}

        <div className="flex flex-1">
          <POSSidebar
            activeComponent={activeComponent}
            setActiveComponent={setActiveComponent}
          />

          {/* Main content area, same spacing & responsiveness as inventory */}
          <main className="flex-1 lg:ml-64 mt-16 transition-all duration-300">
            <div className="w-full max-w-none px-4 py-6 lg:px-6">
              {renderActiveComponent()}
            </div>
          </main>
        </div>
      </div>
    </ProtectedRoute>
  );
};

export default SalesSystem;
