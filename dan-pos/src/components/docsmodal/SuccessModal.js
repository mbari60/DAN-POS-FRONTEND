// components/docsmodal/SuccessModal.js

import React from 'react';
import { 
  CheckCircle, Printer, Download, X, FileText, Truck, 
  CreditCard, Calendar, User, DollarSign 
} from 'lucide-react';

const SuccessModal = ({ invoice, onClose }) => {
  const handlePrintDeliveryNote = () => {
    window.open(`/api/sales/documents/delivery_note_pdf/${invoice.id}/`, '_blank');
  };

  const handlePrintSaleInvoice = () => {
    window.open(`/api/sales/documents/sale_invoice_pdf/${invoice.id}/`, '_blank');
  };

  const handleDownloadDeliveryNote = () => {
    window.open(`/api/sales/documents/delivery_note_pdf/${invoice.id}/?download=true`, '_blank');
  };

  const handleDownloadSaleInvoice = () => {
    window.open(`/api/sales/documents/sale_invoice_pdf/${invoice.id}/?download=true`, '_blank');
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES'
    }).format(value || 0);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-KE', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-green-500 to-green-600 p-6 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <CheckCircle className="w-8 h-8" />
              <div>
                <h2 className="text-2xl font-bold">Invoice Created Successfully!</h2>
                <p className="text-green-100">Your credit sale has been processed</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:text-green-100 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[60vh]">
          {/* Invoice Summary */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <FileText className="w-4 h-4" />
                Invoice Details
              </h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Invoice No:</span>
                  <span className="font-mono font-semibold">{invoice.reference_no}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Date:</span>
                  <span>{formatDate(invoice.created_at)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Customer:</span>
                  <span className="font-medium">{invoice.customer_name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Store:</span>
                  <span>{invoice.store_name}</span>
                </div>
              </div>
            </div>

            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <CreditCard className="w-4 h-4" />
                Payment Summary
              </h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Total Amount:</span>
                  <span className="font-bold text-green-600">{formatCurrency(invoice.total_amount)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Payment Method:</span>
                  <span className="font-medium capitalize">{invoice.payment_method}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Amount Paid:</span>
                  <span>{formatCurrency(invoice.amount_paid)}</span>
                </div>
                <div className="flex justify-between border-t pt-2">
                  <span className="text-gray-600 font-semibold">Balance Due:</span>
                  <span className="font-bold text-orange-600">{formatCurrency(invoice.balance_due)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Items Summary */}
          {invoice.lines && invoice.lines.length > 0 && (
            <div className="mb-6">
              <h3 className="font-semibold text-gray-900 mb-3">Items Summary</h3>
              <div className="border border-gray-200 rounded-lg overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-3 py-2 text-left font-medium text-gray-900">Item</th>
                      <th className="px-3 py-2 text-center font-medium text-gray-900">Qty</th>
                      <th className="px-3 py-2 text-right font-medium text-gray-900">Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {invoice.lines.slice(0, 3).map((line, index) => (
                      <tr key={index}>
                        <td className="px-3 py-2">{line.item_name}</td>
                        <td className="px-3 py-2 text-center">{line.quantity}</td>
                        <td className="px-3 py-2 text-right font-medium">
                          {formatCurrency(line.line_total)}
                        </td>
                      </tr>
                    ))}
                    {invoice.lines.length > 3 && (
                      <tr>
                        <td colSpan="3" className="px-3 py-2 text-center text-gray-500 text-sm">
                          + {invoice.lines.length - 3} more items
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Next Steps */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <h4 className="font-semibold text-yellow-800 mb-2">Next Steps</h4>
            <ul className="text-sm text-yellow-700 space-y-1">
              <li>• Print the delivery note for the customer to sign upon delivery</li>
              <li>• Print the sale invoice for your records and customer copy</li>
              <li>• The customer's account has been updated with the credit balance</li>
              <li>• Monitor the customer's payment status in the accounts receivable</li>
            </ul>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="border-t border-gray-200 p-6 bg-gray-50">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Delivery Note Actions */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-gray-700">
                <Truck className="w-5 h-5 text-blue-600" />
                <span className="font-semibold">Delivery Note</span>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={handlePrintDeliveryNote}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Printer className="w-4 h-4" />
                  Print
                </button>
                <button
                  onClick={handleDownloadDeliveryNote}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-3 border border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 transition-colors"
                >
                  <Download className="w-4 h-4" />
                  Download
                </button>
              </div>
            </div>

            {/* Sale Invoice Actions */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-gray-700">
                <FileText className="w-5 h-5 text-green-600" />
                <span className="font-semibold">Sale Invoice</span>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={handlePrintSaleInvoice}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  <Printer className="w-4 h-4" />
                  Print
                </button>
                <button
                  onClick={handleDownloadSaleInvoice}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-3 border border-green-600 text-green-600 rounded-lg hover:bg-green-50 transition-colors"
                >
                  <Download className="w-4 h-4" />
                  Download
                </button>
              </div>
            </div>
          </div>

          {/* Close Button */}
          <div className="mt-4 pt-4 border-t border-gray-200">
            <button
              onClick={onClose}
              className="w-full px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Close and Return to Dashboard
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SuccessModal;