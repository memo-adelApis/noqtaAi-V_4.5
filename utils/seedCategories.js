import { connectToDB } from "@/utils/database";
import Category from "@/models/Category";

// الفئات الرئيسية الأساسية
const mainCategories = [
  {
    name: "الإلكترونيات",
    description: "أجهزة إلكترونية ومعدات تقنية",
    slug: "electronics",
    seoTitle: "الإلكترونيات - أجهزة ومعدات تقنية",
    seoDescription: "تشكيلة واسعة من الأجهزة الإلكترونية والمعدات التقنية الحديثة",
    sortOrder: 1,
    subcategories: [
      {
        name: "الهواتف الذكية",
        description: "هواتف ذكية وإكسسواراتها",
        slug: "smartphones",
        sortOrder: 1
      },
      {
        name: "أجهزة الكمبيوتر",
        description: "أجهزة كمبيوتر محمولة ومكتبية",
        slug: "computers",
        sortOrder: 2
      },
      {
        name: "الأجهزة المنزلية",
        description: "أجهزة كهربائية منزلية",
        slug: "home-appliances",
        sortOrder: 3
      }
    ]
  },
  {
    name: "الملابس والأزياء",
    description: "ملابس وإكسسوارات للرجال والنساء والأطفال",
    slug: "clothing-fashion",
    seoTitle: "الملابس والأزياء - أحدث صيحات الموضة",
    seoDescription: "تشكيلة متنوعة من الملابس والأزياء العصرية للجميع",
    sortOrder: 2,
    subcategories: [
      {
        name: "ملابس رجالية",
        description: "ملابس وإكسسوارات رجالية",
        slug: "mens-clothing",
        sortOrder: 1
      },
      {
        name: "ملابس نسائية",
        description: "ملابس وإكسسوارات نسائية",
        slug: "womens-clothing",
        sortOrder: 2
      },
      {
        name: "ملابس أطفال",
        description: "ملابس وإكسسوارات للأطفال",
        slug: "kids-clothing",
        sortOrder: 3
      }
    ]
  },
  {
    name: "المواد الغذائية",
    description: "مواد غذائية ومشروبات",
    slug: "food-beverages",
    seoTitle: "المواد الغذائية والمشروبات",
    seoDescription: "مجموعة متنوعة من المواد الغذائية والمشروبات الطازجة",
    sortOrder: 3,
    subcategories: [
      {
        name: "الخضروات والفواكه",
        description: "خضروات وفواكه طازجة",
        slug: "fruits-vegetables",
        sortOrder: 1
      },
      {
        name: "اللحوم والدواجن",
        description: "لحوم ودواجن طازجة",
        slug: "meat-poultry",
        sortOrder: 2
      },
      {
        name: "منتجات الألبان",
        description: "حليب وأجبان ومنتجات ألبان",
        slug: "dairy-products",
        sortOrder: 3
      },
      {
        name: "المشروبات",
        description: "مشروبات غازية وعصائر ومياه",
        slug: "beverages",
        sortOrder: 4
      }
    ]
  },
  {
    name: "الصحة والجمال",
    description: "منتجات العناية الشخصية والصحة",
    slug: "health-beauty",
    seoTitle: "الصحة والجمال - منتجات العناية",
    seoDescription: "منتجات العناية الشخصية والصحة والجمال",
    sortOrder: 4,
    subcategories: [
      {
        name: "العناية بالبشرة",
        description: "كريمات ومنتجات العناية بالبشرة",
        slug: "skincare",
        sortOrder: 1
      },
      {
        name: "العناية بالشعر",
        description: "شامبو وبلسم ومنتجات الشعر",
        slug: "haircare",
        sortOrder: 2
      },
      {
        name: "المكملات الغذائية",
        description: "فيتامينات ومكملات غذائية",
        slug: "supplements",
        sortOrder: 3
      }
    ]
  },
  {
    name: "المنزل والحديقة",
    description: "أثاث ومستلزمات منزلية وحديقة",
    slug: "home-garden",
    seoTitle: "المنزل والحديقة - أثاث ومستلزمات",
    seoDescription: "كل ما تحتاجه لمنزلك وحديقتك من أثاث ومستلزمات",
    sortOrder: 5,
    subcategories: [
      {
        name: "الأثاث",
        description: "أثاث منزلي ومكتبي",
        slug: "furniture",
        sortOrder: 1
      },
      {
        name: "أدوات المطبخ",
        description: "أواني وأدوات الطبخ",
        slug: "kitchen-tools",
        sortOrder: 2
      },
      {
        name: "مستلزمات الحديقة",
        description: "أدوات ومستلزمات البستنة",
        slug: "garden-supplies",
        sortOrder: 3
      }
    ]
  },
  {
    name: "الرياضة واللياقة",
    description: "معدات رياضية وأدوات اللياقة البدنية",
    slug: "sports-fitness",
    seoTitle: "الرياضة واللياقة - معدات رياضية",
    seoDescription: "معدات رياضية وأدوات اللياقة البدنية لجميع الأنشطة",
    sortOrder: 6,
    subcategories: [
      {
        name: "معدات الجيم",
        description: "أوزان ومعدات اللياقة البدنية",
        slug: "gym-equipment",
        sortOrder: 1
      },
      {
        name: "الملابس الرياضية",
        description: "ملابس وأحذية رياضية",
        slug: "sportswear",
        sortOrder: 2
      },
      {
        name: "الألعاب الرياضية",
        description: "كرات ومعدات الألعاب الرياضية",
        slug: "sports-games",
        sortOrder: 3
      }
    ]
  },
  {
    name: "الكتب والقرطاسية",
    description: "كتب ومواد تعليمية وقرطاسية",
    slug: "books-stationery",
    seoTitle: "الكتب والقرطاسية - مواد تعليمية",
    seoDescription: "كتب ومواد تعليمية وأدوات قرطاسية متنوعة",
    sortOrder: 7,
    subcategories: [
      {
        name: "الكتب التعليمية",
        description: "كتب دراسية ومراجع تعليمية",
        slug: "educational-books",
        sortOrder: 1
      },
      {
        name: "القرطاسية المكتبية",
        description: "أقلام ودفاتر وأدوات مكتبية",
        slug: "office-supplies",
        sortOrder: 2
      },
      {
        name: "الكتب الثقافية",
        description: "روايات وكتب ثقافية وأدبية",
        slug: "cultural-books",
        sortOrder: 3
      }
    ]
  },
  {
    name: "السيارات والمركبات",
    description: "قطع غيار ومستلزمات السيارات",
    slug: "automotive",
    seoTitle: "السيارات والمركبات - قطع غيار",
    seoDescription: "قطع غيار ومستلزمات وإكسسوارات السيارات",
    sortOrder: 8,
    subcategories: [
      {
        name: "قطع الغيار",
        description: "قطع غيار أصلية وبديلة",
        slug: "auto-parts",
        sortOrder: 1
      },
      {
        name: "الإكسسوارات",
        description: "إكسسوارات داخلية وخارجية",
        slug: "auto-accessories",
        sortOrder: 2
      },
      {
        name: "الزيوت والسوائل",
        description: "زيوت محرك وسوائل السيارة",
        slug: "oils-fluids",
        sortOrder: 3
      }
    ]
  }
];

