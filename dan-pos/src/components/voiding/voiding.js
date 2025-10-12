// "use client";

// import { useState, useEffect } from 'react';
// import {
//   Dialog,
//   DialogContent,
//   DialogDescription,
//   DialogFooter,
//   DialogHeader,
//   DialogTitle,
// } from "@/components/ui/dialog";
// import { Button } from "@/components/ui/button";
// import { Textarea } from "@/components/ui/textarea";
// import { Label } from "@/components/ui/label";
// import { Badge } from "@/components/ui/badge";
// import { 
//   AlertTriangle, 
//   CheckCircle, 
//   XCircle, 
//   Package, 
//   DollarSign, 
//   ArrowLeftRight,
//   User,
//   Calendar,
//   FileText,
//   RefreshCw
// } from 'lucide-react';
// import { toast } from 'react-toastify';
// import { voidSaleInvoice, voidCustomerPayment, voidSaleReturn } from '@/lib/api/sales';
// import { getCurrentUser } from '@/services/auth';

// export function VoidDialog({ 
//   open, 
//   onOpenChange, 
//   transaction,
//   onVoidSuccess,
//   // getCurrentUser 
// }) {
//   const [loading, setLoading] = useState(false);
//   const [checking, setChecking] = useState(false);
//   const [reason, setReason] = useState('');
//   const [voidCheck, setVoidCheck] = useState(null);
//   const [currentUser, setCurrentUser] = useState(null);
//   const [transactionType, setTransactionType] = useState('');

//   // Transaction type configuration
//   const transactionTypes = {
//     'sale_invoice': {
//       name: 'Sale Invoice',
//       icon: FileText,
//       color: 'blue',
//       description: 'Void a completed sale transaction',
//     },
//     'customer_payment': {
//       name: 'Customer Payment',
//       icon: DollarSign,
//       color: 'green',
//       description: 'Void a customer payment',
//     },
//     'sale_return': {
//       name: 'Sale Return',
//       icon: ArrowLeftRight,
//       color: 'orange',
//       description: 'Void a completed return',
//     }
//   };

//   // Auto-detect transaction type
//   useEffect(() => {
//     if (transaction) {
//       if (transaction.reference_no) {
//         setTransactionType('sale_invoice');
//       } else if (transaction.payment_reference) {
//         setTransactionType('customer_payment');
//       } else if (transaction.return_reference) {
//         setTransactionType('sale_return');
//       } else if (transaction._type) {
//         setTransactionType(transaction._type);
//       }
//     }
//   }, [transaction]);

//   // Load current user
//   useEffect(() => {
//     const loadCurrentUser = async () => {
//       if (open && getCurrentUser) {
//         try {
//           const user = await getCurrentUser();
//           setCurrentUser(user);
//         } catch (error) {
//           console.error('Failed to load current user:', error);
//           toast.error('Failed to load user information');
//         }
//       }
//     };
//     loadCurrentUser();
//   }, [open, getCurrentUser]);

//   const handleOpenChange = (open) => {
//     if (!open) {
//       setReason('');
//       setVoidCheck(null);
//       setLoading(false);
//       setChecking(false);
//     }
//     onOpenChange(open);
//   };

//   const getTransactionDetails = () => {
//     if (!transaction) return null;

//     const typeConfig = transactionTypes[transactionType];
    
//     return {
//       reference: transaction.reference_no || transaction.payment_reference || transaction.return_reference,
//       amount: transaction.total_amount || transaction.amount || transaction.total_return_amount || 0,
//       customer: transaction.customer_name,
//       date: transaction.created_at || transaction.received_at,
//       status: transaction.status,
//       is_voided: transaction.is_voided,
//       icon: typeConfig?.icon || FileText,
//       color: typeConfig?.color || 'gray'
//     };
//   };

//   const checkVoidEligibility = async () => {
//     if (!transaction) return;

//     try {
//       setChecking(true);
      
//       const details = getTransactionDetails();
//       let canVoid = true;
//       let reason = '';

