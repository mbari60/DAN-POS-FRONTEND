// app/expenses/page.jsx
"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
  Plus,
  RefreshCw,
  DollarSign,
  Eye,
  Edit,
  Trash2,
  Filter,
  Calendar,
  User,
  CheckCircle,
  XCircle,
  Store,
  TrendingUp,
  FileText,
} from "lucide-react";
import { toast } from "react-toastify";
import {
  getExpenses,
  getExpense,
  createExpense,
  updateExpense,
  deleteExpense,
  approveExpense,
  getExpenseSummary,
  getProfitLoss,
} from "@/lib/api/sales";
import { getCurrentUser } from "@/services/auth";
import { getCurrentUserStores } from "@/lib/api/inventory";

export default function ExpensesManagement() {
  // State management
  const [loading, setLoading] = useState(true);
  const [expenses, setExpenses] = useState([]);
  const [expenseSummary, setExpenseSummary] = useState(null);
  const [stores, setStores] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [storeFilter, setStoreFilter] = useState("all");

  // Date range filters
  const [dateRange, setDateRange] = useState({
    startDate: "",
    endDate: "",
  });

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  // Dialog states
  const [expenseDialog, setExpenseDialog] = useState({
    open: false,
    mode: "create",
    expense: null,
  });
  const [viewDialog, setViewDialog] = useState({
    open: false,
    expense: null,
  });
  const [deleteDialog, setDeleteDialog] = useState({
    open: false,
    expense: null,
  });
  const [approveDialog, setApproveDialog] = useState({
    open: false,
    expense: null,
  });
  const [summaryDialog, setSummaryDialog] = useState(false);

  // Form state
  const [expenseForm, setExpenseForm] = useState({
    category: "other",
    description: "",
    amount: "",
    payment_method: "cash",
    expense_date: new Date().toISOString().split("T")[0],
    created_by: 1,
    vendor: "",
    reference_number: "",
    notes: "",
    is_recurring: false,
    recurrence_frequency: "",
  });

  const [formErrors, setFormErrors] = useState({});

  // Load data
  const loadData = async () => {
    try {
      setLoading(true);
      const [expensesResponse, summaryResponse, storeResponse] =
        await Promise.all([
          getExpenses(),
          getExpenseSummary(),
          getCurrentUserStores(),
        ]);
      console.log("fetched stores:", storeResponse);
      setExpenses(expensesResponse.data || []);
      setExpenseSummary(summaryResponse || {});
      setStores(storeResponse.assigned_stores || []);

      // Mock stores data - in real app, this would come from API
      // setStores([
      //   { id: 1, name: 'Nairobi Main Store' },
      //   { id: 2, name: 'Mombasa Branch' },
      //   { id: 3, name: 'Kisumu Outlet' },
      //   { id: 4, name: 'Head Office' }
      // ]);
    } catch (error) {
      toast.error(error.message || "Failed to load data");
      // Fallback data for demonstration
      setExpenses([
        {
          id: 1,
          expense_number: "EXP-000001",
          category: "rent",
          description: "January Office Rent",
          amount: "50000.00",
          payment_method: "bank",
          expense_date: "2024-01-05",
          store_name: "Nairobi Main Store",
          vendor: "Property Management Ltd",
          reference_number: "RENT2401",
          notes: "Monthly office space rental",
          created_by_name: "Sarah Wilson",
          approved_by_name: "John Doe",
          is_approved: true,
          approved_at: "2024-01-05T10:30:00Z",
          created_at: "2024-01-05T09:15:00Z",
        },
        {
          id: 2,
          expense_number: "EXP-000002",
          category: "utilities",
          description: "Electricity Bill",
          amount: "15000.00",
          payment_method: "mpesa",
          expense_date: "2024-01-10",
          store_name: "Nairobi Main Store",
          vendor: "KPLC",
          reference_number: "KPLC2401",
          notes: "",
          created_by_name: "Mike Johnson",
          approved_by_name: null,
          is_approved: false,
          approved_at: null,
          created_at: "2024-01-10T14:20:00Z",
        },
        {
          id: 3,
          expense_number: "EXP-000003",
          category: "salaries",
          description: "Staff Salaries - January",
          amount: "250000.00",
          payment_method: "bank",
          expense_date: "2024-01-25",
          store_name: "Head Office",
          vendor: "",
          reference_number: "SAL2401",
          notes: "Monthly staff compensation",
          created_by_name: "David Kim",
          approved_by_name: "Jane Smith",
          is_approved: true,
          approved_at: "2024-01-24T16:45:00Z",
          created_at: "2024-01-24T15:30:00Z",
        },
      ]);

      setExpenseSummary({
        total_expenses: 315000.0,
        total_revenue: 1500000.0,
        net_profit: 1185000.0,
        profit_margin: 79.0,
        by_category: {
          rent: 50000.0,
          utilities: 15000.0,
          salaries: 250000.0,
        },
        expense_count: 3,
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Form handlers
  // const handleExpenseSubmit = async (e) => {
  //   e.preventDefault();

  //   // Validation
  //   const errors = {};
  //   if (!expenseForm.category) errors.category = 'Category is required';
  //   if (!expenseForm.description) errors.description = 'Description is required';
  //   if (!expenseForm.amount || parseFloat(expenseForm.amount) <= 0) {
  //     errors.amount = 'Valid amount is required';
  //   }
  //   if (!expenseForm.payment_method) errors.payment_method = 'Payment method is required';
  //   if (!expenseForm.expense_date) errors.expense_date = 'Expense date is required';

  //   if (Object.keys(errors).length > 0) {
  //     setFormErrors(errors);
  //     return;
  //   }

  //   try {
  //     if (expenseDialog.mode === 'create') {
  //       await createExpense(expenseForm);
  //       toast.success('Expense recorded successfully');
  //     } else {
  //       await updateExpense(expenseDialog.expense.id, expenseForm);
  //       toast.success('Expense updated successfully');
  //     }

  //     setExpenseDialog({ open: false, mode: 'create', expense: null });
  //     resetExpenseForm();
  //     loadData();
  //   } catch (error) {
  //     toast.error(error.message || `Failed to ${expenseDialog.mode} expense`);
  //   }
  // };

  // Improved validation function
  const validateExpenseForm = (formData) => {
    const errors = {};

    if (!formData.category) errors.category = "Category is required";
    if (!formData.description.trim())
      errors.description = "Description is required";
    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      errors.amount = "Valid amount is required";
    }
    if (!formData.payment_method)
      errors.payment_method = "Payment method is required";
    if (!formData.expense_date)
      errors.expense_date = "Expense date is required";
    if (!formData.store) errors.store = "Store is required";

    return {
      isValid: Object.keys(errors).length === 0,
      errors,
    };
  };

  const handleExpenseSubmit = async (e) => {
    e.preventDefault();

    // Use proper validation
    const validation = validateExpenseForm(expenseForm);
    if (!validation.isValid) {
      setFormErrors(validation.errors);
      return;
    }

    try {
      // Get current user ID from your auth context
      const currentUser = await getCurrentUser();

      const expenseData = {
        ...expenseForm,
        created_by: currentUser.id,
        amount: parseFloat(expenseForm.amount),
        store: parseInt(expenseForm.store),
      };

      if (expenseDialog.mode === "create") {
        await createExpense(expenseData);
        toast.success("Expense recorded successfully");
      } else {
        await updateExpense(expenseDialog.expense.id, expenseData);
        toast.success("Expense updated successfully");
      }

      setExpenseDialog({ open: false, mode: "create", expense: null });
      resetExpenseForm();
      loadData();
    } catch (error) {
      console.error("Expense submission error:", error);
      toast.error(error.message || `Failed to ${expenseDialog.mode} expense`);
    }
  };

  const handleApproveExpense = async () => {
    try {
      await approveExpense(approveDialog.expense.id);
      toast.success("Expense approved successfully");
      setApproveDialog({ open: false, expense: null });
      loadData();
    } catch (error) {
      toast.error(error.message || "Failed to approve expense");
    }
  };

  const handleDeleteExpense = async () => {
    try {
      await deleteExpense(deleteDialog.expense.id);
      toast.success("Expense deleted successfully");
      setDeleteDialog({ open: false, expense: null });
      loadData();
    } catch (error) {
      toast.error(error.message || "Failed to delete expense");
    }
  };

  const resetExpenseForm = () => {
    setExpenseForm({
      category: "other",
      description: "",
      amount: "",
      payment_method: "cash",
      expense_date: new Date().toISOString().split("T")[0],
      store: "",
      vendor: "",
      reference_number: "",
      notes: "",
      is_recurring: false,
      recurrence_frequency: "",
    });
    setFormErrors({});
  };

  const openCreateDialog = () => {
    resetExpenseForm();
    setExpenseDialog({ open: true, mode: "create", expense: null });
  };

  const openEditDialog = (expense) => {
    setExpenseForm({
      category: expense.category,
      description: expense.description,
      amount: expense.amount,
      payment_method: expense.payment_method,
      expense_date: expense.expense_date,
      store: expense.store_id?.toString() || "",
      vendor: expense.vendor || "",
      reference_number: expense.reference_number || "",
      notes: expense.notes || "",
      is_recurring: expense.is_recurring || false,
      recurrence_frequency: expense.recurrence_frequency || "",
    });
    setExpenseDialog({ open: true, mode: "edit", expense });
  };

  // Filter functions
  const filteredExpenses = expenses.filter((expense) => {
    const matchesSearch =
      expense.expense_number
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      expense.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      expense.vendor?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      expense.reference_number
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase());

    const matchesCategory =
      categoryFilter === "all" || expense.category === categoryFilter;

    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "approved" && expense.is_approved) ||
      (statusFilter === "pending" && !expense.is_approved);

    const matchesStore =
      storeFilter === "all" || expense.store_id?.toString() === storeFilter;

    // Date range filtering
    const expenseDate = new Date(expense.expense_date);
    const matchesDateRange =
      (!dateRange.startDate || expenseDate >= new Date(dateRange.startDate)) &&
      (!dateRange.endDate || expenseDate <= new Date(dateRange.endDate));

    return (
      matchesSearch &&
      matchesCategory &&
      matchesStatus &&
      matchesStore &&
      matchesDateRange
    );
  });

  // Pagination functions
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentExpenses = filteredExpenses.slice(
    indexOfFirstItem,
    indexOfLastItem
  );
  const totalPages = Math.ceil(filteredExpenses.length / itemsPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const PaginationControls = () => {
    const totalItems = filteredExpenses.length;
    const showingFrom = indexOfFirstItem + 1;
    const showingTo = Math.min(indexOfLastItem, totalItems);

    if (totalItems === 0) return null;

    return (
      <div className="flex items-center justify-between px-4 py-3 border-t">
        <div className="text-sm text-muted-foreground">
          Showing {showingFrom}-{showingTo} of {totalItems} expenses
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => paginate(currentPage - 1)}
            disabled={currentPage === 1}
          >
            ←
          </Button>

          {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
            let pageNumber;
            if (totalPages <= 5) {
              pageNumber = i + 1;
            } else if (currentPage <= 3) {
              pageNumber = i + 1;
            } else if (currentPage >= totalPages - 2) {
              pageNumber = totalPages - 4 + i;
            } else {
              pageNumber = currentPage - 2 + i;
            }

            return (
              <Button
                key={pageNumber}
                variant={currentPage === pageNumber ? "default" : "outline"}
                size="sm"
                onClick={() => paginate(pageNumber)}
                className="h-8 w-8 p-0"
              >
                {pageNumber}
              </Button>
            );
          })}

          <Button
            variant="outline"
            size="sm"
            onClick={() => paginate(currentPage + 1)}
            disabled={currentPage === totalPages}
          >
            →
          </Button>
        </div>
      </div>
    );
  };

  // Helper functions
  const getCategoryDisplay = (category) => {
    const categories = {
      rent: "Rent",
      utilities: "Utilities",
      salaries: "Salaries & Wages",
      supplies: "Office Supplies",
      marketing: "Marketing & Advertising",
      transport: "Transport & Delivery",
      maintenance: "Maintenance & Repairs",
      insurance: "Insurance",
      taxes: "Taxes",
      other: "Other Expenses",
    };
    return categories[category] || category;
  };

  const getPaymentMethodDisplay = (method) => {
    const methods = {
      cash: "Cash",
      mpesa: "M-Pesa",
      bank: "Bank Transfer",
      cheque: "Cheque",
      card: "Card Payment",
    };
    return methods[method] || method;
  };

  const getStatusBadge = (expense) => {
    if (expense.is_approved) {
      return { text: "Approved", variant: "default", icon: CheckCircle };
    } else {
      return { text: "Pending Approval", variant: "outline", icon: XCircle };
    }
  };

  const getCategoryBadge = (category) => {
    const variants = {
      rent: "default",
      utilities: "secondary",
      salaries: "destructive",
      supplies: "outline",
      marketing: "outline",
      transport: "outline",
      maintenance: "outline",
      insurance: "outline",
      taxes: "outline",
      other: "outline",
    };
    return variants[category] || "outline";
  };

  // Reset pagination when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, categoryFilter, statusFilter, storeFilter, dateRange]);

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
          <h1 className="text-2xl font-bold tracking-tight">
            Expenses Management
          </h1>
          <p className="text-sm text-muted-foreground">
            Track and manage business expenses with approval workflow
          </p>
        </div>
        <div className="flex gap-2 mt-2 sm:mt-0">
          <Button onClick={openCreateDialog} size="sm">
            <Plus className="mr-2 h-4 w-4" />
            New Expense
          </Button>
          <Button
            onClick={() => setSummaryDialog(true)}
            variant="outline"
            size="sm"
          >
            <TrendingUp className="mr-2 h-4 w-4" />
            View Summary
          </Button>
          <Button onClick={loadData} variant="outline" size="sm">
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      {expenseSummary && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Total Expenses
                  </p>
                  <p className="text-2xl font-bold text-red-600">
                    Ksh {expenseSummary.total_expenses?.toLocaleString()}
                  </p>
                </div>
                <DollarSign className="h-8 w-8 text-red-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Net Profit
                  </p>
                  <p className="text-2xl font-bold text-green-600">
                    Ksh {expenseSummary.net_profit?.toLocaleString()}
                  </p>
                </div>
                <TrendingUp className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Profit Margin
                  </p>
                  <p className="text-2xl font-bold text-blue-600">
                    {expenseSummary.profit_margin?.toFixed(1)}%
                  </p>
                </div>
                <FileText className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Expense Count
                  </p>
                  <p className="text-2xl font-bold text-purple-600">
                    {expenseSummary.expense_count}
                  </p>
                </div>
                <DollarSign className="h-8 w-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filters */}
      <Card>
        <CardContent className="pt-4">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
            <div className="relative md:col-span-2">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by description, vendor, or reference..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8 h-9"
              />
            </div>

            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="h-9">
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="rent">Rent</SelectItem>
                <SelectItem value="utilities">Utilities</SelectItem>
                <SelectItem value="salaries">Salaries</SelectItem>
                <SelectItem value="supplies">Supplies</SelectItem>
                <SelectItem value="marketing">Marketing</SelectItem>
                <SelectItem value="transport">Transport</SelectItem>
                <SelectItem value="maintenance">Maintenance</SelectItem>
                <SelectItem value="insurance">Insurance</SelectItem>
                <SelectItem value="taxes">Taxes</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="h-9">
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="pending">Pending Approval</SelectItem>
              </SelectContent>
            </Select>

            <Select value={storeFilter} onValueChange={setStoreFilter}>
              <SelectTrigger className="h-9">
                <SelectValue placeholder="All Stores" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Stores</SelectItem>
                {stores && stores.length > 0 ? (
                  stores.map((store) => (
                    <SelectItem key={store.id} value={store.id.toString()}>
                      {store.name}
                    </SelectItem>
                  ))
                ) : (
                  <SelectItem value="no-stores" disabled>
                    No stores available
                  </SelectItem>
                )}
              </SelectContent>
            </Select>
          </div>

          {/* Date Range Filter */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-3">
            <div>
              <Label className="text-sm">Start Date</Label>
              <Input
                type="date"
                value={dateRange.startDate}
                onChange={(e) =>
                  setDateRange({ ...dateRange, startDate: e.target.value })
                }
                className="h-9"
              />
            </div>
            <div>
              <Label className="text-sm">End Date</Label>
              <Input
                type="date"
                value={dateRange.endDate}
                onChange={(e) =>
                  setDateRange({ ...dateRange, endDate: e.target.value })
                }
                className="h-9"
              />
            </div>
            <div className="flex items-end">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setDateRange({ startDate: "", endDate: "" })}
                className="h-9"
              >
                Clear Dates
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Expenses Table */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Expense Records</CardTitle>
          <CardDescription className="text-sm">
            {filteredExpenses.length} expense(s) found
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-0 p-0">
          <div className="border rounded-md overflow-hidden">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead className="font-semibold">Expense #</TableHead>
                    <TableHead className="font-semibold">Description</TableHead>
                    <TableHead className="font-semibold hidden md:table-cell">
                      Category
                    </TableHead>
                    <TableHead className="font-semibold">Amount</TableHead>
                    <TableHead className="font-semibold hidden lg:table-cell">
                      Date
                    </TableHead>
                    <TableHead className="font-semibold hidden sm:table-cell">
                      Status
                    </TableHead>
                    <TableHead className="font-semibold hidden xl:table-cell">
                      Store
                    </TableHead>
                    <TableHead className="font-semibold text-right">
                      Actions
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {currentExpenses.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-6">
                        <div className="flex flex-col items-center gap-2">
                          <DollarSign className="h-8 w-8 text-muted-foreground" />
                          <p className="text-sm text-muted-foreground">
                            No expenses found
                          </p>
                          {(searchTerm ||
                            categoryFilter !== "all" ||
                            statusFilter !== "all" ||
                            storeFilter !== "all" ||
                            dateRange.startDate ||
                            dateRange.endDate) && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setSearchTerm("");
                                setCategoryFilter("all");
                                setStatusFilter("all");
                                setStoreFilter("all");
                                setDateRange({ startDate: "", endDate: "" });
                              }}
                            >
                              Clear filters
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : (
                    currentExpenses.map((expense) => {
                      const status = getStatusBadge(expense);
                      const StatusIcon = status.icon;

                      return (
                        <TableRow
                          key={expense.id}
                          className="hover:bg-muted/30"
                        >
                          <TableCell>
                            <div className="font-medium text-sm">
                              {expense.expense_number}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div
                              className="max-w-[200px] truncate"
                              title={expense.description}
                            >
                              {expense.description}
                            </div>
                            {expense.vendor && (
                              <div className="text-xs text-muted-foreground truncate">
                                Vendor: {expense.vendor}
                              </div>
                            )}
                          </TableCell>
                          <TableCell className="hidden md:table-cell">
                            <Badge
                              variant={getCategoryBadge(expense.category)}
                              className="text-xs"
                            >
                              {getCategoryDisplay(expense.category)}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1 font-semibold text-red-600">
                              <DollarSign className="h-3 w-3" />
                              Ksh {parseFloat(expense.amount).toLocaleString()}
                            </div>
                          </TableCell>
                          <TableCell className="hidden lg:table-cell">
                            <div className="flex items-center gap-1 text-sm text-muted-foreground">
                              <Calendar className="h-3 w-3" />
                              {new Date(
                                expense.expense_date
                              ).toLocaleDateString()}
                            </div>
                          </TableCell>
                          <TableCell className="hidden sm:table-cell">
                            <Badge variant={status.variant} className="text-xs">
                              <StatusIcon className="h-3 w-3 mr-1" />
                              {status.text}
                            </Badge>
                          </TableCell>
                          <TableCell className="hidden xl:table-cell">
                            <div className="flex items-center gap-1 text-sm text-muted-foreground">
                              <Store className="h-3 w-3" />
                              {expense.store_name || "N/A"}
                            </div>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-1">
                              <Button
                                onClick={() =>
                                  setViewDialog({ open: true, expense })
                                }
                                size="sm"
                                variant="outline"
                                className="h-7 px-2"
                              >
                                <Eye className="h-3 w-3" />
                              </Button>
                              <Button
                                onClick={() => openEditDialog(expense)}
                                size="sm"
                                variant="outline"
                                className="h-7 px-2"
                                disabled={expense.is_approved}
                              >
                                <Edit className="h-3 w-3" />
                              </Button>
                              {!expense.is_approved && (
                                <Button
                                  onClick={() =>
                                    setApproveDialog({ open: true, expense })
                                  }
                                  size="sm"
                                  variant="outline"
                                  className="h-7 px-2 text-green-600"
                                >
                                  <CheckCircle className="h-3 w-3" />
                                </Button>
                              )}
                              <Button
                                onClick={() =>
                                  setDeleteDialog({ open: true, expense })
                                }
                                size="sm"
                                variant="outline"
                                className="h-7 px-2 text-red-600"
                              >
                                <Trash2 className="h-3 w-3" />
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
            <PaginationControls />
          </div>
        </CardContent>
      </Card>

      {/* Create/Edit Expense Dialog */}
      <Dialog
        open={expenseDialog.open}
        onOpenChange={(open) => setExpenseDialog({ ...expenseDialog, open })}
      >
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle className="text-lg">
              {expenseDialog.mode === "create"
                ? "Record New Expense"
                : "Edit Expense"}
            </DialogTitle>
            <DialogDescription className="text-sm">
              {expenseDialog.mode === "create"
                ? "Record a new business expense"
                : `Update expense details for ${expenseDialog.expense?.expense_number}`}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleExpenseSubmit}>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="category" className="text-sm">
                    Category *
                  </Label>
                  <Select
                    value={expenseForm.category}
                    onValueChange={(value) =>
                      setExpenseForm({ ...expenseForm, category: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="rent">Rent</SelectItem>
                      <SelectItem value="utilities">Utilities</SelectItem>
                      <SelectItem value="salaries">Salaries & Wages</SelectItem>
                      <SelectItem value="supplies">Office Supplies</SelectItem>
                      <SelectItem value="marketing">
                        Marketing & Advertising
                      </SelectItem>
                      <SelectItem value="transport">
                        Transport & Delivery
                      </SelectItem>
                      <SelectItem value="maintenance">
                        Maintenance & Repairs
                      </SelectItem>
                      <SelectItem value="insurance">Insurance</SelectItem>
                      <SelectItem value="taxes">Taxes</SelectItem>
                      <SelectItem value="other">Other Expenses</SelectItem>
                    </SelectContent>
                  </Select>
                  {formErrors.category && (
                    <p className="text-xs text-destructive">
                      {formErrors.category}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="amount" className="text-sm">
                    Amount *
                  </Label>
                  <Input
                    id="amount"
                    type="number"
                    step="0.01"
                    value={expenseForm.amount}
                    onChange={(e) =>
                      setExpenseForm({ ...expenseForm, amount: e.target.value })
                    }
                    placeholder="0.00"
                    className="h-9"
                  />
                  {formErrors.amount && (
                    <p className="text-xs text-destructive">
                      {formErrors.amount}
                    </p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description" className="text-sm">
                  Description *
                </Label>
                <Input
                  id="description"
                  value={expenseForm.description}
                  onChange={(e) =>
                    setExpenseForm({
                      ...expenseForm,
                      description: e.target.value,
                    })
                  }
                  placeholder="Brief description of the expense"
                  className="h-9"
                />
                {formErrors.description && (
                  <p className="text-xs text-destructive">
                    {formErrors.description}
                  </p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="payment_method" className="text-sm">
                    Payment Method *
                  </Label>
                  <Select
                    value={expenseForm.payment_method}
                    onValueChange={(value) =>
                      setExpenseForm({ ...expenseForm, payment_method: value })
                    }
                  >
                    <SelectTrigger className="h-9">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="cash">Cash</SelectItem>
                      <SelectItem value="mpesa">M-Pesa</SelectItem>
                      <SelectItem value="bank">Bank Transfer</SelectItem>
                      <SelectItem value="cheque">Cheque</SelectItem>
                      <SelectItem value="card">Card Payment</SelectItem>
                    </SelectContent>
                  </Select>
                  {formErrors.payment_method && (
                    <p className="text-xs text-destructive">
                      {formErrors.payment_method}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="expense_date" className="text-sm">
                    Expense Date *
                  </Label>
                  <Input
                    id="expense_date"
                    type="date"
                    value={expenseForm.expense_date}
                    onChange={(e) =>
                      setExpenseForm({
                        ...expenseForm,
                        expense_date: e.target.value,
                      })
                    }
                    className="h-9"
                  />
                  {formErrors.expense_date && (
                    <p className="text-xs text-destructive">
                      {formErrors.expense_date}
                    </p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="store" className="text-sm">
                    Store/Location
                  </Label>
                  <Select
                    value={expenseForm.store}
                    onValueChange={(value) =>
                      setExpenseForm({ ...expenseForm, store: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select store" />
                    </SelectTrigger>
                    <SelectContent>
                      {stores.map((store) => (
                        <SelectItem key={store.id} value={store.id.toString()}>
                          {store.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="vendor" className="text-sm">
                    Vendor
                  </Label>
                  <Input
                    id="vendor"
                    value={expenseForm.vendor}
                    onChange={(e) =>
                      setExpenseForm({ ...expenseForm, vendor: e.target.value })
                    }
                    placeholder="Vendor/supplier name"
                    className="h-9"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="reference_number" className="text-sm">
                  Reference Number
                </Label>
                <Input
                  id="reference_number"
                  value={expenseForm.reference_number}
                  onChange={(e) =>
                    setExpenseForm({
                      ...expenseForm,
                      reference_number: e.target.value,
                    })
                  }
                  placeholder="Invoice number or transaction reference"
                  className="h-9"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes" className="text-sm">
                  Notes
                </Label>
                <Textarea
                  id="notes"
                  value={expenseForm.notes}
                  onChange={(e) =>
                    setExpenseForm({ ...expenseForm, notes: e.target.value })
                  }
                  placeholder="Additional notes or details"
                  className="min-h-[80px]"
                />
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="is_recurring"
                  checked={expenseForm.is_recurring}
                  onChange={(e) =>
                    setExpenseForm({
                      ...expenseForm,
                      is_recurring: e.target.checked,
                    })
                  }
                  className="rounded border-gray-300"
                />
                <Label htmlFor="is_recurring" className="text-sm">
                  This is a recurring expense
                </Label>
              </div>

              {expenseForm.is_recurring && (
                <div className="space-y-2">
                  <Label htmlFor="recurrence_frequency" className="text-sm">
                    Recurrence Frequency
                  </Label>
                  <Select
                    value={expenseForm.recurrence_frequency}
                    onValueChange={(value) =>
                      setExpenseForm({
                        ...expenseForm,
                        recurrence_frequency: value,
                      })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select frequency" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="daily">Daily</SelectItem>
                      <SelectItem value="weekly">Weekly</SelectItem>
                      <SelectItem value="monthly">Monthly</SelectItem>
                      <SelectItem value="quarterly">Quarterly</SelectItem>
                      <SelectItem value="yearly">Yearly</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() =>
                  setExpenseDialog({
                    open: false,
                    mode: "create",
                    expense: null,
                  })
                }
              >
                Cancel
              </Button>
              <Button type="submit">
                {expenseDialog.mode === "create"
                  ? "Record Expense"
                  : "Update Expense"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* View Expense Details Dialog */}
      <Dialog
        open={viewDialog.open}
        onOpenChange={(open) => setViewDialog({ ...viewDialog, open })}
      >
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="text-lg">Expense Details</DialogTitle>
            <DialogDescription className="text-sm">
              {viewDialog.expense?.expense_number}
            </DialogDescription>
          </DialogHeader>
          {viewDialog.expense && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-xs font-medium text-muted-foreground">
                    Expense Number
                  </Label>
                  <p className="text-sm font-semibold">
                    {viewDialog.expense.expense_number}
                  </p>
                </div>
                <div>
                  <Label className="text-xs font-medium text-muted-foreground">
                    Expense Date
                  </Label>
                  <p className="text-sm">
                    {new Date(
                      viewDialog.expense.expense_date
                    ).toLocaleDateString()}
                  </p>
                </div>
              </div>

              <div>
                <Label className="text-xs font-medium text-muted-foreground">
                  Description
                </Label>
                <p className="text-sm font-semibold">
                  {viewDialog.expense.description}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-xs font-medium text-muted-foreground">
                    Category
                  </Label>
                  <Badge
                    variant={getCategoryBadge(viewDialog.expense.category)}
                  >
                    {getCategoryDisplay(viewDialog.expense.category)}
                  </Badge>
                </div>
                <div>
                  <Label className="text-xs font-medium text-muted-foreground">
                    Amount
                  </Label>
                  <p className="text-lg font-bold text-red-600">
                    Ksh {parseFloat(viewDialog.expense.amount).toLocaleString()}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-xs font-medium text-muted-foreground">
                    Payment Method
                  </Label>
                  <p className="text-sm">
                    {getPaymentMethodDisplay(viewDialog.expense.payment_method)}
                  </p>
                </div>
                <div>
                  <Label className="text-xs font-medium text-muted-foreground">
                    Status
                  </Label>
                  <Badge variant={getStatusBadge(viewDialog.expense).variant}>
                    {getStatusBadge(viewDialog.expense).text}
                  </Badge>
                </div>
              </div>

              {viewDialog.expense.vendor && (
                <div>
                  <Label className="text-xs font-medium text-muted-foreground">
                    Vendor
                  </Label>
                  <p className="text-sm">{viewDialog.expense.vendor}</p>
                </div>
              )}

              {viewDialog.expense.store_name && (
                <div>
                  <Label className="text-xs font-medium text-muted-foreground">
                    Store/Location
                  </Label>
                  <p className="text-sm">{viewDialog.expense.store_name}</p>
                </div>
              )}

              {viewDialog.expense.reference_number && (
                <div>
                  <Label className="text-xs font-medium text-muted-foreground">
                    Reference Number
                  </Label>
                  <p className="text-sm font-mono">
                    {viewDialog.expense.reference_number}
                  </p>
                </div>
              )}

              {viewDialog.expense.notes && (
                <div>
                  <Label className="text-xs font-medium text-muted-foreground">
                    Notes
                  </Label>
                  <p className="text-sm bg-muted p-2 rounded">
                    {viewDialog.expense.notes}
                  </p>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-xs font-medium text-muted-foreground">
                    Created By
                  </Label>
                  <div className="flex items-center gap-1 text-sm">
                    <User className="h-3 w-3" />
                    {viewDialog.expense.created_by_name}
                  </div>
                </div>
                {viewDialog.expense.approved_by_name && (
                  <div>
                    <Label className="text-xs font-medium text-muted-foreground">
                      Approved By
                    </Label>
                    <div className="flex items-center gap-1 text-sm">
                      <User className="h-3 w-3" />
                      {viewDialog.expense.approved_by_name}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setViewDialog({ open: false, expense: null })}
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Expense Summary Dialog */}
      <Dialog open={summaryDialog} onOpenChange={setSummaryDialog}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle className="text-lg">Expenses Summary</DialogTitle>
            <DialogDescription className="text-sm">
              Overview of expenses and financial impact
            </DialogDescription>
          </DialogHeader>
          {expenseSummary && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <Card>
                  <CardContent className="pt-4">
                    <p className="text-sm font-medium text-muted-foreground">
                      Total Revenue
                    </p>
                    <p className="text-xl font-bold text-green-600">
                      Ksh {expenseSummary.total_revenue?.toLocaleString()}
                    </p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-4">
                    <p className="text-sm font-medium text-muted-foreground">
                      Total Expenses
                    </p>
                    <p className="text-xl font-bold text-red-600">
                      Ksh {expenseSummary.total_expenses?.toLocaleString()}
                    </p>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">
                    Expenses by Category
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {Object.entries(expenseSummary.by_category || {}).map(
                    ([category, amount]) => (
                      <div
                        key={category}
                        className="flex justify-between items-center py-2 border-b last:border-b-0"
                      >
                        <span className="text-sm">
                          {getCategoryDisplay(category)}
                        </span>
                        <span className="font-semibold">
                          Ksh {parseFloat(amount).toLocaleString()}
                        </span>
                      </div>
                    )
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">
                        Net Profit
                      </p>
                      <p className="text-xl font-bold text-blue-600">
                        Ksh {expenseSummary.net_profit?.toLocaleString()}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">
                        Profit Margin
                      </p>
                      <p className="text-xl font-bold text-purple-600">
                        {expenseSummary.profit_margin?.toFixed(1)}%
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setSummaryDialog(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Approve Expense Dialog */}
      <Dialog
        open={approveDialog.open}
        onOpenChange={(open) => setApproveDialog({ ...approveDialog, open })}
      >
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="text-lg">Approve Expense</DialogTitle>
            <DialogDescription className="text-sm">
              Are you sure you want to approve expense{" "}
              {approveDialog.expense?.expense_number}? This action cannot be
              reversed.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setApproveDialog({ open: false, expense: null })}
            >
              Cancel
            </Button>
            <Button
              onClick={handleApproveExpense}
              className="bg-green-600 hover:bg-green-700"
            >
              Approve Expense
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialog.open}
        onOpenChange={(open) => setDeleteDialog({ ...deleteDialog, open })}
      >
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="text-lg">Delete Expense</DialogTitle>
            <DialogDescription className="text-sm">
              Are you sure you want to delete expense{" "}
              {deleteDialog.expense?.expense_number}? This action cannot be
              undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteDialog({ open: false, expense: null })}
            >
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteExpense}>
              Delete Expense
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
