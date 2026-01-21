import { getInvoiceById } from '@/app/actions/invoiceActions';
import { getInvoiceFormData } from '@/app/actions/invoiceDataActions';
import EditInvoiceForm from '@/components/subuser/invoices/EditInvoiceForm';
import { AlertCircle } from 'lucide-react';
import { redirect } from 'next/navigation';

export default async function EditInvoicePage({ params }) {
    const { id } = await params;
    
    // جلب بيانات الفاتورة
    const invoiceResult = await getInvoiceById(id);
    
    if (!invoiceResult.success) {
        return (
            <div className="flex items-center justify-center h-full bg-red-50 text-red-700 p-8 rounded-lg" dir="rtl">
                <AlertCircle size={24} className="ml-2" />
                <div>
                    <h2 className="font-semibold">خطأ في تحميل الفاتورة</h2>
                    <p className="font-bold">{invoiceResult.error}</p>
                </div>
            </div>
        );
    }

    // جلب البيانات الأولية (المخازن، الوحدات)
    const formDataResult = await getInvoiceFormData();
    
    if (!formDataResult.success) {
        return (
            <div className="flex items-center justify-center h-full bg-red-50 text-red-700 p-8 rounded-lg" dir="rtl">
                <AlertCircle size={24} className="ml-2" />
                <div>
                    <h2 className="font-semibold">خطأ في تحميل بيانات الفورم</h2>
                    <p className="font-bold">{formDataResult.error}</p>
                </div>
            </div>
        );
    }

    // تحويل البيانات لتكون serializable
    const invoice = invoiceResult.data;
    const serializedInvoice = {
        _id: invoice._id.toString(),
        invoiceNumber: invoice.invoiceNumber,
        type: invoice.type,
        kind: invoice.kind,
        taxRate: invoice.taxRate || 0,
        customerId: invoice.customerId?._id?.toString() || null,
        supplierId: invoice.supplierId?._id?.toString() || null,
        entityName: invoice.customerId?.name || invoice.supplierId?.name || '',
        items: invoice.items.map(item => ({
            id: Math.random().toString(),
            name: item.name,
            price: item.price,
            quantity: item.quantity,
            unit: item.unit?.toString() || '',
            unitName: item.unitName || '',
            storeId: item.storeId?.toString() || '',
            storeName: item.storeName || '',
        })),
        pays: invoice.pays.map(pay => ({
            id: Math.random().toString(),
            amount: pay.amount,
            method: pay.method,
            date: pay.date?.toISOString().split('T')[0] || new Date().toISOString().split('T')[0],
        })),
        installments: invoice.installments?.map(inst => ({
            id: Math.random().toString(),
            amount: inst.amount,
            dueDate: inst.dueDate?.toISOString().split('T')[0] || '',
        })) || [],
        paymentType: invoice.paymentType,
        discount: invoice.discount || 0,
        extra: invoice.extra || 0,
        currencyCode: invoice.currencyCode || 'EGP',
        notes: invoice.notes || '',
    };

    const serializedFormData = {
        stores: formDataResult.data.stores.map(s => ({ ...s, _id: s._id.toString() })),
        units: formDataResult.data.units.map(u => ({ ...u, _id: u._id.toString() })),
    };

    return (
        <EditInvoiceForm 
            invoice={serializedInvoice} 
            initialData={serializedFormData} 
        />
    );
}
