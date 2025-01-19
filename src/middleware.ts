import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

// Define public routes
const isPublicRoute = createRouteMatcher(['/site', '/api/uploadthing','/agency', '/agency/sign-in', '/agency/sign-up']);

export default clerkMiddleware(async (auth, request) => {
  const url = new URL(request.url);
  console.log('Clerk Middleware URL:', url);
  const hostname = request.headers.get('host'); // Get the full hostname
  console.log('Clerk Middleware Hostname:', hostname);
  const domain = process.env.NEXT_PUBLIC_DOMAIN || ''; // Ensure a fallback for the domain
  console.log('Clerk Middleware Domain:', domain);
  const subdomain = hostname?.split(domain)?.[0]?.replace(/\.$/, ''); // Extract subdomain
  console.log('Clerk Middleware Subdomain:', subdomain);

  // Redirect "/" to "/site"
  if (url.pathname === '/') {
    console.log("url pathname: ",url.pathname)
    return NextResponse.redirect(new URL('/site', request.url));
  }

  // Check if the route is public
  if (isPublicRoute(request)) {
    console.log('Clerk Middleware Public Route:', request.url);
    return NextResponse.next();
  }

  // Handle subdomain-specific logic
  if (subdomain && subdomain !== 'www') {
    console.log('Clerk Middleware Subdomain inside if statement:', subdomain);
    const searchParams = url.searchParams.toString();
    console.log('Clerk Middleware Search Params:', searchParams)
    const pathWithSearchParams = `${url.pathname}${searchParams ? `?${searchParams}` : ''}`;
    console.log('Clerk Middleware Path with Search Params:', pathWithSearchParams)
    return NextResponse.rewrite(new URL(`/${subdomain}${pathWithSearchParams}`, request.url));
  }

  // Protect non-public routes
  try {
    console.log('i am come above auth protect');
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





