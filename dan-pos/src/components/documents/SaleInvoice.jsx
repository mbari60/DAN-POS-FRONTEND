// components/documents/SaleInvoice.jsx
import React from 'react';

const SaleInvoice = ({ documentData }) => {
  // Safe data extraction with fallbacks
  const customer = documentData?.customer || {};
  const store = documentData?.store || {};
  const companyDetails = documentData?.company_details || {};
  const paymentInfo = documentData?.payment_info || {};
  const totals = documentData?.totals || {};
  const items = documentData?.items || [];
  const terms = documentData?.terms || [];
  
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES'
    }).format(amount || 0);
  };

  const customerName = customer?.name || 'Walk-in Customer';
  const customerCode = customer?.code || customer?.customer_code || 'N/A';
  const customerPhone = customer?.phone || customer?.phone_number || 'N/A';
  const customerEmail = customer?.email || 'N/A';
  const customerAddress = customer?.address || customer?.contact_info || customer?.location || 'N/A';
  const storeName = store?.name || 'N/A';
  const storeLocation = store?.location || store?.address || 'N/A';
  const salesPerson = documentData?.sales_person || 'System';
  const paymentMethod = documentData?.payment_method || 'N/A';

  return (
    <div style={{
      width: '210mm',
      minHeight: '297mm',
      maxHeight: '297mm',
      padding: '12mm',
      margin: '0 auto',
      background: '#ffffff',
      fontFamily: "'Helvetica', 'Arial', sans-serif",
      fontSize: '10pt',
      lineHeight: '1.3',
      color: '#000000',
      position: 'relative',
      boxSizing: 'border-box',
      overflow: 'hidden'
    }}>
      
      {/* Company Header - Compact */}
      <div style={{
        textAlign: 'center',
        marginBottom: '15px',
        paddingBottom: '10px',
        borderBottom: '2px solid #2c5aa0'
      }}>
        <div style={{
          fontSize: '20pt',
          fontWeight: 'bold',
          marginBottom: '4px',
          color: '#2c5aa0',
          letterSpacing: '0.5px'
        }}>
          {documentData.company_name || 'YOUR COMPANY NAME LTD'}
        </div>
        <div style={{
          fontSize: '9pt',
          color: '#666666',
          lineHeight: '1.2'
        }}>
          {companyDetails.address || '123 Business Street, Nairobi, Kenya'} • 
          {companyDetails.phone || ' +254 700 000000'} • 
          {companyDetails.email || ' info@company.com'}
        </div>
      </div>

      {/* Invoice Title */}
      <div style={{
        textAlign: 'center',
        marginBottom: '15px'
      }}>
        <div style={{
          fontSize: '18pt',
          fontWeight: 'bold',
          color: '#2c5aa0',
          textTransform: 'uppercase',
          letterSpacing: '1px'
        }}>
          Sale Invoice
        </div>
      </div>

      {/* Document Info - Compact */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        marginBottom: '12px',
        padding: '10px',
        background: '#f8f9fa',
        border: '1px solid #dee2e6',
        fontSize: '9pt'
      }}>
        <div>
          <span style={{ color: '#666666' }}>Invoice No: </span>
          <strong>{documentData.invoice_number || documentData.reference_no || 'N/A'}</strong>
        </div>
        <div>
          <span style={{ color: '#666666' }}>Date: </span>
          <strong>{documentData.invoice_date || new Date().toLocaleDateString()}</strong>
        </div>
      </div>

      {/* Customer & Store Information - Compact Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '12px',
        marginBottom: '15px',
        fontSize: '9pt'
      }}>
        {/* Customer Information */}
        <div style={{
          border: '1px solid #2c5aa0',
          padding: '12px',
          background: '#ffffff'
        }}>
          <div style={{
            fontWeight: 'bold',
            marginBottom: '8px',
            color: '#2c5aa0',
            fontSize: '10pt'
          }}>
            Bill To
          </div>
          <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>{customerName}</div>
          <div style={{ color: '#666666', marginBottom: '6px', fontSize: '8pt' }}>
            {customerAddress}
          </div>
          <table style={{ width: '100%', fontSize: '8pt' }}>
            <tbody>
              <tr>
                <td style={{ width: '50px', color: '#666666' }}>Code:</td>
                <td>{customerCode}</td>
              </tr>
              <tr>
                <td style={{ color: '#666666' }}>Phone:</td>
                <td>{customerPhone}</td>
              </tr>
              <tr>
                <td style={{ color: '#666666' }}>Email:</td>
                <td>{customerEmail}</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Store & Payment Information */}
        <div style={{
          border: '1px solid #28a745',
          padding: '12px',
          background: '#ffffff'
        }}>
          <div style={{
            fontWeight: 'bold',
            marginBottom: '8px',
            color: '#28a745',
            fontSize: '10pt'
          }}>
            Store Details
          </div>
          <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>{storeName}</div>
          <div style={{ color: '#666666', marginBottom: '6px', fontSize: '8pt' }}>
            {storeLocation}
          </div>
          <table style={{ width: '100%', fontSize: '8pt' }}>
            <tbody>
              <tr>
                <td style={{ width: '70px', color: '#666666' }}>Sales Person:</td>
                <td>{salesPerson}</td>
              </tr>
              <tr>
                <td style={{ color: '#666666' }}>Payment Method:</td>
                <td style={{ fontWeight: '600' }}>{paymentMethod}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Items Table - Compact */}
      <table style={{
        width: '100%',
        borderCollapse: 'collapse',
        marginBottom: '12px',
        border: '1px solid #dee2e6',
        fontSize: '8pt'
      }}>
        <thead>
          <tr style={{ background: '#2c5aa0', color: '#ffffff' }}>
            <th style={{ border: '1px solid #1a3a6b', padding: '8px 4px', width: '4%', textAlign: 'center' }}>
              No.
            </th>
            <th style={{ border: '1px solid #1a3a6b', padding: '8px 8px', width: '48%', textAlign: 'left' }}>
              Item Description
            </th>
            <th style={{ border: '1px solid #1a3a6b', padding: '8px 4px', width: '8%', textAlign: 'center' }}>
              Qty
            </th>
            <th style={{ border: '1px solid #1a3a6b', padding: '8px 6px', width: '15%', textAlign: 'right' }}>
              Unit Price
            </th>
            <th style={{ border: '1px solid #1a3a6b', padding: '8px 6px', width: '15%', textAlign: 'right' }}>
              Amount
            </th>
          </tr>
        </thead>
        <tbody>
          {items.map((item, index) => (
            <tr key={item.index || index} style={{
              borderBottom: '1px solid #dee2e6',
              background: index % 2 === 0 ? '#ffffff' : '#f8f9fa'
            }}>
              <td style={{ border: '1px solid #dee2e6', padding: '6px 4px', textAlign: 'center', fontWeight: '600' }}>
                {item.index || index + 1}
              </td>
              <td style={{ border: '1px solid #dee2e6', padding: '6px 8px' }}>
                <div style={{ fontWeight: '600' }}>{item.name || item.item_name || 'N/A'}</div>
                {item.sku && item.sku !== 'N/A' && (
                  <div style={{ color: '#666666', fontSize: '7pt' }}>SKU: {item.sku}</div>
                )}
              </td>
              <td style={{ border: '1px solid #dee2e6', padding: '6px 4px', textAlign: 'center', fontWeight: '600' }}>
                {item.quantity || '0'}
              </td>
              <td style={{ border: '1px solid #dee2e6', padding: '6px 6px', textAlign: 'right', fontWeight: '600' }}>
                {formatCurrency(item.unit_price)}
              </td>
              <td style={{ border: '1px solid #dee2e6', padding: '6px 6px', textAlign: 'right', fontWeight: 'bold', color: '#2c5aa0' }}>
                {formatCurrency(item.line_total)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Financial Summary & Payment Status - Side by Side */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '12px',
        marginBottom: '12px'
      }}>
        {/* Payment Status */}
        <div style={{
          border: '1px solid #dee2e6',
          padding: '12px',
          background: '#f8f9fa',
          fontSize: '9pt'
        }}>
          <div style={{ fontWeight: 'bold', marginBottom: '8px', color: '#2c5aa0' }}>
            Payment Status
          </div>
          {paymentInfo.is_credit ? (
            <div>
              <div style={{ fontWeight: 'bold', color: '#dc3545', marginBottom: '6px', fontSize: '10pt' }}>
                CREDIT SALE
              </div>
              <div style={{ marginBottom: '4px' }}>
                <strong>Balance Due:</strong> {formatCurrency(totals.balance_due)}
              </div>
              <div style={{ marginBottom: '4px' }}>
                <strong>Terms:</strong> {paymentInfo.terms || 'Due on Receipt'}
              </div>
            </div>
          ) : (
            <div>
              <div style={{ 
                fontWeight: 'bold', 
                marginBottom: '6px', 
                fontSize: '10pt',
                color: totals.balance_due === 0 ? '#28a745' : '#dc3545'
              }}>
                {totals.balance_due === 0 ? 'PAID IN FULL' : 'PARTIAL PAYMENT'}
              </div>
              <div style={{ marginBottom: '4px' }}>
                <strong>Amount Paid:</strong> {formatCurrency(totals.amount_paid)}
              </div>
              {totals.balance_due > 0 && (
                <div style={{ marginBottom: '4px' }}>
                  <strong>Balance Due:</strong> {formatCurrency(totals.balance_due)}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Financial Summary */}
        <div style={{
          border: '1px solid #dee2e6',
          padding: '12px',
          background: '#ffffff',
          fontSize: '9pt'
        }}>
          <div style={{ fontWeight: 'bold', marginBottom: '8px', color: '#2c5aa0' }}>
            Financial Summary
          </div>
          <table style={{ width: '100%' }}>
            <tbody>
              <tr>
                <td style={{ padding: '2px 0' }}><strong>Sub Total:</strong></td>
                <td style={{ padding: '2px 0', textAlign: 'right', fontWeight: '600' }}>
                  {formatCurrency(totals.subtotal || totals.grand_total)}
                </td>
              </tr>
              <tr style={{ borderTop: '1px solid #dee2e6' }}>
                <td style={{ padding: '4px 0', fontWeight: 'bold' }}>GRAND TOTAL:</td>
                <td style={{ padding: '4px 0', textAlign: 'right', fontWeight: 'bold', color: '#2c5aa0' }}>
                  {formatCurrency(totals.grand_total)}
                </td>
              </tr>
              <tr>
                <td style={{ padding: '2px 0' }}><strong>Amount Paid:</strong></td>
                <td style={{ padding: '2px 0', textAlign: 'right', fontWeight: '600' }}>
                  {formatCurrency(totals.amount_paid)}
                </td>
              </tr>
              <tr style={{ borderTop: '1px solid #dee2e6' }}>
                <td style={{ padding: '4px 0', fontWeight: 'bold' }}>BALANCE DUE:</td>
                <td style={{ 
                  padding: '4px 0', 
                  textAlign: 'right', 
                  fontWeight: 'bold', 
                  color: totals.balance_due > 0 ? '#dc3545' : '#28a745'
                }}>
                  {formatCurrency(totals.balance_due)}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Notes Section - Compact */}
      {documentData.notes && (
        <div style={{
          border: '1px solid #dee2e6',
          padding: '10px',
          marginBottom: '12px',
          background: '#fffaf0',
          fontSize: '8pt'
        }}>
          <div style={{ fontWeight: 'bold', marginBottom: '4px', color: '#856404' }}>
            NOTES
          </div>
          <div style={{ color: '#666666', lineHeight: '1.4' }}>
            {documentData.notes}
          </div>
        </div>
      )}

      {/* Terms & Conditions - Compact */}
      {terms.length > 0 && (
        <div style={{
          border: '1px solid #dee2e6',
          padding: '10px',
          marginBottom: '12px',
          background: '#f8f9fa',
          fontSize: '7pt'
        }}>
          <div style={{ fontWeight: 'bold', marginBottom: '4px', color: '#2c5aa0' }}>
            TERMS & CONDITIONS
          </div>
          <ul style={{ 
            margin: 0, 
            paddingLeft: '12px',
            color: '#666666',
            lineHeight: '1.3'
          }}>
            {terms.slice(0, 3).map((term, index) => (
              <li key={index} style={{ marginBottom: '2px' }}>
                {term}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Footer - Compact */}
      <div style={{
        textAlign: 'center',
        fontSize: '8pt',
        paddingTop: '10px',
        borderTop: '1px solid #dee2e6',
        color: '#666666',
        marginTop: 'auto'
      }}>
        <div style={{ marginBottom: '4px', fontStyle: 'italic' }}>
          This is a computer-generated invoice. No signature required.
        </div>
        <div>
          Thank you for your business
        </div>
      </div>
    </div>
  );
};

export default SaleInvoice;