import { NextResponse } from "next/server";
import { connectToDB } from "@/utils/database";
import { getCurrentUser } from "@/app/lib/auth";
import Store from "@/models/Store";
import Item from "@/models/Items";
import mongoose from "mongoose";

export async function GET(request, { params }) {
  try {
    await connectToDB();
    
    const currentUser = await getCurrentUser();
    
    if (!currentUser || currentUser.role !== 'owner') {
      return NextResponse.json(
        { error: "غير مصرح به" },
        { status: 403 }
      );
    }
    
    if (!currentUser.mainAccountId) {
      return NextResponse.json(
        { error: "المالك غير مرتبط بحساب مشترك" },
        { status: 403 }
      );
    }
    
    const { branchId } = await params;
    const subscriberId = new mongoose.Types.ObjectId(currentUser.mainAccountId);
    const branchObjectId = new mongoose.Types.ObjectId(branchId);
    
    // جلب المخازن للفرع
    const stores = await Store.find({
      userId: subscriberId,
      branchId: branchObjectId
    }).lean();
    
    // جلب المنتجات لكل مخزن
    const storesWithItems = await Promise.all(
      stores.map(async (store) => {
        const items = await Item.find({
          storeId: store._id
        })
        .populate('unit', 'name')
        .lean();
        
        return {
          _id: store._id.toString(),
          name: store.name,
          location: store.location,
          itemCount: items.length,
          totalValue: items.reduce((sum, item) => sum + (item.price * item.quantity), 0),
          items: items.map(item => ({
            _id: item._id.toString(),
            name: item.name,
            sku: item.sku,
            quantity: item.quantity,
            price: item.price,
            totalValue: item.price * item.quantity,
            unit: item.unit?.name || 'غير محدد',
            category: item.category || 'غير محدد'
          }))
        };
      })
    );
    
    return NextResponse.json({
      success: true,
      stores: storesWithItems
    });
    
  } catch (error) {
    console.error("Error fetching branch stores:", error);
    return NextResponse.json(
      { error: error.message || "حدث خطأ أثناء جلب المخازن" },
      { status: 500 }
    );
  }
}
