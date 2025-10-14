// // app/sales/dashboard/page.jsx
// "use client";

// import React, { useState, useEffect, useCallback } from "react";
// import {
//   Card,
//   CardContent,
//   CardDescription,
//   CardHeader,
//   CardTitle,
// } from "@/components/ui/card";
// import {
//   Table,
//   TableBody,
//   TableCell,
//   TableHead,
//   TableHeader,
//   TableRow,
// } from "@/components/ui/table";
// import { Button } from "@/components/ui/button";
// import { Badge } from "@/components/ui/badge";
// import { Input } from "@/components/ui/input";
// import {
//   Select,
//   SelectContent,
//   SelectItem,
//   SelectTrigger,
//   SelectValue,
// } from "@/components/ui/select";
// import {
//   Dialog,
//   DialogContent,
//   DialogTrigger,
//   DialogDescription,
//   DialogHeader,
//   DialogTitle,
//   DialogFooter,
// } from "@/components/ui/dialog";
// import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
// import { 
//   Download, 
//   Eye, 
//   AlertCircle, 
//   RefreshCw, 
//   TrendingUp, 
//   BarChart3, 
//   Users,
//   CreditCard,
//   DollarSign,
//   ShoppingCart,
//   Calendar,
//   FileText,
//   PieChart
// } from "lucide-react";
// import { toast } from "react-toastify";
// import * as salesApi from "@/lib/api/sales";

// // Data mapping utility for consistent field names
// const mapApiData = (data, mappingConfig) => {
//   if (!data || !Array.isArray(data)) return [];

//   return data.map((item) => {
//     const mappedItem = {};
//     Object.keys(mappingConfig).forEach((targetKey) => {
//       const sourceKey = mappingConfig[targetKey];
//       mappedItem[targetKey] =
//         item[sourceKey] !== undefined ? item[sourceKey] : null;
//     });
//     return mappedItem;
//   });
// };

// // Mapping configurations
// const CUSTOMER_BALANCE_MAPPING = {
//   customer_name: "customer_name",
//   customer_code: "customer_code",
//   current_balance: "current_balance",
//   credit_limit: "credit_limit",
//   available_credit: "available_credit",
//   credit_utilization: "credit_utilization",
//   over_limit: "over_limit",
// };

// const AGING_REPORT_MAPPING = {
//   customer_name: "customer_name",
//   customer_code: "customer_code",
//   total_balance: "total_balance",
//   current: "current",
//   days_30: "days_30",
//   days_60: "days_60",
//   days_90: "days_90",
//   over_90: "over_90",
//   oldest_invoice_date: "oldest_invoice_date",
// };

// const TODAY_SALES_MAPPING = {
//   payment_method: "payment_method",
//   total_amount: "total_amount",
//   count: "count",
//   percentage: "percentage",
// };

// const SalesDashboard = () => {
//   const [activeTab, setActiveTab] = useState("overview");
//   const [loading, setLoading] = useState(false);
//   const [dashboardData, setDashboardData] = useState({
//     todaySales: null,
//     customerSummary: [],
//     agingReport: [],
//     expenseSummary: null,
//     profitLoss: null,
//     recentInvoices: [],
//   });
//   const [reports, setReports] = useState({
//     customerBalances: [],
//     agingReport: [],
//     salesReport: [],
//     productPerformance: [],
//   });
//   const [filters, setFilters] = useState({
//     storeId: "",
//     dateFrom: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0],
//     dateTo: new Date().toISOString().split('T')[0],
//     customerId: "",
//     paymentMethod: "",
//   });
//   const [selectedCustomer, setSelectedCustomer] = useState(null);
//   const [customerStatement, setCustomerStatement] = useState([]);
//   const [showCustomerDialog, setShowCustomerDialog] = useState(false);
//   const [showAgingDialog, setShowAgingDialog] = useState(false);
//   const [exportLoading, setExportLoading] = useState(false);

//   // Fetch dashboard overview data
//   useEffect(() => {
//     fetchDashboardData();
//   }, []);

//   const fetchDashboardData = async () => {
//     setLoading(true);
//     try {
//       const [
//         todaySales,
//         customerSummary,
//         agingReport,
//         expenseSummary,
//         profitLoss,
//         recentInvoices
//       ] = await Promise.all([
//         salesApi.getTodaySales(),
//         salesApi.getCustomerBalanceSummary(),
//         salesApi.getCustomerAgingReport(),
//         salesApi.getExpenseSummary({ 
//           start_date: filters.dateFrom, 
//           end_date: filters.dateTo 
//         }),
//         salesApi.getProfitLoss({ 
//           start_date: filters.dateFrom, 
//           end_date: filters.dateTo 
//         }),
//         salesApi.getSaleInvoices({ limit: 10 })
//       ]);

//       setDashboardData({
//         todaySales,
//         customerSummary,
//         agingReport,
//         expenseSummary,
//         profitLoss,
//         recentInvoices: recentInvoices.data || recentInvoices.results || []
//       });

//       toast.success('Dashboard data loaded successfully');
//     } catch (error) {
//       console.error("Error fetching dashboard data:", error);
//       toast.error('Failed to load dashboard data');
//     } finally {
//       setLoading(false);
//     }
//   };

//   // Format currency
//   const formatCurrency = (amount) => {
//     return new Intl.NumberFormat('en-KE', {
//       style: 'currency',
//       currency: 'KES'
//     }).format(amount || 0);
//   };

//   // Format date
//   const formatDate = (dateString) => {
//     if (!dateString) return "N/A";
//     try {
//       const date = new Date(dateString);
//       return isNaN(date.getTime())
//         ? dateString
//         : date.toLocaleDateString("en-US", {
//             year: "numeric",
//             month: "short",
//             day: "numeric",
//           });
//     } catch {
//       return dateString;
//     }
//   };

//   // Generate reports
//   const generateReport = async (reportType) => {
//     setLoading(true);
//     try {
//       let data;
//       let mappedData = [];

//       switch (reportType) {
//         case "customerBalances":
//           data = await salesApi.getCustomerBalanceSummary();
//           mappedData = mapApiData(data, CUSTOMER_BALANCE_MAPPING);
//           setReports((prev) => ({ ...prev, customerBalances: mappedData }));
//           break;
//         case "agingReport":
//           data = await salesApi.getCustomerAgingReport();
//           mappedData = mapApiData(data, AGING_REPORT_MAPPING);
//           setReports((prev) => ({ ...prev, agingReport: mappedData }));
//           break;
//         case "salesReport":
//           data = await salesApi.generateSalesReport({
//             report_type: 'daily',
//             start_date: filters.dateFrom,
//             end_date: filters.dateTo
//           });
//           setReports((prev) => ({ ...prev, salesReport: data.daily_breakdown || [] }));
//           break;
//         case "productPerformance":
//           data = await salesApi.generateSalesReport({
//             report_type: 'product',
//             start_date: filters.dateFrom,
//             end_date: filters.dateTo
//           });
//           setReports((prev) => ({ ...prev, productPerformance: data.all_products || [] }));
//           break;
//       }
//       toast.success(`${reportType} report generated successfully`);
//     } catch (error) {
//       console.error(`Error generating ${reportType} report:`, error);
//       toast.error(`Failed to generate ${reportType} report`);
//     } finally {
//       setLoading(false);
//     }
//   };

