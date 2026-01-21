// المسار: hooks/useInvoiceForm.js
"use client";

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { createInvoice } from '@/app/actions/invoiceActions';
import { toast } from 'react-toastify';
import { z } from "zod";

// --- Schema للتحقق من الأصناف ---
export const invoiceItemSchema = z.object({
  name: z.string().min(1, "اسم الصنف مطلوب"),
  price: z.number().min(0, "السعر لا يمكن أن يكون سالب"),
  quantity: z.number().min(0, "الكمية لا يمكن أن تكون سالبة"),
  unit: z.string().min(1, "الوحدة مطلوبة"),
  storeId: z.string().min(1, "المخزن مطلوب"),
  categoryId: z.string().optional(), // مطلوب للشراء فقط
  itemId: z.string().optional(), // للمنتجات الموجودة
  description: z.string().optional(),
  removalReason: z.string().optional(),
});

export const useInvoiceForm = (initialData, existingInvoice = null) => {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);

    // --- (1) الحالة المؤقتة لإضافة صنف ---
    const [currentItem, setCurrentItem] = useState({
        name: '', 
        price: 0, 
        quantity: 1, 
        unit: initialData?.units?.[0]?._id || '',
        storeId: initialData?.stores?.[0]?._id || '',
        categoryId: '',
        itemId: '', // للمنتجات الموجودة
        description: '',
        removalReason: '',
    });

    const handleCurrentItemChange = (e) => {
        const { name, value } = e.target;
        // تحويل القيم الرقمية تلقائيًا
        setCurrentItem(prev => ({
            ...prev,
            [name]: ['price','quantity'].includes(name) ? Number(value) : value
        }));
    };
    
    // --- (2) باقي الحالات - مع دعم البيانات الموجودة ---
    const [invoiceType, setInvoiceType] = useState(existingInvoice?.type || 'revenue'); 
    const [invoiceKind, setInvoiceKind] = useState(existingInvoice?.kind || 'normal'); 
    const [selectedEntity, setSelectedEntity] = useState(
        existingInvoice ? {
            _id: existingInvoice.customerId || existingInvoice.supplierId,
            name: existingInvoice.entityName
        } : null
    ); 
    const [invoiceNumber, setInvoiceNumber] = useState(existingInvoice?.invoiceNumber || '');
    const [currencyCode, setCurrencyCode] = useState(existingInvoice?.currencyCode || 'EGP');
    const [notes, setNotes] = useState(existingInvoice?.notes || '');
    const [items, setItems] = useState(existingInvoice?.items || []); 
    const [pays, setPays] = useState(existingInvoice?.pays || []); 
    const [discount, setDiscount] = useState(existingInvoice?.discount || 0);
    const [extra, setExtra] = useState(existingInvoice?.extra || 0); 
    const [taxRate, setTaxRate] = useState(existingInvoice?.taxRate || 15);
    const [paymentType, setPaymentType] = useState(existingInvoice?.paymentType || 'cash'); 
    const [installments, setInstallments] = useState(existingInvoice?.installments || []);

    // --- (3) الملخص ---
    const summary = useMemo(() => {
        const totalItems = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        const subtotal = totalItems - (Number(discount) || 0); 
        const vatAmount = invoiceKind === 'tax' ? subtotal * (taxRate / 100) : 0;
        const totalInvoice = subtotal + vatAmount + (Number(extra) || 0); 
        const totalPaid = pays.reduce((sum, pay) => sum + (Number(pay.amount) || 0), 0);
        const balance = totalInvoice - totalPaid;
        return { totalItems, subtotal, vatAmount, totalInvoice, totalPaid, balance };
    }, [items, discount, extra, taxRate, invoiceKind, pays]);

    // --- (4) دوال إدارة الفاتورة ---
    const handleInvoiceTypeChange = (newType) => {
        setInvoiceType(newType);
        setSelectedEntity(null); 
    };
    const handleSelectEntity = (entity) => setSelectedEntity(entity);

    // --- (5) دوال الأصناف ---
    const addItem = () => {
      try {
        // التحقق من الحقول المطلوبة للشراء
        if (invoiceType === 'expense' && !currentItem.categoryId) {
          toast.error("يجب اختيار فئة المنتج للفواتير الشرائية");
          return;
        }

        const validatedItem = invoiceItemSchema.parse(currentItem);

        setItems(prev => [...prev, { ...validatedItem, id: Date.now() }]);

        setCurrentItem({
          name: '', 
          price: 0, 
          quantity: 1, 
          unit: initialData?.units?.[0]?._id || '',
          storeId: initialData?.stores?.[0]?._id || '',
          categoryId: '',
          itemId: '',
          description: '',
          removalReason: '',
        });

      } catch (err) {
        if (err instanceof z.ZodError) {
          toast.error(err.issues.map(e => e.message).join("\n"));
        } else {
          toast.error("حدث خطأ غير متوقع");
        }
      }
    };

    const removeItem = (id) => setItems(prev => prev.filter(item => item.id !== id));
    const updateItem = (id, updatedField) => {
        setItems(prev => prev.map(item => item.id === id ? { ...item, ...updatedField } : item));
    };

    // --- (6) دوال الدفعات ---
    const addPayment = () => setPays(prev => [...prev, { id: Date.now(), date: new Date().toISOString().split('T')[0], amount: 0, method: 'cash' }]);
    const removePayment = (id) => setPays(prev => prev.filter(pay => pay.id !== id));
    const updatePayment = (id, updatedField) => setPays(prev => prev.map(pay => pay.id === id ? { ...pay, ...updatedField } : pay));

    // --- (7) دوال الأقساط ---
    const generateInstallments = (count = 3) => {
        if (summary.balance <= 0 || count <= 0) {
            toast.error("الرصيد المتبقي صفر، لا يمكن إنشاء أقساط.");
            return;
        }

        const amountPerInstallment = (summary.balance / count).toFixed(2);
        const newInstallments = [];
        let currentDate = new Date();

        for (let i = 0; i < count; i++) {
            currentDate.setMonth(currentDate.getMonth() + 1);
            newInstallments.push({
                id: Date.now() + i,
                dueDate: currentDate.toISOString().split('T')[0],
                amount: Number(amountPerInstallment),
                status: 'pending'
            });
        }
        setInstallments(newInstallments);
        toast.success(`تم إنشاء ${count} أقساط بقيمة ${amountPerInstallment}`);
    };

    const removeInstallment = (id) => setInstallments(prev => prev.filter(inst => inst.id !== id));
    const updateInstallment = (id, updatedField) => setInstallments(prev => prev.map(inst => inst.id === id ? { ...inst, ...updatedField } : inst));

    // --- (8) حفظ الفاتورة ---
    const handleSubmit = async () => {
        setIsLoading(true);
        toast.loading('جاري حفظ الفاتورة...');

        if (!selectedEntity) {
            toast.error(`يجب اختيار ${invoiceType === 'revenue' ? 'عميل' : 'مورد'}`);
            setIsLoading(false);
            return;
        }

        if (items.length === 0) {
            toast.error("يجب إضافة صنف واحد على الأقل");
            setIsLoading(false);
            return;
        }

        if (paymentType === 'installment' && installments.length === 0) {
             toast.error("اخترت 'أقساط' ولكن لم تقم بإنشاء جدول الأقساط");
             setIsLoading(false);
             return;
        }

        if (paymentType === 'installment') {
            const totalInstallments = installments.reduce((sum, i) => sum + (Number(i.amount) || 0), 0);
            if (Math.abs(totalInstallments - summary.balance) > 0.01) { 
                toast.error(`إجمالي الأقساط (${totalInstallments}) لا يساوي الرصيد المتبقي (${summary.balance})`);
                setIsLoading(false);
                return;
            }
        }

        const invoiceData = {
            invoiceNumber: invoiceNumber || null,
            type: invoiceType,
            invoiceKind,
            customerId: invoiceType === 'revenue' ? selectedEntity._id : null,
            supplierId: invoiceType === 'expense' ? selectedEntity._id : null,
            items: items.map(({id, ...rest}) => rest),
            discount: Number(discount),
            extra: Number(extra),
            taxRate: invoiceKind === 'tax' ? Number(taxRate) : 0,
            paymentType,
            pays: pays.map(({id, ...rest}) => ({ ...rest, amount: Number(rest.amount) })),
            installments: (paymentType === 'installment' ? installments : []).map(({id, ...rest}) => ({ ...rest, amount: Number(rest.amount) })),
            currencyCode,
            notes,
        };

        const result = await createInvoice(invoiceData);

        toast.dismiss();
        if (result.success) {
            toast.success("تم إنشاء الفاتورة بنجاح!");
            router.push('/subuser/home'); 
        } else {
            toast.error(result.error || "حدث خطأ غير معروف");
        }
        setIsLoading(false);
    };

    // --- (9) إعادة البيانات ---
    return {
        isLoading,
        state: {
            invoiceType, invoiceKind, selectedEntity, invoiceNumber, currencyCode, notes,
            items, pays, discount, extra, taxRate, paymentType, installments,
            currentItem 
        },
        setters: {
            setInvoiceKind, setInvoiceNumber, setCurrencyCode, setNotes,
            setDiscount, setExtra, setTaxRate, setPaymentType
        },
        handlers: {
            handleInvoiceTypeChange, handleSelectEntity,
            addItem, removeItem, updateItem,
            addPayment, removePayment, updatePayment,
            generateInstallments, removeInstallment, updateInstallment,
            handleSubmit,
            handleCurrentItemChange 
        },
        summary,
        initialData 
    };
};
