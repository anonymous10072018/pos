
import React, { useState, useEffect, useMemo } from 'react';
import { Sale, Product } from '../types';
import { getBusinessInsights } from '../services/gemini';
import { TrendingUp, ShoppingBag, CreditCard, Sparkles, Clock } from 'lucide-react';

interface Props {
  sales: Sale[];
  products: Product[];
  theme: string;
  colorStyles: any;
}

const Dashboard: React.FC<Props> = ({ sales, products, theme, colorStyles }) => {
  const [insights, setInsights] = useState<string | null>(null);
  const [loadingInsights, setLoadingInsights] = useState(false);

  const stats = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const todaySales = sales.filter(s => s.timestamp >= today.getTime());
    const totalToday = todaySales.reduce((acc, s) => acc + s.total, 0);
    
    return {
      todayCount: todaySales.length,
      todayTotal: totalToday,
      inventoryCount: products.length,
      recentSales: sales.slice(-3).reverse()
    };
  }, [sales, products]);

  useEffect(() => {
    const loadInsights = async () => {
      if (sales.length > 0) {
        setLoadingInsights(true);
        const data = await getBusinessInsights(sales, products);
        setInsights(data || null);
        setLoadingInsights(false);
      }
    };
    loadInsights();
  }, [sales.length]);

  return (
    <div className="p-6 space-y-6 transition-colors dark:bg-slate-900">
      <div className="space-y-1">
        <h2 className="text-2xl font-bold dark:text-slate-100 text-slate-900">Today's Summary</h2>
        <p className="text-slate-500 text-sm">Welcome back! Here's how the day is looking.</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 gap-4">
        <div className={`${colorStyles.bg} p-4 rounded-2xl text-white shadow-lg ${colorStyles.shadow}`}>
          <div className="flex justify-between items-start mb-2">
            <CreditCard className="w-5 h-5 opacity-80" />
            <TrendingUp className="w-4 h-4 opacity-80" />
          </div>
          <p className="text-xs opacity-80 font-medium">Revenue Today</p>
          <h3 className="text-xl font-bold">₱{stats.todayTotal.toLocaleString()}</h3>
        </div>
        <div className="bg-emerald-500 p-4 rounded-2xl text-white shadow-lg shadow-emerald-200 dark:shadow-none">
          <div className="flex justify-between items-start mb-2">
            <ShoppingBag className="w-5 h-5 opacity-80" />
          </div>
          <p className="text-xs opacity-80 font-medium">Orders</p>
          <h3 className="text-xl font-bold">{stats.todayCount}</h3>
        </div>
      </div>

      {/* AI Insights Section */}
      <div className={`bg-white dark:bg-slate-800 rounded-2xl p-5 border ${colorStyles.borderLight} shadow-sm relative overflow-hidden group`}>
        <div className="absolute top-0 right-0 p-3 opacity-5">
            <Sparkles className={`w-20 h-20 ${colorStyles.accent}`} />
        </div>
        <div className="flex items-center gap-2 mb-3">
          <div className={`w-6 h-6 ${colorStyles.bgLight} ${colorStyles.text} rounded flex items-center justify-center`}>
            <Sparkles className="w-4 h-4" />
          </div>
          <h4 className="font-semibold dark:text-slate-100 text-slate-800">Business Insights</h4>
        </div>
        {loadingInsights ? (
          <div className="animate-pulse flex flex-col gap-2">
            <div className="h-3 bg-slate-100 dark:bg-slate-700 rounded w-full"></div>
            <div className="h-3 bg-slate-100 dark:bg-slate-700 rounded w-5/6"></div>
            <div className="h-3 bg-slate-100 dark:bg-slate-700 rounded w-4/6"></div>
          </div>
        ) : (
          <div className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed whitespace-pre-wrap">
            {insights || "Process some sales to see AI recommendations for your business growth."}
          </div>
        )}
      </div>

      {/* Recent Activity */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="font-semibold dark:text-slate-100 text-slate-800 flex items-center gap-2">
            <Clock className="w-4 h-4 text-slate-400" />
            Recent Orders
          </h4>
        </div>
        <div className="space-y-3">
          {stats.recentSales.length > 0 ? stats.recentSales.map((sale) => (
            <div key={sale.id} className="bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 p-3 rounded-xl flex justify-between items-center shadow-sm">
              <div>
                <p className="text-sm font-semibold dark:text-slate-100 text-slate-800">
                  {sale.items.length} {sale.items.length === 1 ? 'Item' : 'Items'}
                </p>
                <p className="text-xs text-slate-400">
                  {new Date(sale.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
              <p className={`font-bold ${colorStyles.text}`}>₱{sale.total.toLocaleString()}</p>
            </div>
          )) : (
            <div className="text-center py-6 text-slate-400 text-sm italic">
              No orders yet today
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
