"use client";

import { 
  User, Mail, Calendar, CreditCard, Users, Building, 
  Store, FileText, TrendingUp, TrendingDown, DollarSign
} from "lucide-react";

export default function SubscriberProfileClient({ user, stats }) {
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount || 0) + ' ج.م';
  };

  const getStatusBadge = (status) => {
    const badges = {
      trial: { color: 'bg-blue-500', text: 'فترة تجريبية' },
      active: { color: 'bg-green-500', text: 'نشط' },
      