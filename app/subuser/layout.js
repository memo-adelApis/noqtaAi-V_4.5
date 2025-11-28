// المسار: app/(subuser)/layout.js
import { redirect } from 'next/navigation';
import { getSafeSession } from '@/app/lib/auth';
import Header from '@/components/subuser/Header';
import Navbar from '@/components/subuser/Navbar';

export default async function SubuserLayout({ children }) {
    let session;
    try {
        session = await getSafeSession();
    } catch (error) {
        redirect('/login'); 
    }

    if (session.user.role !== 'employee' && session.user.role !== 'manager') {
        if(session.user.role === 'subscriber') {
            redirect('/subscriber/dashboard');
        } else {
            redirect('/login'); 
        }
    }

    return (
        <div className="flex flex-col h-screen bg-gray-100 text-blue-500" dir="rtl">
            
            {/* Toast داخل الوضع الداكن */}

            {/* الشريط الأول: الهيدر */}
<div className="relative z-50"> 
                <Header user={session.user} /> 
            </div>
            {/* الشريط الثاني: شريط التنقل */}
    <div className="relative z-40">
                <Navbar />
            </div>

            {/* المحتوى الرئيسي */}
            <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto bg-gray-900 text-blue-600">
                {children}
            </main>
        </div>
    );
}