//       if (details.is_voided) {
//         canVoid = false;
//         reason = 'Transaction is already voided';
//       } else if (transactionType === 'sale_invoice' && transaction.status !== 'completed') {
//         canVoid = false;
//         reason = 'Only completed invoices can be voided';
//       } else if (transactionType === 'sale_return' && transaction.status !== 'completed') {
//         canVoid = false;
//         reason = 'Only completed returns can be voided';
//       } else {
//         canVoid = true;
//         reason = 'Transaction can be voided';
//       }

//       setVoidCheck({ canVoid, reason });
//     } catch (error) {
//       toast.error('Failed to check void eligibility');
//     } finally {
//       setChecking(false);
//     }
//   };

//   const handleVoid = async (e) => {
//     e.preventDefault();
    
//     if (!currentUser) {
//       toast.error('User information not available');
//       return;
//     }

//     if (reason.length < 10) {
//       toast.error('Please provide a detailed reason (minimum 10 characters)');
//       return;
//     }

//     if (voidCheck && !voidCheck.canVoid) {
//       toast.error('This transaction cannot be voided');
//       return;
//     }

//     try {
//       setLoading(true);

//       const voidData = {
//         reason: reason.trim(),
//         voided_by: currentUser.id
//       };

//       let result;

//       // Call appropriate void function based on transaction type
//       switch (transactionType) {
//         case 'sale_invoice':
//           result = await voidSaleInvoice(transaction.id, voidData);
//           break;
          
//         case 'customer_payment':
//           result = await voidCustomerPayment(transaction.id, voidData);
//           break;
          
//         case 'sale_return':
//           result = await voidSaleReturn(transaction.id, voidData);
//           break;
          
//         default:
//           throw new Error('Unknown transaction type');
//       }

//       toast.success(result.message || 'Transaction voided successfully');
//       handleOpenChange(false);
      
//       // Notify parent component
//       if (onVoidSuccess) {
//         onVoidSuccess(transaction.id, transactionType);
//       }
      
//     } catch (error) {
//       console.error('Void error:', error);
//       toast.error(error.message || 'Failed to void transaction');
//     } finally {
//       setLoading(false);
//     }
//   };

//   const getConsequences = () => {
//     switch (transactionType) {
//       case 'sale_invoice':
//         return [
//           'All sold items will be returned to inventory',
//           'Any payment allocations will be reversed',
//           'Customer balance will be updated (for credit sales)',
//           'Transaction will be permanently marked as voided',
//           'Stock levels will be increased accordingly'
//         ];
        
//       case 'customer_payment':
//         return [
//           'Payment allocations to invoices will be reversed',
//           'Customer balance will be updated',
//           'Payment amount will be set to zero',
//           'Invoice balances will be recalculated',
//           'Payment will be marked as voided in records'
//         ];
        
//       case 'sale_return':
//         return [
//           'Returned items will be removed from inventory',
//           'Customer credit will be reversed',
//           'Customer balance will be updated',
//           'Return transaction will be marked as voided',
//           'Stock levels will be decreased accordingly'
//         ];
        
//       default:
//         return ['Transaction will be reversed and marked as voided'];
//     }
//   };

//   const getStatusBadge = (status) => {
//     const statusConfig = {
//       'completed': { variant: 'default', label: 'Completed' },
//       'draft': { variant: 'outline', label: 'Draft' },
//       'pending_approval': { variant: 'secondary', label: 'Pending Approval' },
//       'approved': { variant: 'default', label: 'Approved' },
//       'rejected': { variant: 'destructive', label: 'Rejected' },
//       'voided': { variant: 'destructive', label: 'Voided' }
//     };
    
//     const config = statusConfig[status] || { variant: 'outline', label: status };
//     return <Badge variant={config.variant}>{config.label}</Badge>;
//   };

//   if (!transaction) return null;

//   const details = getTransactionDetails();
//   const typeConfig = transactionTypes[transactionType];
//   const consequences = getConsequences();

//   return (
//     <Dialog open={open} onOpenChange={handleOpenChange}>
//       <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
//         <DialogHeader>
//           <DialogTitle className="flex items-center gap-2 text-red-600">
//             <AlertTriangle className="h-5 w-5" />
//             Void Transaction
//           </DialogTitle>
//           <DialogDescription className="text-sm">
//             This action cannot be undone. Please review all details carefully before proceeding.
//           </DialogDescription>
//         </DialogHeader>

