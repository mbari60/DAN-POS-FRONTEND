// app/unauthorized/page.js
"use client";

import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';

export default function Unauthorized() {
  const router = useRouter();

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-4">Access Denied</h2>
        <p className="mb-6">You don't have permission to access this page.</p>
        <Button onClick={() => router.push('/sales')}>
          Return to Dashboard
        </Button>
      </div>
    </div>
  );
}