//   // Fetch customer statement
//   const fetchCustomerStatement = async (customerId) => {
//     try {
//       setLoading(true);
//       const statement = await salesApi.getCustomerStatement(
//         customerId, 
//         filters.dateFrom, 
//         filters.dateTo
//       );
//       setCustomerStatement(statement.transactions || []);
//     } catch (error) {
//       console.error('Error fetching customer statement:', error);
//       toast.error('Failed to fetch customer statement');
//       setCustomerStatement([]);
//     } finally {
//       setLoading(false);
//     }
//   };

//   // Handle customer click
//   const handleCustomerClick = async (customer) => {
//     setSelectedCustomer(customer);
//     await fetchCustomerStatement(customer.customer_id || customer.id);
//     setShowCustomerDialog(true);
//   };

//   // Handle aging report click
//   const handleAgingClick = () => {
//     setShowAgingDialog(true);
//   };

//   // Export functions
//   const handleExport = async (type, format) => {
//     setExportLoading(true);
//     const filename = `${type}_report_${new Date().toISOString().split("T")[0]}.${format}`;

//     try {
//       let blob;
//       switch (type) {
//         case "profitLoss":
//           blob = await salesApi.generateProfitLossPDF({
//             start_date: filters.dateFrom,
//             end_date: filters.dateTo
//           });
//           break;
//         case "salesReport":
//           blob = await salesApi.generateSalesReportPDF({
//             start_date: filters.dateFrom,
//             end_date: filters.dateTo,
//             report_type: 'monthly'
//           });
//           break;
//         case "customerStatement":
//           if (selectedCustomer) {
//             blob = await salesApi.generateCustomerStatementPDF({
//               customer_id: selectedCustomer.customer_id || selectedCustomer.id,
//               start_date: filters.dateFrom,
//               end_date: filters.dateTo
//             });
//           }
//           break;
//         default:
//           throw new Error(`Unsupported export type: ${type}`);
//       }

//       if (blob) {
//         salesApi.downloadPDF(blob, filename);
//         toast.success(`${type} exported successfully`);
//       }
//     } catch (error) {
//       console.error("Export error:", error);
//       toast.error(`Export failed: ${error.message}`);
//     } finally {
//       setExportLoading(false);
//     }
//   };

//   // Reset filters
//   const resetFilters = () => {
//     setFilters({
//       storeId: "",
//       dateFrom: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0],
//       dateTo: new Date().toISOString().split('T')[0],
//       customerId: "",
//       paymentMethod: "",
//     });
//   };

//   // Calculate key metrics
//   const calculateMetrics = () => {
//     const today = dashboardData.todaySales;
//     const profitLoss = dashboardData.profitLoss;
//     const aging = dashboardData.agingReport;

//     return {
//       totalRevenue: today?.summary?.overall_total || 0,
//       totalTransactions: today?.summary?.total_count || 0,
//       netProfit: profitLoss?.profit?.net_profit || 0,
//       overdueAccounts: aging?.filter(cust => cust.over_90 > 0).length || 0,
//       totalOverdue: aging?.reduce((sum, cust) => sum + (cust.over_90 || 0), 0) || 0,
//       activeCustomers: dashboardData.customerSummary?.length || 0
//     };
//   };

//   const metrics = calculateMetrics();

//   if (loading && activeTab === "overview") {
//     return (
//       <div className="flex items-center justify-center min-h-screen">
//         <RefreshCw className="h-8 w-8 animate-spin mr-2" />
//         Loading sales dashboard...
//       </div>
//     );
//   }

//   return (
//     <div className="container mx-auto p-4 space-y-6">
//       {/* Header */}
//       <div className="flex justify-between items-center">
//         <div>
//           <h1 className="text-3xl font-bold tracking-tight">Sales Dashboard</h1>
//           <p className="text-muted-foreground">
//             Comprehensive overview of sales performance and financial metrics
//           </p>
//         </div>
//         <Button
//           onClick={fetchDashboardData}
//           variant="outline"
//           disabled={loading}
//         >
//           <RefreshCw
//             className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`}
//           />
//           Refresh
//         </Button>
//       </div>

//       {/* Overview Tab */}
//       <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
//         <TabsList className="grid w-full grid-cols-2 md:grid-cols-5">
//           <TabsTrigger value="overview">Overview</TabsTrigger>
//           <TabsTrigger value="customers">Customers</TabsTrigger>
//           <TabsTrigger value="sales">Sales Analysis</TabsTrigger>
//           <TabsTrigger value="products">Products</TabsTrigger>
//           <TabsTrigger value="financials">Financials</TabsTrigger>
//         </TabsList>

//         {/* Overview Content */}
//         <TabsContent value="overview" className="space-y-4">
//           {/* Key Metrics */}
//           <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
//             <Card>
//               <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
//                 <CardTitle className="text-sm font-medium">
//                   Today's Revenue
//                 </CardTitle>
//                 <DollarSign className="h-4 w-4 text-muted-foreground" />
//               </CardHeader>
//               <CardContent>
//                 <div className="text-2xl font-bold">
//                   {formatCurrency(metrics.totalRevenue)}
//                 </div>
//                 <p className="text-xs text-muted-foreground">
//                   {metrics.totalTransactions} transactions today
//                 </p>
//               </CardContent>
//             </Card>
//             <Card>
//               <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
//                 <CardTitle className="text-sm font-medium">
//                   Active Customers
//                 </CardTitle>
//                 <Users className="h-4 w-4 text-muted-foreground" />
//               </CardHeader>
//               <CardContent>
//                 <div className="text-2xl font-bold">
//                   {metrics.activeCustomers}
//                 </div>
//                 <p className="text-xs text-muted-foreground">
//                   {formatCurrency(dashboardData.customerSummary?.reduce((sum, cust) => sum + cust.current_balance, 0) || 0)} total balance
//                 </p>
//               </CardContent>
//             </Card>
//             <Card>
//               <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
//                 <CardTitle className="text-sm font-medium">
//                   Net Profit
//                 </CardTitle>
//                 <TrendingUp className="h-4 w-4 text-muted-foreground" />
//               </CardHeader>
//               <CardContent>
//                 <div className={`text-2xl font-bold ${
//                   metrics.netProfit >= 0 ? 'text-green-600' : 'text-red-600'
//                 }`}>
//                   {formatCurrency(metrics.netProfit)}
//                 </div>
//                 <p className="text-xs text-muted-foreground">
//                   {dashboardData.profitLoss?.profit?.net_profit_margin || 0}% margin
//                 </p>
//               </CardContent>
//             </Card>
//             <Card className="cursor-pointer" onClick={handleAgingClick}>
//               <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
//                 <CardTitle className="text-sm font-medium">
//                   Overdue Accounts
//                 </CardTitle>
//                 <AlertCircle className="h-4 w-4 text-destructive" />
//               </CardHeader>
//               <CardContent>
//                 <div className="text-2xl font-bold text-destructive">
//                   {metrics.overdueAccounts}
//                 </div>
//                 <p className="text-xs text-muted-foreground">
//                   {formatCurrency(metrics.totalOverdue)} total overdue
//                 </p>
//               </CardContent>
//             </Card>
//           </div>

