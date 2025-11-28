"use client";

import { useEffect, useState } from "react";
import { getSubscriberDashboardData } from "@/app/actions/subscriberDashboardActions";

export function useAnalyticsData() {
  const [stats, setStats] = useState(null);
  const [analytics, setAnalytics] = useState({
    branchPerformance: [],
    overallTrend: [],
    topCustomers: [],
    topSuppliers: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // --- Fetch Critical Data (Server Action) ---
  useEffect(() => {
    async function fetchCritical() {
      try {
        const result = await getSubscriberDashboardData();
        if (!result.success) throw new Error(result.error || "فشل تحميل البيانات");
        setStats(result.data.stats);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchCritical();
  }, []);

  // --- Fetch Analytics Data (API Route) ---
  useEffect(() => {
    async function fetchAnalytics() {
      try {
        const res = await fetch("/api/subscriber/analytics");
        const json = await res.json();
        if (!json.success) throw new Error(json.error || "فشل تحميل التحليلات");
        setAnalytics({
          branchPerformance: json.data.branchPerformance || [],
          overallTrend: json.data.overallTrend || [],
          topCustomers: json.data.topCustomers || [],
          topSuppliers: json.data.topSuppliers || []
        });
      } catch (err) {
        // console.error("Analytics fetch error:", err);
        setError("فشل تحميل تحليلات البيانات");
      }
    }
    fetchAnalytics();
  }, []);

  return { stats, analytics, loading, error };
}
