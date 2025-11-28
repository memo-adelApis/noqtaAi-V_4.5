import { getToken } from "next-auth/jwt";
import { NextResponse } from "next/server";

export async function middleware(req) {
    const { pathname } = req.nextUrl;
    
    // مراقبة المسار في Vercel Logs
    console.log(`🚀 Middleware running for: ${pathname}`);

    const token = await getToken({ 
        req, 
        secret: process.env.NEXTAUTH_SECRET 
    });

    const publicRoutes = ["/", "/login", "/register"];
    
    // حماية المسارات (غير مسجل دخول)
    if (!token) {
        if (publicRoutes.includes(pathname)) {
            return NextResponse.next();
        }
        const loginUrl = new URL("/login", req.url);
        loginUrl.searchParams.set("callbackUrl", pathname);
        return NextResponse.redirect(loginUrl);
    }

    // توجيه المستخدمين المسجلين
    const role = token.role;
    const isSubscriber = role === 'subscriber' || role === 'subscription';
    const isSubuser = role === 'employee' || role === 'manager';

    if (publicRoutes.includes(pathname)) {
        let redirectUrl = "/";
        if (isSubscriber) redirectUrl = '/subscriber/dashboard';
        else if (isSubuser) redirectUrl = '/subuser/home';
        return NextResponse.redirect(new URL(redirectUrl, req.url));
    }

    const isAccessingSubscriberRoute = pathname.startsWith("/subscriber");
    const isAccessingSubuserRoute = pathname.startsWith("/subuser");

    if (isSubscriber && isAccessingSubuserRoute) {
        return NextResponse.redirect(new URL("/subscriber/dashboard", req.url));
    }

    if (isSubuser && isAccessingSubscriberRoute) {
        return NextResponse.redirect(new URL("/subuser/home", req.url));
    }

    return NextResponse.next();
}

export const config = {
    matcher: ['/((?!api|_next/static|_next/image|favicon.ico|assets|images|manifest.json).*)'],
};
