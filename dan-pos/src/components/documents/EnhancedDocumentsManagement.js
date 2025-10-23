// components/documents/EnhancedDocumentsManagement.js
import React, { useState, useEffect, useCallback } from 'react';
import { 
  Search, Filter, Download, Printer, FileText, 
  Receipt, Truck, Calendar, User, Store,
  Loader2, Eye, ChevronDown, ChevronUp, RefreshCw,
  Mail, Share2, Copy, CheckCircle2
} from 'lucide-react';
import { toast } from 'react-toastify';
import { downloadDocument, getCustomers, getDocuments, getStores, printDeliveryNote, printPaymentReceipt, printSaleInvoice } from '@/lib/api/saleinvoicesapi';

const EnhancedDocumentsManagement = () => {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({
    documentType: '',
    customer: '',
    store: '',
    startDate: '',
    endDate: '',
    status: '',
    search: ''
  });
  const [customers, setCustomers] = useState([]);
  const [stores, setStores] = useState([]);
  const [expandedDocument, setExpandedDocument] = useState(null);
  const [copiedId, setCopiedId] = useState(null);

  // Document types
  const documentTypes = [
    { value: 'sale_invoice', label: 'Sale Invoices', icon: Receipt, color: 'text-green-600' },
    { value: 'delivery_note', label: 'Delivery Notes', icon: Truck, color: 'text-blue-600' },
    { value: 'payment_receipt', label: 'Payment Receipts', icon: FileText, color: 'text-purple-600' },
    { value: 'all', label: 'All Documents', icon: FileText, color: 'text-gray-600' }
  ];

  // Load initial data
  useEffect(() => {
    loadInitialData();
    loadDocuments();
  }, []);

  const loadInitialData = async () => {
    try {
      const [customersResponse, storesResponse] = await Promise.all([
        getCustomers(),
        getStores()
      ]);
      
      setCustomers(customersResponse.results || customersResponse);
      setStores(storesResponse.results || storesResponse);
    } catch (error) {
      console.error('Error loading initial data:', error);
      toast.error('Failed to load initial data');
    }
  };

  const loadDocuments = useCallback(async (searchFilters = filters) => {
    setLoading(true);
    try {
      const data = await getDocuments(searchFilters);
      setDocuments(Array.isArray(data) ? data : (data.results || []));
    } catch (error) {
      console.error('Error loading documents:', error);
      toast.error('Failed to load documents');
      setDocuments([]);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  const handleFilterChange = (field, value) => {
    const newFilters = { ...filters, [field]: value };
    setFilters(newFilters);
    
    // Debounced search
    if (field === 'search') {
      clearTimeout(searchTimeout);
      setSearchTimeout(setTimeout(() => loadDocuments(newFilters), 500));
    } else {
      loadDocuments(newFilters);
    }
  };

  let searchTimeout;

  const handlePrintDocument = async (documentId, documentType) => {
    try {
      switch (documentType) {
        case 'sale_invoice':
          await printSaleInvoice(documentId);
          break;
        case 'delivery_note':
          await printDeliveryNote(documentId);
          break;
        case 'payment_receipt':
          await printPaymentReceipt(documentId);
          break;
        default:
          toast.error('Unknown document type');
          return;
      }
      toast.success('Document sent to printer');
    } catch (error) {
      toast.error(error.message);
    }
  };

  const handleDownloadDocument = async (documentId, documentType) => {
    try {
      await downloadDocument(documentId, documentType);
      toast.success('Document downloaded successfully');
    } catch (error) {
      toast.error(error.message);
    }
  };

  const handleCopyReference = (reference) => {
    navigator.clipboard.writeText(reference);
    setCopiedId(reference);
    toast.success('Reference copied to clipboard');
    setTimeout(() => setCopiedId(null), 2000);
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
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getDocumentIcon = (type) => {
    const docType = documentTypes.find(dt => dt.value === type);
    return docType ? docType.icon : FileText;
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'completed':
      case 'delivered':
      case 'paid':
        return 'bg-green-100 text-green-800';
      case 'pending':
      case 'processing':
        return 'bg-yellow-100 text-yellow-800';
      case 'cancelled':
      case 'voided':
      case 'rejected':
        return 'bg-red-100 text-red-800';
      case 'draft':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getDocumentTypeLabel = (type) => {
    const docType = documentTypes.find(dt => dt.value === type);
    return docType ? docType.label : type;
  };

  const clearFilters = () => {
    const clearedFilters = {
      documentType: '',
      customer: '',
      store: '',
      startDate: '',
      endDate: '',
      status: '',
      search: ''
    };
    setFilters(clearedFilters);
    loadDocuments(clearedFilters);
  };

  const hasActiveFilters = () => {
    return Object.values(filters).some(value => value !== '');
  };

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <FileText className="w-8 h-8 text-blue-600" />
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Documents Management</h1>
              <p className="text-gray-600">Manage and access all your sales documents</p>
            </div>
          </div>
          <button
            onClick={() => loadDocuments()}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          {documentTypes.filter(dt => dt.value !== 'all').map((type) => {
            const count = documents.filter(doc => 
              type.value === 'all' || doc.document_type === type.value
            ).length;
            const Icon = type.icon;
            
            return (
              <div key={type.value} className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-2xl font-bold text-gray-900">{count}</p>
                    <p className="text-sm text-gray-600">{type.label}</p>
                  </div>
                  <div className={`p-3 rounded-lg bg-gray-50 ${type.color}`}>
                    <Icon className="w-6 h-6" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Enhanced Filters */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 mb-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <Filter className="w-5 h-5 text-gray-600" />
            <h2 className="text-lg font-semibold text-gray-900">Filters & Search</h2>
          </div>
          {hasActiveFilters() && (
            <button
              onClick={clearFilters}
              className="text-sm text-red-600 hover:text-red-800"
            >
              Clear All Filters
            </button>
          )}
        </div>
        
        {/* Search Bar */}
        <div className="mb-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search by reference, customer, or notes..."
              value={filters.search}
              onChange={(e) => handleFilterChange('search', e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {/* Document Type Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Document Type
            </label>
            <select
              value={filters.documentType}
              onChange={(e) => handleFilterChange('documentType', e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
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
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
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
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Stores</option>
              {stores.map(store => (
                <option key={store.id} value={store.id}>
                  {store.name}
                </option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Status
            </label>
            <select
              value={filters.status}
              onChange={(e) => handleFilterChange('status', e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Status</option>
              <option value="completed">Completed</option>
              <option value="pending">Pending</option>
              <option value="draft">Draft</option>
              <option value="cancelled">Cancelled</option>
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
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
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
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Documents List */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">
            Documents ({documents.length})
          </h2>
          <div className="text-sm text-gray-600">
            {loading ? 'Loading...' : `${documents.length} documents found`}
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
            <p className="text-gray-600 mb-4">Try adjusting your filters to see more results</p>
            {hasActiveFilters() && (
              <button
                onClick={clearFilters}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Clear All Filters
              </button>
            )}
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {documents.map(document => {
              const DocumentIcon = getDocumentIcon(document.document_type);
              const isExpanded = expandedDocument === document.id;
              const reference = document.reference_no || document.delivery_note_number || document.payment_reference;
              
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
                            {getDocumentTypeLabel(document.document_type)} #{reference}
                          </h3>
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(document.status)}`}>
                            {document.status || 'Unknown'}
                          </span>
                        </div>
                        
                        <div className="flex items-center gap-4 text-sm text-gray-600 flex-wrap">
                          <span className="flex items-center gap-1">
                            <User className="w-4 h-4" />
                            {document.customer_name || 'Unknown Customer'}
                          </span>
                          <span className="flex items-center gap-1">
                            <Store className="w-4 h-4" />
                            {document.store_name || 'Unknown Store'}
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

                    <div className="flex items-center gap-1">
                      {/* Copy Reference */}
                      <button
                        onClick={() => handleCopyReference(reference)}
                        className="p-2 text-gray-600 hover:text-blue-600 transition-colors"
                        title="Copy Reference"
                      >
                        {copiedId === reference ? (
                          <CheckCircle2 className="w-4 h-4 text-green-600" />
                        ) : (
                          <Copy className="w-4 h-4" />
                        )}
                      </button>
                      
                      {/* View Details */}
                      <button
                        onClick={() => toggleDocumentDetails(document.id)}
                        className="p-2 text-gray-600 hover:text-gray-900 transition-colors"
                        title="View Details"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      
                      {/* Print */}
                      <button
                        onClick={() => handlePrintDocument(document.id, document.document_type)}
                        className="p-2 text-gray-600 hover:text-blue-600 transition-colors"
                        title="Print"
                      >
                        <Printer className="w-4 h-4" />
                      </button>
                      
                      {/* Download */}
                      <button
                        onClick={() => handleDownloadDocument(document.id, document.document_type)}
                        className="p-2 text-gray-600 hover:text-green-600 transition-colors"
                        title="Download"
                      >
                        <Download className="w-4 h-4" />
                      </button>
                      
                      {/* Expand/Collapse */}
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
                    <div className="mt-4 pl-12 border-t border-gray-200 pt-4 animate-in fade-in">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Document Details */}
                        <div>
                          <h4 className="font-medium text-gray-900 mb-3">Document Details</h4>
                          <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                              <span className="text-gray-600">Document Type:</span>
                              <span className="font-medium capitalize">
                                {document.document_type?.replace('_', ' ') || 'Unknown'}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600">Reference:</span>
                              <span className="font-medium">{reference}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600">Created:</span>
                              <span className="font-medium">{formatDate(document.created_at)}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600">Status:</span>
                              <span className={`font-medium ${getStatusColor(document.status).replace('bg-', 'text-')}`}>
                                {document.status || 'Unknown'}
                              </span>
                            </div>
                            {document.payment_method && (
                              <div className="flex justify-between">
                                <span className="text-gray-600">Payment Method:</span>
                                <span className="font-medium capitalize">
                                  {document.payment_method.replace('_', ' ')}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Customer Details */}
                        <div>
                          <h4 className="font-medium text-gray-900 mb-3">Customer Details</h4>
                          <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                              <span className="text-gray-600">Customer:</span>
                              <span className="font-medium">{document.customer_name || 'Unknown'}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600">Store:</span>
                              <span className="font-medium">{document.store_name || 'Unknown'}</span>
                            </div>
                            {document.customer_code && (
                              <div className="flex justify-between">
                                <span className="text-gray-600">Customer Code:</span>
                                <span className="font-medium">{document.customer_code}</span>
                              </div>
                            )}
                            {document.customer_phone && (
                              <div className="flex justify-between">
                                <span className="text-gray-600">Phone:</span>
                                <span className="font-medium">{document.customer_phone}</span>
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
                                    <th className="px-3 py-2 text-left font-medium text-gray-900">SKU</th>
                                    <th className="px-3 py-2 text-left font-medium text-gray-900">Quantity</th>
                                    <th className="px-3 py-2 text-left font-medium text-gray-900">Price</th>
                                    <th className="px-3 py-2 text-left font-medium text-gray-900">Total</th>
                                  </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200">
                                  {document.items.map((item, index) => (
                                    <tr key={index}>
                                      <td className="px-3 py-2">{item.item_name}</td>
                                      <td className="px-3 py-2 text-gray-600">{item.item_sku}</td>
                                      <td className="px-3 py-2">{item.quantity}</td>
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
                                      <td colSpan="4" className="px-3 py-2 text-right font-medium">
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
                                <span className="font-medium capitalize">{document.payment_method}</span>
                              </div>
                              {document.reference && (
                                <div className="flex justify-between col-span-2">
                                  <span className="text-gray-600">Reference:</span>
                                  <span className="font-medium">{document.reference}</span>
                                </div>
                              )}
                              {document.notes && (
                                <div className="flex justify-between col-span-2">
                                  <span className="text-gray-600">Notes:</span>
                                  <span className="font-medium">{document.notes}</span>
                                </div>
                              )}
                            </div>
                          </div>
                        )}

                        {/* Notes Section */}
                        {document.notes && (
                          <div className="md:col-span-2">
                            <h4 className="font-medium text-gray-900 mb-3">Notes</h4>
                            <div className="bg-gray-50 p-3 rounded-lg">
                              <p className="text-sm text-gray-700">{document.notes}</p>
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
    </div>
  );
};

export default EnhancedDocumentsManagement;