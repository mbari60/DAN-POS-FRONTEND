// components/docsmodal/EnhancedSuccessModal.js
import React, { useState, useEffect, useRef } from 'react';
import { 
  CheckCircle, Printer, Download, X, FileText, Truck, 
  CreditCard, Calendar, User, DollarSign, Sparkles, Eye,
  Loader2
} from 'lucide-react';
import { toast } from 'react-toastify';
import { generatePDFFromElement, printElementAsPDF } from '@/lib/api/saleinvoicesapi';
import DeliveryNote from '@/components/documents/DeliveryNote';
import SaleInvoice from '@/components/documents/SaleInvoice';

const EnhancedSuccessModal = ({ invoice, onClose, autoPrint = true }) => {
  const [showPreview, setShowPreview] = useState(null);
  const [printing, setPrinting] = useState({});
  const [documentData, setDocumentData] = useState(null);
  const deliveryNoteRef = useRef();
  const saleInvoiceRef = useRef();

  // Prepare document data when invoice is available
  useEffect(() => {
    if (invoice) {
      prepareDocumentData();
    }
  }, [invoice]);

  // Auto-print delivery note on success
  useEffect(() => {
    if (autoPrint && invoice && documentData) {
      setTimeout(() => {
        handlePrintDeliveryNote();
      }, 1000);
    }
  }, [autoPrint, invoice, documentData]);

  const prepareDocumentData = () => {
    if (!invoice) return;

    const deliveryNoteData = {
      company_name: 'PAVILLION WINES AND SPIRITS LTD',
      delivery_note_number: `DN-${invoice.reference_no}`,
      date: new Date(invoice.created_at).toLocaleDateString('en-KE'),
      delivery_date: new Date().toLocaleDateString('en-KE'),
      customer: {
        name: invoice.customer_name || 'Walk-in Customer',
        code: invoice.customer_code || 'N/A',
        address: invoice.customer_address || 'N/A',
        phone: invoice.customer_phone || 'N/A',
      },
      store: {
        name: invoice.store_name || 'N/A',
        location: invoice.store_location || 'N/A',
      },
      prepared_by: invoice.created_by_name || 'System',
      items: invoice.lines?.map((line, index) => ({
        index: index + 1,
        name: line.item_name,
        sku: line.item_sku,
        quantity: line.quantity,
        unit_price: parseFloat(line.unit_price),
        line_total: parseFloat(line.line_total)
      })) || [],
      total_amount: parseFloat(invoice.total_amount),
      notes: invoice.notes,
      footer_note: 'This is a computer-generated document. No signature required.'
    };

    const saleInvoiceData = {
      document_type: 'sale_invoice',
      company_name: 'PAVILLION WINES AND SPIRITS LTD',
      company_details: {
        address: '20094-00100, Nairobi, Kenya',
        phone: '+254 792826203',
        email: 'kevinmbari600@gmail.com',
        vat_no: 'P1213244513X'
      },
      invoice_number: invoice.reference_no,
      invoice_date: new Date(invoice.created_at).toLocaleDateString('en-KE'),
      customer: {
        name: invoice.customer_name || 'Walk-in Customer',
        code: invoice.customer_code || 'N/A',
        address: invoice.customer_address || 'N/A',
        phone: invoice.customer_phone || 'N/A',
        email: invoice.customer_email || 'N/A',
      },
      store: {
        name: invoice.store_name || 'N/A',
        location: invoice.store_location || 'N/A',
      },
      sales_person: invoice.created_by_name || 'System',
      payment_method: invoice.payment_method,
      items: invoice.lines?.map((line, index) => ({
        index: index + 1,
        name: line.item_name,
        sku: line.item_sku,
        quantity: line.quantity,
        unit_price: parseFloat(line.unit_price),
        line_total: parseFloat(line.line_total)
      })) || [],
      totals: {
        subtotal: parseFloat(invoice.total_amount),
        vat_amount: parseFloat(invoice.total_amount) * 0.16,
        grand_total: parseFloat(invoice.total_amount) * 1.16,
        amount_paid: parseFloat(invoice.amount_paid),
        balance_due: parseFloat(invoice.balance_due)
      },
      payment_info: {
        is_credit: invoice.payment_method === 'credit',
        terms: 'Payment per Agreed Terms',
        bank_details: 'Bank: Mpesa | Till: 5124523 | Name: Eunice Wanjiru Muiruri'
      },
      notes: invoice.notes,
      terms: [
        "1. Goods once sold cannot be returned unless defective",
        "2. Payment is due within 30 days from invoice date",
        "3. Late payments will attract a 2% monthly interest charge",
        "4. All disputes are subject to Nairobi jurisdiction"
      ]
    };

    setDocumentData({
      deliveryNote: deliveryNoteData,
      saleInvoice: saleInvoiceData
    });
  };

  const updatePrintingState = (docType, isPrinting) => {
    setPrinting(prev => ({ ...prev, [docType]: isPrinting }));
  };

  // Simple function to create and print a document
  const createAndPrintDocument = async (documentType) => {
    if (!documentData) return;

    updatePrintingState(documentType, true);
    
    try {
      // Create a hidden iframe for printing
      const iframe = document.createElement('iframe');
      iframe.style.position = 'fixed';
      iframe.style.right = '0';
      iframe.style.bottom = '0';
      iframe.style.width = '0';
      iframe.style.height = '0';
      iframe.style.border = 'none';
      document.body.appendChild(iframe);

      const doc = iframe.contentWindow.document;
      
      // Get the appropriate component and data
      const Component = documentType === 'delivery' ? DeliveryNote : SaleInvoice;
      const data = documentType === 'delivery' ? documentData.deliveryNote : documentData.saleInvoice;
      const title = documentType === 'delivery' ? 'Delivery Note' : 'Sale Invoice';

      // Write the HTML content
      doc.open();
      doc.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>${title}</title>
            <style>
              body { 
                margin: 0; 
                padding: 20px;
                font-family: Arial, sans-serif;
                -webkit-print-color-adjust: exact;
                print-color-adjust: exact;
              }
              .a4-document {
                width: 210mm;
                min-height: 297mm;
                margin: 0 auto;
                background: white;
                padding: 15mm;
                box-sizing: border-box;
              }
              @media print {
                body { margin: 0; padding: 0; }
                .a4-document { 
                  width: 100%; 
                  min-height: 100vh;
                  padding: 15mm;
                  box-shadow: none;
                }
              }
            </style>
          </head>
          <body>
            <div id="root"></div>
          </body>
        </html>
      `);
      doc.close();

      // Create a wrapper div and render the component
      const root = doc.getElementById('root');
      const wrapper = doc.createElement('div');
      wrapper.className = 'a4-document';
      root.appendChild(wrapper);

      // Use React.createElement to render the component
      const { createElement } = await import('react');
      const { createRoot } = await import('react-dom/client');
      
      const reactElement = createElement(Component, { documentData: data });
      const rootInstance = createRoot(wrapper);
      rootInstance.render(reactElement);

      // Wait for render and print
      setTimeout(() => {
        iframe.contentWindow.focus();
        iframe.contentWindow.print();
        
        // Cleanup
        setTimeout(() => {
          document.body.removeChild(iframe);
          updatePrintingState(documentType, false);
        }, 1000);
        
      }, 1000);

    } catch (error) {
      console.error('Print error:', error);
      toast.error(`Failed to print ${documentType === 'delivery' ? 'delivery note' : 'sale invoice'}`);
      updatePrintingState(documentType, false);
    }
  };

  const handlePrintDeliveryNote = async () => {
    await createAndPrintDocument('delivery');
  };

  const handlePrintSaleInvoice = async () => {
    await createAndPrintDocument('invoice');
  };

  const handleDownloadDeliveryNote = async () => {
    if (!documentData?.deliveryNote) return;
    try {
      // For download, we'll use the existing generatePDFFromElement function
      // Create a temporary visible container
      const tempContainer = document.createElement('div');
      tempContainer.className = 'a4-document';
      tempContainer.style.position = 'fixed';
      tempContainer.style.left = '0';
      tempContainer.style.top = '0';
      tempContainer.style.zIndex = '9999';
      tempContainer.style.background = 'white';
      document.body.appendChild(tempContainer);

      // Render the delivery note
      const { createElement } = await import('react');
      const { createRoot } = await import('react-dom/client');
      
      const reactElement = createElement(DeliveryNote, { documentData: documentData.deliveryNote });
      const rootInstance = createRoot(tempContainer);
      rootInstance.render(reactElement);

      // Wait for render and generate PDF
      setTimeout(async () => {
        try {
          await generatePDFFromElement(tempContainer, `delivery_note_${invoice.reference_no}.pdf`);
          toast.success('Delivery note downloaded!');
        } catch (error) {
          console.error('Download error:', error);
          toast.error('Failed to download delivery note');
        } finally {
          // Cleanup
          rootInstance.unmount();
          document.body.removeChild(tempContainer);
        }
      }, 1000);

    } catch (error) {
      console.error('Download setup error:', error);
      toast.error('Failed to setup delivery note download');
    }
  };

  const handleDownloadSaleInvoice = async () => {
    if (!documentData?.saleInvoice) return;
    try {
      const tempContainer = document.createElement('div');
      tempContainer.className = 'a4-document';
      tempContainer.style.position = 'fixed';
      tempContainer.style.left = '0';
      tempContainer.style.top = '0';
      tempContainer.style.zIndex = '9999';
      tempContainer.style.background = 'white';
      document.body.appendChild(tempContainer);

      const { createElement } = await import('react');
      const { createRoot } = await import('react-dom/client');
      
      const reactElement = createElement(SaleInvoice, { documentData: documentData.saleInvoice });
      const rootInstance = createRoot(tempContainer);
      rootInstance.render(reactElement);

      setTimeout(async () => {
        try {
          await generatePDFFromElement(tempContainer, `sale_invoice_${invoice.reference_no}.pdf`);
          toast.success('Sale invoice downloaded!');
        } catch (error) {
          console.error('Download error:', error);
          toast.error('Failed to download sale invoice');
        } finally {
          rootInstance.unmount();
          document.body.removeChild(tempContainer);
        }
      }, 1000);

    } catch (error) {
      console.error('Download setup error:', error);
      toast.error('Failed to setup sale invoice download');
    }
  };

  const handlePrintAll = async () => {
    try {
      await handlePrintDeliveryNote();
      setTimeout(() => handlePrintSaleInvoice(), 3000);
      toast.success('All documents queued for printing!');
    } catch (error) {
      toast.error('Failed to queue prints');
    }
  };

  const handlePreview = (documentType) => {
    setShowPreview(documentType);
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

  if (!invoice || !documentData) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-xl p-8">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Preparing documents...</p>
        </div>
      </div>
    );
  }

  const isPrintingDelivery = printing.delivery;
  const isPrintingInvoice = printing.invoice;

  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-xl w-full max-w-2xl max-h-[90vh] overflow-hidden animate-in fade-in-90 zoom-in-90">
          {/* Header */}
          <div className="bg-gradient-to-r from-green-500 to-green-600 p-6 text-white">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <CheckCircle className="w-8 h-8" />
                  <Sparkles className="w-4 h-4 text-yellow-300 absolute -top-1 -right-1 animate-pulse" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold">Invoice Created Successfully!</h2>
                  <p className="text-green-100">Ready to print documents</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="text-white hover:text-green-100 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            {autoPrint && (
              <div className="mt-3 p-2 bg-green-400 bg-opacity-20 rounded-lg">
                <p className="text-green-100 text-sm flex items-center gap-2">
                  <Printer className="w-4 h-4" />
                  {isPrintingDelivery ? 'Printing delivery note...' : 'Delivery note will auto-print shortly...'}
                </p>
              </div>
            )}
          </div>

          {/* Content */}
          <div className="p-6 overflow-y-auto max-h-[60vh]">
            {/* Quick Actions */}
            <div className="mb-6">
              <button
                onClick={handlePrintAll}
                disabled={isPrintingDelivery || isPrintingInvoice}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
              >
                {isPrintingDelivery || isPrintingInvoice ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Printer className="w-5 h-5" />
                )}
                {isPrintingDelivery || isPrintingInvoice ? 'Printing All...' : 'Print All Documents'}
              </button>
            </div>

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
                <div className="grid grid-cols-3 gap-2">
                  <button
                    onClick={() => handlePreview('delivery_note')}
                    className="flex items-center justify-center gap-1 px-3 py-2 border border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 transition-colors text-sm"
                  >
                    <Eye className="w-4 h-4" />
                    Preview
                  </button>
                  <button
                    onClick={handlePrintDeliveryNote}
                    disabled={isPrintingDelivery}
                    className="flex items-center justify-center gap-1 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors text-sm"
                  >
                    {isPrintingDelivery ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Printer className="w-4 h-4" />
                    )}
                    Print
                  </button>
                  <button
                    onClick={handleDownloadDeliveryNote}
                    className="flex items-center justify-center gap-1 px-3 py-2 border border-green-600 text-green-600 rounded-lg hover:bg-green-50 transition-colors text-sm"
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
                <div className="grid grid-cols-3 gap-2">
                  <button
                    onClick={() => handlePreview('sale_invoice')}
                    className="flex items-center justify-center gap-1 px-3 py-2 border border-green-600 text-green-600 rounded-lg hover:bg-green-50 transition-colors text-sm"
                  >
                    <Eye className="w-4 h-4" />
                    Preview
                  </button>
                  <button
                    onClick={handlePrintSaleInvoice}
                    disabled={isPrintingInvoice}
                    className="flex items-center justify-center gap-1 px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors text-sm"
                  >
                    {isPrintingInvoice ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Printer className="w-4 h-4" />
                    )}
                    Print
                  </button>
                  <button
                    onClick={handleDownloadSaleInvoice}
                    className="flex items-center justify-center gap-1 px-3 py-2 border border-green-600 text-green-600 rounded-lg hover:bg-green-50 transition-colors text-sm"
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

      {/* Document Preview Modal */}
      {showPreview && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">
                {showPreview === 'delivery_note' ? 'Delivery Note Preview' : 'Sale Invoice Preview'}
              </h3>
              <button onClick={() => setShowPreview(null)} className="text-gray-400 hover:text-gray-600">
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="flex-1 overflow-auto p-4">
              {showPreview === 'delivery_note' ? (
                <DeliveryNote documentData={documentData.deliveryNote} />
              ) : (
                <SaleInvoice documentData={documentData.saleInvoice} />
              )}
            </div>
            <div className="p-4 border-t border-gray-200">
              <button
                onClick={() => setShowPreview(null)}
                className="w-full px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default EnhancedSuccessModal;