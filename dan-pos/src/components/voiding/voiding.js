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
import { 
  AlertTriangle, 
  CheckCircle, 
  XCircle, 
  Package, 
  DollarSign, 
  ArrowLeftRight,
  User,
  Calendar,
  FileText,
  RefreshCw
} from 'lucide-react';
import { toast } from 'react-toastify';
import { voidSaleInvoice, voidCustomerPayment, voidSaleReturn } from '@/lib/api/sales';
import { getCurrentUser } from '@/services/auth';

export function VoidDialog({ 
  open, 
  onOpenChange, 
  transaction,
  onVoidSuccess,
  // getCurrentUser 
}) {
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(false);
  const [reason, setReason] = useState('');
  const [voidCheck, setVoidCheck] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [transactionType, setTransactionType] = useState('');

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

  // Auto-detect transaction type
  useEffect(() => {
    if (transaction) {
      if (transaction.reference_no) {
        setTransactionType('sale_invoice');
      } else if (transaction.payment_reference) {
        setTransactionType('customer_payment');
      } else if (transaction.return_reference) {
        setTransactionType('sale_return');
      } else if (transaction._type) {
        setTransactionType(transaction._type);
      }
    }
  }, [transaction]);

  // Load current user
  useEffect(() => {
    const loadCurrentUser = async () => {
      if (open && getCurrentUser) {
        try {
          const user = await getCurrentUser();
          setCurrentUser(user);
        } catch (error) {
          console.error('Failed to load current user:', error);
          toast.error('Failed to load user information');
        }
      }
    };
    loadCurrentUser();
  }, [open, getCurrentUser]);

  const handleOpenChange = (open) => {
    if (!open) {
      setReason('');
      setVoidCheck(null);
      setLoading(false);
      setChecking(false);
    }
    onOpenChange(open);
  };

  const getTransactionDetails = () => {
    if (!transaction) return null;

    const typeConfig = transactionTypes[transactionType];
    
    return {
      reference: transaction.reference_no || transaction.payment_reference || transaction.return_reference,
      amount: transaction.total_amount || transaction.amount || transaction.total_return_amount || 0,
      customer: transaction.customer_name,
      date: transaction.created_at || transaction.received_at,
      status: transaction.status,
      is_voided: transaction.is_voided,
      icon: typeConfig?.icon || FileText,
      color: typeConfig?.color || 'gray'
    };
  };

  const checkVoidEligibility = async () => {
    if (!transaction) return;

    try {
      setChecking(true);
      
      const details = getTransactionDetails();
      let canVoid = true;
      let reason = '';

      if (details.is_voided) {
        canVoid = false;
        reason = 'Transaction is already voided';
      } else if (transactionType === 'sale_invoice' && transaction.status !== 'completed') {
        canVoid = false;
        reason = 'Only completed invoices can be voided';
      } else if (transactionType === 'sale_return' && transaction.status !== 'completed') {
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
      switch (transactionType) {
        case 'sale_invoice':
          result = await voidSaleInvoice(transaction.id, voidData);
          break;
          
        case 'customer_payment':
          result = await voidCustomerPayment(transaction.id, voidData);
          break;
          
        case 'sale_return':
          result = await voidSaleReturn(transaction.id, voidData);
          break;
          
        default:
          throw new Error('Unknown transaction type');
      }

      toast.success(result.message || 'Transaction voided successfully');
      handleOpenChange(false);
      
      // Notify parent component
      if (onVoidSuccess) {
        onVoidSuccess(transaction.id, transactionType);
      }
      
    } catch (error) {
      console.error('Void error:', error);
      toast.error(error.message || 'Failed to void transaction');
    } finally {
      setLoading(false);
    }
  };

  const getConsequences = () => {
    switch (transactionType) {
      case 'sale_invoice':
        return [
          'All sold items will be returned to inventory',
          'Any payment allocations will be reversed',
          'Customer balance will be updated (for credit sales)',
          'Transaction will be permanently marked as voided',
          'Stock levels will be increased accordingly'
        ];
        
      case 'customer_payment':
        return [
          'Payment allocations to invoices will be reversed',
          'Customer balance will be updated',
          'Payment amount will be set to zero',
          'Invoice balances will be recalculated',
          'Payment will be marked as voided in records'
        ];
        
      case 'sale_return':
        return [
          'Returned items will be removed from inventory',
          'Customer credit will be reversed',
          'Customer balance will be updated',
          'Return transaction will be marked as voided',
          'Stock levels will be decreased accordingly'
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

  if (!transaction) return null;

  const details = getTransactionDetails();
  const typeConfig = transactionTypes[transactionType];
  const consequences = getConsequences();

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-red-600">
            <AlertTriangle className="h-5 w-5" />
            Void Transaction
          </DialogTitle>
          <DialogDescription className="text-sm">
            This action cannot be undone. Please review all details carefully before proceeding.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Transaction Type & Basic Info */}
          <div className="p-4 bg-muted/30 rounded-lg">
            <div className="flex items-center gap-3 mb-3">
              {typeConfig && <typeConfig.icon className={`h-5 w-5 text-${typeConfig.color}-500`} />}
              <div>
                <h4 className="font-semibold text-sm">
                  {typeConfig?.name || 'Transaction'}
                </h4>
                <p className="text-xs text-muted-foreground">
                  {typeConfig?.description}
                </p>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <Label className="text-xs font-medium text-muted-foreground">Reference</Label>
                <p className="font-semibold font-mono">{details.reference}</p>
              </div>
              
              <div>
                <Label className="text-xs font-medium text-muted-foreground">Amount</Label>
                <p className="font-semibold text-red-600 flex items-center gap-1">
                  <DollarSign className="h-3 w-3" />
                  Ksh {parseFloat(details.amount).toLocaleString()}
                </p>
              </div>
              
              {details.customer && (
                <div className="col-span-2">
                  <Label className="text-xs font-medium text-muted-foreground">Customer</Label>
                  <p className="flex items-center gap-1">
                    <User className="h-3 w-3" />
                    {details.customer}
                  </p>
                </div>
              )}
              
              <div>
                <Label className="text-xs font-medium text-muted-foreground">Date</Label>
                <p className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  {new Date(details.date).toLocaleDateString()}
                </p>
              </div>
              
              <div>
                <Label className="text-xs font-medium text-muted-foreground">Status</Label>
                <div className="mt-1">
                  {getStatusBadge(details.status)}
                </div>
              </div>
            </div>
          </div>

          {/* Void Eligibility Check */}
          <div className="flex items-center justify-between">
            <div>
              <Label className="text-sm font-medium">Void Eligibility</Label>
              <p className="text-xs text-muted-foreground">
                Check if this transaction can be voided
              </p>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={checkVoidEligibility}
              disabled={checking}
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
                  {consequences.map((consequence, index) => (
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

        <DialogFooter className="gap-2 sm:gap-0">
          <Button
            type="button"
            variant="outline"
            onClick={() => handleOpenChange(false)}
            disabled={loading}
            className="flex-1 sm:flex-none"
          >
            Cancel
          </Button>
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
            className="flex-1 sm:flex-none"
          >
            {loading ? (
              <RefreshCw className="h-4 w-4 animate-spin mr-2" />
            ) : (
              <AlertTriangle className="h-4 w-4 mr-2" />
            )}
            {loading ? 'Voiding...' : `Void ${typeConfig?.name || 'Transaction'}`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

