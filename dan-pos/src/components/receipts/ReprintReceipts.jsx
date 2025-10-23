// components/ReprintReceipts.jsx
import React, { useState, useEffect } from 'react';
import { Search, Printer, Calendar, FileText, X, Filter, Download } from 'lucide-react';
import ReceiptPrint from './ReceiptPrint';
import { searchSales } from '@/lib/api/possale';

const ReprintReceipts = ({ isOpen, onClose }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedSale, setSelectedSale] = useState(null);
  const [showReceipt, setShowReceipt] = useState(false);
  const [stats, setStats] = useState(null);

  // Load today's date as default end date
  useEffect(() => {
    if (isOpen) {
      const today = new Date().toISOString().split('T')[0];
      setEndDate(today);
      
      // Set start date to today for default search
      setStartDate(today);
      
      // Auto-search today's receipts when component opens
      setTimeout(() => {
        searchReceipts();
      }, 100);
    }
  }, [isOpen]);

  const searchReceipts = async () => {
    if (!startDate || !endDate) {
      alert('Please select both start and end dates');
      return;
    }

    setLoading(true);
    try {
      const response = await searchSales({
        start_date: startDate,
        end_date: endDate,
        search_term: searchTerm,
        limit: 100
      });
      setSales(response.results || []);
      
      // Calculate statistics
      if (response.results && response.results.length > 0) {
        const totalSales = response.results.reduce((sum, sale) => sum + sale.total_amount, 0);
        const totalTransactions = response.results.length;
        
        // Payment method breakdown
        const paymentMethods = {};
        response.results.forEach(sale => {
          const method = sale.payment_method === 'mixed' ? 'Split Payment' : sale.payment_method;
          paymentMethods[method] = (paymentMethods[method] || 0) + 1;
        });
        
        setStats({
          totalSales,
          totalTransactions,
          paymentMethods
        });
      } else {
        setStats(null);
      }
    } catch (error) {
      console.error('Failed to search receipts:', error);
      alert('Failed to search receipts: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleReprint = (sale) => {
    setSelectedSale(sale);
    setShowReceipt(true);
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

  const formatCurrency = (amount) => {
    return `KES ${parseFloat(amount).toLocaleString('en-KE', { minimumFractionDigits: 2 })}`;
  };

  const clearFilters = () => {
    setSearchTerm('');
    const today = new Date().toISOString().split('T')[0];
    setStartDate(today);
    setEndDate(today);
  };

  const quickDateFilter = (days) => {
    const end = new Date();
    const start = new Date();
    start.setDate(start.getDate() - days);
    
    setStartDate(start.toISOString().split('T')[0]);
    setEndDate(end.toISOString().split('T')[0]);
    searchReceipts();
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg w-full max-w-6xl max-h-[95vh] overflow-hidden">
          {/* Header */}
          <div className="bg-gray-800 text-white p-4 flex justify-between items-center">
            <div>
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Reprint Receipts
              </h3>
              <p className="text-sm text-gray-300 mt-1">
                Search and reprint past receipts
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-700 rounded-full transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Quick Date Filters */}
          <div className="bg-gray-50 p-3 border-b border-gray-200">
            <div className="flex flex-wrap gap-2">
              <span className="text-sm text-gray-600 font-medium flex items-center gap-1">
                <Filter className="w-4 h-4" />
                Quick Filters:
              </span>
              <button
                onClick={() => quickDateFilter(0)}
                className="px-3 py-1 bg-blue-100 text-blue-700 rounded text-sm hover:bg-blue-200"
              >
                Today
              </button>
              <button
                onClick={() => quickDateFilter(1)}
                className="px-3 py-1 bg-green-100 text-green-700 rounded text-sm hover:bg-green-200"
              >
                Last 2 Days
              </button>
              <button
                onClick={() => quickDateFilter(6)}
                className="px-3 py-1 bg-purple-100 text-purple-700 rounded text-sm hover:bg-purple-200"
              >
                Last Week
              </button>
              <button
                onClick={() => quickDateFilter(29)}
                className="px-3 py-1 bg-orange-100 text-orange-700 rounded text-sm hover:bg-orange-200"
              >
                Last 30 Days
              </button>
            </div>
          </div>

          {/* Search Filters */}
          <div className="p-4 border-b border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Search Term
                </label>
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Receipt #, Customer name..."
                  className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Start Date
                </label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  End Date
                </label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div className="flex items-end gap-2">
                <button
                  onClick={searchReceipts}
                  disabled={loading}
                  className="flex-1 bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 disabled:bg-gray-400 flex items-center justify-center gap-2 transition-colors"
                >
                  {loading ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  ) : (
                    <Search className="w-4 h-4" />
                  )}
                  {loading ? 'Searching...' : 'Search'}
                </button>
                <button
                  onClick={clearFilters}
                  className="px-3 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 transition-colors"
                  title="Clear filters"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="flex items-end">
                <div className="text-sm text-gray-600 bg-gray-100 p-2 rounded w-full">
                  <div className="font-semibold">{sales.length} receipts</div>
                  {stats && (
                    <div className="text-xs">
                      KES {stats.totalSales?.toLocaleString()}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Statistics */}
          {stats && (
            <div className="bg-blue-50 p-3 border-b border-blue-200">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
                <div className="text-center">
                  <div className="font-semibold text-blue-800">Total Sales</div>
                  <div className="text-lg font-bold text-blue-900">
                    {formatCurrency(stats.totalSales)}
                  </div>
                </div>
                <div className="text-center">
                  <div className="font-semibold text-green-800">Transactions</div>
                  <div className="text-lg font-bold text-green-900">
                    {stats.totalTransactions}
                  </div>
                </div>
                <div className="text-center">
                  <div className="font-semibold text-purple-800">Average Sale</div>
                  <div className="text-lg font-bold text-purple-900">
                    {formatCurrency(stats.totalSales / stats.totalTransactions)}
                  </div>
                </div>
                <div className="text-center">
                  <div className="font-semibold text-orange-800">Payment Methods</div>
                  <div className="text-xs text-orange-900">
                    {Object.entries(stats.paymentMethods).map(([method, count]) => (
                      <div key={method}>{method}: {count}</div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Results */}
          <div className="p-4 overflow-y-auto max-h-96">
            {sales.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <FileText className="w-16 h-16 mx-auto mb-4 opacity-50" />
                <p className="text-lg font-medium">No receipts found</p>
                <p className="text-sm mt-2">
                  {loading ? 'Searching...' : 'Try adjusting your search filters or date range'}
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {sales.map((sale) => (
                  <div
                    key={sale.id}
                    className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
                    onClick={() => handleReprint(sale)}
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="font-bold text-lg text-gray-900">
                          #{sale.reference_no}
                        </span>
                        <span className="text-sm text-gray-600 bg-gray-100 px-2 py-1 rounded">
                          {formatDate(sale.created_at)}
                        </span>
                        <span className={`text-sm px-2 py-1 rounded capitalize ${
                          sale.payment_method === 'mixed' 
                            ? 'bg-purple-100 text-purple-800'
                            : sale.payment_method === 'cash'
                            ? 'bg-green-100 text-green-800'
                            : sale.payment_method === 'mpesa'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {sale.payment_method === 'mixed' ? 'Split Payment' : sale.payment_method}
                        </span>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
                        <div>
                          <span className="font-medium">Customer:</span> {sale.customer_name}
                        </div>
                        <div>
                          <span className="font-medium">Store:</span> {sale.store_name}
                        </div>
                        <div>
                          <span className="font-medium">Items:</span> {sale.lines.length} items
                        </div>
                      </div>
                      {sale.notes && (
                        <div className="text-sm text-gray-500 mt-1">
                          <span className="font-medium">Notes:</span> {sale.notes}
                        </div>
                      )}
                    </div>
                    <div className="text-right ml-4">
                      <div className="font-bold text-lg text-green-600 mb-2">
                        {formatCurrency(sale.total_amount)}
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleReprint(sale);
                        }}
                        className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 flex items-center gap-2 transition-colors"
                      >
                        <Printer className="w-4 h-4" />
                        Reprint
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Receipt Print Modal */}
      {showReceipt && selectedSale && (
        <ReceiptPrint
          sale={selectedSale}
          onClose={() => {
            setShowReceipt(false);
            setSelectedSale(null);
          }}
          isReprint={true}
        />
      )}
    </>
  );
};

export default ReprintReceipts;