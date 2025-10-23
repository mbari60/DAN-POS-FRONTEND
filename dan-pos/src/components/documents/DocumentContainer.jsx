import React, { useState, useRef, useEffect } from 'react';
import DeliveryNote from './DeliveryNote';
import SaleInvoice from './SaleInvoice';
import PaymentReceipt from './PaymentReceipt';
import { Loader2, X } from 'lucide-react';
import { generatePDFFromElement, getDeliveryNoteData, getPaymentReceiptData, getSaleInvoiceData, printElementAsPDF } from '@/lib/api/saleinvoicesapi';

const DocumentContainer = ({ documentId, documentType, onClose }) => {
  const [documentData, setDocumentData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const documentRef = useRef();

  const fetchDocumentData = async () => {
    if (!documentId || !documentType) return;
    
    setLoading(true);
    setError(null);
    try {
      let data;
      switch (documentType) {
        case 'delivery_note':
          data = await getDeliveryNoteData(documentId);
          break;
        case 'sale_invoice':
          data = await getSaleInvoiceData(documentId);
          break;
        case 'payment_receipt':
          data = await getPaymentReceiptData(documentId);
          break;
        default:
          throw new Error('Invalid document type');
      }
      setDocumentData(data);
    } catch (err) {
      setError(err.message);
      console.error('Error fetching document data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadPDF = async () => {
    if (!documentRef.current) return;
    
    try {
      const filename = `${documentType}_${documentId}.pdf`;
      await generatePDFFromElement(documentRef.current, filename);
    } catch (err) {
      console.error('Error downloading PDF:', err);
      alert('Failed to download PDF');
    }
  };

  const handlePrint = async () => {
    if (!documentRef.current) return;
    
    try {
      await printElementAsPDF(documentRef.current);
    } catch (err) {
      console.error('Error printing:', err);
      alert('Failed to print document');
    }
  };

  useEffect(() => {
    if (documentId && documentType) {
      fetchDocumentData();
    }
  }, [documentId, documentType]);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="w-6 h-6 animate-spin text-blue-600 mr-2" />
        <span>Loading document data...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 text-center">
        <div className="text-red-600 mb-4">Error: {error}</div>
        <button
          onClick={fetchDocumentData}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Retry
        </button>
      </div>
    );
  }

  if (!documentData) {
    return (
      <div className="p-4 text-center text-gray-600">
        No document data available
      </div>
    );
  }

  return (
    <div className="p-4">
      {/* Action Buttons */}
      <div className="mb-4 flex gap-2 justify-between items-center">
        <div className="flex gap-2">
          <button
            onClick={handleDownloadPDF}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            Download PDF
          </button>
          <button
            onClick={handlePrint}
            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 flex items-center gap-2"
          >
            <Printer className="w-4 h-4" />
            Print
          </button>
        </div>
        <button
          onClick={onClose}
          className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 flex items-center gap-2"
        >
          <X className="w-4 h-4" />
          Close
        </button>
      </div>

      {/* Document Content */}
      <div ref={documentRef} className="bg-white">
        {documentType === 'delivery_note' && (
          <DeliveryNote documentData={documentData} />
        )}
        {documentType === 'sale_invoice' && (
          <SaleInvoice documentData={documentData} />
        )}
        {documentType === 'payment_receipt' && (
          <PaymentReceipt documentData={documentData} />
        )}
      </div>
    </div>
  );
};

export default DocumentContainer;
