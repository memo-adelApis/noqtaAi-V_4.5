import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { connectToDB } from "@/utils/database";
import Invoice from "@/models/Invoices";
import { NextResponse } from "next/server";

export async function PUT(request, { params }) {
    try {
        const session = await getServerSession(authOptions);
        
        if (!session || !['employee', 'manager'].includes(session.user.role)) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        await connectToDB();

        const { id } = await params;
        const body = await request.json();

        const invoice = await Invoice.findById(id);
        
        if (!invoice) {
            return NextResponse.json({ error: 'Invoice not found' }, { status: 404 });
        }

        // التحقق من أن الفاتورة تابعة لنفس الفرع
        if (invoice.branchId?.toString() !== session.user.branchId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
        }

        // تحديث الفاتورة
        const {
            type,
            kind,
            taxRate,
            customerId,
            supplierId,
            items,
            pays,
            installments,
            paymentType,
            discount,
            extra,
            currencyCode,
            notes
        } = body;

        // حساب الإجماليات
        const totalItems = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        const vatAmount = kind === 'tax' ? (totalItems * (taxRate / 100)) : 0;
        const totalInvoice = totalItems + vatAmount - discount + extra;
        const totalPaid = pays.reduce((sum, pay) => sum + Number(pay.amount), 0);
        const balance = totalInvoice - totalPaid;

        // تحديد الحالة
        let status = 'pending';
        if (balance <= 0) status = 'paid';
        else if (totalPaid > 0) status = 'partial';

        invoice.type = type;
        invoice.kind = kind;
        invoice.taxRate = taxRate;
        invoice.customerId = type === 'revenue' ? customerId : null;
        invoice.supplierId = type === 'expense' ? supplierId : null;
        invoice.items = items;
        invoice.pays = pays;
        invoice.installments = installments;
        invoice.paymentType = paymentType;
        invoice.discount = discount;
        invoice.extra = extra;
        invoice.currencyCode = currencyCode;
        invoice.notes = notes;
        invoice.totalAmount = totalItems;
        invoice.taxAmount = vatAmount;
        invoice.totalInvoice = totalInvoice;
        invoice.totalPaid = totalPaid;
        invoice.balance = balance;
        invoice.status = status;

        await invoice.save();

        return NextResponse.json({ 
            success: true, 
            message: 'تم تحديث الفاتورة بنجاح' 
        });

    } catch (error) {
        console.error('Error updating invoice:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
