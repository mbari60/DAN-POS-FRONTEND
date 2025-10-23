import React from 'react';

const PaymentReceipt = ({ documentData }) => {
  // Safe data extraction with fallbacks
  const customer = documentData?.customer || {};
  const allocations = documentData?.allocations || [];
  
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES'
    }).format(amount || 0);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-KE', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const customerName = customer?.name || 'Walk-in Customer';
  const customerCode = customer?.code || customer?.customer_code || 'N/A';

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
      
      {/* Company Header */}
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
          Official Payment Receipt
        </div>
      </div>

      {/* Receipt Title */}
      <div style={{
        textAlign: 'center',
        marginBottom: '15px'
      }}>
        <div style={{
          fontSize: '18pt',
          fontWeight: 'bold',
          color: '#28a745',
          textTransform: 'uppercase',
          letterSpacing: '1px'
        }}>
          Payment Receipt
        </div>
      </div>

      {/* Receipt Details */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '12px',
        marginBottom: '15px',
        fontSize: '9pt'
      }}>
        {/* Receipt Information */}
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
            Receipt Details
          </div>
          <table style={{ width: '100%', fontSize: '8pt' }}>
            <tbody>
              <tr>
                <td style={{ width: '80px', color: '#666666' }}>Receipt No:</td>
                <td style={{ fontWeight: 'bold' }}>{documentData.receipt_number || documentData.payment_reference || 'N/A'}</td>
              </tr>
              <tr>
                <td style={{ color: '#666666' }}>Date:</td>
                <td>{documentData.date || new Date().toLocaleDateString()}</td>
              </tr>
              <tr>
                <td style={{ color: '#666666' }}>Time:</td>
                <td>{documentData.time || new Date().toLocaleTimeString()}</td>
              </tr>
              <tr>
                <td style={{ color: '#666666' }}>Status:</td>
                <td style={{ 
                  fontWeight: 'bold', 
                  color: documentData.is_voided ? '#dc3545' : '#28a745' 
                }}>
                  {documentData.is_voided ? 'VOIDED' : 'PAID'}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

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
            Customer Details
          </div>
          <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>{customerName}</div>
          <table style={{ width: '100%', fontSize: '8pt' }}>
            <tbody>
              <tr>
                <td style={{ width: '50px', color: '#666666' }}>Code:</td>
                <td>{customerCode}</td>
              </tr>
              <tr>
                <td style={{ color: '#666666' }}>Received By:</td>
                <td>{documentData.received_by || 'N/A'}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Payment Summary */}
      <div style={{
        border: '1px solid #dee2e6',
        padding: '12px',
        marginBottom: '15px',
        background: '#f8f9fa'
      }}>
        <div style={{
          fontWeight: 'bold',
          marginBottom: '8px',
          color: '#2c5aa0',
          fontSize: '10pt'
        }}>
          Payment Summary
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', fontSize: '9pt' }}>
          <div style={{ fontWeight: 'bold' }}>Amount Received:</div>
          <div style={{ 
            fontWeight: 'bold', 
            fontSize: '12pt', 
            color: '#28a745',
            textAlign: 'right'
          }}>
            {formatCurrency(documentData.amount)}
          </div>
          
          <div>Payment Method:</div>
          <div style={{ textAlign: 'right', fontWeight: '600' }}>
            {documentData.payment_method || 'N/A'}
          </div>
          
          <div>Reference:</div>
          <div style={{ textAlign: 'right' }}>
            {documentData.reference || 'N/A'}
          </div>
        </div>
      </div>

      {/* Amount in Words */}
      {documentData.amount_in_words && (
        <div style={{
          border: '1px solid #dee2e6',
          padding: '10px',
          marginBottom: '15px',
          background: '#fffaf0',
          fontSize: '9pt'
        }}>
          <div style={{ fontWeight: 'bold', marginBottom: '4px', color: '#856404' }}>
            AMOUNT IN WORDS
          </div>
          <div style={{ fontStyle: 'italic', color: '#666666' }}>
            {documentData.amount_in_words} Kenya Shillings Only
          </div>
        </div>
      )}

      {/* Allocations */}
      {allocations.length > 0 && (
        <div style={{ marginBottom: '15px' }}>
          <div style={{
            fontWeight: 'bold',
            marginBottom: '8px',
            color: '#2c5aa0',
            fontSize: '10pt'
          }}>
            Applied to Invoices
          </div>
          <table style={{
            width: '100%',
            borderCollapse: 'collapse',
            border: '1px solid #dee2e6',
            fontSize: '8pt'
          }}>
            <thead>
              <tr style={{ background: '#2c5aa0', color: '#ffffff' }}>
                <th style={{ border: '1px solid #1a3a6b', padding: '8px', textAlign: 'left' }}>
                  Invoice No
                </th>
                <th style={{ border: '1px solid #1a3a6b', padding: '8px', textAlign: 'left' }}>
                  Date
                </th>
                <th style={{ border: '1px solid #1a3a6b', padding: '8px', textAlign: 'right' }}>
                  Amount Applied
                </th>
              </tr>
            </thead>
            <tbody>
              {allocations.map((allocation, index) => (
                <tr key={index} style={{
                  borderBottom: '1px solid #dee2e6',
                  background: index % 2 === 0 ? '#ffffff' : '#f8f9fa'
                }}>
                  <td style={{ border: '1px solid #dee2e6', padding: '6px' }}>
                    {allocation.invoice_number}
                  </td>
                  <td style={{ border: '1px solid #dee2e6', padding: '6px' }}>
                    {formatDate(allocation.invoice_date)}
                  </td>
                  <td style={{ 
                    border: '1px solid #dee2e6', 
                    padding: '6px', 
                    textAlign: 'right',
                    fontWeight: '600'
                  }}>
                    {formatCurrency(allocation.amount_allocated)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Notes */}
      {documentData.notes && (
        <div style={{
          border: '1px solid #dee2e6',
          padding: '10px',
          marginBottom: '15px',
          background: '#f8f9fa',
          fontSize: '8pt'
        }}>
          <div style={{ fontWeight: 'bold', marginBottom: '4px', color: '#666666' }}>
            NOTES
          </div>
          <div style={{ color: '#666666', lineHeight: '1.4' }}>
            {documentData.notes}
          </div>
        </div>
      )}

      {/* Footer */}
      <div style={{
        textAlign: 'center',
        fontSize: '8pt',
        paddingTop: '10px',
        borderTop: '1px solid #dee2e6',
        color: '#666666',
        marginTop: 'auto'
      }}>
        <div style={{ marginBottom: '4px', fontStyle: 'italic' }}>
          {documentData.is_voided 
            ? '*** THIS RECEIPT HAS BEEN VOIDED ***' 
            : 'This is an official receipt. Please keep it for your records.'
          }
        </div>
        <div>
          Thank you for your payment
        </div>
      </div>
    </div>
  );
};

export default PaymentReceipt;

