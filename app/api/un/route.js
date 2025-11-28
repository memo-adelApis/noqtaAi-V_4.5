import Unit from "@/models/Units";
import { connectToDB } from "@/utils/database";
import { NextResponse } from "next/server";

export async function POST(request) {
    try {
        await connectToDB();

        const data = await request.json();

        const newUnit = await Unit.create(data);

        return NextResponse.json(
            { success: true, data: newUnit },
            { status: 201 }
        );
    } catch (error) {
        return NextResponse.json(
            { success: false, error: error.message },
            { status: 500 }
        );
    }
}