//           <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
//             {/* Today's Sales Breakdown */}
//             <Card className="col-span-4">
//               <CardHeader>
//                 <CardTitle>Today's Sales Performance</CardTitle>
//                 <CardDescription>
//                   Real-time sales breakdown by payment method
//                 </CardDescription>
//               </CardHeader>
//               <CardContent>
//                 <Table>
//                   <TableHeader>
//                     <TableRow>
//                       <TableHead>Payment Method</TableHead>
//                       <TableHead>Transactions</TableHead>
//                       <TableHead>Amount</TableHead>
//                       <TableHead>Percentage</TableHead>
//                     </TableRow>
//                   </TableHeader>
//                   <TableBody>
//                     {dashboardData.todaySales?.payment_methods?.map((method, index) => (
//                       <TableRow key={index}>
//                         <TableCell className="font-medium">
//                           <Badge variant="outline" className="capitalize">
//                             {method.payment_method}
//                           </Badge>
//                         </TableCell>
//                         <TableCell>{method.count}</TableCell>
//                         <TableCell>{formatCurrency(method.total_amount)}</TableCell>
//                         <TableCell>
//                           <Badge variant="secondary">
//                             {method.percentage}%
//                           </Badge>
//                         </TableCell>
//                       </TableRow>
//                     ))}
//                   </TableBody>
//                 </Table>
//               </CardContent>
//             </Card>

//             {/* Recent Invoices */}
//             <Card className="col-span-3">
//               <CardHeader>
//                 <CardTitle>Recent Invoices</CardTitle>
//                 <CardDescription>Latest sales transactions</CardDescription>
//               </CardHeader>
//               <CardContent>
//                 <div className="space-y-4">
//                   {dashboardData.recentInvoices.slice(0, 5).map((invoice, index) => (
//                     <div key={invoice.id || index} className="flex justify-between items-center border-b pb-3">
//                       <div>
//                         <div className="font-medium text-sm">{invoice.reference_no}</div>
//                         <div className="text-xs text-muted-foreground">
//                           {invoice.customer_name || 'Walk-in Customer'}
//                         </div>
//                       </div>
//                       <div className="text-right">
//                         <div className="font-semibold">{formatCurrency(invoice.total_amount)}</div>
//                         <Badge variant="outline" className="text-xs capitalize">
//                           {invoice.payment_method}
//                         </Badge>
//                       </div>
//                     </div>
//                   ))}
//                 </div>
//               </CardContent>
//             </Card>
//           </div>
//         </TabsContent>

//         {/* Customers Tab */}
//         <TabsContent value="customers" className="space-y-4">
//           <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
//             <div className="space-x-2">
//               <Button
//                 onClick={() => generateReport("customerBalances")}
//                 disabled={loading}
//               >
//                 {loading ? "Generating..." : "Generate Report"}
//               </Button>
//               <Dialog>
//                 <DialogTrigger asChild>
//                   <Button variant="outline" disabled={exportLoading}>
//                     <Download className="mr-2 h-4 w-4" />
//                     {exportLoading ? "Exporting..." : "Export"}
//                   </Button>
//                 </DialogTrigger>
//                 <DialogContent>
//                   <DialogHeader>
//                     <DialogTitle>Export Options</DialogTitle>
//                     <DialogDescription>
//                       Choose format for Customer Balances Report
//                     </DialogDescription>
//                   </DialogHeader>
//                   <div className="space-y-2">
//                     <Button
//                       onClick={() => handleExport("customerStatement", "pdf")}
//                       className="w-full"
//                       disabled={exportLoading}
//                     >
//                       PDF
//                     </Button>
//                   </div>
//                 </DialogContent>
//               </Dialog>
//             </div>
//             <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
//               <Input
//                 type="date"
//                 placeholder="From Date"
//                 value={filters.dateFrom}
//                 onChange={(e) =>
//                   setFilters((prev) => ({ ...prev, dateFrom: e.target.value }))
//                 }
//                 className="w-full sm:w-32"
//               />
//               <Input
//                 type="date"
//                 placeholder="To Date"
//                 value={filters.dateTo}
//                 onChange={(e) =>
//                   setFilters((prev) => ({ ...prev, dateTo: e.target.value }))
//                 }
//                 className="w-full sm:w-32"
//               />
//               <Button variant="outline" onClick={resetFilters}>
//                 Clear
//               </Button>
//             </div>
//           </div>

//           <div className="grid gap-4 md:grid-cols-2">
//             {/* Customer Balances */}
//             <Card>
//               <CardHeader>
//                 <CardTitle>Customer Balances</CardTitle>
//                 <CardDescription>Current outstanding balances and credit utilization</CardDescription>
//               </CardHeader>
//               <CardContent>
//                 <Table>
//                   <TableHeader>
//                     <TableRow>
//                       <TableHead>Customer</TableHead>
//                       <TableHead>Balance</TableHead>
//                       <TableHead>Credit Limit</TableHead>
//                       <TableHead>Utilization</TableHead>
//                       <TableHead>Actions</TableHead>
//                     </TableRow>
//                   </TableHeader>
//                   <TableBody>
//                     {dashboardData.customerSummary?.slice(0, 10).map((customer, index) => (
//                       <TableRow key={customer.customer_id || index}>
//                         <TableCell className="font-medium">
//                           {customer.customer_name}
//                         </TableCell>
//                         <TableCell className={
//                           customer.over_limit ? 'text-red-600 font-semibold' : ''
//                         }>
//                           {formatCurrency(customer.current_balance)}
//                         </TableCell>
//                         <TableCell>{formatCurrency(customer.credit_limit)}</TableCell>
//                         <TableCell>
//                           <Badge variant={
//                             customer.credit_utilization > 90 ? 'destructive' :
//                             customer.credit_utilization > 75 ? 'default' : 'secondary'
//                           }>
//                             {customer.credit_utilization}%
//                           </Badge>
//                         </TableCell>
//                         <TableCell>
//                           <Button
//                             variant="ghost"
//                             size="sm"
//                             onClick={() => handleCustomerClick(customer)}
//                           >
//                             <Eye className="h-4 w-4" />
//                           </Button>
//                         </TableCell>
//                       </TableRow>
//                     ))}
//                   </TableBody>
//                 </Table>
//               </CardContent>
//             </Card>

//             {/* Aging Report Summary */}
//             <Card>
//               <CardHeader>
//                 <CardTitle>Accounts Receivable Aging Summary</CardTitle>
//                 <CardDescription>Outstanding invoices by age category</CardDescription>
//               </CardHeader>
//               <CardContent>
//                 <Table>
//                   <TableHeader>
//                     <TableRow>
//                       <TableHead>Customer</TableHead>
//                       <TableHead>Total Due</TableHead>
//                       <TableHead>Current</TableHead>
//                       <TableHead>1-30</TableHead>
//                       <TableHead>31-60</TableHead>
//                       <TableHead>61+</TableHead>
//                     </TableRow>
//                   </TableHeader>
//                   <TableBody>
//                     {dashboardData.agingReport?.slice(0, 10).map((customer, index) => (
//                       <TableRow key={customer.customer_id || index}>
//                         <TableCell className="font-medium">
//                           {customer.customer_name}
//                         </TableCell>
//                         <TableCell className="font-semibold">
//                           {formatCurrency(customer.total_balance)}
//                         </TableCell>
//                         <TableCell>{formatCurrency(customer.current)}</TableCell>
//                         <TableCell>{formatCurrency(customer.days_30)}</TableCell>
//                         <TableCell className="text-orange-600">
//                           {formatCurrency(customer.days_60)}
//                         </TableCell>
//                         <TableCell className="text-red-600 font-semibold">
//                           {formatCurrency((customer.days_90 || 0) + (customer.over_90 || 0))}
//                         </TableCell>
//                       </TableRow>
//                     ))}
//                   </TableBody>
//                 </Table>
//               </CardContent>
//             </Card>
//           </div>
//         </TabsContent>

