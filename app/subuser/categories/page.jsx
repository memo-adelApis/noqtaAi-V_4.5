import CategoriesList from '@/components/subuser/categories/CategoriesList';

export const metadata = {
  title: 'إدارة الفئات - نظام إدارة المخزون',
  description: 'إدارة فئات المنتجات والتصنيفات في نظام إدارة المخزون'
};

export default function CategoriesPage() {
  return (
    <div className="container mx-auto p-6">
      <CategoriesList />
    </div>
  );
}