//         <div className="space-y-6">
//           {/* Transaction Type & Basic Info */}
//           <div className="p-4 bg-muted/30 rounded-lg">
//             <div className="flex items-center gap-3 mb-3">
//               {typeConfig && <typeConfig.icon className={`h-5 w-5 text-${typeConfig.color}-500`} />}
//               <div>
//                 <h4 className="font-semibold text-sm">
//                   {typeConfig?.name || 'Transaction'}
//                 </h4>
//                 <p className="text-xs text-muted-foreground">
//                   {typeConfig?.description}
//                 </p>
//               </div>
//             </div>
            
//             <div className="grid grid-cols-2 gap-4 text-sm">
//               <div>
//                 <Label className="text-xs font-medium text-muted-foreground">Reference</Label>
//                 <p className="font-semibold font-mono">{details.reference}</p>
//               </div>
              
//               <div>
//                 <Label className="text-xs font-medium text-muted-foreground">Amount</Label>
//                 <p className="font-semibold text-red-600 flex items-center gap-1">
//                   <DollarSign className="h-3 w-3" />
//                   Ksh {parseFloat(details.amount).toLocaleString()}
//                 </p>
//               </div>
              
//               {details.customer && (
//                 <div className="col-span-2">
//                   <Label className="text-xs font-medium text-muted-foreground">Customer</Label>
//                   <p className="flex items-center gap-1">
//                     <User className="h-3 w-3" />
//                     {details.customer}
//                   </p>
//                 </div>
//               )}
              
//               <div>
//                 <Label className="text-xs font-medium text-muted-foreground">Date</Label>
//                 <p className="flex items-center gap-1">
//                   <Calendar className="h-3 w-3" />
//                   {new Date(details.date).toLocaleDateString()}
//                 </p>
//               </div>
              
//               <div>
//                 <Label className="text-xs font-medium text-muted-foreground">Status</Label>
//                 <div className="mt-1">
//                   {getStatusBadge(details.status)}
//                 </div>
//               </div>
//             </div>
//           </div>

//           {/* Void Eligibility Check */}
//           <div className="flex items-center justify-between">
//             <div>
//               <Label className="text-sm font-medium">Void Eligibility</Label>
//               <p className="text-xs text-muted-foreground">
//                 Check if this transaction can be voided
//               </p>
//             </div>
//             <Button
//               type="button"
//               variant="outline"
//               size="sm"
//               onClick={checkVoidEligibility}
//               disabled={checking}
//             >
//               {checking ? (
//                 <RefreshCw className="h-3 w-3 animate-spin" />
//               ) : (
//                 <CheckCircle className="h-3 w-3" />
//               )}
//               <span className="ml-1">{checking ? 'Checking...' : 'Check'}</span>
//             </Button>
//           </div>

//           {voidCheck && (
//             <div className={`p-3 rounded-lg border ${
//               voidCheck.canVoid ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'
//             }`}>
//               <div className="flex items-start gap-2">
//                 {voidCheck.canVoid ? (
//                   <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
//                 ) : (
//                   <XCircle className="h-4 w-4 text-red-600 mt-0.5" />
//                 )}
//                 <div className="text-sm">
//                   <p className={`font-medium ${voidCheck.canVoid ? 'text-green-900' : 'text-red-900'}`}>
//                     {voidCheck.canVoid ? 'Eligible for Void' : 'Cannot Be Voided'}
//                   </p>
//                   <p className={voidCheck.canVoid ? 'text-green-700' : 'text-red-700'}>
//                     {voidCheck.reason}
//                   </p>
//                 </div>
//               </div>
//             </div>
//           )}

//           {/* Void Reason */}
//           <div className="space-y-3">
//             <div>
//               <Label htmlFor="void-reason" className="text-sm font-medium">
//                 Void Reason *
//               </Label>
//               <p className="text-xs text-muted-foreground">
//                 Provide a detailed explanation for voiding this transaction
//               </p>
//             </div>
//             <Textarea
//               id="void-reason"
//               value={reason}
//               onChange={(e) => setReason(e.target.value)}
//               placeholder="Example: Transaction was created by mistake, customer returned all items, duplicate payment detected..."
//               className="min-h-[120px] resize-none"
//               required
//             />
//             <div className="flex justify-between text-xs">
//               <span className="text-muted-foreground">
//                 Minimum 10 characters required
//               </span>
//               <span className={reason.length < 10 ? 'text-red-500' : 'text-green-500'}>
//                 {reason.length}/10
//               </span>
//             </div>
//           </div>

