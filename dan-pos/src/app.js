// import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
// import { AuthProvider } from './contexts/AuthContext';
// import Navbar from './components/Navbar';
// import POS from './pages/POS';
// import { ToastContainer } from 'react-toastify';
// import ProtectedRoute from './components/ProtectedRoute';
// import Login from './pages/Login';
// import 'react-toastify/dist/ReactToastify.css';

// function App() {
//   return (
//     <AuthProvider>
//       <Router>
//         <div className="min-h-screen bg-background">
//           <Routes>
//             <Route path="/login" element={<Login />} />
//             <Route
//               path="/*"
//               element={
//                 <ProtectedRoute>
//                   <div className="flex flex-col min-h-screen">
//                     <Navbar />
//                     <main className="flex-1">
//                       <Routes>
//                         <Route path="/" element={<POS />} />
//                         <Route path="/dashboard" element={<div>Dashboard</div>} />
//                         <Route path="*" element={<Navigate to="/" replace />} />
//                       </Routes>
//                     </main>
//                   </div>
//                 </ProtectedRoute>
//               }
//             />
//           </Routes>
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
//         </div>
//       </Router>
//     </AuthProvider>
//   );
// }

// export default App;