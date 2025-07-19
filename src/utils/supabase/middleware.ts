import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export const updateSession = async (request: NextRequest) => {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => request.cookies.getAll(),
        setAll: (cookiesToSet) => {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value),
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  try {
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    if (error) {
      console.error("Auth error:", error);
    }

    const { pathname } = request.nextUrl;

    // Define public routes (only root, login, and signup)
    const isPublicRoute =
      pathname === "/" || pathname === "/login" || pathname === "/signup";

    // Define resource routes (static files, API routes, etc.)
    const isResourceRoute =
      pathname.startsWith("/_next") ||
      pathname.startsWith("/api") ||
      pathname.startsWith("/favicon") ||
      pathname.match(/\.(ico|png|jpg|jpeg|gif|svg|webp|css|js)$/);

    // If it's a resource route, allow it through
    if (isResourceRoute) {
      return supabaseResponse;
    }

    // If user is not authenticated and trying to access a protected route
    if (!user && !isPublicRoute) {
      const loginUrl = request.nextUrl.clone();
      loginUrl.pathname = "/login";
      loginUrl.searchParams.set("redirectTo", pathname);
      return NextResponse.redirect(loginUrl);
    }

    // If user is authenticated and trying to access auth routes, redirect to dashboard
    if (user && (pathname === "/login" || pathname === "/signup")) {
      const dashboardUrl = request.nextUrl.clone();
      dashboardUrl.pathname = "/choose";
      return NextResponse.redirect(dashboardUrl);
    }

    // If user is authenticated and on root, redirect to dashboard
    if (user && pathname === "/") {
      const dashboardUrl = request.nextUrl.clone();
      dashboardUrl.pathname = "/choose";
      return NextResponse.redirect(dashboardUrl);
    }

    return supabaseResponse;
  } catch (error) {
    console.error("Middleware error:", error);
    // On error, redirect to login for protected routes
    const { pathname } = request.nextUrl;
    const isPublicRoute =
      pathname === "/" || pathname === "/login" || pathname === "/signup";

    if (!isPublicRoute) {
      const loginUrl = request.nextUrl.clone();
      loginUrl.pathname = "/login";
      return NextResponse.redirect(loginUrl);
    }

    return supabaseResponse;
  }
};
