import { getCurrentUser } from "@/app/lib/auth";
import { redirect } from "next/navigation";
import CashierPOS from "@/components/cashier/CashierPOS";

export default async function CashierPage() {
    const user = await getCurrentUser();
    
    // if (!user || user.role !== 'cashier') {
    //     redirect('/login');
    // }

    // جلب بيانات المخزن والمنتجات
    const userData = {
        _id: user._id.toString(),
        name: user.name,
        branchId: user.branchId?.toString() || null,
    };

    return <CashierPOS user={userData} />;
}
