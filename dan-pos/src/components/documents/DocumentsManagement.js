// components/documents/DocumentsManagement.js

import React, { useState, useEffect } from 'react';
import { 
  Search, Filter, Download, Printer, FileText, 
  Receipt, Truck, Calendar, User, Store,
  Loader2, Eye, ChevronDown, ChevronUp, X
} from 'lucide-react';
import { toast } from 'react-toastify';
import DocumentContainer from './DocumentContainer';

const DocumentsManagement = () => {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({
    documentType: '',
    customer: '',
    store: '',
    startDate: '',
    endDate: '',
    status: ''
  });
  const [customers, setCustomers] = useState([]);
  const [stores, setStores] = useState([]);
  const [expandedDocument, setExpandedDocument] = useState(null);
  const [selectedDocument, setSelectedDocument] = useState(null);
  const [showDocumentViewer, setShowDocumentViewer] = useState(false);

  // Document types
  const documentTypes = [
    { value: 'sale_invoice', label: 'Sale Invoices', icon: Receipt },
    { value: 'delivery_note', label: 'Delivery Notes', icon: Truck },
    { value: 'payment_receipt', label: 'Payment Receipts', icon: FileText },
    { value: 'all', label: 'All Documents', icon: FileText }
  ];

  // Quick date filters
  const quickDateFilters = [
    { label: 'Today', value: 'today' },
    { label: 'Yesterday', value: 'yesterday' },
    { label: 'Last 7 Days', value: 'last7' },
    { label: 'This Month', value: 'thisMonth' },
    { label: 'Last Month', value: 'lastMonth' },
  ];

  // Load initial data
  useEffect(() => {
    loadInitialData();
    loadDocuments();
  }, []);

  const loadInitialData = async () => {
    try {
      // Load customers and stores
      const [customersResponse, storesResponse] = await Promise.all([
        fetch('/api/sales/customers/').then(res => res.json()),
        fetch('/api/inventory/stores/').then(res => res.json())
      ]);
      
      setCustomers(customersResponse.results || customersResponse || []);
      setStores(storesResponse.results || storesResponse || []);
    } catch (error) {
      console.error('Error loading initial data:', error);
      toast.error('Failed to load initial data');
    }
  };

  const loadDocuments = async (searchFilters = filters) => {
    setLoading(true);
    try {
      const queryParams = new URLSearchParams();
      
      Object.entries(searchFilters).forEach(([key, value]) => {
        if (value && value !== 'all') {
          queryParams.append(key, value);
        }
      });

      const response = await fetch(`/api/sales/documents/?${queryParams}`);
      if (!response.ok) {
        throw new Error('Failed to fetch documents');
      }
      
      const data = await response.json();
      setDocuments(data.results || data || []);
    } catch (error) {
      console.error('Error loading documents:', error);
      toast.error('Failed to load documents');
      setDocuments([]);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (field, value) => {
    const newFilters = { ...filters, [field]: value };
    setFilters(newFilters);
    loadDocuments(newFilters);
  };

  const handleQuickDateFilter = (period) => {
    const today = new Date();
    let startDate = '';
    let endDate = '';

    switch (period) {
      case 'today':
        startDate = today.toISOString().split('T')[0];
        endDate = startDate;
        break;
      case 'yesterday':
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);
        startDate = yesterday.toISOString().split('T')[0];
        endDate = startDate;
        break;
      case 'last7':
        const last7 = new Date(today);
        last7.setDate(last7.getDate() - 7);
        startDate = last7.toISOString().split('T')[0];
        endDate = today.toISOString().split('T')[0];
        break;
      case 'thisMonth':
        startDate = new Date(today.getFullYear(), today.getMonth(), 1).toISOString().split('T')[0];
        endDate = today.toISOString().split('T')[0];
        break;
      case 'lastMonth':
        const firstDayLastMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1);
        const lastDayLastMonth = new Date(today.getFullYear(), today.getMonth(), 0);
        startDate = firstDayLastMonth.toISOString().split('T')[0];
        endDate = lastDayLastMonth.toISOString().split('T')[0];
        break;
      default:
        return;
    }

    const newFilters = { ...filters, startDate, endDate };
    setFilters(newFilters);
    loadDocuments(newFilters);
  };

  const handleViewDocument = (document) => {
    setSelectedDocument(document);
    setShowDocumentViewer(true);
  };

  const handleCloseViewer = () => {
    setShowDocumentViewer(false);
    setSelectedDocument(null);
  };

  const handlePrintDocument = (documentId, documentType) => {
    let url = '';
    switch (documentType) {
      case 'sale_invoice':
        url = `/api/sales/documents/sale_invoice_pdf/${documentId}/`;
        break;
      case 'delivery_note':
        url = `/api/sales/documents/delivery_note_pdf/${documentId}/`;
        break;
      case 'payment_receipt':
        url = `/api/sales/documents/payment_receipt_pdf/${documentId}/`;
        break;
      default:
        return;
    }
    window.open(url, '_blank');
  };

  const handleDownloadDocument = async (documentId, documentType) => {
    try {
      let url = '';
      switch (documentType) {
        case 'sale_invoice':
          url = `/api/sales/documents/sale_invoice_pdf/${documentId}/?download=true`;
          break;
        case 'delivery_note':
          url = `/api/sales/documents/delivery_note_pdf/${documentId}/?download=true`;
          break;
        case 'payment_receipt':
          url = `/api/sales/documents/payment_receipt_pdf/${documentId}/?download=true`;
          break;
        default:
          return;
      }

      const response = await fetch(url);
      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = `${documentType}_${documentId}.pdf`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(downloadUrl);
      
      toast.success('Document downloaded successfully');
    } catch (error) {
      console.error('Error downloading document:', error);
      toast.error('Failed to download document');
    }
  };

  const toggleDocumentDetails = (documentId) => {
    setExpandedDocument(expandedDocument === documentId ? null : documentId);
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
      day: 'numeric'
    });
  };

  const getDocumentIcon = (type) => {
    switch (type) {
      case 'sale_invoice':
        return Receipt;
      case 'delivery_note':
        return Truck;
      case 'payment_receipt':
        return FileText;
      default:
        return FileText;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      case 'draft':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <FileText className="w-8 h-8 text-blue-600" />
          <h1 className="text-3xl font-bold text-gray-900">Documents Management</h1>
        </div>
        <p className="text-gray-600">Manage and access all your sales documents</p>
      </div>

      {/* Filters */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 mb-6">
        <div className="flex items-center gap-3 mb-4">
          <Filter className="w-5 h-5 text-gray-600" />
          <h2 className="text-lg font-semibold text-gray-900">Filters</h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
          {/* Document Type Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Document Type
            </label>
            <select
              value={filters.documentType}
              onChange={(e) => handleFilterChange('documentType', e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">All Types</option>
              {documentTypes.map(type => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
          </div>

          {/* Customer Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Customer
            </label>
            <select
              value={filters.customer}
              onChange={(e) => handleFilterChange('customer', e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">All Customers</option>
              {customers.map(customer => (
                <option key={customer.id} value={customer.id}>
                  {customer.name}
                </option>
              ))}
            </select>
          </div>

          {/* Store Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Store
            </label>
            <select
              value={filters.store}
              onChange={(e) => handleFilterChange('store', e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">All Stores</option>
              {stores.map(store => (
                <option key={store.id} value={store.id}>
                  {store.name}
                </option>
              ))}
            </select>
          </div>

          {/* Date Range */}
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                From Date
              </label>
              <input
                type="date"
                value={filters.startDate}
                onChange={(e) => handleFilterChange('startDate', e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                To Date
              </label>
              <input
                type="date"
                value={filters.endDate}
                onChange={(e) => handleFilterChange('endDate', e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Quick Date Filters */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Quick Date Filters
          </label>
          <div className="flex flex-wrap gap-2">
            {quickDateFilters.map(filter => (
              <button
                key={filter.value}
                onClick={() => handleQuickDateFilter(filter.value)}
                className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-md transition-colors border border-gray-300"
              >
                {filter.label}
              </button>
            ))}
            <button
              onClick={() => {
                handleFilterChange('startDate', '');
                handleFilterChange('endDate', '');
              }}
              className="px-3 py-1 text-sm bg-red-100 hover:bg-red-200 text-red-700 rounded-md transition-colors border border-red-300"
            >
              Clear Dates
            </button>
          </div>
        </div>
      </div>

      {/* Documents List */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">Documents</h2>
            <div className="text-sm text-gray-600">
              {documents.length} document(s) found
            </div>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            <span className="ml-2 text-gray-600">Loading documents...</span>
          </div>
        ) : documents.length === 0 ? (
          <div className="text-center py-12">
            <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No documents found</h3>
            <p className="text-gray-600">Try adjusting your filters to see more results</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {documents.map(document => {
              const DocumentIcon = getDocumentIcon(document.document_type);
              const isExpanded = expandedDocument === document.id;
              
              return (
                <div key={document.id} className="p-6 hover:bg-gray-50 transition-colors">
                  {/* Document Header */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4 flex-1">
                      <div className="p-2 bg-blue-100 rounded-lg">
                        <DocumentIcon className="w-5 h-5 text-blue-600" />
                      </div>
                      
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-1">
                          <h3 className="font-semibold text-gray-900">
                            {document.document_type === 'sale_invoice' && `Invoice #${document.reference_no}`}
                            {document.document_type === 'delivery_note' && `Delivery Note #${document.delivery_note_number}`}
                            {document.document_type === 'payment_receipt' && `Payment Receipt #${document.payment_reference}`}
                          </h3>
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(document.status)}`}>
                            {document.status}
                          </span>
                        </div>
                        
                        <div className="flex items-center gap-4 text-sm text-gray-600 flex-wrap">
                          <span className="flex items-center gap-1">
                            <User className="w-4 h-4" />
                            {document.customer_name}
                          </span>
                          <span className="flex items-center gap-1">
                            <Store className="w-4 h-4" />
                            {document.store_name}
                          </span>
                          <span className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            {formatDate(document.created_at)}
                          </span>
                          {document.total_amount && (
                            <span className="font-semibold text-gray-900">
                              {formatCurrency(document.total_amount)}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleViewDocument(document)}
                        className="p-2 text-gray-600 hover:text-blue-600 transition-colors"
                        title="View Document"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      
                      <button
                        onClick={() => handlePrintDocument(document.id, document.document_type)}
                        className="p-2 text-gray-600 hover:text-blue-600 transition-colors"
                        title="Print"
                      >
                        <Printer className="w-4 h-4" />
                      </button>
                      
                      <button
                        onClick={() => handleDownloadDocument(document.id, document.document_type)}
                        className="p-2 text-gray-600 hover:text-green-600 transition-colors"
                        title="Download"
                      >
                        <Download className="w-4 h-4" />
                      </button>
                      
                      <button
                        onClick={() => toggleDocumentDetails(document.id)}
                        className="p-2 text-gray-600 hover:text-gray-900 transition-colors"
                      >
                        {isExpanded ? (
                          <ChevronUp className="w-4 h-4" />
                        ) : (
                          <ChevronDown className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Expanded Details */}
                  {isExpanded && (
                    <div className="mt-4 pl-12 border-t border-gray-200 pt-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Document Details */}
                        <div>
                          <h4 className="font-medium text-gray-900 mb-3">Document Details</h4>
                          <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                              <span className="text-gray-600">Document Type:</span>
                              <span className="font-medium capitalize">
                                {document.document_type?.replace('_', ' ') || 'N/A'}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600">Reference:</span>
                              <span className="font-medium">{document.reference_no || 'N/A'}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600">Created:</span>
                              <span className="font-medium">{formatDate(document.created_at)}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600">Status:</span>
                              <span className={`font-medium ${getStatusColor(document.status).replace('bg-', 'text-').split(' ')[0]}`}>
                                {document.status}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Customer Details */}
                        <div>
                          <h4 className="font-medium text-gray-900 mb-3">Customer Details</h4>
                          <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                              <span className="text-gray-600">Customer:</span>
                              <span className="font-medium">{document.customer_name || 'N/A'}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600">Store:</span>
                              <span className="font-medium">{document.store_name || 'N/A'}</span>
                            </div>
                            {document.payment_method && (
                              <div className="flex justify-between">
                                <span className="text-gray-600">Payment Method:</span>
                                <span className="font-medium capitalize">
                                  {document.payment_method?.replace('_', ' ') || 'N/A'}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Items List for Invoices and Delivery Notes */}
                        {(document.document_type === 'sale_invoice' || document.document_type === 'delivery_note') && document.items && document.items.length > 0 && (
                          <div className="md:col-span-2">
                            <h4 className="font-medium text-gray-900 mb-3">Items</h4>
                            <div className="border border-gray-200 rounded-lg overflow-hidden">
                              <table className="w-full text-sm">
                                <thead className="bg-gray-50">
                                  <tr>
                                    <th className="px-3 py-2 text-left font-medium text-gray-900">Item</th>
                                    <th className="px-3 py-2 text-left font-medium text-gray-900">Quantity</th>
                                    <th className="px-3 py-2 text-left font-medium text-gray-900">Price</th>
                                    <th className="px-3 py-2 text-left font-medium text-gray-900">Total</th>
                                  </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200">
                                  {document.items.map((item, index) => (
                                    <tr key={index}>
                                      <td className="px-3 py-2">{item.item_name || 'N/A'}</td>
                                      <td className="px-3 py-2">{item.quantity || 0}</td>
                                      <td className="px-3 py-2">{formatCurrency(item.unit_price)}</td>
                                      <td className="px-3 py-2 font-medium">
                                        {formatCurrency(item.line_total)}
                                      </td>
                                    </tr>
                                  ))}
                                </tbody>
                                {document.total_amount && (
                                  <tfoot className="bg-gray-50">
                                    <tr>
                                      <td colSpan="3" className="px-3 py-2 text-right font-medium">
                                        Total:
                                      </td>
                                      <td className="px-3 py-2 font-bold text-gray-900">
                                        {formatCurrency(document.total_amount)}
                                      </td>
                                    </tr>
                                  </tfoot>
                                )}
                              </table>
                            </div>
                          </div>
                        )}

                        {/* Payment Details for Receipts */}
                        {document.document_type === 'payment_receipt' && (
                          <div className="md:col-span-2">
                            <h4 className="font-medium text-gray-900 mb-3">Payment Details</h4>
                            <div className="grid grid-cols-2 gap-4 text-sm">
                              <div className="flex justify-between">
                                <span className="text-gray-600">Amount:</span>
                                <span className="font-medium">{formatCurrency(document.amount)}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-600">Payment Method:</span>
                                <span className="font-medium capitalize">{document.payment_method || 'N/A'}</span>
                              </div>
                              {document.reference && (
                                <div className="flex justify-between col-span-2">
                                  <span className="text-gray-600">Reference:</span>
                                  <span className="font-medium">{document.reference}</span>
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Document Viewer Modal */}
      {showDocumentViewer && selectedDocument && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg w-full max-w-6xl max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">
                {selectedDocument.document_type === 'sale_invoice' && `Invoice #${selectedDocument.reference_no}`}
                {selectedDocument.document_type === 'delivery_note' && `Delivery Note #${selectedDocument.delivery_note_number}`}
                {selectedDocument.document_type === 'payment_receipt' && `Payment Receipt #${selectedDocument.payment_reference}`}
              </h3>
              <button 
                onClick={handleCloseViewer}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="flex-1 overflow-auto">
              <DocumentContainer
                documentId={selectedDocument.id}
                documentType={selectedDocument.document_type}
                onClose={handleCloseViewer}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DocumentsManagement;