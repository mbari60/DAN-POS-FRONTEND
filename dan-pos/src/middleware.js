import { NextResponse } from 'next/server';
import { getTokenFromRequest } from './lib/auth';

// Define public routes that don't require authentication
const publicRoutes = ['/login'];
const protectedRoutes = ['/', '/protected', '/pos-sale', '/profile'];

export function middleware(request) {
  const token = getTokenFromRequest(request);
  const { pathname } = request.nextUrl;

  // Check if the route is protected
  const isProtectedRoute = protectedRoutes.some(route => 
    pathname === route || pathname.startsWith(route + '/')
  );
  
  // Check if the route is public
  const isPublicRoute = publicRoutes.some(route => 
    pathname === route || pathname.startsWith(route + '/')
  );

  // Redirect to login if not authenticated and trying to access protected routes
  if (!token && isProtectedRoute) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('from', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Redirect to dashboard if authenticated and trying to access login
  if (token && isPublicRoute) {
    return NextResponse.redirect(new URL('/pos-sale', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/',
    '/protected/:path*',
    '/login',
    '/pos-sale/:path*',
    '/changepassword/:path*'
  ],
};

