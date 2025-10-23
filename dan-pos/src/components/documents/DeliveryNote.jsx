import React from 'react';

const DeliveryNote = ({ documentData }) => {
  // Safe data extraction with fallbacks
  console.log('DeliveryNote documentData:', documentData);
  const customer = documentData?.customer || {};
  const store = documentData?.store || {};
  const items = documentData?.items || [];
  
  const customerName = customer?.name || 'Walk-in Customer';
  const customerCode = customer?.code || customer?.customer_code || 'N/A';
  const customerPhone = customer?.phone || customer?.phone_number || 'N/A';
  const customerAddress = customer?.address || customer?.contact_info || customer?.location || 'N/A';
  const storeName = store?.name || 'N/A';
  const storeLocation = store?.location || store?.address || 'N/A';

  const totalItems = items.reduce((sum, item) => sum + parseInt(item.quantity || 0), 0);

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
          {storeLocation || '123 Business Street, Nairobi, Kenya'}
        </div>
      </div>

      {/* Delivery Note Title */}
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
          Delivery Note
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
          <span style={{ color: '#666666' }}>Delivery Note No: </span>
          <strong>{documentData.delivery_note_number || documentData.reference_no || 'N/A'}</strong>
        </div>
        <div>
          <span style={{ color: '#666666' }}>Date: </span>
          <strong>{documentData.date || new Date().toLocaleDateString()}</strong>
        </div>
      </div>

      {/* Customer Information - Compact Grid */}
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
            Deliver To
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
            </tbody>
          </table>
        </div>

        {/* Delivery Details */}
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
            Delivery Details
          </div>
          <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>{storeName}</div>
          <div style={{ color: '#666666', marginBottom: '6px', fontSize: '8pt' }}>
            {storeLocation}
          </div>
          <table style={{ width: '100%', fontSize: '8pt' }}>
            <tbody>
              <tr>
                <td style={{ width: '70px', color: '#666666' }}>Prepared By:</td>
                <td>{documentData.prepared_by || 'System'}</td>
              </tr>
              <tr>
                <td style={{ color: '#666666' }}>Delivery Date:</td>
                <td style={{ fontWeight: '600' }}>{documentData.delivery_date || documentData.date || new Date().toLocaleDateString()}</td>
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
            <th style={{ border: '1px solid #1a3a6b', padding: '8px 4px', width: '5%', textAlign: 'center' }}>
              No.
            </th>
            <th style={{ border: '1px solid #1a3a6b', padding: '8px 8px', width: '55%', textAlign: 'left' }}>
              Item Description
            </th>
            <th style={{ border: '1px solid #1a3a6b', padding: '8px 4px', width: '15%', textAlign: 'center' }}>
              Item Code
            </th>
            <th style={{ border: '1px solid #1a3a6b', padding: '8px 4px', width: '10%', textAlign: 'center' }}>
              Quantity
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
              </td>
              <td style={{ border: '1px solid #dee2e6', padding: '6px 4px', textAlign: 'center', color: '#666666' }}>
                {item.sku || item.item_sku || 'N/A'}
              </td>
              <td style={{ border: '1px solid #dee2e6', padding: '6px 4px', textAlign: 'center', fontWeight: '600' }}>
                {item.quantity || '0'}
              </td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr style={{ background: '#e9ecef', fontWeight: 'bold' }}>
            <td colSpan="3" style={{
              border: '1px solid #dee2e6',
              padding: '8px 8px',
              textAlign: 'right',
              fontSize: '9pt'
            }}>
              TOTAL ITEMS DELIVERED
            </td>
            <td style={{
              border: '1px solid #dee2e6',
              padding: '8px 4px',
              textAlign: 'center',
              fontSize: '9pt',
              color: '#2c5aa0'
            }}>
              {totalItems}
            </td>
          </tr>
        </tfoot>
      </table>

      {/* Delivery Instructions & Signatures - Side by Side */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '12px',
        marginBottom: '12px'
      }}>
        {/* Delivery Instructions */}
        {documentData.notes && (
          <div style={{
            border: '1px solid #dee2e6',
            padding: '12px',
            background: '#fffaf0',
            fontSize: '8pt'
          }}>
            <div style={{ fontWeight: 'bold', marginBottom: '6px', color: '#856404' }}>
              DELIVERY INSTRUCTIONS
            </div>
            <div style={{ color: '#666666', lineHeight: '1.4' }}>
              {documentData.notes}
            </div>
          </div>
        )}

        {/* Signature Section - Compact */}
        <div style={{
          border: '1px solid #dee2e6',
          padding: '12px',
          background: '#f8f9fa',
          fontSize: '8pt'
        }}>
          <div style={{ fontWeight: 'bold', marginBottom: '8px', color: '#2c5aa0', textAlign: 'center' }}>
            CONFIRMATION OF RECEIPT
          </div>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', fontSize: '7pt' }}>
            {/* Driver */}
            <div>
              <div style={{ fontWeight: 'bold', marginBottom: '4px', color: '#666666' }}>
                DRIVER
              </div>
              <div style={{ borderBottom: '1px solid #666666', padding: '15px 0 5px 0', marginBottom: '4px' }}></div>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: '#999999' }}>
                <span>Name</span>
                <span>Signature</span>
                <span>Date</span>
              </div>
            </div>

            {/* Customer */}
            <div>
              <div style={{ fontWeight: 'bold', marginBottom: '4px', color: '#666666' }}>
                CUSTOMER
              </div>
              <div style={{ borderBottom: '1px solid #666666', padding: '15px 0 5px 0', marginBottom: '4px' }}></div>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: '#999999' }}>
                <span>Name</span>
                <span>Signature</span>
                <span>Date</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Additional Information */}
      <div style={{
        border: '1px solid #dee2e6',
        padding: '10px',
        marginBottom: '12px',
        background: '#f8f9fa',
        fontSize: '8pt'
      }}>
        <div style={{ fontWeight: 'bold', marginBottom: '4px', color: '#2c5aa0' }}>
          DELIVERY TERMS
        </div>
        <div style={{ color: '#666666', lineHeight: '1.3' }}>
          Goods received in good condition. Please inspect items upon delivery and report any discrepancies within 24 hours.
        </div>
      </div>

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
          {documentData.footer_note || 'This is a computer-generated delivery note.'}
        </div>
        <div>
          Thank you for your business
        </div>
        {customerPhone !== 'N/A' && (
          <div style={{ fontSize: '7pt', color: '#999999', marginTop: '2px' }}>
            For delivery inquiries, please contact {customerPhone}
          </div>
        )}
      </div>
    </div>
  );
};

export default DeliveryNote;