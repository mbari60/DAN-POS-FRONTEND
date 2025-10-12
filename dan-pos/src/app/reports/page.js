"use client";

import { useState } from "react";
import ProtectedRoute from "@/components/ProtectedRoute";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { DollarSign, BarChart3, FileText } from "lucide-react";
import SalesDashboard from "./sales/page";
import InventoryDashboard from "./inventory/page";

const ReportsSystem = () => {
  const [activeTab, setActiveTab] = useState("sales");

  const renderActiveTab = () => {
    switch (activeTab) {
      case "sales":
        return <SalesDashboard />;
      case "inventory":
        return <InventoryDashboard />;
      case "financial":
        return (
          <Card className="mt-6 border border-gray-200 shadow-sm w-full h-full">
            <CardHeader>
              <CardTitle>Financial Reports</CardTitle>
              <CardDescription>
                Analyze Profit & Loss, Balance Sheets, and Cash Flow data.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex items-center justify-center h-[60vh] text-gray-500">
              <div className="text-center">
                <FileText className="h-14 w-14 mx-auto mb-4 text-purple-500" />
                <p>Financial Reports Overview</p>
              </div>
            </CardContent>
          </Card>
        );
      default:
        return null;
    }
  };

  return (
    <ProtectedRoute>
      <main className="min-h-screen w-full bg-gray-100 flex flex-col">
        <section className="flex-1 w-full p-3 sm:p-4 md:p-6 lg:p-8">
          <div className="w-full h-full bg-white rounded-xl sm:rounded-2xl shadow-sm border border-gray-200 flex flex-col p-4 sm:p-6 md:p-10">
            
            {/* Header */}
            <div className="mb-6 sm:mb-8 text-center">
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-2 text-gray-800">
                Reports & Analytics
              </h1>
              <p className="text-gray-500 text-sm sm:text-base max-w-2xl mx-auto">
                View detailed analytics for Sales, Inventory, and Financial performance across your business.
              </p>
            </div>

            {/* Tabs */}
            <div className="flex flex-wrap justify-center gap-2 sm:gap-3 mb-8">
              <Button
                variant={activeTab === "sales" ? "default" : "outline"}
                size="lg"
                onClick={() => setActiveTab("sales")}
                className={`flex items-center justify-center w-full sm:w-auto px-6 py-3 text-sm sm:text-base ${
                  activeTab === "sales" ? "bg-blue-600 text-white hover:bg-blue-700" : ""
                }`}
              >
                <DollarSign className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
                Sales
              </Button>

              <Button
                variant={activeTab === "inventory" ? "default" : "outline"}
                size="lg"
                onClick={() => setActiveTab("inventory")}
                className={`flex items-center justify-center w-full sm:w-auto px-6 py-3 text-sm sm:text-base ${
                  activeTab === "inventory" ? "bg-green-600 text-white hover:bg-green-700" : ""
                }`}
              >
                <BarChart3 className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
                Inventory
              </Button>

              <Button
                variant={activeTab === "financial" ? "default" : "outline"}
                size="lg"
                onClick={() => setActiveTab("financial")}
                className={`flex items-center justify-center w-full sm:w-auto px-6 py-3 text-sm sm:text-base ${
                  activeTab === "financial" ? "bg-purple-600 text-white hover:bg-purple-700" : ""
                }`}
              >
                <FileText className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
                Financial
              </Button>
            </div>

            {/* Report Section */}
            <div className="flex-1 overflow-y-auto transition-all duration-300">
              {renderActiveTab()}
            </div>
          </div>
        </section>
      </main>
    </ProtectedRoute>
  );
};

export default ReportsSystem;
