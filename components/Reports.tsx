
import React, { useState, useEffect, useMemo } from 'react';
import { ApiService, CheckoutRecord } from '../services/api';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell
} from 'recharts';
import { Calendar, TrendingUp, FileSpreadsheet, Loader2, RefreshCcw } from 'lucide-react';

interface Props {
  theme: string;
  colorStyles: any;
}

const Reports: React.FC<Props> = ({ theme, colorStyles }) => {
  const [history, setHistory] = useState<CheckoutRecord[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchHistory = async () => {
    setLoading(true);
    const data = await ApiService.getCheckoutHistory();
    setHistory(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const weeklyData = useMemo(() => {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const data = days.map(day => ({ name: day, total: 0 }));
    
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    
    history.forEach(rec => {
      const ts = new Date(rec.dateCheckOut).getTime();
      if (ts >= weekAgo.getTime()) {
        const dayIdx = new Date(ts).getDay();
        data[dayIdx].total += rec.total;
      }
    });
    
    return data;
  }, [history]);

  const topItems = useMemo(() => {
    const counts: Record<string, number> = {};
    history.forEach(rec => {
      counts[rec.itemName] = (counts[rec.itemName] || 0) + rec.quantity;
    });
    
    return Object.entries(counts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
  }, [history]);

  const totalRevenue = history.reduce((acc, r) => acc + r.total, 0);

  const exportAllHistory = () => {
    if (history.length === 0) {
      alert("No data found in database to export.");
      return;
    }

    let csvContent = "ID,BranchCode,Date,Category,Item,Quantity,PricePerItem,Total\n";

    history.forEach(rec => {
      const dateTimeString = new Date(rec.dateCheckOut).toLocaleString().replace(/"/g, '""');
      const category = (rec.category || 'Uncategorized').replace(/"/g, '""');
      const itemName = rec.itemName.replace(/"/g, '""');
      
      csvContent += `${rec.id},"${rec.branchCode}","${dateTimeString}","${category}","${itemName}",${rec.quantity},${rec.pricePerItem.toFixed(2)},${rec.total.toFixed(2)}\n`;
    });

    csvContent += `\n,,,,,Grand Total,${totalRevenue.toFixed(2)}\n`;

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `POS_Cloud_Sales_Report_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const chartColor = useMemo(() => {
    const colors: Record<string, string> = {
      orange: '#f97316',
      blue: '#2563eb',
      emerald: '#10b981',
      purple: '#9333ea',
      rose: '#e11d48',
      slate: '#334155'
    };
    return colors[colorStyles.bg.split('-')[1]] || '#f97316';
  }, [colorStyles]);

  return (
    <div className="p-6 space-y-8 transition-colors dark:bg-slate-900 min-h-full pb-32">
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-2xl font-bold dark:text-slate-100 text-slate-900">Cloud Analytics</h2>
          <p className="text-slate-500 text-sm">Synchronized with database.</p>
        </div>
        <div className="flex gap-2">
           <button 
            onClick={fetchHistory}
            className={`p-2.5 rounded-2xl bg-white dark:bg-slate-800 border dark:border-slate-700 shadow-sm text-slate-400 hover:text-slate-600`}
          >
            <RefreshCcw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <button 
            onClick={exportAllHistory}
            className={`bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 p-2.5 rounded-2xl shadow-sm flex items-center gap-2 text-xs font-bold hover:bg-slate-50 transition-colors`}
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
            Export DB
          </button>
        </div>
      </div>

      {/* Stats Summary */}
      <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-100 dark:border-slate-700 shadow-sm flex items-center justify-between">
        <div className="space-y-1">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Database Revenue</p>
          <h3 className="text-3xl font-black dark:text-slate-100 text-slate-900">₱{totalRevenue.toLocaleString()}</h3>
        </div>
        <div className={`w-14 h-14 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-2xl flex items-center justify-center shadow-inner`}>
          <TrendingUp className="w-7 h-7" />
        </div>
      </div>

      {/* Weekly Trend Chart */}
      <div className="space-y-4">
        <h4 className={`text-xs font-black uppercase tracking-widest dark:text-slate-400 text-slate-400 flex items-center gap-2`}>
          <Calendar className={`w-3.5 h-3.5 ${colorStyles.text}`} />
          Last 7 Days Revenue
        </h4>
        <div className="h-64 bg-white dark:bg-slate-800 p-4 rounded-3xl border border-slate-100 dark:border-slate-700 shadow-sm">
          {loading ? (
             <div className="h-full flex items-center justify-center"><Loader2 className={`w-8 h-8 ${colorStyles.text} animate-spin`} /></div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={weeklyData}>
                <defs>
                  <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={chartColor} stopOpacity={0.1}/>
                    <stop offset="95%" stopColor={chartColor} stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={theme === 'dark' ? "#334155" : "#f1f5f9"} />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#94a3b8'}} />
                <YAxis axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#94a3b8'}} tickFormatter={(val) => `₱${val}`} />
                <Tooltip 
                  formatter={(value: number) => [`₱${value.toLocaleString()}`, 'Revenue']}
                  contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', backgroundColor: theme === 'dark' ? '#1e293b' : '#ffffff' }}
                />
                <Area type="monotone" dataKey="total" stroke={chartColor} strokeWidth={4} fillOpacity={1} fill="url(#colorTotal)" />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Top Products Bar Chart */}
      <div className="space-y-4">
        <h4 className="text-xs font-black uppercase tracking-widest dark:text-slate-400 text-slate-400">Top Selling Products</h4>
        <div className="h-64 bg-white dark:bg-slate-800 p-4 rounded-3xl border border-slate-100 dark:border-slate-700 shadow-sm">
          {loading ? (
             <div className="h-full flex items-center justify-center"><Loader2 className={`w-8 h-8 ${colorStyles.text} animate-spin`} /></div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={topItems} layout="vertical">
                <XAxis type="number" hide />
                <YAxis type="category" dataKey="name" axisLine={false} tickLine={false} width={100} tick={{fontSize: 10, fill: '#64748b', fontWeight: 'bold'}} />
                <Tooltip cursor={{fill: 'transparent'}} />
                <Bar dataKey="count" radius={[0, 8, 8, 0]}>
                  {topItems.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={index === 0 ? chartColor : `${chartColor}aa`} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
    </div>
  );
};

export default Reports;
