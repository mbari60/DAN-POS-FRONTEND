"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import Navbar from "@/components/Navbar";
import { useRouter } from "next/navigation";
import {
  Loader2,
  Users,
  Shield,
  Settings,
  BarChart3,
  Plus,
  Edit,
  Trash2,
  Search,
  UserPlus,
  Key,
  Eye,
  Grid3X3,
  AlertTriangle,
  RefreshCw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "react-toastify";

// Import our components
import RoleManagement from "@/components/roles/RoleManagement";
import RolePermissions from "@/components/roles/RolePermissions";
import UserManagement from "@/components/users/userManagement";
// import { VoidDialog } from "../../components/voiding/voiding";

// Import API functions
import { 
  getSaleInvoices, 
  getCustomerPayments, 
  getSaleReturns,
  voidSaleInvoice,
  voidCustomerPayment,
  voidSaleReturn
} from '@/lib/api/sales';
import { VoidDialog } from "@/components/voiding/voiding";

const AdminSystem = () => {
  const { user, isAuthenticated, isInitialized } = useAuth();
  const [voidDialogOpen, setVoidDialogOpen] = useState(false); 
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const router = useRouter();

  // State for admin system
  const [activeSection, setActiveSection] = useState("dashboard");
  const [activeTab, setActiveTab] = useState("users");
  const [loading, setLoading] = useState(false);

  // Real data states
  const [saleInvoices, setSaleInvoices] = useState([]);
  const [customerPayments, setCustomerPayments] = useState([]);
  const [saleReturns, setSaleReturns] = useState([]);
  const [systemStats, setSystemStats] = useState({
    totalUsers: 0,
    activeUsers: 0,
    adminUsers: 0,
    todayLogins: 0,
    totalRoles: 0,
    systemHealth: "Good",
  });

  // Get current user function for VoidDialog
  const getCurrentUser = async () => {
    try {
      if (!user) {
        throw new Error("User not authenticated");
      }
      
      return {
        id: user.id,
        username: user.username,
        first_name: user.first_name || user.username,
        last_name: user.last_name || "",
        email: user.email
      };
    } catch (error) {
      console.error("Failed to get current user:", error);
      throw new Error("Failed to get current user information");
    }
  };

  // Fetch real data from backend
  const fetchRealData = async () => {
    try {
      setLoading(true);
      
      // Fetch all transaction data in parallel
      const [invoicesResponse, paymentsResponse, returnsResponse] = await Promise.all([
        getSaleInvoices({ status: 'completed', limit: 50 }),
        getCustomerPayments({ limit: 50 }),
        getSaleReturns({ status: 'completed', limit: 50 })
      ]);

      setSaleInvoices(invoicesResponse.data || invoicesResponse.results || []);
      setCustomerPayments(paymentsResponse.data || paymentsResponse.results || []);
      setSaleReturns(returnsResponse.data || returnsResponse.results || []);

      // Update stats with real counts
      setSystemStats(prev => ({
        ...prev,
        totalInvoices: invoicesResponse.data?.length || invoicesResponse.results?.length || 0,
        totalPayments: paymentsResponse.data?.length || paymentsResponse.results?.length || 0,
        totalReturns: returnsResponse.data?.length || returnsResponse.results?.length || 0,
      }));

    } catch (error) {
      console.error("Failed to fetch data:", error);
      toast.error("Failed to load transaction data");
    } finally {
      setLoading(false);
    }
  };

  // Handle void success
  const handleVoidSuccess = (transactionId, transactionType) => {
    toast.success(`${transactionType} voided successfully`);
    setVoidDialogOpen(false);
    setSelectedTransaction(null);
    
    // Refresh data after voiding
    fetchRealData();
  };

  // Open void dialog with selected transaction
  const openVoidDialog = (transaction, transactionType) => {
    setSelectedTransaction({
      ...transaction,
      _type: transactionType // Add type for identification
    });
    setVoidDialogOpen(true);
  };

  // Load data when voiding section is active
  useEffect(() => {
    if (activeSection === "voiding") {
      fetchRealData();
    }
  }, [activeSection]);

  // Additional protection - only admins should access this page
  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/");
    }
  }, [isAuthenticated, isInitialized, router, user]);

  if (!isInitialized) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  // Render transaction tables
  const renderTransactionTable = (transactions, type, title) => {
    const getStatusBadge = (status) => {
      const statusConfig = {
        'completed': { variant: 'default', label: 'Completed' },
        'draft': { variant: 'outline', label: 'Draft' },
        'pending_approval': { variant: 'secondary', label: 'Pending Approval' },
        'approved': { variant: 'default', label: 'Approved' },
        'rejected': { variant: 'destructive', label: 'Rejected' },
        'voided': { variant: 'destructive', label: 'Voided' }
      };
      
      const config = statusConfig[status] || { variant: 'outline', label: status };
      return <Badge variant={config.variant}>{config.label}</Badge>;
    };

    return (
      <Card>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
          <CardDescription>
            {transactions.length} transaction(s) found
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="border rounded-md overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-muted/50">
                <tr>
                  <th className="p-3 text-left font-semibold">Reference</th>
                  <th className="p-3 text-left font-semibold">Customer</th>
                  <th className="p-3 text-left font-semibold">Amount</th>
                  <th className="p-3 text-left font-semibold">Date</th>
                  <th className="p-3 text-left font-semibold">Status</th>
                  <th className="p-3 text-right font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((transaction) => (
                  <tr key={transaction.id} className="border-b hover:bg-muted/30">
                    <td className="p-3">
                      {transaction.reference_no || transaction.payment_reference || transaction.return_reference}
                    </td>
                    <td className="p-3">
                      {transaction.customer_name || 'N/A'}
                    </td>
                    <td className="p-3 font-semibold text-red-600">
                      Ksh {parseFloat(
                        transaction.total_amount || 
                        transaction.amount || 
                        transaction.total_return_amount || 0
                      ).toLocaleString()}
                    </td>
                    <td className="p-3 text-muted-foreground">
                      {new Date(
                        transaction.created_at || 
                        transaction.received_at
                      ).toLocaleDateString()}
                    </td>
                    <td className="p-3">
                      {getStatusBadge(transaction.status)}
                    </td>
                    <td className="p-3 text-right">
                      <Button
                        onClick={() => openVoidDialog(transaction, type)}
                        variant="outline"
                        size="sm"
                        disabled={transaction.is_voided || transaction.status !== 'completed'}
                      >
                        <AlertTriangle className="h-3 w-3 mr-1" />
                        Void
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    );
  };

  // Render different sections based on selection
  const renderActiveSection = () => {
    switch (activeSection) {
      case "users":
        return (
          <div className="space-y-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>User & Role Management</CardTitle>
                  <CardDescription>
                    Manage system users, roles, and permissions
                  </CardDescription>
                </div>
              </CardHeader>
              <CardContent>
                <Tabs
                  value={activeTab}
                  onValueChange={setActiveTab}
                  className="w-full"
                >
                  <TabsList className="grid w-full grid-cols-3 mb-6">
                    <TabsTrigger value="users" className="flex items-center gap-2">
                      <Users className="h-4 w-4" />
                      Users
                    </TabsTrigger>
                    <TabsTrigger value="roles" className="flex items-center gap-2">
                      <Shield className="h-4 w-4" />
                      Roles
                    </TabsTrigger>
                    <TabsTrigger value="permissions" className="flex items-center gap-2">
                      <Key className="h-4 w-4" />
                      Permissions
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="users">
                    <UserManagement />
                  </TabsContent>

                  <TabsContent value="roles">
                    <RoleManagement />
                  </TabsContent>

                  <TabsContent value="permissions">
                    <RolePermissions />
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>
        );

      case "dashboard":
        return (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>System Dashboard</CardTitle>
                <CardDescription>
                  Overview of system health and statistics
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <Card className="bg-gradient-to-br from-blue-50 to-blue-100">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Users className="h-5 w-5 text-blue-600" />
                        Users
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex justify-between items-end">
                        <div>
                          <div className="text-3xl font-bold">
                            {systemStats.totalUsers}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            Total Users
                          </div>
                        </div>
                        <Badge variant="outline" className="bg-blue-100 text-blue-800">
                          {systemStats.activeUsers} Active
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-gradient-to-br from-green-50 to-green-100">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Shield className="h-5 w-5 text-green-600" />
                        Roles & Permissions
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex justify-between items-end">
                        <div>
                          <div className="text-3xl font-bold">
                            {systemStats.totalRoles}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            System Roles
                          </div>
                        </div>
                        <Badge variant="outline" className="bg-green-100 text-green-800">
                          {systemStats.adminUsers} Admins
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-gradient-to-br from-purple-50 to-purple-100">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg flex items-center gap-2">
                        <BarChart3 className="h-5 w-5 text-purple-600" />
                        Activity
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex justify-between items-end">
                        <div>
                          <div className="text-3xl font-bold">
                            {systemStats.todayLogins}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            Today's Logins
                          </div>
                        </div>
                        <Badge variant="outline" className="bg-purple-100 text-purple-800">
                          This Week
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </CardContent>
            </Card>
          </div>
        );

      case "voiding":
        return (
          <div className="space-y-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5 text-red-500" />
                    Transaction Voiding System
                  </CardTitle>
                  <CardDescription>
                    Void sales, returns, and payments with proper reversal handling
                  </CardDescription>
                </div>
                <Button onClick={fetchRealData} variant="outline" size="sm" disabled={loading}>
                  <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                  Refresh Data
                </Button>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin" />
                  </div>
                ) : (
                  <div className="space-y-6">
                    {/* Statistics Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <Card>
                        <CardHeader className="pb-3">
                          <CardTitle className="text-sm">Sale Invoices</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <p className="text-2xl font-bold text-blue-600">
                            {saleInvoices.length}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Completed invoices available for voiding
                          </p>
                        </CardContent>
                      </Card>

                      <Card>
                        <CardHeader className="pb-3">
                          <CardTitle className="text-sm">Customer Payments</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <p className="text-2xl font-bold text-green-600">
                            {customerPayments.length}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Processed payments available for voiding
                          </p>
                        </CardContent>
                      </Card>

                      <Card>
                        <CardHeader className="pb-3">
                          <CardTitle className="text-sm">Sale Returns</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <p className="text-2xl font-bold text-orange-600">
                            {saleReturns.length}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Completed returns available for voiding
                          </p>
                        </CardContent>
                      </Card>
                    </div>

                    {/* Transaction Tables */}
                    {renderTransactionTable(saleInvoices, 'sale_invoice', 'Sale Invoices')}
                    {renderTransactionTable(customerPayments, 'customer_payment', 'Customer Payments')}
                    {renderTransactionTable(saleReturns, 'sale_return', 'Sale Returns')}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Void Dialog */}
            <VoidDialog
              open={voidDialogOpen}
              onOpenChange={setVoidDialogOpen}
              transaction={selectedTransaction}
              onVoidSuccess={handleVoidSuccess}
              getCurrentUser={getCurrentUser}
            />
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto p-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold tracking-tight">Admin System</h1>
          <p className="text-muted-foreground">
            Manage users, roles, permissions, and monitor system health
          </p>
        </div>

        <div className="flex flex-wrap gap-2 mb-6">
          <Button
            onClick={() => setActiveSection("dashboard")}
            variant={activeSection === "dashboard" ? "default" : "outline"}
            className="flex items-center gap-2"
          >
            <BarChart3 className="h-4 w-4" />
            Dashboard
          </Button>
          <Button
            onClick={() => setActiveSection("users")}
            variant={activeSection === "users" ? "default" : "outline"}
            className="flex items-center gap-2"
          >
            <Users className="h-4 w-4" />
            User Management
          </Button>
          <Button
            onClick={() => setActiveSection("voiding")}
            variant={activeSection === "voiding" ? "default" : "outline"}
            className="flex items-center gap-2"
          >
            <AlertTriangle className="h-4 w-4" />
            Voiding System
          </Button>
        </div>

        {renderActiveSection()}
      </div>
    </div>
  );
};

export default AdminSystem;