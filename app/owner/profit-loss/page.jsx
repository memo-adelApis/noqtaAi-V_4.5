import ProfitLossStatementClient from '@/components/owner/ProfitLossStatementClient';

export const metadata = {
  title: 'Profit & Loss Statement - Owner Dashboard',
  description: 'View detailed profit and loss statement with revenue and expense breakdown',
};

export default function ProfitLossPage() {
  return (
    <div className="container mx-auto px-4 py-6">
      <ProfitLossStatementClient />
    </div>
  );
}