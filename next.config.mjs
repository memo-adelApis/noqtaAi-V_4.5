/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,
    
    // تحسينات البناء
    serverExternalPackages: ['mongoose'],
    
    // تجاهل أخطاء البناء المتعلقة بقاعدة البيانات في بيئة الإنتاج
    typescript: {
        ignoreBuildErrors: false,
    },
    
    eslint: {
        ignoreDuringBuilds: false,
    },
    
    async headers() {
        return [
            {
                // تطبيق القواعد على جميع المسارات
                source: '/:path*',
                headers: [
                    {
                        key: 'X-DNS-Prefetch-Control',
                        value: 'on'
                    },
                    {
                        key: 'Strict-Transport-Security',
                        value: 'max-age=63072000; includeSubDomains; preload'
                    },
                    {
                        key: 'X-Frame-Options',
                        value: 'SAMEORIGIN' // يسمح بعرض الموقع داخل iframe لنفس الموقع فقط
                    },
                    {
                        key: 'X-Content-Type-Options',
                        value: 'nosniff' // يصلح الخطأ الأحمر الخاص بـ nosniff
                    },
                    {
                        key: 'Referrer-Policy',
                        value: 'origin-when-cross-origin' // يصلح الخطأ الأحمر الخاص بـ Referrer
                    },
                    {
                        key: 'Permissions-Policy',
                        value: "camera=(), microphone=(), geolocation=(), browsing-topics=()" // يصلح الخطأ الأحمر الخاص بالصلاحيات
                    },
                    {
                        // هذا هو أهم وأصعب كود (Content Security Policy)
                        // قمت بضبطه ليكون آمناً ولكن يسمح بتحميل الصور والسكربتات الضرورية لـ Next.js
                        key: 'Content-Security-Policy',
                        value: "default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' blob: data:; font-src 'self' data:;" 
                    }
                ]
            }
        ]
    },
    
    // تحسين معالجة الصور
    images: {
        domains: ['localhost'],
        unoptimized: true
    }
};

export default nextConfig;