//           {/* Current User Info */}
//           {currentUser && (
//             <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
//               <div className="flex items-center gap-2 text-sm">
//                 <User className="h-3 w-3 text-blue-600" />
//                 <span className="font-medium text-blue-900">Voiding as:</span>
//                 <span className="text-blue-700">
//                   {currentUser.first_name} {currentUser.last_name} ({currentUser.username})
//                 </span>
//               </div>
//             </div>
//           )}

//           {/* Consequences Warning */}
//           <div className="p-4 bg-red-50 rounded-lg border border-red-200">
//             <div className="flex items-start gap-3">
//               <AlertTriangle className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
//               <div className="text-sm">
//                 <p className="font-medium text-red-900 mb-2">
//                   Important: Consequences of Voiding
//                 </p>
//                 <ul className="space-y-1 text-red-700">
//                   {consequences.map((consequence, index) => (
//                     <li key={index} className="flex items-start gap-2">
//                       <span className="text-red-500 mt-1">•</span>
//                       <span>{consequence}</span>
//                     </li>
//                   ))}
//                 </ul>
//                 <p className="font-semibold text-red-800 mt-3">
//                   This action is permanent and cannot be reversed!
//                 </p>
//               </div>
//             </div>
//           </div>
//         </div>

//         <DialogFooter className="gap-2 sm:gap-0">
//           <Button
//             type="button"
//             variant="outline"
//             onClick={() => handleOpenChange(false)}
//             disabled={loading}
//             className="flex-1 sm:flex-none"
//           >
//             Cancel
//           </Button>
//           <Button
//             type="submit"
//             variant="destructive"
//             onClick={handleVoid}
//             disabled={
//               loading || 
//               !currentUser ||
//               reason.length < 10 ||
//               (voidCheck && !voidCheck.canVoid)
//             }
//             className="flex-1 sm:flex-none"
//           >
//             {loading ? (
//               <RefreshCw className="h-4 w-4 animate-spin mr-2" />
//             ) : (
//               <AlertTriangle className="h-4 w-4 mr-2" />
//             )}
//             {loading ? 'Voiding...' : `Void ${typeConfig?.name || 'Transaction'}`}
//           </Button>
//         </DialogFooter>
//       </DialogContent>
//     </Dialog>
//   );
// }


"use client";

import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { 
  AlertTriangle, 
  CheckCircle, 
  XCircle, 
  DollarSign, 
  ArrowLeftRight,
  User,
  Calendar,
  FileText,
  RefreshCw,
  Search,
  Filter,
  ChevronLeft,
  ChevronRight,
  List
} from 'lucide-react';
import { toast } from 'react-toastify';
import { voidSaleInvoice, voidCustomerPayment, voidSaleReturn, getSaleInvoices, getCustomerPayments, getSaleReturns } from '@/lib/api/sales';
import { getCurrentUser } from '@/services/auth';

