export const metadata = {
    title: 'نقطة البيع - الكاشير',
    description: 'نظام نقطة البيع للكاشير',
};

export default function CashierLayout({ children }) {
    return (
        <div className="min-h-screen bg-gray-950">
            {children}
        </div>
    );
}
