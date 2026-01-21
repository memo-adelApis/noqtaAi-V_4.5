import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { connectToDB } from "@/utils/database";
import Invoice from "@/models/Invoices";
import Item from "@/models/Items";
import { NextResponse } from "next/server";
import mongoose from "mongoose";

export async function POST(request) {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const authSession = await getServerSession(authOptions);
        
        if (!authSession || authSession.user.role !== 'cashier') {
            await session.abortTransaction();
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        await connectToDB();

        const body = await request.json();
        const { items, customer, paymentMethod, amountPaid, total, tax } = body;

        // التحقق من توفر الكميات وخصمها
        for (const item of items) {
            const product = await Item.findById(item._id).session(session);
            
            if (!product) {
                throw new Error(`المنتج ${item.name} غير موجود`);
            }

            if (product.quantity_Remaining < item.quantity) {
                throw new Error(`الكمية المتوفرة من ${item.name} غير كافية (متوفر: ${product.quantity_Remaining})`);
            }

            // إضافة تصريح صرف معتمد للمنتج
            await product.sellStock(
                item.quantity,
                item.price,
                null, // سيتم تحديثه بعد إنشاء الفاتورة
                null, // العميل (إذا وجد)
                authSession.user.id,
                `بيع نقطة البيع - ${new Date().toLocaleString('ar-EG')}`
            );
        }

        // إنشاء الفاتورة
        const invoice = await Invoice.create([{
            invoiceNumber: `POS-${Date.now()}`,
            type: 'revenue',
            kind: 'normal',
            customerId: customer?._id || null,
            items: items.map(item => ({
                name: item.name,
                price: item.price,
                quantity: item.quantity,
                unit: item.unit || 'قطعة',
                storeId: item.storeId || null,
                total: item.price * item.quantity
            })),
            totalAmount: total,
            taxAmount: tax,
            discount: 0,
            extra: 0,
            pays: [{
                amount: paymentMethod === 'cash' ? amountPaid : total,
                method: paymentMethod,
                date: new Date()
            }],
            paymentType: paymentMethod === 'cash' ? 'cash' : 'credit',
            status: 'paid',
            userId: authSession.user.mainAccountId || authSession.user.id,
            branchId: authSession.user.branchId,
            createdBy: authSession.user.id
        }], { session });

        // تحديث تصاريح الصرف بمعرف الفاتورة
        for (const item of items) {
            const product = await Item.findById(item._id).session(session);
            if (product && product.exchange_permits.length > 0) {
                // البحث عن آخر تصريح صرف وتحديثه
                const lastPermit = product.exchange_permits[product.exchange_permits.length - 1];
                if (!lastPermit.invoiceId) {
                    lastPermit.invoiceId = invoice[0]._id;
                    lastPermit.customerId = customer?._id || null;
                    await product.save({ session });
                }
            }
        }

        await session.commitTransaction();

        return NextResponse.json({ 
            success: true, 
            message: 'تمت عملية البيع بنجاح',
            invoiceId: invoice[0]._id.toString()
        });

    } catch (error) {
        await session.abortTransaction();
        console.error('Error completing sale:', error);
        return NextResponse.json({ 
            error: error.message || 'Internal server error' 
        }, { status: 500 });
    } finally {
        session.endSession();
    }
}
