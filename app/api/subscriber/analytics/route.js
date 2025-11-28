import { NextResponse } from "next/server";
import { connectToDB } from "@/utils/database";
import { getCurrentUser } from "@/app/lib/auth";
import Invoice from "@/models/Invoices";
import Branch from "@/models/Branches";
import mongoose from "mongoose";

export async function GET() {
    try {
        const currentUser = await getCurrentUser();
        if (!currentUser || currentUser.role !== 'subscriber') {
            return NextResponse.json({ success: false, error: "401 - غير مصرح به" });
        }

        await connectToDB();
        const mainAccountId = currentUser._id;

        // --- Branch Performance ---
        const branchPerformance = await Invoice.aggregate([
            { $match: { userId: mainAccountId, status: { $in: ["paid","pending","overdue"] } } },
            { $group: {
                _id: "$branchId",
                revenue: { $sum: { $cond: [{ $eq:["$type","revenue"] }, "$totalInvoice", 0] } },
                expenses: { $sum: { $cond: [{ $eq:["$type","expense"] }, "$totalInvoice", 0] } },
                profit: { $sum: { $cond: [{ $eq:["$type","revenue"] }, "$totalPays", { $multiply:["$totalPays",-1] } ] } }
            }},
            { $lookup: { from: "branches", localField: "_id", foreignField: "_id", as: "branchDetails" } },
            { $match: { branchDetails: { $ne: [] } } },
            { $project: { _id:0, name: { $arrayElemAt:["$branchDetails.name",0] }, revenue:1, expenses:1, profit:1 } },
            { $sort: { profit:-1 } }
        ]);

        // --- Overall Trend 30 Days ---
        const thirtyDaysAgo = new Date(); thirtyDaysAgo.setDate(thirtyDaysAgo.getDate()-30);
        thirtyDaysAgo.setHours(0,0,0,0);

        const trendAggregation = await Invoice.aggregate([
            { $match: { userId: mainAccountId, createdAt: { $gte: thirtyDaysAgo }, status: { $in:["paid","pending","overdue"] } } },
            { $group: {
                _id: { date: { $dateToString: { format: "%Y-%m-%d", date:"$createdAt", timezone:"Africa/Cairo" } }, type:"$type" },
                dailyTotal: { $sum:"$totalInvoice" }
            }},
            { $group: { _id:"$_id.date", revenue: { $sum: { $cond:[ { $eq:["$_id.type","revenue"] }, "$dailyTotal", 0 ] } }, expense:{ $sum:{ $cond:[ { $eq:["$_id.type","expense"] }, "$dailyTotal",0 ] } } } },
            { $sort:{ _id:1 } }
        ]);

        const dateMap = new Map(trendAggregation.map(item=>[item._id,item]));
        const overallTrend = [];
        const timeZone = 'Africa/Cairo';
        for(let i=29;i>=0;i--){
            const date=new Date(); date.setDate(date.getDate()-i);
            const dateString=date.toLocaleDateString('en-CA',{timeZone});
            const data=dateMap.get(dateString);
            overallTrend.push({ name: date.toLocaleDateString('ar-EG',{day:'2-digit',month:'short',timeZone}), revenue:data?.revenue||0, expense:data?.expense||0 });
        }

        // --- Top 5 Customers ---
        const topCustomers = await Invoice.aggregate([
            { $match:{ userId:mainAccountId, type:'revenue', status:{ $in:["paid","pending","overdue"] } } },
            { $group:{ _id:"$customerId", totalPaid:{ $sum:"$totalPays" } } },
            { $sort:{ totalPaid:-1 } },
            { $limit:5 },
            { $lookup:{ from:"customers", localField:"_id", foreignField:"_id", as:"customerDetails" } },
            { $unwind:"$customerDetails" },
            { $project:{ _id:1, name:"$customerDetails.name", total:"$totalPaid" } }
        ]);

        // --- Top 5 Suppliers ---
        const topSuppliers = await Invoice.aggregate([
            { $match:{ userId:mainAccountId, type:'expense', status:{ $in:["paid","pending","overdue"] } } },
            { $group:{ _id:"$supplierId", totalPaid:{ $sum:"$totalPays" } } },
            { $sort:{ totalPaid:-1 } },
            { $limit:5 },
            { $lookup:{ from:"suppliers", localField:"_id", foreignField:"_id", as:"supplierDetails" } },
            { $unwind:"$supplierDetails" },
            { $project:{ _id:1, name:"$supplierDetails.name", total:"$totalPaid" } }
        ]);

        return NextResponse.json({ success:true, data:{ branchPerformance, overallTrend, topCustomers, topSuppliers } });

    } catch(err){
        console.error(err);
        return NextResponse.json({ success:false, error: err.message });
    }
}
