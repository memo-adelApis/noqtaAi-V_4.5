import { NextResponse } from 'next/server';
import { connectToDB } from "@/utils/database";
import Item from '@/models/Items';
import Category from '@/models/Categories';

export async function GET(request) {
  try {
    await connectToDB();

    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const search = searchParams.get('search');
    const page = parseInt(searchParams.get('page')) || 1;
    const limit = parseInt(searchParams.get('limit')) || 12;
    const featured = searchParams.get('featured') === 'true';

    // Build query
    let query = {};

    if (category) {
      query.category = category;
    }

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    // Get products
    const products = await Item.find(query)
      .populate('category', 'name')
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip((page - 1) * limit);

    // Get featured products (you can customize this logic)
    const featuredProducts = await Item.find({ 
      ...query,
      // Add your featured logic here, e.g., featured: true
    })
      .populate('category', 'name')
      .sort({ createdAt: -1 })
      .limit(8);

    const total = await Item.countDocuments(query);

    return NextResponse.json({
      products: products.map(product => ({
        _id: product._id,
        name: product.name,
        description: product.description,
        price: product.price,
        originalPrice: product.originalPrice,
        image: product.image,
        category: product.category,
        sku: product.sku,
        stock: product.stock,
        rating: product.rating || 4.5,
        reviewCount: product.reviewCount || 0,
        discount: product.discount
      })),
      featured: featured ? featuredProducts.map(product => ({
        _id: product._id,
        name: product.name,
        description: product.description,
        price: product.price,
        originalPrice: product.originalPrice,
        image: product.image,
        category: product.category,
        sku: product.sku,
        stock: product.stock,
        rating: product.rating || 4.5,
        reviewCount: product.reviewCount || 0,
        discount: product.discount
      })) : [],
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error('Error fetching products:', error);
    return NextResponse.json(
      { error: 'Failed to fetch products' },
      { status: 500 }
    );
  }
}