// دالة إنشاء الفئات
export async function seedCategories(userId, branchId) {
  await connectToDB();
  
  try {
    console.log('بدء إنشاء الفئات الرئيسية...');
    
    for (const categoryData of mainCategories) {
      // التحقق من عدم وجود الفئة مسبقاً
      const existingCategory = await Category.findOne({
        name: categoryData.name,
        userId: userId,
        branchId: branchId
      });

      if (existingCategory) {
        console.log(`الفئة "${categoryData.name}" موجودة مسبقاً`);
        continue;
      }

      // إنشاء الفئة الرئيسية
      const mainCategory = await Category.create({
        name: categoryData.name,
        description: categoryData.description,
        slug: categoryData.slug,
        seoTitle: categoryData.seoTitle,
        seoDescription: categoryData.seoDescription,
        sortOrder: categoryData.sortOrder,
        isActive: true,
        userId: userId,
        branchId: branchId
      });

      console.log(`تم إنشاء الفئة الرئيسية: ${categoryData.name}`);

      // إنشاء الفئات الفرعية
      if (categoryData.subcategories && categoryData.subcategories.length > 0) {
        for (const subCategoryData of categoryData.subcategories) {
          await Category.create({
            name: subCategoryData.name,
            description: subCategoryData.description,
            slug: subCategoryData.slug,
            sortOrder: subCategoryData.sortOrder,
            parentId: mainCategory._id,
            isActive: true,
            userId: userId,
            branchId: branchId
          });

          console.log(`  - تم إنشاء الفئة الفرعية: ${subCategoryData.name}`);
        }
      }
    }

    console.log('تم إنشاء جميع الفئات بنجاح!');
    return { success: true, message: 'تم إنشاء الفئات الرئيسية بنجاح' };

  } catch (error) {
    console.error('خطأ في إنشاء الفئات:', error);
    return { success: false, error: error.message };
  }
}

// دالة لحذف جميع الفئات (للاختبار)
export async function clearAllCategories(userId, branchId) {
  await connectToDB();
  
  try {
    const result = await Category.deleteMany({
      userId: userId,
      branchId: branchId
    });

    console.log(`تم حذف ${result.deletedCount} فئة`);
    return { success: true, message: `تم حذف ${result.deletedCount} فئة` };

  } catch (error) {
    console.error('خطأ في حذف الفئات:', error);
    return { success: false, error: error.message };
  }
}