"use client";

import { useRouter, useSearchParams } from 'next/navigation';
import { Calendar } from 'lucide-react';

export default function YearFilter({ currentYear, availableYears }) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const handleYearChange = (e) => {
    const year = e.target.value;
    const params = new URLSearchParams(searchParams);
    params.set('year', year);
    router.push(`?${params.toString()}`);
  };

  return (
    <div className="flex items-center gap-2">
      <Calendar className="text-blue-500" size={20} />
      <label className="text-gray-400 text-sm">السنة:</label>
      <select 
        value={currentYear}
        onChange={handleYearChange}
        className="bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white"
      >
        {availableYears.map(year => (
          <option key={year} value={year}>{year}</option>
        ))}
      </select>
    </div>
  );
}