export function VoidDialog({ 
  open, 
  onOpenChange, 
  onVoidSuccess,
}) {
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(false);
  const [reason, setReason] = useState('');
  const [voidCheck, setVoidCheck] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  
  // Transaction selection states
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [filteredTransactions, setFilteredTransactions] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [loadingTransactions, setLoadingTransactions] = useState(false);

  const itemsPerPage = 10;

  // Transaction type configuration
  const transactionTypes = {
    'sale_invoice': {
      name: 'Sale Invoice',
      icon: FileText,
      color: 'blue',
      description: 'Void a completed sale transaction',
    },
    'customer_payment': {
      name: 'Customer Payment',
      icon: DollarSign,
      color: 'green',
      description: 'Void a customer payment',
    },
    'sale_return': {
      name: 'Sale Return',
      icon: ArrowLeftRight,
      color: 'orange',
      description: 'Void a completed return',
    }
  };

  // Load transactions when dialog opens
  useEffect(() => {
    if (open) {
      loadTransactions();
      loadCurrentUser();
    } else {
      // Reset states when dialog closes
      setSelectedTransaction(null);
      setReason('');
      setVoidCheck(null);
      setSearchTerm('');
      setTypeFilter('all');
      setCurrentPage(1);
    }
  }, [open]);

  // Filter transactions based on search and type filter
  useEffect(() => {
    let filtered = transactions.filter(transaction => {
      // Search filter
      const searchLower = searchTerm.toLowerCase();
      const matchesSearch = 
        transaction.reference?.toLowerCase().includes(searchLower) ||
        transaction.customer?.toLowerCase().includes(searchLower) ||
        transaction.amount?.toString().includes(searchLower);

      // Type filter
      const matchesType = typeFilter === 'all' || transaction.type === typeFilter;

      return matchesSearch && matchesType;
    });

    setFilteredTransactions(filtered);
    setCurrentPage(1);
  }, [transactions, searchTerm, typeFilter]);

  const loadCurrentUser = async () => {
    try {
      const user = await getCurrentUser();
      setCurrentUser(user);
    } catch (error) {
      console.error('Failed to load current user:', error);
      toast.error('Failed to load user information');
    }
  };

  const loadTransactions = async () => {
    try {
      setLoadingTransactions(true);
      
      // Fetch all transaction types in parallel
      const [invoices, payments, returns] = await Promise.all([
        getSaleInvoices({ status: 'completed', is_voided: false }),
        getCustomerPayments({ is_voided: false }),
        getSaleReturns({ status: 'completed', is_voided: false })
      ]);

      // Transform data to common format
      const allTransactions = [
        ...(invoices.data || invoices).map(invoice => ({
          id: invoice.id,
          type: 'sale_invoice',
          reference: invoice.reference_no,
          customer: invoice.customer_name,
          amount: invoice.total_amount,
          date: invoice.created_at,
          status: invoice.status,
          is_voided: invoice.is_voided,
          originalData: invoice
        })),
        ...(payments.data || payments).map(payment => ({
          id: payment.id,
          type: 'customer_payment',
          reference: payment.payment_reference,
          customer: payment.customer_name,
          amount: payment.amount,
          date: payment.received_at,
          status: 'completed',
          is_voided: payment.is_voided,
          originalData: payment
        })),
        ...(returns.data || returns).map(returnItem => ({
          id: returnItem.id,
          type: 'sale_return',
          reference: returnItem.return_reference,
          customer: returnItem.customer_name,
          amount: returnItem.total_return_amount,
          date: returnItem.created_at,
          status: returnItem.status,
          is_voided: returnItem.is_voided,
          originalData: returnItem
        }))
      ];

      setTransactions(allTransactions);
    } catch (error) {
      console.error('Failed to load transactions:', error);
      toast.error('Failed to load transactions');
    } finally {
      setLoadingTransactions(false);
    }
  };

  // Pagination calculations
  const totalPages = Math.ceil(filteredTransactions.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedTransactions = filteredTransactions.slice(startIndex, startIndex + itemsPerPage);

  const handleOpenChange = (open) => {
    if (!open) {
      setSelectedTransaction(null);
      setReason('');
      setVoidCheck(null);
      setLoading(false);
      setChecking(false);
    }
    onOpenChange(open);
  };

  const getTransactionDetails = (transaction) => {
    const typeConfig = transactionTypes[transaction.type];
    
    return {
      reference: transaction.reference,
      amount: transaction.amount,
      customer: transaction.customer,
      date: transaction.date,
      status: transaction.status,
      is_voided: transaction.is_voided,
      icon: typeConfig?.icon || FileText,
      color: typeConfig?.color || 'gray'
    };
  };

  const checkVoidEligibility = async (transaction = selectedTransaction) => {
    if (!transaction) return;

    try {
      setChecking(true);
      
      const details = getTransactionDetails(transaction);
      let canVoid = true;
      let reason = '';

      if (details.is_voided) {
        canVoid = false;
        reason = 'Transaction is already voided';
      } else if (transaction.type === 'sale_invoice' && transaction.status !== 'completed') {
        canVoid = false;
        reason = 'Only completed invoices can be voided';
      } else if (transaction.type === 'sale_return' && transaction.status !== 'completed') {
        canVoid = false;
        reason = 'Only completed returns can be voided';
      } else {
        canVoid = true;
        reason = 'Transaction can be voided';
      }

      setVoidCheck({ canVoid, reason });
    } catch (error) {
      toast.error('Failed to check void eligibility');
    } finally {
      setChecking(false);
    }
  };

  const handleVoid = async (e) => {
    e.preventDefault();
    
    if (!currentUser) {
      toast.error('User information not available');
      return;
    }

    if (!selectedTransaction) {
      toast.error('Please select a transaction to void');
      return;
    }

    if (reason.length < 10) {
      toast.error('Please provide a detailed reason (minimum 10 characters)');
      return;
    }

    if (voidCheck && !voidCheck.canVoid) {
      toast.error('This transaction cannot be voided');
      return;
    }

    try {
      setLoading(true);

      const voidData = {
        reason: reason.trim(),
        voided_by: currentUser.id
      };

      let result;

      // Call appropriate void function based on transaction type
      switch (selectedTransaction.type) {
        case 'sale_invoice':
          result = await voidSaleInvoice(selectedTransaction.id, voidData);
          break;
        case 'customer_payment':
          result = await voidCustomerPayment(selectedTransaction.id, voidData);
          break;
        case 'sale_return':
          result = await voidSaleReturn(selectedTransaction.id, voidData);
          break;
        default:
          throw new Error('Unknown transaction type');
      }

      toast.success(result.message || 'Transaction voided successfully');
      handleOpenChange(false);
      
      // Notify parent component
      if (onVoidSuccess) {
        onVoidSuccess(selectedTransaction.id, selectedTransaction.type);
      }
      
      // Reload transactions to reflect the voided status
      loadTransactions();
    } catch (error) {
      console.error('Void error:', error);
      toast.error(error.message || 'Failed to void transaction');
    } finally {
      setLoading(false);
    }
  };

  const getConsequences = (transactionType) => {
    switch (transactionType) {
      case 'sale_invoice':
        return [
          'All sold items will be returned to inventory',
          'Any payment allocations will be reversed',
          'Customer balance will be updated',
          'Transaction will be permanently marked as voided'
        ];
      case 'customer_payment':
        return [
          'Payment allocations to invoices will be reversed',
          'Customer balance will be updated',
          'Payment amount will be set to zero',
          'Invoice balances will be recalculated'
        ];
      case 'sale_return':
        return [
          'Returned items will be removed from inventory',
          'Customer credit will be reversed',
          'Customer balance will be updated',
          'Return transaction will be marked as voided'
        ];
      default:
        return ['Transaction will be reversed and marked as voided'];
    }
  };

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

  const handleTransactionSelect = (transaction) => {
    setSelectedTransaction(transaction);
    setVoidCheck(null);
    setReason('');
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[900px] max-h-[95vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-red-600">
            <AlertTriangle className="h-5 w-5" />
            Void Transaction
          </DialogTitle>
          <DialogDescription className="text-sm">
            Select a transaction to void. This action cannot be undone.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Transaction Selection Section */}
          {!selectedTransaction ? (
            <div className="space-y-4">
              {/* Search and Filters */}
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search by reference, customer, amount..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                
                <select
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value)}
                  className="p-2 border rounded-md text-sm w-full sm:w-48"
                >
                  <option value="all">All Types</option>
                  <option value="sale_invoice">Sale Invoices</option>
                  <option value="customer_payment">Customer Payments</option>
                  <option value="sale_return">Sale Returns</option>
                </select>

                <Button
                  variant="outline"
                  onClick={loadTransactions}
                  disabled={loadingTransactions}
                  className="whitespace-nowrap"
                >
                  <RefreshCw className={`h-4 w-4 mr-2 ${loadingTransactions ? 'animate-spin' : ''}`} />
                  Refresh
                </Button>
              </div>

              {/* Transactions List */}
              <div className="border rounded-lg">
                {loadingTransactions ? (
                  <div className="p-8 text-center">
                    <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground">Loading transactions...</p>
                  </div>
                ) : filteredTransactions.length === 0 ? (
                  <div className="p-8 text-center">
                    <List className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">
                      {transactions.length === 0 ? 'No transactions found' : 'No transactions match your filters'}
                    </p>
                  </div>
                ) : (
                  <>
                    <div className="max-h-96 overflow-y-auto">
                      {paginatedTransactions.map((transaction) => {
                        const details = getTransactionDetails(transaction);
                        const typeConfig = transactionTypes[transaction.type];
                        return (
                          <div
                            key={`${transaction.type}-${transaction.id}`}
                            className="p-4 border-b hover:bg-muted/50 cursor-pointer transition-colors"
                            onClick={() => handleTransactionSelect(transaction)}
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                {typeConfig && (
                                  <typeConfig.icon className={`h-5 w-5 text-${typeConfig.color}-500`} />
                                )}
                                <div>
                                  <p className="font-semibold text-sm">{details.reference}</p>
                                  <p className="text-xs text-muted-foreground">{details.customer}</p>
                                </div>
                              </div>
                              
                              <div className="text-right">
                                <p className="font-semibold text-red-600">
                                  Ksh {parseFloat(details.amount).toLocaleString()}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  {new Date(details.date).toLocaleDateString()}
                                </p>
                              </div>
                            </div>
                            
                            <div className="flex items-center justify-between mt-2">
                              <Badge variant="outline" className="text-xs">
                                {typeConfig?.name}
                              </Badge>
                              {getStatusBadge(details.status)}
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* Pagination */}
                    {totalPages > 1 && (
                      <div className="flex items-center justify-between p-4 border-t">
                        <p className="text-sm text-muted-foreground">
                          Showing {startIndex + 1}-{Math.min(startIndex + itemsPerPage, filteredTransactions.length)} of {filteredTransactions.length}
                        </p>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setCurrentPage(currentPage - 1)}
                            disabled={currentPage === 1}
                          >
                            <ChevronLeft className="h-4 w-4" />
                          </Button>
                          
                          <span className="text-sm">
                            Page {currentPage} of {totalPages}
                          </span>
                          
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setCurrentPage(currentPage + 1)}
                            disabled={currentPage === totalPages}
                          >
                            <ChevronRight className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          ) : (
            /* Void Confirmation Section */
            <div className="space-y-6">
              {/* Selected Transaction Info */}
              <div className="p-4 bg-muted/30 rounded-lg">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    {transactionTypes[selectedTransaction.type] && (
  (() => {
    const IconComponent = transactionTypes[selectedTransaction.type].icon;
    return <IconComponent className={`h-5 w-5 text-${transactionTypes[selectedTransaction.type].color}-500`} />;
  })()
)}
                    <div>
                      <h4 className="font-semibold text-sm">
                        {transactionTypes[selectedTransaction.type]?.name}
                      </h4>
                      <p className="text-xs text-muted-foreground">
                        {transactionTypes[selectedTransaction.type]?.description}
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSelectedTransaction(null)}
                  >
                    Change Selection
                  </Button>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                  <div>
                    <Label className="text-xs font-medium text-muted-foreground">Reference</Label>
                    <p className="font-semibold font-mono">{selectedTransaction.reference}</p>
                  </div>
                  
                  <div>
                    <Label className="text-xs font-medium text-muted-foreground">Amount</Label>
                    <p className="font-semibold text-red-600 flex items-center gap-1">
                      <DollarSign className="h-3 w-3" />
                      Ksh {parseFloat(selectedTransaction.amount).toLocaleString()}
                    </p>
                  </div>
                  
                  <div className="sm:col-span-2">
                    <Label className="text-xs font-medium text-muted-foreground">Customer</Label>
                    <p className="flex items-center gap-1">
                      <User className="h-3 w-3" />
                      {selectedTransaction.customer}
                    </p>
                  </div>
                  
                  <div>
                    <Label className="text-xs font-medium text-muted-foreground">Date</Label>
                    <p className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {new Date(selectedTransaction.date).toLocaleDateString()}
                    </p>
                  </div>
                  
                  <div>
                    <Label className="text-xs font-medium text-muted-foreground">Status</Label>
                    <div className="mt-1">
                      {getStatusBadge(selectedTransaction.status)}
                    </div>
                  </div>
                </div>
              </div>

              {/* Void Eligibility Check */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="flex-1">
                  <Label className="text-sm font-medium">Void Eligibility</Label>
                  <p className="text-xs text-muted-foreground">
                    Check if this transaction can be voided
                  </p>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => checkVoidEligibility()}
                  disabled={checking}
                  className="sm:w-auto w-full"
                >
                  {checking ? (
                    <RefreshCw className="h-3 w-3 animate-spin" />
                  ) : (
                    <CheckCircle className="h-3 w-3" />
                  )}
                  <span className="ml-1">{checking ? 'Checking...' : 'Check'}</span>
                </Button>
              </div>

              {voidCheck && (
                <div className={`p-3 rounded-lg border ${
                  voidCheck.canVoid ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'
                }`}>
                  <div className="flex items-start gap-2">
                    {voidCheck.canVoid ? (
                      <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
                    ) : (
                      <XCircle className="h-4 w-4 text-red-600 mt-0.5" />
                    )}
                    <div className="text-sm">
                      <p className={`font-medium ${voidCheck.canVoid ? 'text-green-900' : 'text-red-900'}`}>
                        {voidCheck.canVoid ? 'Eligible for Void' : 'Cannot Be Voided'}
                      </p>
                      <p className={voidCheck.canVoid ? 'text-green-700' : 'text-red-700'}>
                        {voidCheck.reason}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Void Reason */}
              <div className="space-y-3">
                <div>
                  <Label htmlFor="void-reason" className="text-sm font-medium">
                    Void Reason *
                  </Label>
                  <p className="text-xs text-muted-foreground">
                    Provide a detailed explanation for voiding this transaction
                  </p>
                </div>
                <Textarea
                  id="void-reason"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="Example: Transaction was created by mistake, customer returned all items, duplicate payment detected..."
                  className="min-h-[120px] resize-none"
                  required
                />
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">
                    Minimum 10 characters required
                  </span>
                  <span className={reason.length < 10 ? 'text-red-500' : 'text-green-500'}>
                    {reason.length}/10
                  </span>
                </div>
              </div>

              {/* Current User Info */}
              {currentUser && (
                <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                  <div className="flex items-center gap-2 text-sm">
                    <User className="h-3 w-3 text-blue-600" />
                    <span className="font-medium text-blue-900">Voiding as:</span>
                    <span className="text-blue-700">
                      {currentUser.first_name} {currentUser.last_name} ({currentUser.username})
                    </span>
                  </div>
                </div>
              )}

              {/* Consequences Warning */}
              <div className="p-4 bg-red-50 rounded-lg border border-red-200">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
                  <div className="text-sm">
                    <p className="font-medium text-red-900 mb-2">
                      Important: Consequences of Voiding
                    </p>
                    <ul className="space-y-1 text-red-700">
                      {getConsequences(selectedTransaction.type).map((consequence, index) => (
                        <li key={index} className="flex items-start gap-2">
                          <span className="text-red-500 mt-1">•</span>
                          <span>{consequence}</span>
                        </li>
                      ))}
                    </ul>
                    <p className="font-semibold text-red-800 mt-3">
                      This action is permanent and cannot be reversed!
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="gap-2 sm:gap-0 flex-col sm:flex-row">
          <Button
            type="button"
            variant="outline"
            onClick={() => handleOpenChange(false)}
            disabled={loading}
            className="flex-1 sm:flex-none order-2 sm:order-1"
          >
            Cancel
          </Button>
          
          {selectedTransaction && (
            <Button
              type="submit"
              variant="destructive"
              onClick={handleVoid}
              disabled={
                loading || 
                !currentUser ||
                reason.length < 10 ||
                (voidCheck && !voidCheck.canVoid)
              }
              className="flex-1 sm:flex-none order-1 sm:order-2"
            >
              {loading ? (
                <RefreshCw className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <AlertTriangle className="h-4 w-4 mr-2" />
              )}
              {loading ? 'Voiding...' : `Void ${transactionTypes[selectedTransaction.type]?.name}`}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}