//         {/* Sales Analysis Tab */}
//         <TabsContent value="sales" className="space-y-4">
//           <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
//             <div className="space-x-2">
//               <Button
//                 onClick={() => generateReport("salesReport")}
//                 disabled={loading}
//               >
//                 {loading ? "Generating..." : "Generate Report"}
//               </Button>
//               <Dialog>
//                 <DialogTrigger asChild>
//                   <Button variant="outline" disabled={exportLoading}>
//                     <Download className="mr-2 h-4 w-4" />
//                     {exportLoading ? "Exporting..." : "Export"}
//                   </Button>
//                 </DialogTrigger>
//                 <DialogContent>
//                   <DialogHeader>
//                     <DialogTitle>Export Options</DialogTitle>
//                     <DialogDescription>
//                       Choose format for Sales Report
//                     </DialogDescription>
//                   </DialogHeader>
//                   <div className="space-y-2">
//                     <Button
//                       onClick={() => handleExport("salesReport", "pdf")}
//                       className="w-full"
//                       disabled={exportLoading}
//                     >
//                       PDF
//                     </Button>
//                   </div>
//                 </DialogContent>
//               </Dialog>
//             </div>
//             <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
//               <Input
//                 type="date"
//                 placeholder="From Date"
//                 value={filters.dateFrom}
//                 onChange={(e) =>
//                   setFilters((prev) => ({ ...prev, dateFrom: e.target.value }))
//                 }
//                 className="w-full sm:w-32"
//               />
//               <Input
//                 type="date"
//                 placeholder="To Date"
//                 value={filters.dateTo}
//                 onChange={(e) =>
//                   setFilters((prev) => ({ ...prev, dateTo: e.target.value }))
//                 }
//                 className="w-full sm:w-32"
//               />
//               <Button variant="outline" onClick={resetFilters}>
//                 Clear
//               </Button>
//             </div>
//           </div>

//           <Card>
//             <CardHeader>
//               <CardTitle>Sales Performance Report</CardTitle>
//               <CardDescription>
//                 Daily sales breakdown from {filters.dateFrom} to {filters.dateTo}
//               </CardDescription>
//             </CardHeader>
//             <CardContent>
//               <Table>
//                 <TableHeader>
//                   <TableRow>
//                     <TableHead>Date</TableHead>
//                     <TableHead>Total Sales</TableHead>
//                     <TableHead>Invoices</TableHead>
//                     <TableHead>Average Sale</TableHead>
//                     <TableHead>Payment Methods</TableHead>
//                   </TableRow>
//                 </TableHeader>
//                 <TableBody>
//                   {reports.salesReport.map((day, index) => (
//                     <TableRow key={index}>
//                       <TableCell className="font-medium">{day.date}</TableCell>
//                       <TableCell>{formatCurrency(day.total_sales)}</TableCell>
//                       <TableCell>{day.total_invoices}</TableCell>
//                       <TableCell>{formatCurrency(day.average_sale)}</TableCell>
//                       <TableCell>
//                         <div className="flex gap-1 flex-wrap">
//                           {day.payment_methods?.slice(0, 3).map((method, idx) => (
//                             <Badge key={idx} variant="outline" className="text-xs">
//                               {method.payment_method}: {formatCurrency(method.total_amount)}
//                             </Badge>
//                           ))}
//                         </div>
//                       </TableCell>
//                     </TableRow>
//                   ))}
//                   {reports.salesReport.length === 0 && (
//                     <TableRow>
//                       <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
//                         No sales data available. Generate a report to see data.
//                       </TableCell>
//                     </TableRow>
//                   )}
//                 </TableBody>
//               </Table>
//             </CardContent>
//           </Card>
//         </TabsContent>

//         {/* Products Tab */}
//         <TabsContent value="products" className="space-y-4">
//           <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
//             <div className="space-x-2">
//               <Button
//                 onClick={() => generateReport("productPerformance")}
//                 disabled={loading}
//               >
//                 {loading ? "Generating..." : "Generate Report"}
//               </Button>
//             </div>
//             <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
//               <Input
//                 type="date"
//                 placeholder="From Date"
//                 value={filters.dateFrom}
//                 onChange={(e) =>
//                   setFilters((prev) => ({ ...prev, dateFrom: e.target.value }))
//                 }
//                 className="w-full sm:w-32"
//               />
//               <Input
//                 type="date"
//                 placeholder="To Date"
//                 value={filters.dateTo}
//                 onChange={(e) =>
//                   setFilters((prev) => ({ ...prev, dateTo: e.target.value }))
//                 }
//                 className="w-full sm:w-32"
//               />
//               <Button variant="outline" onClick={resetFilters}>
//                 Clear
//               </Button>
//             </div>
//           </div>

//           <Card>
//             <CardHeader>
//               <CardTitle>Product Performance</CardTitle>
//               <CardDescription>
//                 Top performing products by revenue and profit
//               </CardDescription>
//             </CardHeader>
//             <CardContent>
//               <Table>
//                 <TableHeader>
//                   <TableRow>
//                     <TableHead>Product</TableHead>
//                     <TableHead>Quantity Sold</TableHead>
//                     <TableHead>Revenue</TableHead>
//                     <TableHead>Cost</TableHead>
//                     <TableHead>Profit</TableHead>
//                     <TableHead>Margin</TableHead>
//                   </TableRow>
//                 </TableHeader>
//                 <TableBody>
//                   {reports.productPerformance.slice(0, 15).map((product, index) => (
//                     <TableRow key={product.item_id || index}>
//                       <TableCell className="font-medium">{product.item_name}</TableCell>
//                       <TableCell>{product.quantity_sold}</TableCell>
//                       <TableCell>{formatCurrency(product.total_revenue)}</TableCell>
//                       <TableCell>{formatCurrency(product.total_cost)}</TableCell>
//                       <TableCell className={
//                         product.gross_profit >= 0 ? 'text-green-600' : 'text-red-600'
//                       }>
//                         {formatCurrency(product.gross_profit)}
//                       </TableCell>
//                       <TableCell>
//                         <Badge variant={
//                           product.profit_margin_percent > 30 ? 'default' :
//                           product.profit_margin_percent > 15 ? 'secondary' : 'destructive'
//                         }>
//                           {product.profit_margin_percent}%
//                         </Badge>
//                       </TableCell>
//                     </TableRow>
//                   ))}
//                   {reports.productPerformance.length === 0 && (
//                     <TableRow>
//                       <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
//                         No product data available. Generate a report to see performance.
//                       </TableCell>
//                     </TableRow>
//                   )}
//                 </TableBody>
//               </Table>
//             </CardContent>
//           </Card>
//         </TabsContent>

//         {/* Financials Tab */}
//         <TabsContent value="financials" className="space-y-4">
//           <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
//             <div className="space-x-2">
//               <Dialog>
//                 <DialogTrigger asChild>
//                   <Button variant="outline" disabled={exportLoading}>
//                     <Download className="mr-2 h-4 w-4" />
//                     {exportLoading ? "Exporting..." : "Export Reports"}
//                   </Button>
//                 </DialogTrigger>
//                 <DialogContent>
//                   <DialogHeader>
//                     <DialogTitle>Export Financial Reports</DialogTitle>
//                     <DialogDescription>
//                       Choose financial reports to export
//                     </DialogDescription>
//                   </DialogHeader>
//                   <div className="space-y-2">
//                     <Button
//                       onClick={() => handleExport("profitLoss", "pdf")}
//                       className="w-full"
//                       disabled={exportLoading}
//                     >
//                       Profit & Loss Statement
//                     </Button>
//                     <Button
//                       onClick={() => handleExport("salesReport", "pdf")}
//                       className="w-full"
//                       disabled={exportLoading}
//                     >
//                       Sales Report
//                     </Button>
//                   </div>
//                 </DialogContent>
//               </Dialog>
//             </div>
//             <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
//               <Input
//                 type="date"
//                 placeholder="From Date"
//                 value={filters.dateFrom}
//                 onChange={(e) =>
//                   setFilters((prev) => ({ ...prev, dateFrom: e.target.value }))
//                 }
//                 className="w-full sm:w-32"
//               />
//               <Input
//                 type="date"
//                 placeholder="To Date"
//                 value={filters.dateTo}
//                 onChange={(e) =>
//                   setFilters((prev) => ({ ...prev, dateTo: e.target.value }))
//                 }
//                 className="w-full sm:w-32"
//               />
//             </div>
//           </div>

