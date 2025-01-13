import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

// Define public routes
const isPublicRoute = createRouteMatcher(['/site', '/api/uploadthing','/agency', '/agency/sign-in', '/agency/sign-up']);

export default clerkMiddleware(async (auth, request) => {
  const url = new URL(request.url);
  const hostname = request.headers.get('host'); // Get the full hostname
  const domain = process.env.NEXT_PUBLIC_DOMAIN || ''; // Ensure a fallback for the domain
  const subdomain = hostname?.split(domain)?.[0]?.replace(/\.$/, ''); // Extract subdomain

  // Redirect "/" to "/site"
  if (url.pathname === '/') {
    return NextResponse.redirect(new URL('/site', request.url));
  }

  // Check if the route is public
  if (isPublicRoute(request)) {
    return NextResponse.next();
  }

  // Handle subdomain-specific logic
  if (subdomain && subdomain !== 'www') {
    const searchParams = url.searchParams.toString();
    const pathWithSearchParams = `${url.pathname}${searchParams ? `?${searchParams}` : ''}`;
    return NextResponse.rewrite(new URL(`/${subdomain}${pathWithSearchParams}`, request.url));
  }

  // Protect non-public routes
  try {
    await auth.protect(); // Ensures the user is authenticated
  } catch (error) {
    console.log('Clerk Middleware Error:', error);
    // Redirect unauthenticated users to "/agency/sign-in"
    const signInUrl = new URL('/agency/sign-in', request.url);
    return NextResponse.redirect(signInUrl);
  }

  // Allow access for authenticated users
  return NextResponse.next();
});

export const config = {
  matcher: [
    // Match all routes except static files and Next.js internal routes
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/(api|trpc)(.*)',
    '/agency/sign-in',
    '/agency/sign-up',
  ],
};





