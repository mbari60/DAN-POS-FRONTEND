// app/sales/customer-balances/page.jsx
"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  Search, 
  RefreshCw, 
  Eye,
  FileText,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  XCircle,
  User,
  DollarSign,
  CreditCard,
  Calendar,
  Filter,
  Download,
  BarChart3
} from 'lucide-react';
import { toast } from 'react-toastify';
import { 
  getCustomers,
  getCustomerBalanceSummary,
  getCustomerAgingReport,
  getCustomerStatement,
  getCustomer,
  getCustomerSalesHistory,
  getCustomerPaymentHistory
} from '@/lib/api/sales';

export default function CustomerBalancesManagement() {
  // State management
  const [loading, setLoading] = useState(true);
  const [customers, setCustomers] = useState([]);
  const [balanceSummary, setBalanceSummary] = useState([]);
  const [agingReport, setAgingReport] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  
  // Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [balanceFilter, setBalanceFilter] = useState('all');
  const [sortBy, setSortBy] = useState('name');
  
  // Dialog states
  const [viewDialog, setViewDialog] = useState({ 
    open: false, 
    customer: null,
    statement: null,
    salesHistory: [],
    paymentHistory: []
  });
  const [statementDialog, setStatementDialog] = useState({ 
    open: false, 
    customer: null,
    startDate: '',
    endDate: '',
    statementData: null
  });
  const [agingDialog, setAgingDialog] = useState(false);

  // Date range for statements
  const [statementDateRange, setStatementDateRange] = useState({
    startDate: new Date(new Date().setDate(new Date().getDate() - 30)).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0]
  });

  // Load data
  const loadData = async () => {
    try {
      setLoading(true);
      const [customersResponse, balanceSummaryResponse, agingReportResponse] = await Promise.all([
        getCustomers(),
        getCustomerBalanceSummary(),
        getCustomerAgingReport()
      ]);
      
      setCustomers(customersResponse.data || []);
      setBalanceSummary(balanceSummaryResponse || []);
      setAgingReport(agingReportResponse || []);
    } catch (error) {
      toast.error(error.message || 'Failed to load data');
      // Fallback data for demonstration
      setCustomers([
        {
          id: 1,
          name: 'John Doe Enterprises',
          customer_code: 'CUS-000001',
          current_balance: 12500.00,
          credit_limit: 50000.00,
          available_credit: 37500.00,
          credit_utilization: 25.0,
          over_limit: false,
          is_active: true,
          contact_info: 'john@doe.com, +254712345678',
          last_payment_date: '2024-01-15'
        },
        {
          id: 2,
          name: 'Tech Solutions Ltd',
          customer_code: 'CUS-000002',
          current_balance: 45000.00,
          credit_limit: 40000.00,
          available_credit: -5000.00,
          credit_utilization: 112.5,
          over_limit: true,
          is_active: true,
          contact_info: 'info@techsolutions.co.ke, +254723456789',
          last_payment_date: '2024-01-10'
        },
        {
          id: 3,
          name: 'Retail Mart',
          customer_code: 'CUS-000003',
          current_balance: 0.00,
          credit_limit: 20000.00,
          available_credit: 20000.00,
          credit_utilization: 0.0,
          over_limit: false,
          is_active: true,
          contact_info: 'sales@retailmart.com, +254734567890',
          last_payment_date: null
        },
        {
          id: 4,
          name: 'Fresh Foods Co.',
          customer_code: 'CUS-000004',
          current_balance: 7500.00,
          credit_limit: 15000.00,
          available_credit: 7500.00,
          credit_utilization: 50.0,
          over_limit: false,
          is_active: true,
          contact_info: 'orders@freshfoods.co.ke, +254745678901',
          last_payment_date: '2024-01-20'
        }
      ]);
      
      setBalanceSummary([
        {
          customer_id: 1,
          customer_name: 'John Doe Enterprises',
          customer_code: 'CUS-000001',
          current_balance: 12500.00,
          credit_limit: 50000.00,
          available_credit: 37500.00,
          credit_utilization: 25.0,
          over_limit: false
        },
        {
          customer_id: 2,
          customer_name: 'Tech Solutions Ltd',
          customer_code: 'CUS-000002',
          current_balance: 45000.00,
          credit_limit: 40000.00,
          available_credit: -5000.00,
          credit_utilization: 112.5,
          over_limit: true
        },
        {
          customer_id: 3,
          customer_name: 'Retail Mart',
          customer_code: 'CUS-000003',
          current_balance: 0.00,
          credit_limit: 20000.00,
          available_credit: 20000.00,
          credit_utilization: 0.0,
          over_limit: false
        },
        {
          customer_id: 4,
          customer_name: 'Fresh Foods Co.',
          customer_code: 'CUS-000004',
          current_balance: 7500.00,
          credit_limit: 15000.00,
          available_credit: 7500.00,
          credit_utilization: 50.0,
          over_limit: false
        }
      ]);
      
      setAgingReport([
        {
          customer_id: 1,
          customer_name: 'John Doe Enterprises',
          customer_code: 'CUS-000001',
          total_balance: 12500.00,
          current: 5000.00,
          days_30: 5000.00,
          days_60: 2500.00,
          days_90: 0.00,
          over_90: 0.00,
          oldest_invoice_date: '2023-12-15'
        },
        {
          customer_id: 2,
          customer_name: 'Tech Solutions Ltd',
          customer_code: 'CUS-000002',
          total_balance: 45000.00,
          current: 15000.00,
          days_30: 20000.00,
          days_60: 10000.00,
          days_90: 0.00,
          over_90: 0.00,
          oldest_invoice_date: '2023-11-20'
        },
        {
          customer_id: 4,
          customer_name: 'Fresh Foods Co.',
          customer_code: 'CUS-000004',
          total_balance: 7500.00,
          current: 7500.00,
          days_30: 0.00,
          days_60: 0.00,
          days_90: 0.00,
          over_90: 0.00,
          oldest_invoice_date: '2024-01-05'
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Load customer details for view dialog
  const loadCustomerDetails = async (customerId) => {
    try {
      const [customer, salesHistory, paymentHistory] = await Promise.all([
        getCustomer(customerId),
        getCustomerSalesHistory(customerId),
        getCustomerPaymentHistory(customerId)
      ]);
      
      setViewDialog(prev => ({
        ...prev,
        customer: customer,
        salesHistory: salesHistory || [],
        paymentHistory: paymentHistory || []
      }));
    } catch (error) {
      toast.error('Failed to load customer details');
    }
  };

  // Generate customer statement
  const generateStatement = async (customerId, startDate, endDate) => {
    try {
      const statement = await getCustomerStatement(customerId, startDate, endDate);
      setStatementDialog(prev => ({
        ...prev,
        statementData: statement
      }));
    } catch (error) {
      toast.error('Failed to generate statement');
    }
  };

  // Filter functions
  const filteredCustomers = balanceSummary.filter(customer => {
    const matchesSearch = customer.customer_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         customer.customer_code?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || 
                         (statusFilter === 'active' && customer.over_limit === false) ||
                         (statusFilter === 'over_limit' && customer.over_limit === true);
    
    const matchesBalance = balanceFilter === 'all' || 
                          (balanceFilter === 'with_balance' && customer.current_balance > 0) ||
                          (balanceFilter === 'no_balance' && customer.current_balance === 0);

    return matchesSearch && matchesStatus && matchesBalance;
  });

  // Sort customers
  const sortedCustomers = [...filteredCustomers].sort((a, b) => {
    switch (sortBy) {
      case 'balance':
        return b.current_balance - a.current_balance;
      case 'utilization':
        return b.credit_utilization - a.credit_utilization;
      case 'over_limit':
        return (b.over_limit === a.over_limit) ? 0 : b.over_limit ? -1 : 1;
      case 'name':
      default:
        return a.customer_name.localeCompare(b.customer_name);
    }
  });

  // Helper functions
  const getStatusBadge = (customer) => {
    if (customer.over_limit) {
      return { text: 'Over Limit', variant: 'destructive', icon: AlertTriangle };
    } else if (customer.current_balance > 0) {
      return { text: 'Active Balance', variant: 'default', icon: CheckCircle };
    } else {
      return { text: 'No Balance', variant: 'outline', icon: CheckCircle };
    }
  };

  const getUtilizationColor = (utilization) => {
    if (utilization >= 90) return 'text-red-600';
    if (utilization >= 75) return 'text-orange-600';
    if (utilization >= 50) return 'text-yellow-600';
    return 'text-green-600';
  };

  const getAgingBucketColor = (amount, bucket) => {
    if (amount === 0) return 'text-muted-foreground';
    if (bucket === 'over_90' || bucket === 'days_90') return 'text-red-600';
    if (bucket === 'days_60') return 'text-orange-600';
    if (bucket === 'days_30') return 'text-yellow-600';
    return 'text-green-600';
  };

  const openCustomerDetails = async (customer) => {
    setViewDialog({ open: true, customer, salesHistory: [], paymentHistory: [] });
    await loadCustomerDetails(customer.customer_id);
  };

  const openStatementDialog = (customer) => {
    setStatementDialog({ 
      open: true, 
      customer,
      startDate: statementDateRange.startDate,
      endDate: statementDateRange.endDate,
      statementData: null
    });
  };

  const handleGenerateStatement = () => {
    if (statementDialog.customer && statementDialog.startDate && statementDialog.endDate) {
      generateStatement(statementDialog.customer.customer_id, statementDialog.startDate, statementDialog.endDate);
    }
  };

  // Loading skeleton
  if (loading) {
    return (
      <div className="w-full space-y-4">
        <div className="flex items-center justify-between">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-10 w-32" />
        </div>
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} className="h-16 w-full" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="w-full space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Customer Balances</h1>
          <p className="text-sm text-muted-foreground">
            Manage customer credit limits, track balances, and monitor aging reports
          </p>
        </div>
        <div className="flex gap-2 mt-2 sm:mt-0">
          <Button 
            onClick={() => setAgingDialog(true)} 
            variant="outline" 
            size="sm"
          >
            <BarChart3 className="mr-2 h-4 w-4" />
            Aging Report
          </Button>
          <Button onClick={loadData} variant="outline" size="sm">
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Customers</p>
                <p className="text-2xl font-bold">{customers.length}</p>
              </div>
              <User className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Receivables</p>
                <p className="text-2xl font-bold text-green-600">
                  Ksh {balanceSummary.reduce((sum, cust) => sum + cust.current_balance, 0).toLocaleString()}
                </p>
              </div>
              <DollarSign className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Customers Over Limit</p>
                <p className="text-2xl font-bold text-red-600">
                  {balanceSummary.filter(cust => cust.over_limit).length}
                </p>
              </div>
              <AlertTriangle className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Avg. Utilization</p>
                <p className="text-2xl font-bold text-purple-600">
                  {balanceSummary.length > 0 
                    ? (balanceSummary.reduce((sum, cust) => sum + cust.credit_utilization, 0) / balanceSummary.length).toFixed(1) 
                    : 0}%
                </p>
              </div>
              <TrendingUp className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-4">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
            <div className="relative md:col-span-2">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by customer name or code..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8 h-9"
              />
            </div>
            
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="h-9">
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Within Limit</SelectItem>
                <SelectItem value="over_limit">Over Limit</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={balanceFilter} onValueChange={setBalanceFilter}>
              <SelectTrigger className="h-9">
                <SelectValue placeholder="Balance Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Balances</SelectItem>
                <SelectItem value="with_balance">With Balance</SelectItem>
                <SelectItem value="no_balance">No Balance</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="h-9">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="name">Name</SelectItem>
                <SelectItem value="balance">Balance</SelectItem>
                <SelectItem value="utilization">Utilization</SelectItem>
                <SelectItem value="over_limit">Over Limit</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Customer Balances Table */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Customer Balance Summary</CardTitle>
          <CardDescription className="text-sm">
            {sortedCustomers.length} customer(s) found
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-0 p-0">
          <div className="border rounded-md overflow-hidden">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead className="font-semibold">Customer</TableHead>
                    <TableHead className="font-semibold">Credit Limit</TableHead>
                    <TableHead className="font-semibold">Current Balance</TableHead>
                    <TableHead className="font-semibold">Available Credit</TableHead>
                    <TableHead className="font-semibold hidden lg:table-cell">Utilization</TableHead>
                    <TableHead className="font-semibold">Status</TableHead>
                    <TableHead className="font-semibold text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sortedCustomers.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-6">
                        <div className="flex flex-col items-center gap-2">
                          <User className="h-8 w-8 text-muted-foreground" />
                          <p className="text-sm text-muted-foreground">No customers found</p>
                          {(searchTerm || statusFilter !== 'all' || balanceFilter !== 'all') && (
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => {
                                setSearchTerm('');
                                setStatusFilter('all');
                                setBalanceFilter('all');
                              }}
                            >
                              Clear filters
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : (
                    sortedCustomers.map((customer) => {
                      const status = getStatusBadge(customer);
                      const StatusIcon = status.icon;

                      return (
                        <TableRow key={customer.customer_id} className="hover:bg-muted/30">
                          <TableCell>
                            <div className="font-medium text-sm">{customer.customer_name}</div>
                            <div className="text-xs text-muted-foreground">{customer.customer_code}</div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1 font-semibold">
                              <CreditCard className="h-3 w-3" />
                              Ksh {customer.credit_limit.toLocaleString()}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1 font-semibold">
                              <DollarSign className="h-3 w-3" />
                              Ksh {customer.current_balance.toLocaleString()}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className={`flex items-center gap-1 font-semibold ${
                              customer.available_credit < 0 ? 'text-red-600' : 'text-green-600'
                            }`}>
                              <DollarSign className="h-3 w-3" />
                              Ksh {Math.abs(customer.available_credit).toLocaleString()}
                              {customer.available_credit < 0 && ' (Over)'}
                            </div>
                          </TableCell>
                          <TableCell className="hidden lg:table-cell">
                            <div className={`flex items-center gap-1 font-semibold ${getUtilizationColor(customer.credit_utilization)}`}>
                              <TrendingUp className="h-3 w-3" />
                              {customer.credit_utilization.toFixed(1)}%
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant={status.variant} className="text-xs">
                              <StatusIcon className="h-3 w-3 mr-1" />
                              {status.text}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-1">
                              <Button 
                                onClick={() => openCustomerDetails(customer)}
                                size="sm" 
                                variant="outline"
                                className="h-7 px-2"
                              >
                                <Eye className="h-3 w-3" />
                              </Button>
                              <Button 
                                onClick={() => openStatementDialog(customer)}
                                size="sm" 
                                variant="outline"
                                className="h-7 px-2"
                              >
                                <FileText className="h-3 w-3" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Customer Details Dialog */}
      <Dialog open={viewDialog.open} onOpenChange={(open) => setViewDialog({ ...viewDialog, open })}>
        <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-lg">Customer Details</DialogTitle>
            <DialogDescription className="text-sm">
              {viewDialog.customer?.customer_name} - {viewDialog.customer?.customer_code}
            </DialogDescription>
          </DialogHeader>
          {viewDialog.customer && (
            <div className="space-y-6">
              {/* Basic Info */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-xs font-medium text-muted-foreground">Customer Code</Label>
                  <p className="text-sm font-semibold">{viewDialog.customer.customer_code}</p>
                </div>
                <div>
                  <Label className="text-xs font-medium text-muted-foreground">Status</Label>
                  <Badge variant={getStatusBadge(viewDialog.customer).variant}>
                    {getStatusBadge(viewDialog.customer).text}
                  </Badge>
                </div>
              </div>

              {/* Balance Information */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm">Credit Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-xs font-medium text-muted-foreground">Credit Limit</Label>
                      <p className="text-lg font-bold">Ksh {viewDialog.customer.credit_limit?.toLocaleString()}</p>
                    </div>
                    <div>
                      <Label className="text-xs font-medium text-muted-foreground">Current Balance</Label>
                      <p className="text-lg font-bold text-green-600">
                        Ksh {viewDialog.customer.current_balance?.toLocaleString()}
                      </p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-xs font-medium text-muted-foreground">Available Credit</Label>
                      <p className={`text-lg font-bold ${
                        viewDialog.customer.available_credit < 0 ? 'text-red-600' : 'text-green-600'
                      }`}>
                        Ksh {Math.abs(viewDialog.customer.available_credit || 0).toLocaleString()}
                        {viewDialog.customer.available_credit < 0 && ' (Over Limit)'}
                      </p>
                    </div>
                    <div>
                      <Label className="text-xs font-medium text-muted-foreground">Credit Utilization</Label>
                      <p className={`text-lg font-bold ${getUtilizationColor(viewDialog.customer.credit_utilization)}`}>
                        {viewDialog.customer.credit_utilization?.toFixed(1)}%
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Recent Sales */}
              {viewDialog.salesHistory.length > 0 && (
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm">Recent Sales (Last 5)</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {viewDialog.salesHistory.slice(0, 5).map((sale) => (
                        <div key={sale.id} className="flex justify-between items-center py-1 border-b last:border-b-0">
                          <div>
                            <span className="text-sm font-medium">{sale.reference_no}</span>
                            <span className="text-xs text-muted-foreground ml-2">
                              {new Date(sale.created_at).toLocaleDateString()}
                            </span>
                          </div>
                          <span className="text-sm font-semibold">Ksh {parseFloat(sale.total_amount).toLocaleString()}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Recent Payments */}
              {viewDialog.paymentHistory.length > 0 && (
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm">Recent Payments (Last 5)</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {viewDialog.paymentHistory.slice(0, 5).map((payment) => (
                        <div key={payment.id} className="flex justify-between items-center py-1 border-b last:border-b-0">
                          <div>
                            <span className="text-sm font-medium">{payment.payment_reference}</span>
                            <span className="text-xs text-muted-foreground ml-2">
                              {new Date(payment.received_at).toLocaleDateString()}
                            </span>
                          </div>
                          <span className="text-sm font-semibold text-green-600">
                            Ksh {parseFloat(payment.amount).toLocaleString()}
                          </span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          )}
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setViewDialog({ open: false, customer: null, salesHistory: [], paymentHistory: [] })}
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Statement Generation Dialog */}
      <Dialog open={statementDialog.open} onOpenChange={(open) => setStatementDialog({ ...statementDialog, open })}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="text-lg">Generate Statement</DialogTitle>
            <DialogDescription className="text-sm">
              {statementDialog.customer?.customer_name}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-sm">Start Date</Label>
                <Input
                  type="date"
                  value={statementDialog.startDate}
                  onChange={(e) => setStatementDialog(prev => ({ ...prev, startDate: e.target.value }))}
                  className="h-9"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-sm">End Date</Label>
                <Input
                  type="date"
                  value={statementDialog.endDate}
                  onChange={(e) => setStatementDialog(prev => ({ ...prev, endDate: e.target.value }))}
                  className="h-9"
                />
              </div>
            </div>

            {statementDialog.statementData && (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm">Statement Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm">Opening Balance:</span>
                    <span className="font-semibold">Ksh {statementDialog.statementData.opening_balance?.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Closing Balance:</span>
                    <span className="font-semibold">Ksh {statementDialog.statementData.closing_balance?.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Total Invoices:</span>
                    <span className="font-semibold">{statementDialog.statementData.summary?.total_invoices}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Total Payments:</span>
                    <span className="font-semibold">{statementDialog.statementData.summary?.total_payments}</span>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setStatementDialog({ open: false, customer: null, startDate: '', endDate: '', statementData: null })}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleGenerateStatement}
              disabled={!statementDialog.startDate || !statementDialog.endDate}
            >
              Generate Statement
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Aging Report Dialog */}
      <Dialog open={agingDialog} onOpenChange={setAgingDialog}>
        <DialogContent className="sm:max-w-[700px] max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-lg">Accounts Receivable Aging Report</DialogTitle>
            <DialogDescription className="text-sm">
              Breakdown of customer balances by aging buckets
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="border rounded-md overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead className="font-semibold">Customer</TableHead>
                    <TableHead className="font-semibold text-right">Current</TableHead>
                    <TableHead className="font-semibold text-right">1-30 Days</TableHead>
                    <TableHead className="font-semibold text-right">31-60 Days</TableHead>
                    <TableHead className="font-semibold text-right">61-90 Days</TableHead>
                    <TableHead className="font-semibold text-right">Over 90 Days</TableHead>
                    <TableHead className="font-semibold text-right">Total Balance</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {agingReport.map((customer) => (
                    <TableRow key={customer.customer_id} className="hover:bg-muted/30">
                      <TableCell>
                        <div className="font-medium text-sm">{customer.customer_name}</div>
                        <div className="text-xs text-muted-foreground">{customer.customer_code}</div>
                      </TableCell>
                      <TableCell className={`text-right font-semibold ${getAgingBucketColor(customer.current, 'current')}`}>
                        Ksh {customer.current.toLocaleString()}
                      </TableCell>
                      <TableCell className={`text-right font-semibold ${getAgingBucketColor(customer.days_30, 'days_30')}`}>
                        Ksh {customer.days_30.toLocaleString()}
                      </TableCell>
                      <TableCell className={`text-right font-semibold ${getAgingBucketColor(customer.days_60, 'days_60')}`}>
                        Ksh {customer.days_60.toLocaleString()}
                      </TableCell>
                      <TableCell className={`text-right font-semibold ${getAgingBucketColor(customer.days_90, 'days_90')}`}>
                        Ksh {customer.days_90.toLocaleString()}
                      </TableCell>
                      <TableCell className={`text-right font-semibold ${getAgingBucketColor(customer.over_90, 'over_90')}`}>
                        Ksh {customer.over_90.toLocaleString()}
                      </TableCell>
                      <TableCell className="text-right font-bold">
                        Ksh {customer.total_balance.toLocaleString()}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {/* Summary */}
            <Card>
              <CardContent className="pt-4">
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div>
                    <p className="font-medium">Total Receivables:</p>
                    <p className="text-lg font-bold text-green-600">
                      Ksh {agingReport.reduce((sum, cust) => sum + cust.total_balance, 0).toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <p className="font-medium">Overdue Amount (60+ days):</p>
                    <p className="text-lg font-bold text-red-600">
                      Ksh {agingReport.reduce((sum, cust) => sum + cust.days_90 + cust.over_90, 0).toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <p className="font-medium">Customers with Overdue:</p>
                    <p className="text-lg font-bold">
                      {agingReport.filter(cust => cust.days_90 + cust.over_90 > 0).length}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setAgingDialog(false)}
            >
              Close
            </Button>
            <Button variant="outline">
              <Download className="mr-2 h-4 w-4" />
              Export Report
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