//           <div className="grid gap-4 md:grid-cols-2">
//             {/* Profit & Loss Summary */}
//             <Card>
//               <CardHeader>
//                 <CardTitle>Profit & Loss Summary</CardTitle>
//                 <CardDescription>
//                   {filters.dateFrom} to {filters.dateTo}
//                 </CardDescription>
//               </CardHeader>
//               <CardContent>
//                 <div className="space-y-3">
//                   <div className="flex justify-between">
//                     <span>Total Revenue:</span>
//                     <span className="font-semibold">
//                       {formatCurrency(dashboardData.profitLoss?.revenue?.total_sales || 0)}
//                     </span>
//                   </div>
//                   <div className="flex justify-between">
//                     <span>Cost of Goods Sold:</span>
//                     <span className="font-semibold">
//                       {formatCurrency(dashboardData.profitLoss?.revenue?.cost_of_goods_sold || 0)}
//                     </span>
//                   </div>
//                   <div className="flex justify-between border-t pt-2">
//                     <span>Gross Profit:</span>
//                     <span className="font-semibold text-green-600">
//                       {formatCurrency(dashboardData.profitLoss?.revenue?.gross_profit || 0)}
//                     </span>
//                   </div>
//                   <div className="flex justify-between">
//                     <span>Total Expenses:</span>
//                     <span className="font-semibold text-red-600">
//                       {formatCurrency(dashboardData.profitLoss?.expenses?.total_expenses || 0)}
//                     </span>
//                   </div>
//                   <div className="flex justify-between border-t pt-2 font-bold text-lg">
//                     <span>Net Profit:</span>
//                     <span className={
//                       dashboardData.profitLoss?.profit?.net_profit >= 0 
//                         ? 'text-green-600' 
//                         : 'text-red-600'
//                     }>
//                       {formatCurrency(dashboardData.profitLoss?.profit?.net_profit || 0)}
//                     </span>
//                   </div>
//                 </div>
//               </CardContent>
//             </Card>

//             {/* Expense Breakdown */}
//             <Card>
//               <CardHeader>
//                 <CardTitle>Expense Breakdown</CardTitle>
//                 <CardDescription>By category</CardDescription>
//               </CardHeader>
//               <CardContent>
//                 <div className="space-y-2">
//                   {dashboardData.expenseSummary?.by_category?.map((category, index) => (
//                     <div key={index} className="flex justify-between items-center">
//                       <span className="capitalize">{category.category || 'Unknown'}:</span>
//                       <span className="font-semibold">
//                         {formatCurrency(category.total || category.amount || 0)}
//                       </span>
//                     </div>
//                   ))}
//                 </div>
//               </CardContent>
//             </Card>
//           </div>
//         </TabsContent>
//       </Tabs>

//       {/* Customer Statement Dialog */}
//       <Dialog open={showCustomerDialog} onOpenChange={setShowCustomerDialog}>
//         <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
//           <DialogHeader>
//             <DialogTitle>{selectedCustomer?.customer_name} Statement</DialogTitle>
//             <DialogDescription>
//               Transaction history from {filters.dateFrom} to {filters.dateTo}
//             </DialogDescription>
//           </DialogHeader>
//           <div className="space-y-4">
//             <Button
//               onClick={() => handleExport("customerStatement", "pdf")}
//               variant="outline"
//               disabled={exportLoading}
//             >
//               <Download className="mr-2 h-4 w-4" />
//               {exportLoading ? "Exporting..." : "Export to PDF"}
//             </Button>
//             <Table>
//               <TableHeader>
//                 <TableRow>
//                   <TableHead>Date</TableHead>
//                   <TableHead>Type</TableHead>
//                   <TableHead>Document</TableHead>
//                   <TableHead>Description</TableHead>
//                   <TableHead>Debit</TableHead>
//                   <TableHead>Credit</TableHead>
//                   <TableHead>Balance</TableHead>
//                 </TableRow>
//               </TableHeader>
//               <TableBody>
//                 {customerStatement.map((transaction, index) => (
//                   <TableRow key={index}>
//                     <TableCell>{formatDate(transaction.date)}</TableCell>
//                     <TableCell>
//                       <Badge variant={
//                         transaction.type === 'invoice' ? 'destructive' : 'default'
//                       }>
//                         {transaction.type}
//                       </Badge>
//                     </TableCell>
//                     <TableCell className="font-medium">{transaction.document}</TableCell>
//                     <TableCell>{transaction.description}</TableCell>
//                     <TableCell className="text-red-600">
//                       {transaction.debit > 0 ? formatCurrency(transaction.debit) : '-'}
//                     </TableCell>
//                     <TableCell className="text-green-600">
//                       {transaction.credit > 0 ? formatCurrency(transaction.credit) : '-'}
//                     </TableCell>
//                     <TableCell className="font-semibold">
//                       {formatCurrency(transaction.balance)}
//                     </TableCell>
//                   </TableRow>
//                 ))}
//                 {customerStatement.length === 0 && (
//                   <TableRow>
//                     <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
//                       No transaction history available for this period
//                     </TableCell>
//                   </TableRow>
//                 )}
//               </TableBody>
//             </Table>
//           </div>
//           <DialogFooter>
//             <div className="flex justify-between items-center w-full">
//               <span className="text-sm text-muted-foreground">
//                 Total transactions: {customerStatement.length}
//               </span>
//               <Button onClick={() => setShowCustomerDialog(false)}>Close</Button>
//             </div>
//           </DialogFooter>
//         </DialogContent>
//       </Dialog>

