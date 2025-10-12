// app/sales/returns/page.jsx
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
  Eye,
  Edit,
  CheckCircle,
  XCircle,
  Clock,
  Package,
  User,
  DollarSign,
  FileText,
  Filter,
  Calendar,
  ArrowLeftRight,
  AlertCircle,
} from "lucide-react";
import { toast } from "react-toastify";
import {
  getSaleReturns,
  getSaleReturn,
  createSaleReturn,
  updateSaleReturn,
  approveSaleReturn,
  rejectSaleReturn,
  completeSaleReturn,
  getReturnableItems,
  getReturnSummary,
  getCustomerReturnHistory,
  getCustomers,
  getSaleInvoices,
} from "@/lib/api/sales";

export default function ReturnsManagement() {
  // State management
  const [loading, setLoading] = useState(true);
  const [returns, setReturns] = useState([]);
  const [returnSummary, setReturnSummary] = useState(null);
  const [customers, setCustomers] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [customerFilter, setCustomerFilter] = useState("all");

  // Dialog states
  const [returnDialog, setReturnDialog] = useState({
    open: false,
    mode: "create",
    return: null,
  });
  const [viewDialog, setViewDialog] = useState({
    open: false,
    return: null,
    returnItems: [],
  });
  const [approvalDialog, setApprovalDialog] = useState({
    open: false,
    return: null,
    action: "approve", // 'approve' or 'reject'
  });
  const [completionDialog, setCompletionDialog] = useState({
    open: false,
    return: null,
  });
  const [itemsDialog, setItemsDialog] = useState({
    open: false,
    invoiceId: null,
    returnableItems: [],
  });

  // Form states
  const [returnForm, setReturnForm] = useState({
    original_invoice: "",
    customer: "",
    store: "",
    return_reason: "customer_request",
    notes: "",
    lines: [],
  });

  const [approvalForm, setApprovalForm] = useState({
    notes: "",
    rejection_reason: "",
  });

  const [completionForm, setCompletionForm] = useState({
    notes: "",
  });

  const [formErrors, setFormErrors] = useState({});

  // Load data
  const loadData = async () => {
    try {
      setLoading(true);
      const [
        returnsResponse,
        summaryResponse,
        customersResponse,
        invoicesResponse,
      ] = await Promise.all([
        getSaleReturns(),
        getReturnSummary(),
        getCustomers(),
        getSaleInvoices({ status: "completed", limit: 100 }),
      ]);

      setReturns(returnsResponse.data || returnsResponse.results || []);
      setReturnSummary(summaryResponse.data || summaryResponse);
      setCustomers(customersResponse.data || customersResponse.results || []);
      setInvoices(invoicesResponse.data || invoicesResponse.results || []);
    } catch (error) {
      console.error("Error loading data:", error);
      toast.error(error.message || "Failed to load data");
      // Initialize empty arrays to prevent crashes
      setReturns([]);
      setReturnSummary({
        total_returns: 0,
        total_return_amount: 0,
        pending_approvals: 0,
        completed_returns: 0,
        rejected_returns: 0,
        average_return_amount: 0,
        return_rate_percentage: 0,
        top_return_reasons: [],
      });
      setCustomers([]);
      setInvoices([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Load returnable items for an invoice
  const loadReturnableItems = async (invoiceId) => {
    try {
      const response = await getReturnableItems(invoiceId);
      setItemsDialog((prev) => ({
        ...prev,
        returnableItems: response.returnable_items || response.data || [],
      }));
    } catch (error) {
      console.error("Error loading returnable items:", error);
      toast.error("Failed to load returnable items");
      setItemsDialog((prev) => ({ ...prev, returnableItems: [] }));
    }
  };

  // Load return details for viewing
  const loadReturnDetails = async (returnId) => {
    try {
      const response = await getSaleReturn(returnId);
      const returnData = response.data || response;
      setViewDialog((prev) => ({
        ...prev,
        return: returnData,
        returnItems: returnData.lines || [],
      }));
    } catch (error) {
      console.error("Error loading return details:", error);
      toast.error("Failed to load return details");
    }
  };

  // Form handlers
  // const handleReturnSubmit = async (e) => {
  //   e.preventDefault();

  //   // Validation
  //   const errors = {};
  //   if (!returnForm.original_invoice) errors.original_invoice = 'Original invoice is required';
  //   if (!returnForm.customer) errors.customer = 'Customer is required';
  //   if (!returnForm.return_reason) errors.return_reason = 'Return reason is required';
  //   if (returnForm.lines.length === 0) errors.lines = 'At least one return item is required';

  //   if (Object.keys(errors).length > 0) {
  //     setFormErrors(errors);
  //     return;
  //   }

  //   try {
  //     if (returnDialog.mode === 'create') {
  //       await createSaleReturn(returnForm);
  //       toast.success('Return request created successfully');
  //     } else {
  //       await updateSaleReturn(returnDialog.return.id, returnForm);
  //       toast.success('Return request updated successfully');
  //     }

  //     setReturnDialog({ open: false, mode: 'create', return: null });
  //     resetReturnForm();
  //     loadData();
  //   } catch (error) {
  //     console.error('Error submitting return:', error);
  //     toast.error(error.message || `Failed to ${returnDialog.mode} return`);
  //   }
  // };

  // Form handlers
  const handleReturnSubmit = async (e) => {
    e.preventDefault();
    console.log("Form submission started with data:", returnForm);

    // Enhanced validation - ensure customer is included
    const errors = {};
    if (!returnForm.original_invoice)
      errors.original_invoice = "Original invoice is required";
    if (!returnForm.customer) errors.customer = "Customer is required";
    if (!returnForm.store) errors.store = "Store is required"; 
    if (!returnForm.return_reason)
      errors.return_reason = "Return reason is required";
    if (returnForm.lines.length === 0)
      errors.lines = "At least one return item is required";

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      console.log("Form submission blocked by validation errors:", errors);
      toast.error("Please fill all required fields");
      return;
    }

    try {
      // Prepare complete payload with all required fields
      const payload = {
        original_invoice: parseInt(returnForm.original_invoice),
        customer: parseInt(returnForm.customer), // Ensure this is included as integer
        store: parseInt(returnForm.store),
        return_reason: returnForm.return_reason,
        notes: returnForm.notes || "",
        restocking_fee: returnForm.restocking_fee || "0.00",
        lines: returnForm.lines.map((line) => ({
          original_line: parseInt(line.original_line),
          item: parseInt(line.item),
          original_quantity: parseInt(line.original_quantity),
          quantity_returned: parseInt(line.quantity_returned),
          return_unit_price: parseFloat(line.return_unit_price),
          condition: line.condition,
        })),
      };

      console.log("Sending complete payload to API:", payload);

      if (returnDialog.mode === "create") {
        await createSaleReturn(payload);
        toast.success("Return request created successfully");
      } else {
        await updateSaleReturn(returnDialog.return.id, payload);
        toast.success("Return request updated successfully");
      }

      setReturnDialog({ open: false, mode: "create", return: null });
      resetReturnForm();
      loadData();
    } catch (error) {
      console.error("Error submitting return:", error);
      console.error("Error response:", error.response?.data);
      const errorMessage =
        error.response?.data?.message ||
        error.response?.data?.error ||
        `Failed to ${returnDialog.mode} return`;
      toast.error(errorMessage);
    }
  };

  // const handleApproval = async (e) => {
  //   e.preventDefault();

  //   try {
  //     if (approvalDialog.action === "approve") {
  //       await approveSaleReturn(approvalDialog.return.id, {
  //         notes: approvalForm.notes,
  //       });
  //       toast.success("Return approved successfully");
  //     } else {
  //       await rejectSaleReturn(approvalDialog.return.id, {
  //         rejection_reason: approvalForm.rejection_reason,
  //       });
  //       toast.success("Return rejected successfully");
  //     }

  //     setApprovalDialog({ open: false, return: null, action: "approve" });
  //     setApprovalForm({ notes: "", rejection_reason: "" });
  //     loadData();
  //   } catch (error) {
  //     console.error("Error processing approval:", error);
  //     toast.error(error.message || `Failed to ${approvalDialog.action} return`);
  //   }
  // };


const handleApproval = async (e) => {
  e.preventDefault();

  try {
    if (approvalDialog.action === "approve") {
      const response = await approveSaleReturn(approvalDialog.return.id, {
        notes: approvalForm.notes,
      });
      console.log('Approve response:', response); // Debug log
      toast.success(response.status || "Return approved successfully");
    } else {
      const response = await rejectSaleReturn(approvalDialog.return.id, {
        rejection_reason: approvalForm.rejection_reason,
      });
      console.log('Reject response:', response); // Debug log
      toast.success(response.status || "Return rejected successfully");
    }

    setApprovalDialog({ open: false, return: null, action: "approve" });
    setApprovalForm({ notes: "", rejection_reason: "" });
    await loadData(); // Make sure this completes
  } catch (error) {
    console.error("Error processing approval:", error);
    console.error("Error details:", error.response?.data); // Add more details
    toast.error(error.message || `Failed to ${approvalDialog.action} return`);
  }
};


  const handleCompletion = async (e) => {
    e.preventDefault();

    try {
      await completeSaleReturn(completionDialog.return.id, {
        notes: completionForm.notes,
      });
      toast.success("Return processed successfully");

      setCompletionDialog({ open: false, return: null });
      setCompletionForm({ notes: "" });
      loadData();
    } catch (error) {
      console.error("Error completing return:", error);
      toast.error(error.message || "Failed to complete return");
    }
  };

  const resetReturnForm = () => {
    setReturnForm({
      original_invoice: "",
      customer: "",
      store: "",
      return_reason: "customer_request",
      notes: "",
      lines: [],
    });
    setFormErrors({});
  };

  const openCreateDialog = () => {
    resetReturnForm();
    setReturnDialog({ open: true, mode: "create", return: null });
  };

  const openEditDialog = (returnItem) => {
    setReturnForm({
      original_invoice: returnItem.original_invoice?.id || "",
      customer: returnItem.customer?.id || "",
      store: returnItem.store?.id || "",
      return_reason: returnItem.return_reason || "customer_request",
      notes: returnItem.notes || "",
      lines: returnItem.lines || [],
    });
    setReturnDialog({ open: true, mode: "edit", return: returnItem });
  };

  const openItemsDialog = async (invoiceId) => {
    setItemsDialog({ open: true, invoiceId, returnableItems: [] });
    await loadReturnableItems(invoiceId);
  };

  const openViewDialog = async (returnItem) => {
    setViewDialog({ open: true, return: returnItem, returnItems: [] });
    await loadReturnDetails(returnItem.id);
  };

  const addReturnLine = (item) => {
    const newLine = {
      original_line: item.line_id,
      item: item.item_id,
      original_quantity: item.original_quantity,
      quantity_returned: 1, // Default to 1
      return_unit_price: item.unit_price,
      condition: "good",
    };

    setReturnForm((prev) => ({
      ...prev,
      lines: [...prev.lines, newLine],
    }));
  };

  const removeReturnLine = (index) => {
    setReturnForm((prev) => ({
      ...prev,
      lines: prev.lines.filter((_, i) => i !== index),
    }));
  };

  const updateReturnLine = (index, field, value) => {
    setReturnForm((prev) => ({
      ...prev,
      lines: prev.lines.map((line, i) =>
        i === index ? { ...line, [field]: value } : line
      ),
    }));
  };

  // Filter functions
  const filteredReturns = returns.filter((returnItem) => {
    const matchesSearch =
      returnItem.return_reference
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      returnItem.original_invoice_reference
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      returnItem.customer_name
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === "all" || returnItem.status === statusFilter;

    const matchesCustomer =
      customerFilter === "all" ||
      returnItem.customer_id?.toString() === customerFilter;

    return matchesSearch && matchesStatus && matchesCustomer;
  });

  // Helper functions
  const getStatusDisplay = (status) => {
    const statuses = {
      draft: "Draft",
      pending_approval: "Pending Approval",
      approved: "Approved",
      rejected: "Rejected",
      completed: "Completed",
      cancelled: "Cancelled",
    };
    return statuses[status] || status;
  };

  const getReasonDisplay = (reason) => {
    const reasons = {
      defective: "Defective Item",
      wrong_item: "Wrong Item",
      customer_request: "Customer Request",
      expired: "Expired Product",
      damaged: "Damaged in Transit",
      quality_issue: "Quality Issue",
      overcharge: "Overcharge Correction",
      other: "Other",
    };
    return reasons[reason] || reason;
  };

  const getStatusBadge = (status) => {
    const variants = {
      draft: "outline",
      pending_approval: "secondary",
      approved: "default",
      rejected: "destructive",
      completed: "default",
      cancelled: "outline",
    };

    const icons = {
      draft: FileText,
      pending_approval: Clock,
      approved: CheckCircle,
      rejected: XCircle,
      completed: CheckCircle,
      cancelled: XCircle,
    };

    return {
      variant: variants[status] || "outline",
      icon: icons[status] || FileText,
    };
  };

  const getConditionDisplay = (condition) => {
    const conditions = {
      good: "Good Condition",
      damaged: "Damaged",
      defective: "Defective",
      expired: "Expired",
      opened: "Opened/Used",
    };
    return conditions[condition] || condition;
  };

  const canBeApproved = (returnItem) => {
    return returnItem.status === "pending_approval";
  };

  const canBeCompleted = (returnItem) => {
    return returnItem.status === "approved";
  };

  const canBeEdited = (returnItem) => {
    return ["draft", "rejected"].includes(returnItem.status);
  };

  // Loading skeleton
  if (loading) {
    return (
      <div className="w-full space-y-4">
        <div className="flex items-center justify-between">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-10 w-32" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-24" />
          ))}
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
            Returns Management
          </h1>
          <p className="text-sm text-muted-foreground">
            Manage product returns, approvals, and refund processing
          </p>
        </div>
        <div className="flex gap-2 mt-2 sm:mt-0">
          <Button onClick={openCreateDialog} size="sm">
            <Plus className="mr-2 h-4 w-4" />
            New Return
          </Button>
          <Button onClick={loadData} variant="outline" size="sm">
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      {returnSummary && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Total Returns
                  </p>
                  <p className="text-2xl font-bold">
                    {returnSummary.total_returns}
                  </p>
                </div>
                <Package className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Total Amount
                  </p>
                  <p className="text-2xl font-bold text-red-600">
                    Ksh{" "}
                    {parseFloat(
                      returnSummary.total_return_amount || 0
                    ).toLocaleString()}
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
                    Pending Approval
                  </p>
                  <p className="text-2xl font-bold text-orange-600">
                    {returnSummary.pending_approvals}
                  </p>
                </div>
                <Clock className="h-8 w-8 text-orange-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Return Rate
                  </p>
                  <p className="text-2xl font-bold text-purple-600">
                    {parseFloat(
                      returnSummary.return_rate_percentage || 0
                    ).toFixed(1)}
                    %
                  </p>
                </div>
                <ArrowLeftRight className="h-8 w-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filters */}
      <Card>
        <CardContent className="pt-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            <div className="relative md:col-span-2">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by return reference, invoice, or customer..."
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
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="pending_approval">
                  Pending Approval
                </SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>

            <Select value={customerFilter} onValueChange={setCustomerFilter}>
              <SelectTrigger className="h-9">
                <SelectValue placeholder="All Customers" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Customers</SelectItem>
                {customers.map((customer) => (
                  <SelectItem key={customer.id} value={customer.id.toString()}>
                    {customer.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Returns Table */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Return Requests</CardTitle>
          <CardDescription className="text-sm">
            {filteredReturns.length} return(s) found
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-0 p-0">
          <div className="border rounded-md overflow-hidden">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead className="font-semibold">Return #</TableHead>
                    <TableHead className="font-semibold">Invoice</TableHead>
                    <TableHead className="font-semibold">Customer</TableHead>
                    <TableHead className="font-semibold hidden lg:table-cell">
                      Reason
                    </TableHead>
                    <TableHead className="font-semibold">Amount</TableHead>
                    <TableHead className="font-semibold">Status</TableHead>
                    <TableHead className="font-semibold hidden xl:table-cell">
                      Created
                    </TableHead>
                    <TableHead className="font-semibold text-right">
                      Actions
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredReturns.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-6">
                        <div className="flex flex-col items-center gap-2">
                          <Package className="h-8 w-8 text-muted-foreground" />
                          <p className="text-sm text-muted-foreground">
                            No returns found
                          </p>
                          {(searchTerm ||
                            statusFilter !== "all" ||
                            customerFilter !== "all") && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setSearchTerm("");
                                setStatusFilter("all");
                                setCustomerFilter("all");
                              }}
                            >
                              Clear filters
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredReturns.map((returnItem) => {
                      const statusBadge = getStatusBadge(returnItem.status);
                      const StatusIcon = statusBadge.icon;

                      return (
                        <TableRow
                          key={returnItem.id}
                          className="hover:bg-muted/30"
                        >
                          <TableCell>
                            <div className="font-medium text-sm">
                              {returnItem.return_reference}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="text-sm">
                              {returnItem.original_invoice_reference}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="text-sm">
                              {returnItem.customer_name}
                            </div>
                          </TableCell>
                          <TableCell className="hidden lg:table-cell">
                            <div className="text-sm text-muted-foreground">
                              {getReasonDisplay(returnItem.return_reason)}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1 font-semibold text-red-600">
                              <DollarSign className="h-3 w-3" />
                              Ksh{" "}
                              {parseFloat(
                                returnItem.total_return_amount || 0
                              ).toLocaleString()}
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant={statusBadge.variant}
                              className="text-xs"
                            >
                              <StatusIcon className="h-3 w-3 mr-1" />
                              {getStatusDisplay(returnItem.status)}
                            </Badge>
                          </TableCell>
                          <TableCell className="hidden xl:table-cell">
                            <div className="flex items-center gap-1 text-sm text-muted-foreground">
                              <Calendar className="h-3 w-3" />
                              {new Date(
                                returnItem.created_at
                              ).toLocaleDateString()}
                            </div>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-1">
                              <Button
                                onClick={() => openViewDialog(returnItem)}
                                size="sm"
                                variant="outline"
                                className="h-7 px-2"
                              >
                                <Eye className="h-3 w-3" />
                              </Button>

                              {canBeEdited(returnItem) && (
                                <Button
                                  onClick={() => openEditDialog(returnItem)}
                                  size="sm"
                                  variant="outline"
                                  className="h-7 px-2"
                                >
                                  <Edit className="h-3 w-3" />
                                </Button>
                              )}

                              {canBeApproved(returnItem) && (
                                <>
                                  <Button
                                    onClick={() =>
                                      setApprovalDialog({
                                        open: true,
                                        return: returnItem,
                                        action: "approve",
                                      })
                                    }
                                    size="sm"
                                    variant="outline"
                                    className="h-7 px-2 text-green-600"
                                  >
                                    <CheckCircle className="h-3 w-3" />
                                  </Button>
                                  <Button
                                    onClick={() =>
                                      setApprovalDialog({
                                        open: true,
                                        return: returnItem,
                                        action: "reject",
                                      })
                                    }
                                    size="sm"
                                    variant="outline"
                                    className="h-7 px-2 text-red-600"
                                  >
                                    <XCircle className="h-3 w-3" />
                                  </Button>
                                </>
                              )}

                              {canBeCompleted(returnItem) && (
                                <Button
                                  onClick={() =>
                                    setCompletionDialog({
                                      open: true,
                                      return: returnItem,
                                    })
                                  }
                                  size="sm"
                                  variant="outline"
                                  className="h-7 px-2 text-blue-600"
                                >
                                  Complete
                                </Button>
                              )}
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

      {/* Create/Edit Return Dialog */}
      <Dialog
        open={returnDialog.open}
        onOpenChange={(open) => setReturnDialog({ ...returnDialog, open })}
      >
        <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-lg">
              {returnDialog.mode === "create"
                ? "Create Return Request"
                : "Edit Return Request"}
            </DialogTitle>
            <DialogDescription className="text-sm">
              {returnDialog.mode === "create"
                ? "Create a new return request for customer items"
                : `Update return request for ${returnDialog.return?.return_reference}`}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleReturnSubmit}>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="original_invoice" className="text-sm">
                    Original Invoice *
                  </Label>
                  <Select
                    value={returnForm.original_invoice}
                    onValueChange={(value) => {
                      const selectedInvoice = invoices.find(
                        (inv) => inv.id.toString() === value
                      );

                      if (selectedInvoice) {
                        // Get customer ID - try multiple possible locations
                        const customerId =
                          selectedInvoice.customer;
                        // Get store ID - try multiple possible locations
                        const storeId =
                          selectedInvoice.store;

                        console.log("Auto-populating:", {
                          invoiceId: value,
                          customerId,
                          storeId,
                          invoice: selectedInvoice,
                        });

                        setReturnForm((prev) => ({
                          ...prev,
                          original_invoice: value,
                          customer: customerId ? customerId.toString() : "",
                          store: storeId ? storeId.toString() : "",
                        }));
                      } else {
                        // If invoice not found, just update the invoice field
                        setReturnForm((prev) => ({
                          ...prev,
                          original_invoice: value,
                        }));
                      }
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select invoice" />
                    </SelectTrigger>
                    <SelectContent>
                      {invoices.map((invoice) => (
                        <SelectItem
                          key={invoice.id}
                          value={invoice.id.toString()}
                        >
                          {invoice.reference_no} - {invoice.customer_name} (Ksh{" "}
                          {parseFloat(
                            invoice.total_amount || 0
                          ).toLocaleString()}
                          )
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {formErrors.original_invoice && (
                    <p className="text-xs text-destructive">
                      {formErrors.original_invoice}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="return_reason" className="text-sm">
                    Return Reason *
                  </Label>
                  <Select
                    value={returnForm.return_reason}
                    onValueChange={(value) =>
                      setReturnForm({ ...returnForm, return_reason: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="defective">Defective Item</SelectItem>
                      <SelectItem value="wrong_item">
                        Wrong Item Delivered
                      </SelectItem>
                      <SelectItem value="customer_request">
                        Customer Request
                      </SelectItem>
                      <SelectItem value="expired">Expired Product</SelectItem>
                      <SelectItem value="damaged">
                        Damaged in Transit
                      </SelectItem>
                      <SelectItem value="quality_issue">
                        Quality Issue
                      </SelectItem>
                      <SelectItem value="overcharge">
                        Overcharge Correction
                      </SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                  {formErrors.return_reason && (
                    <p className="text-xs text-destructive">
                      {formErrors.return_reason}
                    </p>
                  )}
                </div>
              </div>

              {/* Return Items Section */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label className="text-sm">Return Items *</Label>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      returnForm.original_invoice &&
                      openItemsDialog(returnForm.original_invoice)
                    }
                    disabled={!returnForm.original_invoice}
                  >
                    <Plus className="h-3 w-3 mr-1" />
                    Add Items
                  </Button>
                </div>

                {formErrors.lines && (
                  <p className="text-xs text-destructive">{formErrors.lines}</p>
                )}

                {returnForm.lines.length === 0 ? (
                  <div className="border-2 border-dashed rounded-lg p-8 text-center">
                    <Package className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground">
                      No items added to return
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Select an invoice first to add returnable items
                    </p>
                  </div>
                ) : (
                  <div className="border rounded-md">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Item</TableHead>
                          <TableHead>Original Qty</TableHead>
                          <TableHead>Return Qty</TableHead>
                          <TableHead>Unit Price</TableHead>
                          <TableHead>Condition</TableHead>
                          <TableHead>Action</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {returnForm.lines.map((line, index) => (
                          <TableRow key={index}>
                            <TableCell>Item #{line.item}</TableCell>
                            <TableCell>{line.original_quantity}</TableCell>
                            <TableCell>
                              <Input
                                type="number"
                                min="1"
                                max={line.original_quantity}
                                value={line.quantity_returned}
                                onChange={(e) =>
                                  updateReturnLine(
                                    index,
                                    "quantity_returned",
                                    parseInt(e.target.value)
                                  )
                                }
                                className="h-8 w-20"
                              />
                            </TableCell>
                            <TableCell>
                              Ksh{" "}
                              {parseFloat(
                                line.return_unit_price || 0
                              ).toLocaleString()}
                            </TableCell>
                            <TableCell>
                              <Select
                                value={line.condition}
                                onValueChange={(value) =>
                                  updateReturnLine(index, "condition", value)
                                }
                              >
                                <SelectTrigger className="h-8">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="good">Good</SelectItem>
                                  <SelectItem value="damaged">
                                    Damaged
                                  </SelectItem>
                                  <SelectItem value="defective">
                                    Defective
                                  </SelectItem>
                                  <SelectItem value="expired">
                                    Expired
                                  </SelectItem>
                                  <SelectItem value="opened">
                                    Opened/Used
                                  </SelectItem>
                                </SelectContent>
                              </Select>
                            </TableCell>
                            <TableCell>
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => removeReturnLine(index)}
                                className="h-8 text-red-600"
                              >
                                Remove
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes" className="text-sm">
                  Notes
                </Label>
                <Textarea
                  id="notes"
                  value={returnForm.notes}
                  onChange={(e) =>
                    setReturnForm({ ...returnForm, notes: e.target.value })
                  }
                  placeholder="Additional notes about the return"
                  className="min-h-[80px]"
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() =>
                  setReturnDialog({ open: false, mode: "create", return: null })
                }
              >
                Cancel
              </Button>
              <Button type="submit">
                {returnDialog.mode === "create"
                  ? "Create Return"
                  : "Update Return"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Returnable Items Dialog */}
      <Dialog
        open={itemsDialog.open}
        onOpenChange={(open) => setItemsDialog({ ...itemsDialog, open })}
      >
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle className="text-lg">
              Select Items to Return
            </DialogTitle>
            <DialogDescription className="text-sm">
              Choose items from the invoice to include in the return
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {itemsDialog.returnableItems.length === 0 ? (
              <div className="text-center py-8">
                <Package className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">
                  No returnable items found
                </p>
                <p className="text-xs text-muted-foreground">
                  All items from this invoice may have already been returned
                </p>
              </div>
            ) : (
              <div className="border rounded-md">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Item Name</TableHead>
                      <TableHead>Original Qty</TableHead>
                      <TableHead>Returnable Qty</TableHead>
                      <TableHead>Unit Price</TableHead>
                      <TableHead>Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {itemsDialog.returnableItems.map((item) => (
                      <TableRow key={item.line_id}>
                        <TableCell>{item.item_name}</TableCell>
                        <TableCell>{item.original_quantity}</TableCell>
                        <TableCell>{item.returnable_quantity}</TableCell>
                        <TableCell>
                          Ksh{" "}
                          {parseFloat(item.unit_price || 0).toLocaleString()}
                        </TableCell>
                        <TableCell>
                          <Button
                            size="sm"
                            onClick={() => {
                              addReturnLine(item);
                              toast.success("Item added to return");
                            }}
                            disabled={returnForm.lines.some(
                              (line) => line.original_line === item.line_id
                            )}
                          >
                            {returnForm.lines.some(
                              (line) => line.original_line === item.line_id
                            )
                              ? "Added"
                              : "Add"}
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() =>
                setItemsDialog({
                  open: false,
                  invoiceId: null,
                  returnableItems: [],
                })
              }
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Return Details Dialog */}
      <Dialog
        open={viewDialog.open}
        onOpenChange={(open) => setViewDialog({ ...viewDialog, open })}
      >
        <DialogContent className="sm:max-w-[700px] max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-lg">Return Details</DialogTitle>
            <DialogDescription className="text-sm">
              {viewDialog.return?.return_reference}
            </DialogDescription>
          </DialogHeader>
          {viewDialog.return && (
            <div className="space-y-6">
              {/* Return Information */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-xs font-medium text-muted-foreground">
                    Return Reference
                  </Label>
                  <p className="text-sm font-semibold">
                    {viewDialog.return.return_reference}
                  </p>
                </div>
                <div>
                  <Label className="text-xs font-medium text-muted-foreground">
                    Original Invoice
                  </Label>
                  <p className="text-sm font-semibold">
                    {viewDialog.return.original_invoice_reference}
                  </p>
                </div>
                <div>
                  <Label className="text-xs font-medium text-muted-foreground">
                    Customer
                  </Label>
                  <p className="text-sm">{viewDialog.return.customer_name}</p>
                </div>
                <div>
                  <Label className="text-xs font-medium text-muted-foreground">
                    Store
                  </Label>
                  <p className="text-sm">{viewDialog.return.store_name}</p>
                </div>
                <div>
                  <Label className="text-xs font-medium text-muted-foreground">
                    Return Reason
                  </Label>
                  <p className="text-sm">
                    {getReasonDisplay(viewDialog.return.return_reason)}
                  </p>
                </div>
                <div>
                  <Label className="text-xs font-medium text-muted-foreground">
                    Status
                  </Label>
                  <div className="mt-1">
                    <Badge
                      variant={getStatusBadge(viewDialog.return.status).variant}
                      className="text-xs"
                    >
                      {getStatusDisplay(viewDialog.return.status)}
                    </Badge>
                  </div>
                </div>
              </div>

              {/* Financial Information */}
              <div className="grid grid-cols-3 gap-4 p-4 bg-muted/30 rounded-lg">
                <div>
                  <Label className="text-xs font-medium text-muted-foreground">
                    Total Return Amount
                  </Label>
                  <p className="text-lg font-bold text-red-600">
                    Ksh{" "}
                    {parseFloat(
                      viewDialog.return.total_return_amount || 0
                    ).toLocaleString()}
                  </p>
                </div>
                <div>
                  <Label className="text-xs font-medium text-muted-foreground">
                    Restocking Fee
                  </Label>
                  <p className="text-sm font-semibold">
                    Ksh{" "}
                    {parseFloat(
                      viewDialog.return.restocking_fee || 0
                    ).toLocaleString()}
                  </p>
                </div>
                <div>
                  <Label className="text-xs font-medium text-muted-foreground">
                    Refund Amount
                  </Label>
                  <p className="text-lg font-bold text-green-600">
                    Ksh{" "}
                    {parseFloat(
                      viewDialog.return.refund_amount || 0
                    ).toLocaleString()}
                  </p>
                </div>
              </div>

              {/* Return Items */}
              <div>
                <Label className="text-sm font-medium">Return Items</Label>
                {viewDialog.returnItems.length === 0 ? (
                  <p className="text-sm text-muted-foreground mt-2">
                    No items loaded
                  </p>
                ) : (
                  <div className="border rounded-md mt-2">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Item</TableHead>
                          <TableHead>SKU</TableHead>
                          <TableHead>Quantity</TableHead>
                          <TableHead>Condition</TableHead>
                          <TableHead>Unit Price</TableHead>
                          <TableHead>Total</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {viewDialog.returnItems.map((item, index) => (
                          <TableRow key={index}>
                            <TableCell>{item.item_name}</TableCell>
                            <TableCell>{item.item_sku}</TableCell>
                            <TableCell>{item.quantity_returned}</TableCell>
                            <TableCell>
                              <Badge variant="outline" className="text-xs">
                                {getConditionDisplay(item.condition)}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              Ksh{" "}
                              {parseFloat(
                                item.return_unit_price || 0
                              ).toLocaleString()}
                            </TableCell>
                            <TableCell>
                              Ksh{" "}
                              {parseFloat(
                                item.line_return_total || 0
                              ).toLocaleString()}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </div>

              {/* Timestamps and Users */}
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <Label className="text-xs font-medium text-muted-foreground">
                    Created By
                  </Label>
                  <p>{viewDialog.return.created_by_name}</p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(viewDialog.return.created_at).toLocaleString()}
                  </p>
                </div>
                {viewDialog.return.approved_by_name && (
                  <div>
                    <Label className="text-xs font-medium text-muted-foreground">
                      Approved By
                    </Label>
                    <p>{viewDialog.return.approved_by_name}</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(viewDialog.return.approved_at).toLocaleString()}
                    </p>
                  </div>
                )}
                {viewDialog.return.processed_by_name && (
                  <div>
                    <Label className="text-xs font-medium text-muted-foreground">
                      Processed By
                    </Label>
                    <p>{viewDialog.return.processed_by_name}</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(
                        viewDialog.return.completed_at
                      ).toLocaleString()}
                    </p>
                  </div>
                )}
              </div>

              {/* Notes */}
              {viewDialog.return.notes && (
                <div>
                  <Label className="text-sm font-medium">Notes</Label>
                  <div className="mt-2 p-3 bg-muted/30 rounded-md">
                    <p className="text-sm">{viewDialog.return.notes}</p>
                  </div>
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() =>
                setViewDialog({ open: false, return: null, returnItems: [] })
              }
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Approval/Rejection Dialog */}
      <Dialog
        open={approvalDialog.open}
        onOpenChange={(open) => setApprovalDialog({ ...approvalDialog, open })}
      >
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="text-lg">
              {approvalDialog.action === "approve"
                ? "Approve Return"
                : "Reject Return"}
            </DialogTitle>
            <DialogDescription className="text-sm">
              {approvalDialog.action === "approve"
                ? `Approve return request ${approvalDialog.return?.return_reference}`
                : `Reject return request ${approvalDialog.return?.return_reference}`}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleApproval}>
            <div className="space-y-4 py-4">
              {approvalDialog.return && (
                <div className="p-4 bg-muted/30 rounded-lg">
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <Label className="text-xs font-medium text-muted-foreground">
                        Return Amount
                      </Label>
                      <p className="font-semibold text-red-600">
                        Ksh{" "}
                        {parseFloat(
                          approvalDialog.return.total_return_amount || 0
                        ).toLocaleString()}
                      </p>
                    </div>
                    <div>
                      <Label className="text-xs font-medium text-muted-foreground">
                        Customer
                      </Label>
                      <p>{approvalDialog.return.customer_name}</p>
                    </div>
                    <div>
                      <Label className="text-xs font-medium text-muted-foreground">
                        Reason
                      </Label>
                      <p>
                        {getReasonDisplay(approvalDialog.return.return_reason)}
                      </p>
                    </div>
                    <div>
                      <Label className="text-xs font-medium text-muted-foreground">
                        Created
                      </Label>
                      <p>
                        {new Date(
                          approvalDialog.return.created_at
                        ).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {approvalDialog.action === "approve" ? (
                <div className="space-y-2">
                  <Label htmlFor="approval_notes" className="text-sm">
                    Approval Notes
                  </Label>
                  <Textarea
                    id="approval_notes"
                    value={approvalForm.notes}
                    onChange={(e) =>
                      setApprovalForm({
                        ...approvalForm,
                        notes: e.target.value,
                      })
                    }
                    placeholder="Optional notes about the approval"
                    className="min-h-[80px]"
                  />
                </div>
              ) : (
                <div className="space-y-2">
                  <Label htmlFor="rejection_reason" className="text-sm">
                    Rejection Reason *
                  </Label>
                  <Textarea
                    id="rejection_reason"
                    value={approvalForm.rejection_reason}
                    onChange={(e) =>
                      setApprovalForm({
                        ...approvalForm,
                        rejection_reason: e.target.value,
                      })
                    }
                    placeholder="Please explain why this return is being rejected"
                    className="min-h-[80px]"
                    required
                  />
                </div>
              )}

              <div className="flex items-start gap-2 p-3 bg-blue-50 rounded-lg">
                <AlertCircle className="h-4 w-4 text-blue-600 mt-0.5" />
                <div className="text-sm">
                  <p className="font-medium text-blue-900">
                    {approvalDialog.action === "approve"
                      ? "Approval Confirmation"
                      : "Rejection Confirmation"}
                  </p>
                  <p className="text-blue-700">
                    {approvalDialog.action === "approve"
                      ? "This will approve the return and allow it to be processed for refund."
                      : "This will reject the return request and notify the requester."}
                  </p>
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() =>
                  setApprovalDialog({
                    open: false,
                    return: null,
                    action: "approve",
                  })
                }
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant={
                  approvalDialog.action === "approve"
                    ? "default"
                    : "destructive"
                }
              >
                {approvalDialog.action === "approve"
                  ? "Approve Return"
                  : "Reject Return"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Completion Dialog */}
      <Dialog
        open={completionDialog.open}
        onOpenChange={(open) =>
          setCompletionDialog({ ...completionDialog, open })
        }
      >
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="text-lg">
              Complete Return Processing
            </DialogTitle>
            <DialogDescription className="text-sm">
              Process return {completionDialog.return?.return_reference} and
              update inventory
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleCompletion}>
            <div className="space-y-4 py-4">
              {completionDialog.return && (
                <div className="p-4 bg-muted/30 rounded-lg">
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <Label className="text-xs font-medium text-muted-foreground">
                        Refund Amount
                      </Label>
                      <p className="text-lg font-bold text-green-600">
                        Ksh{" "}
                        {parseFloat(
                          completionDialog.return.refund_amount || 0
                        ).toLocaleString()}
                      </p>
                    </div>
                    <div>
                      <Label className="text-xs font-medium text-muted-foreground">
                        Customer
                      </Label>
                      <p>{completionDialog.return.customer_name}</p>
                    </div>
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="completion_notes" className="text-sm">
                  Processing Notes
                </Label>
                <Textarea
                  id="completion_notes"
                  value={completionForm.notes}
                  onChange={(e) => setCompletionForm({ notes: e.target.value })}
                  placeholder="Optional notes about the return processing"
                  className="min-h-[80px]"
                />
              </div>

              <div className="flex items-start gap-2 p-3 bg-green-50 rounded-lg">
                <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
                <div className="text-sm">
                  <p className="font-medium text-green-900">
                    Processing Confirmation
                  </p>
                  <p className="text-green-700">
                    This will complete the return process, update inventory, and
                    credit the customer account.
                  </p>
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() =>
                  setCompletionDialog({ open: false, return: null })
                }
              >
                Cancel
              </Button>
              <Button type="submit">Complete Return</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
