import { getToken } from "next-auth/jwt";
import { NextResponse } from "next/server";

export async function middleware(req) {
    const { pathname } = req.nextUrl;
    
    // 1. تعريف المسارات والأدوار
    const publicRoutes = ["/", "/login", "/register", "/about"]; // أضف أي مسارات عامة هنا
    const authRoutes = ["/login", "/register"]; // الصفحات التي لا يجب للمسجل الدخول إليها
    
    // مسارات المتاجر الإلكترونية (عامة للجميع)
    const isShopRoute = pathname.startsWith("/shop/");
    
    // 2. جلب التوكن
    const token = await getToken({ 
        req, 
        secret: process.env.NEXTAUTH_SECRET 
    });

    // --- الحالة أ: المستخدم غير مسجل دخول (Guest) ---
    if (!token) {
        // إذا كان المسار عاماً أو متجر إلكتروني، اسمح بالمرور
        if (publicRoutes.includes(pathname) || isShopRoute) {
            return NextResponse.next();
        }
        // خلاف ذلك، وجهه لصفحة الدخول مع حفظ المسار الذي كان يريده
        const loginUrl = new URL("/login", req.url);
        loginUrl.searchParams.set("callbackUrl", pathname);
        return NextResponse.redirect(loginUrl);
    }

    // --- الحالة ب: المستخدم مسجل دخول (Logged In) ---
    const role = token.role;
    
    // السماح بالوصول للمتاجر الإلكترونية للجميع
    if (isShopRoute) {
        return NextResponse.next();
    }

    // تحديد هوية المستخدم ومساره الافتراضي (Home)
    const isAdmin = role === 'admin';
    const isOwner = role === 'owner';
    const isSubscriber = role === 'subscriber' || role === 'subscription';
    const isSubuser = role === 'employee' || role === 'manager' || role === 'subuser';
    const isCashier = role === 'cashier';

    let userHome = "/";
    if (isAdmin) userHome = "/admin";
    else if (isOwner) userHome = "/owner";
    else if (isSubscriber) userHome = "/subscriber/dashboard";
    else if (isSubuser) userHome = "/subuser/home";
    else if (isCashier) userHome = "/cashier";

    // 1. منع المسجلين من دخول صفحات الدخول والتسجيل
    if (authRoutes.includes(pathname)) {
        return NextResponse.redirect(new URL(userHome, req.url));
    }

    // 2. 🛡️ حماية المناطق (Role-Based Access Control)
    
    // حماية منطقة الأدمن
    if (pathname.startsWith("/admin") && !isAdmin) {
        return NextResponse.redirect(new URL(userHome, req.url));
    }

    // حماية منطقة المالك (Owner)
    if (pathname.startsWith("/owner") && !isOwner) {
        return NextResponse.redirect(new URL(userHome, req.url));
    }

    // حماية منطقة المشترك
    if (pathname.startsWith("/subscriber") && !isSubscriber) {
        return NextResponse.redirect(new URL(userHome, req.url));
    }

    // حماية منطقة الموظف (Subuser)
    if (pathname.startsWith("/subuser") && !isSubuser) {
        return NextResponse.redirect(new URL(userHome, req.url));
    }

    // حماية منطقة الكاشير
    if (pathname.startsWith("/cashier") && !isCashier) {
        return NextResponse.redirect(new URL(userHome, req.url));
    }

    // 3. (اختياري) توجيه من الصفحة الرئيسية "/" إلى لوحة التحكم مباشرة
    if (pathname === "/") {
        return NextResponse.redirect(new URL(userHome, req.url));
    }

    return NextResponse.next();
}

export const config = {
    // استثناء الملفات الثابتة والصور والـ API
    matcher: ['/((?!api|_next/static|_next/image|favicon.ico|assets|images|manifest.json).*)'],
};