//       {/* Aging Report Dialog */}
//       <Dialog open={showAgingDialog} onOpenChange={setShowAgingDialog}>
//         <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
//           <DialogHeader>
//             <DialogTitle>Accounts Receivable Aging Report</DialogTitle>
//             <DialogDescription>
//               Detailed aging analysis of customer outstanding balances
//             </DialogDescription>
//           </DialogHeader>
//           <div className="space-y-4">
//             <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4">
//               <div className="flex items-center">
//                 <AlertCircle className="h-5 w-5 text-destructive mr-2" />
//                 <span className="font-semibold text-destructive">
//                   {metrics.overdueAccounts} customers with overdue payments
//                 </span>
//               </div>
//             </div>
//             <Table>
//               <TableHeader>
//                 <TableRow>
//                   <TableHead>Customer</TableHead>
//                   <TableHead>Total Due</TableHead>
//                   <TableHead>Current</TableHead>
//                   <TableHead>1-30 Days</TableHead>
//                   <TableHead>31-60 Days</TableHead>
//                   <TableHead>61-90 Days</TableHead>
//                   <TableHead>90+ Days</TableHead>
//                   <TableHead>Oldest Invoice</TableHead>
//                 </TableRow>
//               </TableHeader>
//               <TableBody>
//                 {dashboardData.agingReport?.map((customer, index) => (
//                   <TableRow key={customer.customer_id || index}>
//                     <TableCell className="font-medium">{customer.customer_name}</TableCell>
//                     <TableCell className="font-semibold">{formatCurrency(customer.total_balance)}</TableCell>
//                     <TableCell>{formatCurrency(customer.current)}</TableCell>
//                     <TableCell>{formatCurrency(customer.days_30)}</TableCell>
//                     <TableCell className="text-orange-600">{formatCurrency(customer.days_60)}</TableCell>
//                     <TableCell className="text-red-600">{formatCurrency(customer.days_90)}</TableCell>
//                     <TableCell className="text-red-600 font-semibold">{formatCurrency(customer.over_90)}</TableCell>
//                     <TableCell>{formatDate(customer.oldest_invoice_date)}</TableCell>
//                   </TableRow>
//                 ))}
//                 {dashboardData.agingReport?.length === 0 && (
//                   <TableRow>
//                     <TableCell colSpan={8} className="text-center text-muted-foreground py-8">
//                       No aging data available
//                     </TableCell>
//                   </TableRow>
//                 )}
//               </TableBody>
//             </Table>
//           </div>
//           <DialogFooter>
//             <div className="flex justify-between items-center w-full">
//               <div className="space-y-1">
//                 <span className="text-sm text-muted-foreground block">
//                   Total customers: {dashboardData.agingReport?.length || 0}
//                 </span>
//                 <span className="text-sm text-destructive block">
//                   Total overdue (61+ days): {formatCurrency(metrics.totalOverdue)}
//                 </span>
//               </div>
//               <Button onClick={() => setShowAgingDialog(false)}>Close</Button>
//             </div>
//           </DialogFooter>
//         </DialogContent>
//       </Dialog>
//     </div>
//   );
// };

// export default SalesDashboard;



// app/sales/dashboard/page.jsx
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
  DialogTrigger,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Download, 
  Eye, 
  AlertCircle, 
  RefreshCw, 
  TrendingUp, 
  BarChart3, 
  Users,
  CreditCard,
  DollarSign,
  ShoppingCart,
  Calendar,
  FileText,
  PieChart
} from "lucide-react";
import { toast } from "react-toastify";
import * as salesApi from "@/lib/api/sales";

// Data mapping utility for consistent field names
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

// Mapping configurations
const CUSTOMER_BALANCE_MAPPING = {
  customer_name: "customer_name",
  customer_code: "customer_code",
  current_balance: "current_balance",
  credit_limit: "credit_limit",
  available_credit: "available_credit",
  credit_utilization: "credit_utilization",
  over_limit: "over_limit",
};

const AGING_REPORT_MAPPING = {
  customer_name: "customer_name",
  customer_code: "customer_code",
  total_balance: "total_balance",
  current: "current",
  days_30: "days_30",
  days_60: "days_60",
  days_90: "days_90",
  over_90: "over_90",
  oldest_invoice_date: "oldest_invoice_date",
};

