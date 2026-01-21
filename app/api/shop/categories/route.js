import { NextResponse } from 'next/server';
import { connectToDB } from "@/utils/database";
import Category from '@/models/Categories';
import Item from '@/models/Items';

export async function GET(request) {
  try {
    await connectToDB();

    // Get all categories
    const categories = await Category.find({})
      .sort({ name: 1 });

    // Get item count for each category
    const categoriesWithCount = await Promise.all(
      categories.map(async (category) => {
        const itemCount = await Item.countDocuments({ category: category._id });
        return {
          _id: category._id,
          name: category.name,
          description: category.description,
          image: category.image,
          itemCount
        };
      })
    );

    return NextResponse.json(categoriesWithCount);

  } catch (error) {
    console.error('Error fetching categories:', error);
    return NextResponse.json(
      { error: 'Failed to fetch categories' },
      { status: 500 }
    );
  }
}