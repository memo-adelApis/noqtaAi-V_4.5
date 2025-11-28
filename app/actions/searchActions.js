// المسار: app/actions/searchActions.js
"use server";

import { getCurrentUser } from "@/app/lib/auth"; 
import Customer from "@/models/Customers";
import Supplier from "@/models/Suppliers";
import { connectToDB } from "@/utils/database";

export async function searchCustomers(query) {
    try {
        const currentUser = await getCurrentUser();
        if (!currentUser) throw new Error("401 - غير مصرح به");

        await connectToDB();
        
        const sanitizedQuery = query.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&');

        const searchQuery = {
            userId: currentUser.mainAccountId, 
            name: { $regex: sanitizedQuery, $options: 'i' }
        };

    const customers = await Customer.find(searchQuery).limit(10).lean();
return customers.map(c => ({
    ...c,
    _id: c._id.toString(),
    userId: c.userId?.toString(),
    branchId: c.branchId?.toString(),  // <--- هذا مهم
}))
        // --- (نهاية التعديل) --- 
        
        return customers; // (لم نعد بحاجة لـ JSON.parse)
    } catch (error) {
        // console.error("Search Customers Error:", error.message);
        return { error: error.message };
    }
}

export async function searchSuppliers(query) {
    try {
        const currentUser = await getCurrentUser();
        if (!currentUser) throw new Error("401 - غير مصرح به");

        await connectToDB();

        const sanitizedQuery = query.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&');
        
        const searchQuery = {
            userId: currentUser.mainAccountId, 
            name: { $regex: sanitizedQuery, $options: 'i' }
        };

        // --- (هذا هو التعديل: إضافة .lean()) ---
const suppliers = await Supplier.find(searchQuery).limit(10).lean();
return suppliers.map(s => ({
    ...s,
    _id: s._id.toString(),
    userId: s.userId?.toString(),
    branchId: s.branchId?.toString(),  // <--- هذا مهم
}));        // --- (نهاية التعديل) ---
        return suppliers; // (لم نعد بحاجة لـ JSON.parse)
    } catch (error) {
        // console.error("Search Suppliers Error:", error.message);
        return { error: error.message };
    }
}