const SalesDashboard = () => {
  const [activeTab, setActiveTab] = useState("overview");
  const [loading, setLoading] = useState(false);
  const [dashboardData, setDashboardData] = useState({
    todaySales: null,
    customerSummary: [],
    agingReport: [],
    expenseSummary: null,
    profitLoss: null,
    recentInvoices: [],
  });
  const [reports, setReports] = useState({
    customerBalances: [],
    agingReport: [],
  });
  const [filters, setFilters] = useState({
    storeId: "",
    dateFrom: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0],
    dateTo: new Date().toISOString().split('T')[0],
    customerId: "",
    paymentMethod: "",
  });
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [customerStatement, setCustomerStatement] = useState([]);
  const [showCustomerDialog, setShowCustomerDialog] = useState(false);
  const [showAgingDialog, setShowAgingDialog] = useState(false);
  const [exportLoading, setExportLoading] = useState(false);

  // Fetch dashboard overview data
  useEffect(() => {
    fetchDashboardData();
  }, []);

  useEffect(() => {
    fetchDashboardData();
  }, [filters.dateFrom, filters.dateTo]);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const [
        todaySales,
        customerSummary,
        agingReport,
        expenseSummary,
        profitLoss,
        recentInvoices
      ] = await Promise.all([
        salesApi.getTodaySales(),
        salesApi.getCustomerBalanceSummary(),
        salesApi.getCustomerAgingReport(),
        salesApi.getExpenseSummary({ 
          start_date: filters.dateFrom, 
          end_date: filters.dateTo 
        }),
        salesApi.getProfitLoss({ 
          start_date: filters.dateFrom, 
          end_date: filters.dateTo 
        }),
        salesApi.getSaleInvoices({ limit: 10 })
      ]);

      setDashboardData({
        todaySales,
        customerSummary,
        agingReport,
        expenseSummary,
        profitLoss,
        recentInvoices: recentInvoices.data || recentInvoices.results || []
      });

      toast.success('Dashboard data loaded successfully');
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES'
    }).format(amount || 0);
  };

  // Format date
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
          });
    } catch {
      return dateString;
    }
  };

  // Generate reports
  const generateReport = async (reportType) => {
    setLoading(true);
    try {
      let data;
      let mappedData = [];

      switch (reportType) {
        case "customerBalances":
          data = await salesApi.getCustomerBalanceSummary();
          mappedData = mapApiData(data, CUSTOMER_BALANCE_MAPPING);
          setReports((prev) => ({ ...prev, customerBalances: mappedData }));
          break;
        case "agingReport":
          data = await salesApi.getCustomerAgingReport();
          mappedData = mapApiData(data, AGING_REPORT_MAPPING);
          setReports((prev) => ({ ...prev, agingReport: mappedData }));
          break;
      }
      toast.success(`${reportType} report generated successfully`);
    } catch (error) {
      console.error(`Error generating ${reportType} report:`, error);
      toast.error(`Failed to generate ${reportType} report`);
    } finally {
      setLoading(false);
    }
  };

  // Fetch customer statement
  const fetchCustomerStatement = async (customerId) => {
    try {
      setLoading(true);
      const statement = await salesApi.getCustomerStatement(
        customerId, 
        filters.dateFrom, 
        filters.dateTo
      );
      setCustomerStatement(statement.transactions || []);
    } catch (error) {
      console.error('Error fetching customer statement:', error);
      toast.error('Failed to fetch customer statement');
      setCustomerStatement([]);
    } finally {
      setLoading(false);
    }
  };

  // Handle customer click
  const handleCustomerClick = async (customer) => {
    setSelectedCustomer(customer);
    await fetchCustomerStatement(customer.customer_id || customer.id);
    setShowCustomerDialog(true);
  };

  // Handle aging report click
  const handleAgingClick = () => {
    setShowAgingDialog(true);
  };

  // Export functions
  const handleExport = async (type, format) => {
    setExportLoading(true);
    const filename = `${type}_report_${new Date().toISOString().split("T")[0]}.${format}`;

    try {
      let blob;
      switch (type) {
        case "profitLoss":
          blob = await salesApi.generateProfitLossPDF({
            start_date: filters.dateFrom,
            end_date: filters.dateTo
          });
          break;
        case "customerStatement":
          if (selectedCustomer) {
            blob = await salesApi.generateCustomerStatementPDF({
              customer_id: selectedCustomer.customer_id || selectedCustomer.id,
              start_date: filters.dateFrom,
              end_date: filters.dateTo
            });
          }
          break;
        default:
          throw new Error(`Unsupported export type: ${type}`);
      }

      if (blob) {
        salesApi.downloadPDF(blob, filename);
        toast.success(`${type} exported successfully`);
      }
    } catch (error) {
      console.error("Export error:", error);
      toast.error(`Export failed: ${error.message}`);
    } finally {
      setExportLoading(false);
    }
  };

  // Reset filters
  const resetFilters = () => {
    setFilters({
      storeId: "",
      dateFrom: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0],
      dateTo: new Date().toISOString().split('T')[0],
      customerId: "",
      paymentMethod: "",
    });
  };

  // Calculate key metrics
  const calculateMetrics = () => {
    const today = dashboardData.todaySales;
    const profitLoss = dashboardData.profitLoss;
    const aging = dashboardData.agingReport;

    return {
      totalRevenue: today?.summary?.overall_total || 0,
      totalTransactions: today?.summary?.total_count || 0,
      netProfit: profitLoss?.profit?.net_profit || 0,
      overdueAccounts: aging?.filter(cust => cust.over_90 > 0).length || 0,
      totalOverdue: aging?.reduce((sum, cust) => sum + (cust.over_90 || 0), 0) || 0,
      activeCustomers: dashboardData.customerSummary?.length || 0
    };
  };

  const metrics = calculateMetrics();

  if (loading && activeTab === "overview") {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <RefreshCw className="h-8 w-8 animate-spin mr-2" />
        Loading sales dashboard...
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Sales Dashboard</h1>
          <p className="text-muted-foreground">
            Comprehensive overview of sales performance and financial metrics
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <Input
            type="date"
            value={filters.dateFrom}
            onChange={(e) =>
              setFilters((prev) => ({ ...prev, dateFrom: e.target.value }))
            }
            className="w-44 h-10"
          />
          <Input
            type="date"
            value={filters.dateTo}
            onChange={(e) =>
              setFilters((prev) => ({ ...prev, dateTo: e.target.value }))
            }
            className="w-44 h-10"
          />
          <Button variant="outline" onClick={resetFilters} size="sm" className="h-10">
            Clear
          </Button>
          <Button
            onClick={fetchDashboardData}
            variant="default"
            disabled={loading}
            size="sm"
            className="h-10"
          >
            <RefreshCw
              className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`}
            />
            Refresh
          </Button>
        </div>
      </div>

      {/* Overview Tab */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2 md:grid-cols-3">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="customers">Customers</TabsTrigger>
          <TabsTrigger value="financials">Financials</TabsTrigger>
        </TabsList>

        {/* Overview Content */}
        <TabsContent value="overview" className="space-y-6">
          {/* Key Metrics */}
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            <Card className="hover:shadow-lg transition-shadow duration-200">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Today's Revenue
                </CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {formatCurrency(metrics.totalRevenue)}
                </div>
                <p className="text-xs text-muted-foreground">
                  {metrics.totalTransactions} transactions today
                </p>
              </CardContent>
            </Card>
            <Card className="hover:shadow-lg transition-shadow duration-200">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Active Customers
                </CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {metrics.activeCustomers}
                </div>
                <p className="text-xs text-muted-foreground">
                  {formatCurrency(dashboardData.customerSummary?.reduce((sum, cust) => sum + cust.current_balance, 0) || 0)} total balance
                </p>
              </CardContent>
            </Card>
            <Card className="hover:shadow-lg transition-shadow duration-200">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Net Profit
                </CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className={`text-2xl font-bold ${
                  metrics.netProfit >= 0 ? 'text-green-600' : 'text-red-600'
                }`}>
                  {formatCurrency(metrics.netProfit)}
                </div>
                <p className="text-xs text-muted-foreground">
                  {dashboardData.profitLoss?.profit?.net_profit_margin || 0}% margin
                </p>
              </CardContent>
            </Card>
            <Card className="cursor-pointer hover:shadow-lg transition-shadow duration-200" onClick={handleAgingClick}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Overdue Accounts
                </CardTitle>
                <AlertCircle className="h-4 w-4 text-destructive" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-destructive">
                  {metrics.overdueAccounts}
                </div>
                <p className="text-xs text-muted-foreground">
                  {formatCurrency(metrics.totalOverdue)} total overdue
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
            {/* Today's Sales Breakdown */}
            <Card className="col-span-4 hover:shadow-lg transition-shadow duration-200">
              <CardHeader>
                <CardTitle>Today's Sales Performance</CardTitle>
                <CardDescription>
                  Real-time sales breakdown by payment method
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Payment Method</TableHead>
                      <TableHead>Transactions</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Percentage</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {dashboardData.todaySales?.payment_methods?.map((method, index) => (
                      <TableRow key={index}>
                        <TableCell className="font-medium">
                          <Badge variant="outline" className="capitalize">
                            {method.payment_method}
                          </Badge>
                        </TableCell>
                        <TableCell>{method.count}</TableCell>
                        <TableCell>{formatCurrency(method.total_amount)}</TableCell>
                        <TableCell>
                          <Badge variant="secondary">
                            {method.percentage}%
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            {/* Recent Invoices */}
            <Card className="col-span-3 hover:shadow-lg transition-shadow duration-200">
              <CardHeader>
                <CardTitle>Recent Invoices</CardTitle>
                <CardDescription>Latest sales transactions</CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="space-y-4">
                  {dashboardData.recentInvoices.slice(0, 5).map((invoice, index) => (
                    <div key={invoice.id || index} className="flex justify-between items-center border-b pb-3 last:border-b-0">
                      <div>
                        <div className="font-medium text-sm">{invoice.reference_no}</div>
                        <div className="text-xs text-muted-foreground">
                          {invoice.customer_name || 'Walk-in Customer'}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold">{formatCurrency(invoice.total_amount)}</div>
                        <Badge variant="outline" className="text-xs capitalize mt-1">
                          {invoice.payment_method}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Customers Tab */}
        <TabsContent value="customers" className="space-y-6">
          <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
            <div className="space-x-2">
              <Button
                onClick={() => generateReport("customerBalances")}
                disabled={loading}
                className="hover:shadow-md transition-shadow duration-200"
              >
                {loading ? "Generating..." : "Generate Report"}
              </Button>
            </div>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            {/* Customer Balances */}
            <Card className="hover:shadow-lg transition-shadow duration-200">
              <CardHeader>
                <CardTitle>Customer Balances</CardTitle>
                <CardDescription>Current outstanding balances and credit utilization</CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Customer</TableHead>
                      <TableHead>Balance</TableHead>
                      <TableHead>Credit Limit</TableHead>
                      <TableHead>Utilization</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {dashboardData.customerSummary?.slice(0, 10).map((customer, index) => (
                      <TableRow key={customer.customer_id || index} className="hover:bg-muted/50 transition-colors duration-150">
                        <TableCell className="font-medium">
                          {customer.customer_name}
                        </TableCell>
                        <TableCell className={
                          customer.over_limit ? 'text-red-600 font-semibold' : ''
                        }>
                          {formatCurrency(customer.current_balance)}
                        </TableCell>
                        <TableCell>{formatCurrency(customer.credit_limit)}</TableCell>
                        <TableCell>
                          <Badge variant={
                            customer.credit_utilization > 90 ? 'destructive' :
                            customer.credit_utilization > 75 ? 'default' : 'secondary'
                          }>
                            {customer.credit_utilization}%
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleCustomerClick(customer)}
                            className="h-8 w-8 p-0 hover:bg-muted"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            {/* Aging Report Summary */}
            <Card className="hover:shadow-lg transition-shadow duration-200">
              <CardHeader>
                <CardTitle>Accounts Receivable Aging Summary</CardTitle>
                <CardDescription>Outstanding invoices by age category</CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Customer</TableHead>
                      <TableHead>Total Due</TableHead>
                      <TableHead>Current</TableHead>
                      <TableHead>1-30</TableHead>
                      <TableHead>31-60</TableHead>
                      <TableHead>61+</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {dashboardData.agingReport?.slice(0, 10).map((customer, index) => (
                      <TableRow key={customer.customer_id || index} className="hover:bg-muted/50 transition-colors duration-150">
                        <TableCell className="font-medium">
                          {customer.customer_name}
                        </TableCell>
                        <TableCell className="font-semibold">
                          {formatCurrency(customer.total_balance)}
                        </TableCell>
                        <TableCell>{formatCurrency(customer.current)}</TableCell>
                        <TableCell>{formatCurrency(customer.days_30)}</TableCell>
                        <TableCell className="text-orange-600">
                          {formatCurrency(customer.days_60)}
                        </TableCell>
                        <TableCell className="text-red-600 font-semibold">
                          {formatCurrency((customer.days_90 || 0) + (customer.over_90 || 0))}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Financials Tab */}
        <TabsContent value="financials" className="space-y-6">
          <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
            <div className="space-x-2">
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="outline" disabled={exportLoading} className="hover:shadow-md transition-shadow duration-200">
                    <Download className="mr-2 h-4 w-4" />
                    {exportLoading ? "Exporting..." : "Export Reports"}
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Export Financial Reports</DialogTitle>
                    <DialogDescription>
                      Choose financial reports to export
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-2">
                    <Button
                      onClick={() => handleExport("profitLoss", "pdf")}
                      className="w-full"
                      disabled={exportLoading}
                    >
                      Profit & Loss Statement
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            {/* Profit & Loss Summary */}
            <Card className="hover:shadow-lg transition-shadow duration-200">
              <CardHeader>
                <CardTitle>Profit & Loss Summary</CardTitle>
                <CardDescription>
                  {formatDate(filters.dateFrom)} to {formatDate(filters.dateTo)}
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span>Total Revenue:</span>
                    <span className="font-semibold">
                      {formatCurrency(dashboardData.profitLoss?.revenue?.total_sales || 0)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Cost of Goods Sold:</span>
                    <span className="font-semibold">
                      {formatCurrency(dashboardData.profitLoss?.revenue?.cost_of_goods_sold || 0)}
                    </span>
                  </div>
                  <div className="flex justify-between border-t pt-2">
                    <span>Gross Profit:</span>
                    <span className="font-semibold text-green-600">
                      {formatCurrency(dashboardData.profitLoss?.revenue?.gross_profit || 0)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Total Expenses:</span>
                    <span className="font-semibold text-red-600">
                      {formatCurrency(dashboardData.profitLoss?.expenses?.total_expenses || 0)}
                    </span>
                  </div>
                  <div className="flex justify-between border-t pt-2 font-bold text-lg">
                    <span>Net Profit:</span>
                    <span className={
                      dashboardData.profitLoss?.profit?.net_profit >= 0 
                        ? 'text-green-600' 
                        : 'text-red-600'
                    }>
                      {formatCurrency(dashboardData.profitLoss?.profit?.net_profit || 0)}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Expense Breakdown */}
            <Card className="hover:shadow-lg transition-shadow duration-200">
              <CardHeader>
                <CardTitle>Expense Breakdown</CardTitle>
                <CardDescription>By category</CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="space-y-2">
                  {dashboardData.expenseSummary?.by_category?.map((category, index) => (
                    <div key={index} className="flex justify-between items-center py-1">
                      <span className="capitalize">{category.category || 'Unknown'}:</span>
                      <span className="font-semibold">
                        {formatCurrency(category.total || category.amount || 0)}
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Customer Statement Dialog */}
      <Dialog open={showCustomerDialog} onOpenChange={setShowCustomerDialog}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{selectedCustomer?.customer_name} Statement</DialogTitle>
            <DialogDescription>
              Transaction history from {formatDate(filters.dateFrom)} to {formatDate(filters.dateTo)}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <Button
              onClick={() => handleExport("customerStatement", "pdf")}
              variant="outline"
              disabled={exportLoading}
              className="hover:shadow-md transition-shadow duration-200"
            >
              <Download className="mr-2 h-4 w-4" />
              {exportLoading ? "Exporting..." : "Export to PDF"}
            </Button>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Document</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Debit</TableHead>
                  <TableHead>Credit</TableHead>
                  <TableHead>Balance</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {customerStatement.map((transaction, index) => (
                  <TableRow key={index} className="hover:bg-muted/50 transition-colors duration-150">
                    <TableCell>{formatDate(transaction.date)}</TableCell>
                    <TableCell>
                      <Badge variant={
                        transaction.type === 'invoice' ? 'destructive' : 'default'
                      }>
                        {transaction.type}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-medium">{transaction.document}</TableCell>
                    <TableCell>{transaction.description}</TableCell>
                    <TableCell className="text-red-600">
                      {transaction.debit > 0 ? formatCurrency(transaction.debit) : '-'}
                    </TableCell>
                    <TableCell className="text-green-600">
                      {transaction.credit > 0 ? formatCurrency(transaction.credit) : '-'}
                    </TableCell>
                    <TableCell className="font-semibold">
                      {formatCurrency(transaction.balance)}
                    </TableCell>
                  </TableRow>
                ))}
                {customerStatement.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                      No transaction history available for this period
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
          <DialogFooter>
            <div className="flex justify-between items-center w-full">
              <span className="text-sm text-muted-foreground">
                Total transactions: {customerStatement.length}
              </span>
              <Button onClick={() => setShowCustomerDialog(false)}>Close</Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Aging Report Dialog */}
      <Dialog open={showAgingDialog} onOpenChange={setShowAgingDialog}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Accounts Receivable Aging Report</DialogTitle>
            <DialogDescription>
              Detailed aging analysis of customer outstanding balances
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4">
              <div className="flex items-center">
                <AlertCircle className="h-5 w-5 text-destructive mr-2" />
                <span className="font-semibold text-destructive">
                  {metrics.overdueAccounts} customers with overdue payments
                </span>
              </div>
            </div>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Customer</TableHead>
                  <TableHead>Total Due</TableHead>
                  <TableHead>Current</TableHead>
                  <TableHead>1-30 Days</TableHead>
                  <TableHead>31-60 Days</TableHead>
                  <TableHead>61-90 Days</TableHead>
                  <TableHead>90+ Days</TableHead>
                  <TableHead>Oldest Invoice</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {dashboardData.agingReport?.map((customer, index) => (
                  <TableRow key={customer.customer_id || index} className="hover:bg-muted/50 transition-colors duration-150">
                    <TableCell className="font-medium">{customer.customer_name}</TableCell>
                    <TableCell className="font-semibold">{formatCurrency(customer.total_balance)}</TableCell>
                    <TableCell>{formatCurrency(customer.current)}</TableCell>
                    <TableCell>{formatCurrency(customer.days_30)}</TableCell>
                    <TableCell className="text-orange-600">{formatCurrency(customer.days_60)}</TableCell>
                    <TableCell className="text-red-600">{formatCurrency(customer.days_90)}</TableCell>
                    <TableCell className="text-red-600 font-semibold">{formatCurrency(customer.over_90)}</TableCell>
                    <TableCell>{formatDate(customer.oldest_invoice_date)}</TableCell>
                  </TableRow>
                ))}
                {dashboardData.agingReport?.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center text-muted-foreground py-8">
                      No aging data available
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
                  Total customers: {dashboardData.agingReport?.length || 0}
                </span>
                <span className="text-sm text-destructive block">
                  Total overdue (61+ days): {formatCurrency(metrics.totalOverdue)}
                </span>
              </div>
              <Button onClick={() => setShowAgingDialog(false)}>Close</Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SalesDashboard;