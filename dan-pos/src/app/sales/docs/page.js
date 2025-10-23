'use client';

import React from 'react';
import DocumentsManagement from '@/components/documents/DocumentsManagement';
import { FileText, Home, ChevronRight } from 'lucide-react';
import Navbar from '@/components/Navbar';

const DocumentsPage = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Main Content */}
      <div className="max-w-7xl mx-auto">
        <DocumentsManagement />
      </div>
    </div>
  );
};

export default DocumentsPage;