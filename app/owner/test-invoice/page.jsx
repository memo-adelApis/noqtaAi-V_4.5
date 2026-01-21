import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { redirect } from 'next/navigation';
import TestInvoiceForm from '@/components/owner/TestInvoiceForm';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export default async function TestInvoicePage() {
  const session = await getServerSession(authOptions);
  
  if (!session || session.user.role !== 'owner') {
    redirect('/login');
  }

  return (
    <>
      <ToastContainer position="top-center" />
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-white">اختبار إنشاء فاتورة</h1>
          <p className="text-gray-400 mt-2">
            صفحة اختبار لإنشاء فاتورة تجريبية والتأكد من عمل النظام
          </p>
        </div>

        <TestInvoiceForm />
      </div>
    </>
  );
}