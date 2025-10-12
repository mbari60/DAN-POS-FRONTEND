// import { Geist, Geist_Mono } from "next/font/google";
// import "./globals.css";
// import { AuthProvider } from "@/contexts/AuthContext";
// import { ToastContainer } from "react-toastify";
// import "react-toastify/dist/ReactToastify.css";

// const geistSans = Geist({
//   variable: "--font-geist-sans",
//   subsets: ["latin"],
// });

// const geistMono = Geist_Mono({
//   variable: "--font-geist-mono",
//   subsets: ["latin"],
// });

// export const metadata = {
//   title: "Managerp",
//   description: "Point of Sale",
// };

// export default function RootLayout({ children }) {
//   return (
//     <html lang="en">
//       <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
//         <AuthProvider>
//           {children}
//           <ToastContainer
//             position="top-right"
//             autoClose={5000}
//             hideProgressBar={false}
//             newestOnTop={false}
//             closeOnClick
//             rtl={false}
//             pauseOnFocusLoss
//             draggable
//             pauseOnHover
//           />
//         </AuthProvider>
//       </body>
//     </html>
//   );
// }




// app/layout.js (modified root layout)
// src/app/layout.js
"use client";

import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/contexts/AuthContext";
import { PermissionProvider } from "@/contexts/PermissionContext";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Navbar from '@/components/Navbar';
import { usePathname } from 'next/navigation';

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

function LayoutContent({ children }) {
  const pathname = usePathname();
  
  // Routes where navbar should be hidden
  const hideNavbarRoutes = ['/login', '/register', '/forgot-password'];
  const shouldHideNavbar = hideNavbarRoutes.includes(pathname);

  return (
    <>
      {/* Conditionally render Navbar */}
      {!shouldHideNavbar && (
        <header className="fixed top-0 left-0 right-0 z-50 bg-white shadow-sm border-b">
          <Navbar />
        </header>
      )}
      
      {/* Main content with conditional padding */}
      <main className={`${!shouldHideNavbar ? 'pt-16' : ''} min-h-screen bg-gray-50`}>
        {children}
      </main>
      
      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
    </>
  );
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <AuthProvider>
          <PermissionProvider>
            <LayoutContent>{children}</LayoutContent>
          </PermissionProvider>
        </AuthProvider>
      </body>
    </html>
  );
}


