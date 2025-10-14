import React, { useState, useEffect } from "react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Download,
  FileText,
  BarChart3,
  Calendar,
  ChevronDown,
  ChevronUp,
  Loader2,
  CreditCard,
  TrendingUp,
  DollarSign,
  Receipt,
} from "lucide-react";
import {
  getDetailedSalesReport,
  getSummarySalesReport,
  generateSalesReportPDF,
  getDailyPaymentsReport,
  getEnhancedSummaryReport,
} from "@/lib/api/sales";
import { getStores } from "@/lib/api/inventory";

const SalesReports = () => {
  const [activeTab, setActiveTab] = useState("detailed");
  const [loading, setLoading] = useState(false);
  const [detailedData, setDetailedData] = useState(null);
  const [summaryData, setSummaryData] = useState(null);
  const [combinedData, setCombinedData] = useState(null);
  const [stores, setStores] = useState([]);
  const [filters, setFilters] = useState({
    start_date: new Date().toISOString().split('T')[0],
    end_date: new Date().toISOString().split('T')[0],
    date: new Date().toISOString().split('T')[0],
    store_id: "all",
    customer_id: "",
  });
  const [expandedInvoices, setExpandedInvoices] = useState(new Set());
  const [expandedPayments, setExpandedPayments] = useState(new Set());

  useEffect(() => {
    loadStores();
  }, []);

  const loadStores = async () => {
    try {
      const response = await getStores();
      setStores(response.data || []);
    } catch (error) {
      toast.error("Failed to load stores");
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const loadDetailedReport = async () => {
    if (!filters.start_date || !filters.end_date) {
      toast.error("Please select start and end dates for detailed report");
      return;
    }

    setLoading(true);
    try {
      const apiParams = {
        ...filters,
        store_id: filters.store_id === "all" ? "" : filters.store_id,
      };

      const data = await getDetailedSalesReport(apiParams);
      setDetailedData(data);
      toast.success("Detailed report loaded successfully");
    } catch (error) {
      toast.error(error.message || "Failed to load detailed report");
    } finally {
      setLoading(false);
    }
  };

  const loadSummaryReport = async () => {
    if (!filters.date) {
      toast.error("Please select a date for summary report");
      return;
    }

    setLoading(true);
    try {
      const apiParams = {
        ...filters,
        store_id: filters.store_id === "all" ? "" : filters.store_id,
      };

      const data = await getSummarySalesReport(apiParams);
      setSummaryData(data);
      toast.success("Summary report loaded successfully");
    } catch (error) {
      toast.error(error.message || "Failed to load summary report");
    } finally {
      setLoading(false);
    }
  };

  const loadCombinedReport = async () => {
    if (!filters.date) {
      toast.error("Please select a date for invoices paid report");
      return;
    }

    setLoading(true);
    try {
      const apiParams = {
        ...filters,
        store_id: filters.store_id === "all" ? "" : filters.store_id,
      };

      const [paymentsData, enhancedData] = await Promise.all([
        getDailyPaymentsReport(apiParams),
        getEnhancedSummaryReport(apiParams),
      ]);

      setCombinedData({
        payments: paymentsData,
        enhanced: enhancedData,
      });
      toast.success("Invoices paid report loaded successfully");
    } catch (error) {
      toast.error(error.message || "Failed to load invoices paid report");
    } finally {
      setLoading(false);
    }
  };

  const toggleInvoiceExpansion = (invoiceNumber) => {
    setExpandedInvoices((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(invoiceNumber)) {
        newSet.delete(invoiceNumber);
      } else {
        newSet.add(invoiceNumber);
      }
      return newSet;
    });
  };

  const togglePaymentExpansion = (paymentReference) => {
    setExpandedPayments((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(paymentReference)) {
        newSet.delete(paymentReference);
      } else {
        newSet.add(paymentReference);
      }
      return newSet;
    });
  };

  const exportToPDF = async (reportType) => {
    try {
      const params = {
        report_type: reportType,
        ...filters,
        store_id: filters.store_id === "all" ? "" : filters.store_id,
      };

      const blob = await generateSalesReportPDF(params);

      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${reportType}_report_${
        new Date().toISOString().split("T")[0]
      }.pdf`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      toast.success("PDF exported successfully");
    } catch (error) {
      toast.error("Failed to export PDF");
    }
  };

  const getPaymentMethodBadge = (method) => {
    const variants = {
      cash: "default",
      mpesa: "secondary",
      credit: "destructive",
      bank: "outline",
      card: "secondary",
    };

    return (
      <Badge variant={variants[method] || "default"}>
        {method?.charAt(0).toUpperCase() + method?.slice(1)}
      </Badge>
    );
  };

  const getInvoiceAgeBadge = (days) => {
    if (days === 0) return <Badge variant="default">Today</Badge>;
    if (days === 1) return <Badge variant="secondary">Yesterday</Badge>;
    if (days <= 7) return <Badge variant="outline">{days} days</Badge>;
    if (days <= 30) return <Badge variant="secondary">{days} days</Badge>;
    return <Badge variant="destructive">{days} days</Badge>;
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-KE", {
      style: "currency",
      currency: "KES",
    }).format(amount || 0);
  };

  const handleLoadReport = () => {
    switch (activeTab) {
      case "detailed":
        loadDetailedReport();
        break;
      case "summary":
        loadSummaryReport();
        break;
      case "invoices-paid":
        loadCombinedReport();
        break;
      default:
        loadDetailedReport();
    }
  };

  const getLoadButtonText = () => {
    switch (activeTab) {
      case "detailed":
        return "Load Detailed Report";
      case "summary":
        return "Load Summary Report";
      case "invoices-paid":
        return "Load Invoices Paid Report";
      default:
        return "Load Report";
    }
  };

  // Calculate totals for invoices paid
  const calculateInvoicesPaidTotals = () => {
    if (!combinedData?.payments?.payments) return { totalAmount: 0, methodTotals: {} };
    
    const methodTotals = {};
    let totalAmount = 0;

    combinedData.payments.payments.forEach(payment => {
      totalAmount += payment.amount;
      const method = payment.payment_method_code;
      methodTotals[method] = (methodTotals[method] || 0) + payment.amount;
    });

    return { totalAmount, methodTotals };
  };

  const invoicesPaidTotals = calculateInvoicesPaidTotals();

  return (
    <div className="container mx-auto p-4 md:p-6 space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Sales Reports</h1>
          <p className="text-muted-foreground text-sm sm:text-base">
            Generate and analyze sales performance and invoices paid reports
          </p>
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          <Button
            onClick={() => exportToPDF(activeTab)}
            variant="outline"
            className="flex items-center gap-2 w-full sm:w-auto"
          >
            <Download className="h-4 w-4" />
            <span className="hidden sm:inline">Export PDF</span>
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="text-lg sm:text-xl">Report Filters</CardTitle>
          <CardDescription className="text-sm sm:text-base">
            Select filters to generate your reports
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Store</label>
              <Select
                value={filters.store_id}
                onValueChange={(value) => handleFilterChange("store_id", value)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select store" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Stores</SelectItem>
                  {stores.map((store) => (
                    <SelectItem key={store.id} value={store.id.toString()}>
                      {store.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Start Date</label>
              <Input
                type="date"
                value={filters.start_date}
                onChange={(e) =>
                  handleFilterChange("start_date", e.target.value)
                }
                className="w-full"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">End Date</label>
              <Input
                type="date"
                value={filters.end_date}
                onChange={(e) => handleFilterChange("end_date", e.target.value)}
                className="w-full"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">
                Single Date (Summary/Invoices Paid)
              </label>
              <Input
                type="date"
                value={filters.date}
                onChange={(e) => handleFilterChange("date", e.target.value)}
                className="w-full"
              />
            </div>
          </div>

          <div className="flex gap-2">
            <Button
              onClick={handleLoadReport}
              disabled={loading}
              className="flex items-center gap-2 w-full sm:w-auto"
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <FileText className="h-4 w-4" />
              )}
              {getLoadButtonText()}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="space-y-6"
      >
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="detailed" className="flex items-center gap-2 text-xs sm:text-sm">
            <FileText className="h-4 w-4" />
            <span className="hidden sm:inline">Detailed</span>
          </TabsTrigger>
          <TabsTrigger value="summary" className="flex items-center gap-2 text-xs sm:text-sm">
            <BarChart3 className="h-4 w-4" />
            <span className="hidden sm:inline">Summary</span>
          </TabsTrigger>
          <TabsTrigger value="invoices-paid" className="flex items-center gap-2 text-xs sm:text-sm">
            <Receipt className="h-4 w-4" />
            <span className="hidden sm:inline">Invoices Paid</span>
          </TabsTrigger>
        </TabsList>

        {/* Detailed Report Tab */}
        <TabsContent value="detailed" className="space-y-6">
          {detailedData && (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      Total Invoices
                    </CardTitle>
                    <FileText className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {detailedData.summary_totals.total_invoices}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      Total Sales
                    </CardTitle>
                    <BarChart3 className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {formatCurrency(detailedData.summary_totals.total_sales)}
                    </div>
                  </CardContent>
                </Card>

                {/* <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">Payment Status</CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Paid Sales:</span>
                        <span className="font-medium">
                          {formatCurrency(
                            detailedData.summary_totals.paid_vs_credit
                              ?.paid_sales || 0
                          )}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Credit Sales:</span>
                        <span className="font-medium">
                          {formatCurrency(
                            detailedData.summary_totals.paid_vs_credit
                              ?.credit_sales || 0
                          )}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card> */}

                    <Card>
                   <CardHeader>
                   <CardTitle>Payment Status Breakdown</CardTitle>
                  </CardHeader>                  <CardContent>
                     <div className="space-y-2">
                       <div className="flex justify-between">
                         <span>Paid Sales:</span>
                        <span className="font-large">
                          {formatCurrency(
                            detailedData.summary_totals.paid_vs_credit
                              ?.paid_sales || 0
                          )}
                        </span>
                       </div>
                     <div className="flex justify-between">
                         <span className="text-sm">Credit Sales:</span>
                         <span className="font-large">
                           {formatCurrency(
                             detailedData.summary_totals.paid_vs_credit
                               .credit_sales
                           )}
                         </span>
                      </div>
                       <div className="flex justify-between">
                        <span className="text-sm text-green-600">
                           Paid on Credit:
                         </span>
                        <span className="font-large text-green-600">
                          {formatCurrency(
                             detailedData.summary_totals.paid_vs_credit
                               .credit_paid
                         )}
                         </span>
                       </div>
                       <div className="flex justify-between">
                         <span className="text-sm text-red-600">
                           Outstanding:
                         </span>
                         <span className="font-large text-red-600">
                           {formatCurrency(
                             detailedData.summary_totals.paid_vs_credit
                               .credit_outstanding
                           )}
                         </span>
                       </div>
                     </div>
                   </CardContent>
                 </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      Balance Due
                    </CardTitle>
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {formatCurrency(
                        detailedData.summary_totals.total_balance_due
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg sm:text-xl">Invoice Details</CardTitle>
                  <CardDescription>
                    {detailedData.detailed_data.length} invoices found
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-0 sm:p-6">
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="whitespace-nowrap">Invoice #</TableHead>
                          <TableHead className="whitespace-nowrap">Date & Time</TableHead>
                          <TableHead className="whitespace-nowrap">Customer</TableHead>
                          <TableHead className="whitespace-nowrap">Store</TableHead>
                          <TableHead className="whitespace-nowrap">Payment Method</TableHead>
                          <TableHead className="text-right whitespace-nowrap">
                            Total Amount
                          </TableHead>
                          <TableHead className="text-right whitespace-nowrap">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {detailedData.detailed_data.map((invoice) => (
                          <React.Fragment key={invoice.invoice_number}>
                            <TableRow className="cursor-pointer hover:bg-muted/50">
                              <TableCell className="font-medium whitespace-nowrap">
                                {invoice.invoice_number}
                              </TableCell>
                              <TableCell className="whitespace-nowrap">{invoice.invoice_date}</TableCell>
                              <TableCell className="whitespace-nowrap">{invoice.customer_name}</TableCell>
                              <TableCell className="whitespace-nowrap">{invoice.store_name}</TableCell>
                              <TableCell className="whitespace-nowrap">
                                {getPaymentMethodBadge(
                                  invoice.payment_method_code
                                )}
                              </TableCell>
                              <TableCell className="text-right whitespace-nowrap">
                                {formatCurrency(invoice.total_amount)}
                              </TableCell>
                              <TableCell className="text-right">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() =>
                                    toggleInvoiceExpansion(invoice.invoice_number)
                                  }
                                  className="h-8 w-8 p-0"
                                >
                                  {expandedInvoices.has(
                                    invoice.invoice_number
                                  ) ? (
                                    <ChevronUp className="h-4 w-4" />
                                  ) : (
                                    <ChevronDown className="h-4 w-4" />
                                  )}
                                </Button>
                              </TableCell>
                            </TableRow>
                            {expandedInvoices.has(invoice.invoice_number) && (
                              <TableRow>
                                <TableCell
                                  colSpan={7}
                                  className="bg-muted/20 p-4"
                                >
                                  <div className="space-y-3">
                                    <div className="flex justify-between items-center">
                                      <h4 className="font-semibold">Items</h4>
                                      <span className="text-sm text-muted-foreground">
                                        {invoice.items.length} items
                                      </span>
                                    </div>
                                    <div className="overflow-x-auto">
                                      <Table>
                                        <TableHeader>
                                          <TableRow>
                                            <TableHead className="whitespace-nowrap">Item Name</TableHead>
                                            <TableHead className="whitespace-nowrap">SKU</TableHead>
                                            <TableHead className="text-right whitespace-nowrap">
                                              Quantity
                                            </TableHead>
                                            <TableHead className="text-right whitespace-nowrap">
                                              Buying Price
                                            </TableHead>
                                            <TableHead className="text-right whitespace-nowrap">
                                              Selling Price
                                            </TableHead>
                                            <TableHead className="text-right whitespace-nowrap">
                                              Line Total
                                            </TableHead>
                                            <TableHead className="text-right whitespace-nowrap">
                                              Profit
                                            </TableHead>
                                            <TableHead className="text-right whitespace-nowrap">
                                              Margin
                                            </TableHead>
                                          </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                          {invoice.items.map((item, index) => (
                                            <TableRow key={index}>
                                              <TableCell className="font-medium whitespace-nowrap">
                                                {item.item_name}
                                              </TableCell>
                                              <TableCell className="whitespace-nowrap">{item.item_sku}</TableCell>
                                              <TableCell className="text-right whitespace-nowrap">
                                                {item.quantity}
                                              </TableCell>
                                              <TableCell className="text-right whitespace-nowrap">
                                                {formatCurrency(item.cost_price)}
                                              </TableCell>
                                              <TableCell className="text-right whitespace-nowrap">
                                                {formatCurrency(item.unit_price)}
                                              </TableCell>
                                              <TableCell className="text-right whitespace-nowrap">
                                                {formatCurrency(item.line_total)}
                                              </TableCell>
                                              <TableCell className="text-right whitespace-nowrap">
                                                <span
                                                  className={
                                                    item.profit >= 0
                                                      ? "text-green-600"
                                                      : "text-red-600"
                                                  }
                                                >
                                                  {formatCurrency(item.profit)}
                                                </span>
                                              </TableCell>
                                              <TableCell className="text-right whitespace-nowrap">
                                                <span
                                                  className={
                                                    item.profit_margin >= 0
                                                      ? "text-green-600"
                                                      : "text-red-600"
                                                  }
                                                >
                                                  {item.profit_margin.toFixed(2)}%
                                                </span>
                                              </TableCell>
                                            </TableRow>
                                          ))}
                                        </TableBody>
                                      </Table>
                                    </div>
                                  </div>
                                </TableCell>
                              </TableRow>
                            )}
                          </React.Fragment>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </TabsContent>

        {/* Summary Report Tab */}
        <TabsContent value="summary" className="space-y-6">
          {summaryData && (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      Total Sales
                    </CardTitle>
                    <BarChart3 className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {formatCurrency(summaryData.summary_totals.total_sales)}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      Total Expenses
                    </CardTitle>
                    <FileText className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {formatCurrency(
                        summaryData.summary_totals.total_expenses
                      )}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      Net Profit
                    </CardTitle>
                    <Download className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {formatCurrency(summaryData.summary_totals.net_profit)}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {summaryData.summary_totals.profit_margin}% margin
                    </p>
                  </CardContent>
                </Card>

                <Card 
                  className="cursor-pointer transition-all duration-200 hover:shadow-md hover:scale-105"
                  onClick={() => setActiveTab("invoices-paid")}
                >
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      Invoice Payments
                    </CardTitle>
                    <Receipt className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-blue-600">
                      {formatCurrency(summaryData.summary_totals.total_sales)}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Click to view details
                    </p>
                  </CardContent>
                </Card>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg sm:text-xl">Payment Methods</CardTitle>
                    <CardDescription>
                      Sales breakdown by payment method
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {Object.entries(summaryData.payment_methods).map(
                        ([method, amount]) => (
                          <div
                            key={method}
                            className="flex items-center justify-between"
                          >
                            <div className="flex items-center gap-2">
                              <Badge variant="outline">
                                {method.charAt(0).toUpperCase() +
                                  method.slice(1)}
                              </Badge>
                            </div>
                            <div className="text-right">
                              <div className="font-medium">
                                {formatCurrency(amount)}
                              </div>
                              <div className="text-sm text-muted-foreground">
                                {(
                                  (amount /
                                    summaryData.summary_totals.total_sales) *
                                  100
                                ).toFixed(1)}
                                %
                              </div>
                            </div>
                          </div>
                        )
                      )}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg sm:text-xl">Top Products</CardTitle>
                    <CardDescription>Best performing products</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {summaryData.product_sales.slice(0, 5).map((product) => (
                        <div
                          key={product.item_id}
                          className="flex items-center justify-between"
                        >
                          <div>
                            <div className="font-medium">
                              {product.item_name}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {product.total_quantity} units
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="font-medium">
                              {formatCurrency(product.total_revenue)}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {product.profit_margin}% margin
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg sm:text-xl">All Products Sold</CardTitle>
                  <CardDescription>
                    Complete product sales breakdown
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-0 sm:p-6">
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="whitespace-nowrap">Product Name</TableHead>
                          <TableHead className="whitespace-nowrap">SKU</TableHead>
                          <TableHead className="text-right whitespace-nowrap">Quantity</TableHead>
                          <TableHead className="text-right whitespace-nowrap">Revenue</TableHead>
                          <TableHead className="text-right whitespace-nowrap">Cost</TableHead>
                          <TableHead className="text-right whitespace-nowrap">Profit</TableHead>
                          <TableHead className="text-right whitespace-nowrap">Margin</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {summaryData.product_sales.map((product) => (
                          <TableRow key={product.item_id}>
                            <TableCell className="font-medium whitespace-nowrap">
                              {product.item_name}
                            </TableCell>
                            <TableCell className="whitespace-nowrap">{product.item_sku}</TableCell>
                            <TableCell className="text-right whitespace-nowrap">
                              {product.total_quantity}
                            </TableCell>
                            <TableCell className="text-right whitespace-nowrap">
                              {formatCurrency(product.total_revenue)}
                            </TableCell>
                            <TableCell className="text-right whitespace-nowrap">
                              {formatCurrency(product.total_cost)}
                            </TableCell>
                            <TableCell className="text-right whitespace-nowrap">
                              <span
                                className={
                                  product.total_profit >= 0
                                    ? "text-green-600"
                                    : "text-red-600"
                                }
                              >
                                {formatCurrency(product.total_profit)}
                              </span>
                            </TableCell>
                            <TableCell className="text-right whitespace-nowrap">
                              <span
                                className={
                                  product.profit_margin >= 0
                                    ? "text-green-600"
                                    : "text-red-600"
                                }
                              >
                                {product.profit_margin}%
                              </span>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </TabsContent>

        {/* Invoices Paid Tab */}
        <TabsContent value="invoices-paid" className="space-y-6">
          {combinedData && (
            <>
              {/* Totals Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      Total Invoices Paid
                    </CardTitle>
                    <Receipt className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {formatCurrency(invoicesPaidTotals.totalAmount)}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {combinedData.payments.payments.length} payments
                    </p>
                  </CardContent>
                </Card>

                {Object.entries(invoicesPaidTotals.methodTotals).map(([method, amount]) => (
                  <Card key={method}>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium capitalize">
                        {method}
                      </CardTitle>
                      <CreditCard className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">
                        {formatCurrency(amount)}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {((amount / invoicesPaidTotals.totalAmount) * 100).toFixed(1)}%
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Payment Allocation Analysis Card */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg sm:text-xl">Payment Allocation Analysis</CardTitle>
                  <CardDescription>
                    Where today's payments came from
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
                      <div>
                        <div className="font-medium text-base sm:text-lg">Today's Invoices</div>
                        <div className="text-sm text-muted-foreground">
                          {combinedData.enhanced.cash_flow_analysis.allocation_analysis.todays_invoices.count} allocations
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-xl sm:text-2xl font-bold text-green-600">
                          {formatCurrency(combinedData.enhanced.cash_flow_analysis.allocation_analysis.todays_invoices.amount)}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {(
                            (combinedData.enhanced.cash_flow_analysis.allocation_analysis.todays_invoices.amount /
                              combinedData.enhanced.cash_flow_analysis.todays_payments.total) *
                            100
                          ).toFixed(1)}% of total
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
                      <div>
                        <div className="font-medium text-base sm:text-lg">Older Invoices</div>
                        <div className="text-sm text-muted-foreground">
                          {combinedData.enhanced.cash_flow_analysis.allocation_analysis.older_invoices.count} allocations
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-xl sm:text-2xl font-bold text-blue-600">
                          {formatCurrency(combinedData.enhanced.cash_flow_analysis.allocation_analysis.older_invoices.amount)}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {(
                            (combinedData.enhanced.cash_flow_analysis.allocation_analysis.older_invoices.amount /
                              combinedData.enhanced.cash_flow_analysis.todays_payments.total) *
                            100
                          ).toFixed(1)}% of total
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Top Invoices Paid Today Card */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg sm:text-xl">Top Invoices Paid Today</CardTitle>
                  <CardDescription>
                    Largest payments received today
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {combinedData.enhanced.top_invoices_paid_today.map((invoice) => (
                      <div
                        key={invoice.invoice_reference}
                        className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors"
                      >
                        <div>
                          <div className="font-medium text-base sm:text-lg">
                            {invoice.invoice_reference}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {invoice.customer_name} • {invoice.invoice_age_days === 0 ? 'Today' : `${invoice.invoice_age_days} days ago`}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-lg sm:text-xl font-bold">
                            {formatCurrency(invoice.total_paid_today)}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {invoice.allocation_count} payment{invoice.allocation_count !== 1 ? 's' : ''}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Payments Received Today Table */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg sm:text-xl">Payments Received Today</CardTitle>
                  <CardDescription>
                    All payments received on {combinedData.payments.report_date}, including payments for older invoices
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-0 sm:p-6">
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="whitespace-nowrap">Payment Ref</TableHead>
                          <TableHead className="whitespace-nowrap">Customer</TableHead>
                          <TableHead className="whitespace-nowrap">Payment Method</TableHead>
                          <TableHead className="text-right whitespace-nowrap">Amount</TableHead>
                          <TableHead className="text-right whitespace-nowrap">Time</TableHead>
                          <TableHead className="text-right whitespace-nowrap">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {combinedData.payments.payments.map((payment) => (
                          <React.Fragment key={payment.payment_reference}>
                            <TableRow className="cursor-pointer hover:bg-muted/50">
                              <TableCell className="font-medium whitespace-nowrap">
                                {payment.payment_reference}
                              </TableCell>
                              <TableCell className="whitespace-nowrap">{payment.customer_name}</TableCell>
                              <TableCell className="whitespace-nowrap">
                                {getPaymentMethodBadge(payment.payment_method_code)}
                              </TableCell>
                              <TableCell className="text-right whitespace-nowrap">
                                {formatCurrency(payment.amount)}
                              </TableCell>
                              <TableCell className="text-right whitespace-nowrap">
                                {payment.received_at}
                              </TableCell>
                              <TableCell className="text-right">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() =>
                                    togglePaymentExpansion(payment.payment_reference)
                                  }
                                  className="h-8 w-8 p-0"
                                >
                                  {expandedPayments.has(
                                    payment.payment_reference
                                  ) ? (
                                    <ChevronUp className="h-4 w-4" />
                                  ) : (
                                    <ChevronDown className="h-4 w-4" />
                                  )}
                                </Button>
                              </TableCell>
                            </TableRow>
                            {expandedPayments.has(payment.payment_reference) && (
                              <TableRow>
                                <TableCell
                                  colSpan={6}
                                  className="bg-muted/20 p-4"
                                >
                                  <div className="space-y-3">
                                    <div className="flex justify-between items-center">
                                      <h4 className="font-semibold">Invoice Allocations</h4>
                                      <span className="text-sm text-muted-foreground">
                                        {payment.allocations.length} allocations
                                      </span>
                                    </div>
                                    <div className="overflow-x-auto">
                                      <Table>
                                        <TableHeader>
                                          <TableRow>
                                            <TableHead className="whitespace-nowrap">Invoice #</TableHead>
                                            <TableHead className="whitespace-nowrap">Invoice Date</TableHead>
                                            <TableHead className="whitespace-nowrap">Age</TableHead>
                                            <TableHead className="text-right whitespace-nowrap">Invoice Total</TableHead>
                                            <TableHead className="text-right whitespace-nowrap">Amount Paid</TableHead>
                                            <TableHead className="text-right whitesitespace-nowrap">Balance Before</TableHead>
                                            <TableHead className="text-right whitespace-nowrap">Balance After</TableHead>
                                          </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                          {payment.allocations.map((allocation, index) => (
                                            <TableRow key={index}>
                                              <TableCell className="font-medium whitespace-nowrap">
                                                {allocation.invoice_reference}
                                              </TableCell>
                                              <TableCell className="whitespace-nowrap">{allocation.invoice_date}</TableCell>
                                              <TableCell className="whitespace-nowrap">
                                                {getInvoiceAgeBadge(allocation.invoice_age_days)}
                                              </TableCell>
                                              <TableCell className="text-right whitespace-nowrap">
                                                {formatCurrency(allocation.invoice_total)}
                                              </TableCell>
                                              <TableCell className="text-right whitespace-nowrap">
                                                <span className="text-green-600 font-medium">
                                                  {formatCurrency(allocation.allocation_amount)}
                                                </span>
                                              </TableCell>
                                              <TableCell className="text-right whitespace-nowrap">
                                                {formatCurrency(allocation.invoice_balance_before)}
                                              </TableCell>
                                              <TableCell className="text-right whitespace-nowrap">
                                                {formatCurrency(allocation.invoice_balance_after)}
                                              </TableCell>
                                            </TableRow>
                                          ))}
                                        </TableBody>
                                      </Table>
                                    </div>
                                  </div>
                                </TableCell>
                              </TableRow>
                            )}
                          </React.Fragment>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </TabsContent>
      </Tabs>

      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
    </div>
  );
};

export default SalesReports;