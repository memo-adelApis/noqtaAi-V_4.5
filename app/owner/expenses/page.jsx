import ExpensesClient from '@/components/owner/ExpensesClient';

export const metadata = {
  title: 'Expenses Management - Owner Dashboard',
  description: 'Manage business expenses and track spending by category',
};

export default function ExpensesPage() {
  return (
    <div className="container mx-auto px-4 py-6">
      <ExpensesClient />
    </div>
  );
}