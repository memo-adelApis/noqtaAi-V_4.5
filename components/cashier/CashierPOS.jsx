"use client";

import { useState, useEffect } from "react";
import { Search, ShoppingCart, Trash2, Plus, Minus, DollarSign, CreditCard, Banknote, User, LogOut, Calculator } from "lucide-react";
import { toast } from "react-toastify";
import { signOut } from "next-auth/react";

export default function CashierPOS({ user }) {
    const [products, setProducts] = useState([]);
    const [cart, setCart] = useState([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [loading, setLoading] = useState(false);
    const [customer, setCustomer] = useState(null);
    const [paymentMethod, setPaymentMethod] = useState("cash");
    const [amountPaid, setAmountPaid] = useState(0);

    // جلب المنتجات
    useEffect(() => {
        fetchProducts();
    }, []);

    const fetchProducts = async () => {
        try {
            setLoading(true);
            const response = await fetch('/api/cashier/products');
            const data = await response.json();
            
            if (data.success && data.products) {
                // التأكد من أن جميع المنتجات لها أسعار صالحة
                const validProducts = data.products.map(product => ({
                    ...product,
                    price: product.price || 0,
                    quantity: product.quantity || 0
                }));
                setProducts(validProducts);
                
                if (validProducts.length === 0) {
                    toast.info('لا توجد منتجات متوفرة في هذا الفرع');
                }
            } else {
                toast.error(data.error || 'فشل في تحميل المنتجات');
                setProducts([]);
            }
        } catch (error) {
            console.error('خطأ في جلب المنتجات:', error);
            toast.error('حدث خطأ في تحميل المنتجات');
            setProducts([]);
        } finally {
            setLoading(false);
        }
    };

    // البحث عن المنتجات
    const filteredProducts = products.filter(p => 
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.barcode?.includes(searchQuery)
    );

    // إضافة منتج للسلة
    const addToCart = (product) => {
        // التحقق من وجود السعر
        if (!product.price || product.price <= 0) {
            toast.error('سعر المنتج غير صالح');
            return;
        }

        // التحقق من توفر المنتج
        if (product.quantity <= 0) {
            toast.error('المنتج غير متوفر في المخزون');
            return;
        }

        const existingItem = cart.find(item => item._id === product._id);
        
        if (existingItem) {
            if (existingItem.quantity >= product.quantity) {
                toast.error(`الكمية المتوفرة غير كافية (متوفر: ${product.quantity})`);
                return;
            }
            setCart(cart.map(item =>
                item._id === product._id
                    ? { ...item, quantity: item.quantity + 1 }
                    : item
            ));
        } else {
            setCart([...cart, { 
                ...product, 
                quantity: 1,
                storeId: product.store // إضافة معرف المخزن
            }]);
        }
        toast.success('تمت الإضافة للسلة');
    };

    // تحديث الكمية
    const updateQuantity = (productId, newQuantity) => {
        const product = products.find(p => p._id === productId);
        
        if (!product) {
            toast.error('المنتج غير موجود');
            return;
        }
        
        if (newQuantity > product.quantity) {
            toast.error(`الكمية المتوفرة غير كافية (متوفر: ${product.quantity})`);
            return;
        }

        if (newQuantity <= 0) {
            removeFromCart(productId);
            return;
        }

        setCart(cart.map(item =>
            item._id === productId
                ? { ...item, quantity: newQuantity }
                : item
        ));
    };

    // حذف من السلة
    const removeFromCart = (productId) => {
        setCart(cart.filter(item => item._id !== productId));
    };

    // تسجيل الخروج
    const handleLogout = async () => {
        try {
            await signOut({ 
                callbackUrl: '/login',
                redirect: true 
            });
        } catch (error) {
            console.error('خطأ في تسجيل الخروج:', error);
            toast.error('حدث خطأ في تسجيل الخروج');
        }
    };

    // حساب الإجمالي
    const subtotal = cart.reduce((sum, item) => sum + ((item.price || 0) * (item.quantity || 0)), 0);
    const tax = subtotal * 0.14; // 14% ضريبة
    const total = subtotal + tax;
    const change = amountPaid - total;

    // إتمام البيع
    const completeSale = async () => {
        if (cart.length === 0) {
            toast.error('السلة فارغة');
            return;
        }

        if (paymentMethod === 'cash' && amountPaid < total) {
            toast.error('المبلغ المدفوع غير كافٍ');
            return;
        }

        setLoading(true);

        try {
            const response = await fetch('/api/cashier/complete-sale', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    items: cart,
                    customer: customer,
                    paymentMethod,
                    amountPaid,
                    total,
                    tax
                })
            });

            const result = await response.json();

            if (response.ok) {
                toast.success('تمت عملية البيع بنجاح');
                // طباعة الفاتورة
                if (result.invoiceId) {
                    window.open(`/cashier/print/${result.invoiceId}`, '_blank');
                }
                // تصفير السلة
                setCart([]);
                setCustomer(null);
                setAmountPaid(0);
                fetchProducts(); // تحديث المخزون
            } else {
                toast.error(result.error || 'حدث خطأ');
            }
        } catch (error) {
            console.error('Error:', error);
            toast.error('حدث خطأ في إتمام البيع');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="h-screen flex flex-col bg-gray-950" dir="rtl">
            
            {/* شريط العلوي */}
            <div className="bg-gray-900 border-b border-gray-800 p-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-600 rounded-lg">
                            <ShoppingCart className="text-white" size={24} />
                        </div>
                        <div>
                            <h1 className="text-xl font-bold text-white">نقطة البيع (POS)</h1>
                            <p className="text-sm text-gray-400">مرحباً، {user.name}</p>
                        </div>
                    </div>
                    <button
                        onClick={handleLogout}
                        className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-all"
                    >
                        <LogOut size={18} />
                        تسجيل الخروج
                    </button>
                </div>
            </div>

            <div className="flex-1 flex overflow-hidden">
                
                {/* قسم المنتجات - اليسار */}
                <div className="flex-1 flex flex-col p-4 overflow-hidden">
                    
                    {/* البحث */}
                    <div className="mb-4">
                        <div className="relative">
                            <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="ابحث عن منتج أو امسح الباركود..."
                                className="w-full pr-12 pl-4 py-3 bg-gray-900 border border-gray-800 rounded-lg text-white placeholder-gray-500 focus:ring-2 focus:ring-blue-500"
                                autoFocus
                            />
                        </div>
                    </div>

                    {/* شبكة المنتجات */}
                    <div className="flex-1 overflow-y-auto">
                        {loading ? (
                            <div className="flex items-center justify-center h-64">
                                <div className="text-center">
                                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                                    <p className="text-gray-400">جاري تحميل المنتجات...</p>
                                </div>
                            </div>
                        ) : filteredProducts.length === 0 ? (
                            <div className="flex items-center justify-center h-64">
                                <div className="text-center">
                                    <ShoppingCart size={48} className="mx-auto mb-4 text-gray-600" />
                                    <p className="text-gray-400 text-lg">
                                        {searchQuery ? 'لا توجد منتجات تطابق البحث' : 'لا توجد منتجات متوفرة'}
                                    </p>
                                    {searchQuery && (
                                        <button
                                            onClick={() => setSearchQuery('')}
                                            className="mt-2 text-blue-400 hover:text-blue-300"
                                        >
                                            مسح البحث
                                        </button>
                                    )}
                                </div>
                            </div>
                        ) : (
                            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                                {filteredProducts.map((product) => (
                                    <button
                                        key={product._id}
                                        onClick={() => addToCart(product)}
                                        disabled={product.quantity === 0}
                                        className={`
                                            p-4 rounded-xl border-2 transition-all text-right relative overflow-hidden
                                            ${product.quantity === 0
                                                ? 'bg-gray-800 border-gray-700 opacity-50 cursor-not-allowed'
                                                : 'bg-gray-900 border-gray-800 hover:border-blue-600 hover:shadow-lg active:scale-95'
                                            }
                                        `}
                                    >
                                        {/* صورة المنتج */}
                                        {product.image && (
                                            <div className="w-full h-20 mb-3 rounded-lg overflow-hidden bg-gray-800">
                                                <img
                                                    src={product.image}
                                                    alt={product.name}
                                                    className="w-full h-full object-cover"
                                                />
                                            </div>
                                        )}
                                        
                                        {/* اسم المنتج */}
                                        <div className="font-bold text-white mb-1 line-clamp-2 text-sm">
                                            {product.name}
                                        </div>
                                        
                                        {/* الفئة */}
                                        {product.category && (
                                            <div className="text-xs text-gray-400 mb-2">
                                                {product.category}
                                            </div>
                                        )}
                                        
                                        {/* السعر */}
                                        <div className="text-xl font-bold text-blue-400 mb-2">
                                            {product.price ? product.price.toLocaleString('en-US') : '0'} ج.م
                                        </div>
                                        
                                        {/* الكمية المتوفرة */}
                                        <div className={`text-xs flex items-center justify-between ${
                                            (product.quantity || 0) > 10 
                                                ? 'text-green-400' 
                                                : (product.quantity || 0) > 0 
                                                    ? 'text-orange-400' 
                                                    : 'text-red-400'
                                        }`}>
                                            <span>متوفر: {product.quantity || 0}</span>
                                            {product.unit && (
                                                <span className="text-gray-500">{product.unit}</span>
                                            )}
                                        </div>
                                        
                                        {/* الباركود */}
                                        {product.barcode && (
                                            <div className="text-xs text-gray-500 mt-1 truncate">
                                                {product.barcode}
                                            </div>
                                        )}
                                        
                                        {/* مؤشر نفاد المخزون */}
                                        {product.quantity === 0 && (
                                            <div className="absolute inset-0 bg-red-900/20 flex items-center justify-center">
                                                <span className="bg-red-600 text-white px-2 py-1 rounded text-xs font-bold">
                                                    نفد المخزون
                                                </span>
                                            </div>
                                        )}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* قسم السلة والدفع - اليمين */}
                <div className="w-96 bg-gray-900 border-r border-gray-800 flex flex-col">
                    
                    {/* السلة */}
                    <div className="flex-1 overflow-y-auto p-4">
                        <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                            <ShoppingCart size={20} className="text-blue-400" />
                            السلة ({cart.length})
                        </h2>

                        {cart.length === 0 ? (
                            <div className="text-center py-12 text-gray-500">
                                <ShoppingCart size={48} className="mx-auto mb-3 opacity-30" />
                                <p>السلة فارغة</p>
                            </div>
                        ) : (
                            <div className="space-y-2">
                                {cart.map((item) => (
                                    <div key={item._id} className="bg-gray-800 rounded-lg p-3">
                                        <div className="flex justify-between items-start mb-2">
                                            <div className="flex-1">
                                                <div className="font-medium text-white">{item.name}</div>
                                                <div className="text-sm text-gray-400">
                                                    {(item.price || 0).toLocaleString()} ج.م
                                                </div>
                                            </div>
                                            <button
                                                onClick={() => removeFromCart(item._id)}
                                                className="text-red-400 hover:text-red-300 p-1"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                        
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-2 bg-gray-900 rounded-lg">
                                                <button
                                                    onClick={() => updateQuantity(item._id, item.quantity - 1)}
                                                    className="p-2 hover:bg-gray-700 rounded-lg"
                                                >
                                                    <Minus size={16} className="text-white" />
                                                </button>
                                                <span className="px-3 font-bold text-white">{item.quantity}</span>
                                                <button
                                                    onClick={() => updateQuantity(item._id, item.quantity + 1)}
                                                    className="p-2 hover:bg-gray-700 rounded-lg"
                                                >
                                                    <Plus size={16} className="text-white" />
                                                </button>
                                            </div>
                                            <div className="font-bold text-blue-400">
                                                {((item.price || 0) * (item.quantity || 0)).toLocaleString()} ج.م
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* الملخص والدفع */}
                    <div className="border-t border-gray-800 p-4 space-y-4">
                        
                        {/* الملخص */}
                        <div className="space-y-2">
                            <div className="flex justify-between text-gray-400">
                                <span>المجموع الفرعي:</span>
                                <span>{subtotal.toLocaleString()} ج.م</span>
                            </div>
                            <div className="flex justify-between text-gray-400">
                                <span>الضريبة (14%):</span>
                                <span>{tax.toLocaleString()} ج.م</span>
                            </div>
                            <div className="flex justify-between text-2xl font-bold text-white pt-2 border-t border-gray-800">
                                <span>الإجمالي:</span>
                                <span className="text-green-400">{total.toLocaleString()} ج.م</span>
                            </div>
                        </div>

                        {/* طريقة الدفع */}
                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-2">طريقة الدفع</label>
                            <div className="grid grid-cols-2 gap-2">
                                <button
                                    onClick={() => setPaymentMethod('cash')}
                                    className={`p-3 rounded-lg border-2 transition-all ${
                                        paymentMethod === 'cash'
                                            ? 'bg-blue-600 border-blue-600 text-white'
                                            : 'bg-gray-800 border-gray-700 text-gray-400'
                                    }`}
                                >
                                    <Banknote size={20} className="mx-auto mb-1" />
                                    <div className="text-xs">نقداً</div>
                                </button>
                                <button
                                    onClick={() => setPaymentMethod('card')}
                                    className={`p-3 rounded-lg border-2 transition-all ${
                                        paymentMethod === 'card'
                                            ? 'bg-blue-600 border-blue-600 text-white'
                                            : 'bg-gray-800 border-gray-700 text-gray-400'
                                    }`}
                                >
                                    <CreditCard size={20} className="mx-auto mb-1" />
                                    <div className="text-xs">بطاقة</div>
                                </button>
                            </div>
                        </div>

                        {/* المبلغ المدفوع */}
                        {paymentMethod === 'cash' && (
                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-2">المبلغ المدفوع</label>
                                <input
                                    type="number"
                                    value={amountPaid}
                                    onChange={(e) => setAmountPaid(Number(e.target.value))}
                                    className="w-full p-3 bg-gray-800 border border-gray-700 rounded-lg text-white text-xl font-bold text-center focus:ring-2 focus:ring-blue-500"
                                    min="0"
                                    step="0.01"
                                />
                                {amountPaid > 0 && (
                                    <div className={`mt-2 text-center font-bold ${change >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                                        الباقي: {change.toLocaleString()} ج.م
                                    </div>
                                )}
                            </div>
                        )}

                        {/* زر إتمام البيع */}
                        <button
                            onClick={completeSale}
                            disabled={loading || cart.length === 0}
                            className="w-full py-4 bg-gradient-to-r from-green-600 to-emerald-700 hover:from-green-700 hover:to-emerald-800 text-white rounded-xl font-bold text-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg"
                        >
                            {loading ? 'جاري المعالجة...' : 'إتمام البيع'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
