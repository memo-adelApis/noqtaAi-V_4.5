import Item from "@/models/Items";
import User from "@/models/User";
import { connectToDB } from "@/utils/database";
import { NextResponse } from "next/server";

export async function GET() {
    try {
        await connectToDB();
        const data = await User.find();

        return NextResponse.json(
            { success: true, items: data },
            { status: 201 }
        );
    } catch (error) {
        return NextResponse.json(
            { success: false, error: error.message },
            { status: 500 }
        );
    }
}
