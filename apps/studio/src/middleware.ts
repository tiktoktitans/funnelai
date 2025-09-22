import { NextResponse, type NextRequest } from 'next/server';
import { createServerClient } from '@supabase/ssr';

export async function middleware(request: NextRequest) {
  // Create response with security headers
  const response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-XSS-Protection', '1; mode=block');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');

  // Check if Supabase is configured
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    // If Supabase is not configured, allow all routes except dashboard
    if (request.nextUrl.pathname.startsWith('/dashboard') ||
        request.nextUrl.pathname.startsWith('/contacts') ||
        request.nextUrl.pathname.startsWith('/inbox') ||
        request.nextUrl.pathname.startsWith('/pipelines') ||
        request.nextUrl.pathname.startsWith('/settings')) {
      return NextResponse.redirect(new URL('/sign-in', request.url));
    }
    return response;
  }

  try {
    const supabase = createServerClient(
      supabaseUrl,
      supabaseKey,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll();
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value }) =>
              request.cookies.set(name, value)
            );
            cookiesToSet.forEach(({ name, value, options }) =>
              response.cookies.set(name, value, options)
            );
          },
        },
      }
    );

    const { data: { user } } = await supabase.auth.getUser();

    // Protected routes
    const protectedRoutes = ['/dashboard', '/contacts', '/inbox', '/pipelines', '/settings'];
    const authRoutes = ['/sign-in', '/sign-up'];
    const isProtectedRoute = protectedRoutes.some(route => request.nextUrl.pathname.startsWith(route));
    const isAuthRoute = authRoutes.includes(request.nextUrl.pathname);

    // If user is not signed in and trying to access protected route
    if (!user && isProtectedRoute) {
      return NextResponse.redirect(new URL('/sign-in', request.url));
    }

    // If user is signed in and trying to access auth routes
    if (user && isAuthRoute) {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
  } catch (error) {
    console.error('Middleware error:', error);
    // On error, allow access to auth pages but protect dashboard
    if (request.nextUrl.pathname.startsWith('/dashboard')) {
      return NextResponse.redirect(new URL('/sign-in', request.url));
    }
  }

  return response;
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};