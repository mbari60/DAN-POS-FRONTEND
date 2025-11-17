// "use client";

// import { useState, useEffect } from 'react';
// import { useAuth } from '@/contexts/AuthContext';
// import { useRouter, useSearchParams } from 'next/navigation';
// import { Eye, EyeOff, LogIn, Loader2 } from 'lucide-react';
// import { Button } from '@/components/ui/button';
// import { Input } from '@/components/ui/input';
// import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

// const Login = () => {
//   const [credentials, setCredentials] = useState({ username: '', password: '' });
//   const [showPassword, setShowPassword] = useState(false);
//   const [isLoading, setIsLoading] = useState(false);
//   const { login, isAuthenticated, isLoading: authLoading, isInitialized } = useAuth();
//   const router = useRouter();
//   const searchParams = useSearchParams();
//   const redirectTo = searchParams.get('from') || '/sales';

//   useEffect(() => {
//     if (isInitialized && isAuthenticated) {
//       router.push(redirectTo);
//     }
//   }, [isAuthenticated, isInitialized, router, redirectTo]);

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setIsLoading(true);
    
//     const result = await login(credentials);
//     if (result.success) {
//       router.push(redirectTo);
//     }
    
//     setIsLoading(false);
//   };

//   const handleChange = (e) => {
//     setCredentials({
//       ...credentials,
//       [e.target.name]: e.target.value
//     });
//   };

//   if (authLoading || !isInitialized) {
//     return (
//       <div className="min-h-screen flex items-center justify-center">
//         <Loader2 className="h-8 w-8 animate-spin" />
//       </div>
//     );
//   }

//   return (
//     <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
//       <Card className="w-full max-w-md">
//         <CardHeader className="space-y-1">
//           <CardTitle className="text-2xl font-bold text-center">
//             System Login
//           </CardTitle>
//           <CardDescription className="text-center">
//             Enter your credentials to access your account
//           </CardDescription>
//         </CardHeader>
//         <CardContent>
//           <form onSubmit={handleSubmit} className="space-y-4">
//             <div className="space-y-2">
//               <Input
//                 name="username"
//                 type="text"
//                 placeholder="Username"
//                 value={credentials.username}
//                 onChange={handleChange}
//                 required
//                 className="h-11"
//                 disabled={isLoading}
//               />
//             </div>
//             <div className="space-y-2 relative">
//               <Input
//                 name="password"
//                 type={showPassword ? 'text' : 'password'}
//                 placeholder="Password"
//                 value={credentials.password}
//                 onChange={handleChange}
//                 required
//                 className="h-11 pr-10"
//                 disabled={isLoading}
//               />
//               <button
//                 type="button"
//                 className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
//                 onClick={() => setShowPassword(!showPassword)}
//                 disabled={isLoading}
//               >
//                 {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
//               </button>
//             </div>
//             <Button
//               type="submit"
//               className="w-full h-11"
//               disabled={isLoading}
//             >
//               {isLoading ? (
//                 <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
//               ) : (
//                 <LogIn className="mr-2 h-4 w-4" />
//               )}
//               Sign In
//             </Button>
//           </form>
//         </CardContent>
//       </Card>
//     </div>
//   );
// };

// export default Login;


"use client";

import { useState, useEffect, Suspense } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter, useSearchParams } from 'next/navigation';
import { Eye, EyeOff, LogIn, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const LoginContent = () => {
  const [credentials, setCredentials] = useState({ username: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { login, isAuthenticated, isLoading: authLoading, isInitialized } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get('from') || '/sales';

  useEffect(() => {
    if (isInitialized && isAuthenticated) {
      router.push(redirectTo);
    }
  }, [isAuthenticated, isInitialized, router, redirectTo]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    
    const result = await login(credentials);
    if (result.success) {
      router.push(redirectTo);
    }
    
    setIsLoading(false);
  };

  const handleChange = (e) => {
    setCredentials({
      ...credentials,
      [e.target.name]: e.target.value
    });
  };

  if (authLoading || !isInitialized) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">
            System Login
          </CardTitle>
          <CardDescription className="text-center">
            Enter your credentials to access your account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Input
                name="username"
                type="text"
                placeholder="Username"
                value={credentials.username}
                onChange={handleChange}
                required
                className="h-11"
                disabled={isLoading}
              />
            </div>
            <div className="space-y-2 relative">
              <Input
                name="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="Password"
                value={credentials.password}
                onChange={handleChange}
                required
                className="h-11 pr-10"
                disabled={isLoading}
              />
              <button
                type="button"
                className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                onClick={() => setShowPassword(!showPassword)}
                disabled={isLoading}
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
            <Button
              type="submit"
              className="w-full h-11"
              disabled={isLoading}
            >
              {isLoading ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
              ) : (
                <LogIn className="mr-2 h-4 w-4" />
              )}
              Sign In
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

const Login = () => {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    }>
      <LoginContent />
    </Suspense>
  );
};

export default Login;