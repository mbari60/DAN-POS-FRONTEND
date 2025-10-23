// components/ReceiptPrint.jsx
import React, { useRef } from 'react';
import { Printer, Download, X } from 'lucide-react';

const ReceiptPrint = ({ sale, onClose, isReprint = false }) => {
  const receiptRef = useRef();

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('en-KE', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatCurrency = (amount) => {
    return `KES ${parseFloat(amount).toLocaleString('en-KE', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    })}`;
  };

  const handlePrint = () => {
    const printContent = receiptRef.current.innerHTML;
    const originalContent = document.body.innerHTML;
    
    document.body.innerHTML = printContent;
    window.print();
    document.body.innerHTML = originalContent;
    window.location.reload(); // Reload to restore React app
  };

  const handleSaveAsPDF = () => {
    // This would typically use a PDF generation library
    // For now, we'll just trigger print which can save as PDF
    handlePrint();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-md max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gray-800 text-white p-4 flex justify-between items-center">
          <h3 className="text-lg font-semibold">
            {isReprint ? 'Reprint Receipt' : 'Receipt'}
          </h3>
          <div className="flex gap-2">
            <button
              onClick={handleSaveAsPDF}
              className="p-1 hover:bg-gray-700 rounded"
              title="Save as PDF"
            >
              <Download className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-1 hover:bg-gray-700 rounded"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Receipt Content */}
        <div className="p-6 overflow-y-auto">
          {/* Printable receipt */}
          <div ref={receiptRef} className="receipt-content font-mono text-sm">
            {/* Company Header */}
            <div className="text-center mb-4">
              <h2 className="text-xl font-bold uppercase">Your Company Name</h2>
              <p className="text-sm">123 Business Street</p>
              <p className="text-sm">Nairobi, Kenya</p>
              <p className="text-sm">Phone: (254) 123-4567</p>
            </div>

            {/* Receipt Info */}
            <div className="border-t border-b border-gray-300 py-2 my-2">
              <div className="flex justify-between">
                <span>Receipt #:</span>
                <span className="font-bold">{sale.reference_no}</span>
              </div>
              <div className="flex justify-between">
                <span>Date:</span>
                <span>{formatDate(sale.created_at)}</span>
              </div>
              {isReprint && (
                <div className="flex justify-between text-orange-600">
                  <span>Reprinted:</span>
                  <span>{new Date().toLocaleString()}</span>
                </div>
              )}
            </div>

            {/* Customer Info */}
            {sale.customer_name && sale.customer_name !== 'Walk-in Customer' && (
              <div className="mb-2">
                <div className="font-semibold">Customer:</div>
                <div>{sale.customer_name}</div>
              </div>
            )}

            {/* Items */}
            <div className="mb-4">
              <div className="font-semibold border-b border-gray-300 pb-1 mb-2">
                ITEMS
              </div>
              {sale.lines && sale.lines.map((item, index) => (
                <div key={index} className="flex justify-between mb-1">
                  <div className="flex-1">
                    <div className="font-medium">{item.item_name}</div>
                    <div className="text-xs text-gray-600">
                      {item.quantity} x {formatCurrency(item.unit_price)}
                    </div>
                  </div>
                  <div className="font-medium">
                    {formatCurrency(item.line_total)}
                  </div>
                </div>
              ))}
            </div>

            {/* Totals */}
            <div className="border-t border-gray-300 pt-2 mb-4">
              <div className="flex justify-between">
                <span>Subtotal:</span>
                <span>{formatCurrency(sale.total_amount)}</span>
              </div>
              <div className="flex justify-between">
                <span>Amount Paid:</span>
                <span>{formatCurrency(sale.amount_paid)}</span>
              </div>
              <div className="flex justify-between">
                <span>Balance Due:</span>
                <span>{formatCurrency(sale.balance_due)}</span>
              </div>
              <div className="flex justify-between font-bold text-lg border-t border-gray-300 mt-2 pt-2">
                <span>TOTAL:</span>
                <span>{formatCurrency(sale.total_amount)}</span>
              </div>
            </div>

            {/* Payment Method */}
            <div className="border-t border-gray-300 pt-2 mb-4">
              <div className="flex justify-between">
                <span>Payment Method:</span>
                <span className="capitalize font-medium">
                  {sale.payment_method}
                </span>
              </div>
              {sale.payment_reference && (
                <div className="flex justify-between text-sm">
                  <span>Reference:</span>
                  <span>{sale.payment_reference}</span>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="text-center text-xs border-t border-gray-300 pt-2">
              <p>Thank you for your business!</p>
              <p>Items cannot be returned without receipt</p>
              <p className="mt-2">*** {sale.reference_no} ***</p>
            </div>
          </div>

          {/* Print Actions */}
          <div className="flex gap-3 mt-6">
            <button
              onClick={handlePrint}
              className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 flex items-center justify-center gap-2"
            >
              <Printer className="w-4 h-4" />
              Print Receipt
            </button>
            <button
              onClick={onClose}
              className="flex-1 bg-gray-500 text-white py-2 px-4 rounded-lg hover:bg-gray-600"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReceiptPrint;