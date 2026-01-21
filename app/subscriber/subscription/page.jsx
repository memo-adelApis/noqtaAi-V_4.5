import { createPayment, getUserPayments } from "@/app/actions/paymentActions";
import SubscriptionPlans from "@/components/subscriber/SubscriptionPlans";
import { CreditCard, Clock, CheckCircle, XCircle, Upload } from "lucide-react";

export default async function SubscriptionPage() {
  const { payments = [] } = await getUserPayments();

  const getStatusBadge = (status) => {
    const badges = {
      pending: { color: 'bg-yellow-500', text: 'في المراجعة', icon: Clock },
      verified: { color: 'bg-green-500', text: 'مؤكد', icon: CheckCircle },
      rejected: { color: 'bg-red-500', text: 'مرفوض', icon: XCircle }
    };
    
    const badge = badges[status];
    const Icon = badge.icon;
    
    return (
      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium text-white ${badge.color}`}>
        <Icon size={12} />
        {badge.text}
      </span>
    );
  };

  const subscriptionPlans = [
    {
      type: 'monthly',
      name: 'الاشتراك الشهري',
      price: 99,
      duration: 'شهر واحد',
      features: ['إدارة المخزون', 'تقارير أساسية', 'دعم فني']
    },
    {
      type: 'quarterly',
      name: 'الاشتراك الربع سنوي',
      price: 249,
      duration: '3 أشهر',
      features: ['إدارة المخزون', 'تقارير متقدمة', 'دعم فني مميز', 'خصم 15%'],
      popular: true
    },
    {
      type: 'yearly',
      name: 'الاشتراك السنوي',
      price: 899,
      duration: '12 شهر',
      features: ['جميع المميزات', 'تقارير مخصصة', 'دعم فني أولوية', 'خصم 25%']
    }
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-3">
          <CreditCard className="text-blue-500" />
          إدارة الاشتراك
        </h1>
        <p className="text-gray-400 mt-2">
          اختر خطة الاشتراك المناسبة لك وقم بالدفع
        </p>
      </div>

      {/* خطط الاشتراك */}
      <SubscriptionPlans plans={subscriptionPlans} />

      {/* نموذج الدفع */}
      <div id="payment-form" className="bg-gray-900 rounded-xl border border-gray-800 p-8">
        <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
          <Upload className="text-green-500" />
          إرسال طلب دفع
        </h2>

        <form action={createPayment} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* نوع الاشتراك */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                نوع الاشتراك
              </label>
              <select 
                name="subscriptionType" 
                required
                className="w-full bg-gray-800 border border-gray-700 rounded-lg p-3 text-white"
              >
                <option value="">اختر نوع الاشتراك</option>
                <option value="monthly">شهري - 99 ريال</option>
                <option value="quarterly">ربع سنوي - 249 ريال</option>
                <option value="yearly">سنوي - 899 ريال</option>
              </select>
            </div>

            {/* المبلغ */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                المبلغ المدفوع
              </label>
              <input 
                name="amount" 
                type="number" 
                step="0.01"
                required
                className="w-full bg-gray-800 border border-gray-700 rounded-lg p-3 text-white"
                placeholder="مثال: 99.00"
              />
            </div>

            {/* رقم العملية */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                رقم العملية / المرجع
              </label>
              <input 
                name="transactionId" 
                type="text" 
                required
                className="w-full bg-gray-800 border border-gray-700 rounded-lg p-3 text-white"
                placeholder="رقم العملية من البنك"
              />
            </div>

            {/* طريقة الدفع */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                طريقة الدفع
              </label>
              <select 
                name="paymentMethod" 
                required
                className="w-full bg-gray-800 border border-gray-700 rounded-lg p-3 text-white"
              >
                <option value="">اختر طريقة الدفع</option>
                <option value="bank_transfer">تحويل بنكي</option>
                <option value="stc_pay">STC Pay</option>
                <option value="mada">مدى</option>
                <option value="credit_card">بطاقة ائتمانية</option>
                <option value="other">أخرى</option>
              </select>
            </div>

            {/* اسم البنك */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                اسم البنك (اختياري)
              </label>
              <input 
                name="bankName" 
                type="text"
                className="w-full bg-gray-800 border border-gray-700 rounded-lg p-3 text-white"
                placeholder="مثال: البنك الأهلي"
              />
            </div>

            {/* رقم الحساب */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                آخر 4 أرقام من الحساب (اختياري)
              </label>
              <input 
                name="accountNumber" 
                type="text"
                maxLength="4"
                className="w-full bg-gray-800 border border-gray-700 rounded-lg p-3 text-white"
                placeholder="1234"
              />
            </div>
          </div>

          {/* معلومات مهمة */}
          <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
            <h3 className="font-medium text-blue-400 mb-2">معلومات مهمة:</h3>
            <ul className="text-sm text-gray-300 space-y-1">
              <li>• تأكد من صحة رقم العملية قبل الإرسال</li>
              <li>• سيتم مراجعة طلبك خلال 24 ساعة</li>
              <li>• ستصلك رسالة تأكيد عند الموافقة على الدفعة</li>
              <li>• في حالة الرفض، يرجى التواصل مع الدعم الفني</li>
            </ul>
          </div>

          <button 
            type="submit"
            className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-4 rounded-xl transition flex justify-center items-center gap-2"
          >
            <Upload size={20} />
            إرسال طلب الدفع
          </button>
        </form>
      </div>

      {/* تاريخ الدفعات */}
      {payments.length > 0 && (
        <div className="bg-gray-900 rounded-xl border border-gray-800 overflow-hidden">
          <div className="p-6 border-b border-gray-800">
            <h2 className="text-xl font-semibold">تاريخ دفعاتك</h2>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-800">
                <tr>
                  <th className="text-right p-4 text-gray-300">المبلغ</th>
                  <th className="text-right p-4 text-gray-300">نوع الاشتراك</th>
                  <th className="text-right p-4 text-gray-300">رقم العملية</th>
                  <th className="text-right p-4 text-gray-300">الحالة</th>
                  <th className="text-right p-4 text-gray-300">التاريخ</th>
                </tr>
              </thead>
              <tbody>
                {payments.map((payment) => (
                  <tr key={payment._id} className="border-b border-gray-800">
                    <td className="p-4 font-semibold text-green-400">
                      {payment.amount} {payment.currency}
                    </td>
                    <td className="p-4">
                      {payment.subscriptionType === 'monthly' ? 'شهري' : 
                       payment.subscriptionType === 'quarterly' ? 'ربع سنوي' : 'سنوي'}
                    </td>
                    <td className="p-4 font-mono text-sm">{payment.transactionId}</td>
                    <td className="p-4">
                      {getStatusBadge(payment.status)}
                    </td>
                    <td className="p-4 text-sm text-gray-400">
                      {new Date(payment.createdAt).toLocaleDateString('en-GB')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}