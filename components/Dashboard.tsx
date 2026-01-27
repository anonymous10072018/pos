
import React, { useState, useEffect, useMemo } from 'react';
import { Sale, Product } from '../types';
import { ApiService, CheckoutRecord } from '../services/api';
import { getBusinessInsights } from '../services/gemini';
import { TrendingUp, ShoppingBag, CreditCard, Sparkles, Clock, Loader2 } from 'lucide-react';

interface Props {
  sales: Sale[];
  products: Product[];
  theme: string;
  colorStyles: any;
  storeName: string;
}

const Dashboard: React.FC<Props> = ({ sales: localSales, products, theme, colorStyles, storeName }) => {
  const [insights, setInsights] = useState<string | null>(null);
  const [loadingInsights, setLoadingInsights] = useState(false);
  const [dbHistory, setDbHistory] = useState<CheckoutRecord[]>([]);
  const [loadingStats, setLoadingStats] = useState(false);

  useEffect(() => {
    const fetchStats = async () => {
      setLoadingStats(true);
      const history = await ApiService.getCheckoutHistory();
      setDbHistory(history);
      setLoadingStats(false);
    };
    fetchStats();
  }, [localSales.length]);

  const stats = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayTime = today.getTime();
    
    const todayRecords = dbHistory.filter(rec => {
      const recDate = new Date(rec.dateCheckOut);
      recDate.setHours(0,0,0,0);
      return recDate.getTime() === todayTime;
    });

    const totalToday = todayRecords.reduce((acc, rec) => acc + rec.total, 0);
    
    return {
      todayItemsCount: todayRecords.reduce((acc, rec) => acc + rec.quantity, 0),
      todayTotal: totalToday,
      inventoryCount: products.length,
      recentRecords: dbHistory.slice(0, 5)
    };
  }, [dbHistory, products]);

  useEffect(() => {
    const loadInsights = async () => {
      if (dbHistory.length > 0) {
        setLoadingInsights(true);
        const data = await getBusinessInsights(localSales, products);
        setInsights(data || null);
        setLoadingInsights(false);
      }
    };
    loadInsights();
  }, [dbHistory.length]);

  return (
    <div className="flex-1 overflow-y-auto no-scrollbar pb-10">
      <div className="p-6 space-y-6">
        <div className="space-y-1">
          <h2 className="text-2xl font-bold dark:text-slate-100 text-slate-900">Today's Summary</h2>
          <p className="text-slate-500 dark:text-slate-400 text-sm">Welcome back to {storeName}!</p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-2 gap-4">
          <div className={`${colorStyles.bg} p-4 rounded-2xl text-white shadow-lg ${colorStyles.shadow} relative overflow-hidden`}>
            {loadingStats && <div className="absolute inset-0 bg-black/10 flex items-center justify-center"><Loader2 className="w-4 h-4 animate-spin" /></div>}
            <div className="flex justify-between items-start mb-2">
              <CreditCard className="w-5 h-5 opacity-80" />
              <TrendingUp className="w-4 h-4 opacity-80" />
            </div>
            <p className="text-xs opacity-80 font-medium">Revenue Today</p>
            <h3 className="text-xl font-bold">₱{stats.todayTotal.toLocaleString()}</h3>
          </div>
          <div className="bg-emerald-500 p-4 rounded-2xl text-white shadow-lg shadow-emerald-200 dark:shadow-none relative overflow-hidden">
            {loadingStats && <div className="absolute inset-0 bg-black/10 flex items-center justify-center"><Loader2 className="w-4 h-4 animate-spin" /></div>}
            <div className="flex justify-between items-start mb-2">
              <ShoppingBag className="w-5 h-5 opacity-80" />
            </div>
            <p className="text-xs opacity-80 font-medium">Items Sold</p>
            <h3 className="text-xl font-bold">{stats.todayItemsCount}</h3>
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
            </div>
          ) : (
            <div className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed whitespace-pre-wrap">
              {insights || "Process some sales to see AI recommendations."}
            </div>
          )}
        </div>

        {/* Recent Activity (From DB) */}
        <div className="space-y-3">
          <h4 className="font-semibold dark:text-slate-100 text-slate-800 flex items-center gap-2">
            <Clock className="w-4 h-4 text-slate-400" />
            Recent DB Transactions
          </h4>
          <div className="space-y-3">
            {stats.recentRecords.length > 0 ? stats.recentRecords.map((rec) => (
              <div key={rec.id} className="bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 p-3 rounded-xl flex justify-between items-center shadow-sm transition-transform active:scale-[0.98]">
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold dark:text-slate-100 text-slate-800 truncate">{rec.itemName}</p>
                  <div className="flex gap-2 text-[10px] text-slate-400 font-medium">
                    <span>{rec.branchCode}</span>
                    <span>•</span>
                    <span>{new Date(rec.dateCheckOut).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                </div>
                <div className="text-right ml-4">
                  <p className={`font-bold ${colorStyles.text}`}>₱{rec.total.toLocaleString()}</p>
                  <p className="text-[10px] text-slate-400">Qty: {rec.quantity}</p>
                </div>
              </div>
            )) : (
              <div className="text-center py-6 text-slate-400 text-sm italic">No records in cloud yet</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
