
import React, { useMemo } from 'react';
import { Sale } from '../types';
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
import { Calendar, TrendingUp, FileSpreadsheet } from 'lucide-react';

interface Props {
  sales: Sale[];
  theme: string;
  colorStyles: any;
}

const Reports: React.FC<Props> = ({ sales, theme, colorStyles }) => {
  const weeklyData = useMemo(() => {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const data = days.map(day => ({ name: day, total: 0 }));
    
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    
    sales.forEach(sale => {
      if (sale.timestamp >= weekAgo.getTime()) {
        const dayIdx = new Date(sale.timestamp).getDay();
        data[dayIdx].total += sale.total;
      }
    });
    
    return data;
  }, [sales]);

  const topCategories = useMemo(() => {
    const counts: Record<string, number> = {};
    sales.forEach(sale => {
      sale.items.forEach(item => {
        counts[item.name] = (counts[item.name] || 0) + item.quantity;
      });
    });
    
    return Object.entries(counts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
  }, [sales]);

  const totalRevenue = sales.reduce((acc, s) => acc + s.total, 0);

  const exportDailySales = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todaySales = sales.filter(s => s.timestamp >= today.getTime());

    if (todaySales.length === 0) {
      alert("No sales recorded today to export.");
      return;
    }

    let csvContent = "OrderID,dateTime,Category,Item,Quantity,Price per item,Total\n";

    let grandTotal = 0;
    todaySales.forEach(sale => {
      const dateTimeString = new Date(sale.timestamp).toLocaleString().replace(/"/g, '""');
      
      sale.items.forEach(item => {
        const itemTotal = item.quantity * item.priceAtSale;
        const category = (item.category || 'Uncategorized').replace(/"/g, '""');
        const itemName = item.name.replace(/"/g, '""');
        
        csvContent += `${sale.id},"${dateTimeString}","${category}","${itemName}",${item.quantity},${item.priceAtSale.toFixed(2)},${itemTotal.toFixed(2)}\n`;
        grandTotal += itemTotal;
      });
    });

    csvContent += `\n,,,,,Grand Total Today,${grandTotal.toFixed(2)}\n`;

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `Detailed_Sales_Report_${new Date().toISOString().split('T')[0]}.csv`);
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
    // Extract the color name from the class or state. primaryColor is the key.
    // Assuming colorStyles contains the theme key somewhere or just pass it directly.
    // For now, let's extract it from the colorStyles.bg class name if possible or pass it.
    return colors[colorStyles.bg.split('-')[1]] || '#f97316';
  }, [colorStyles]);

  return (
    <div className="p-6 space-y-8 transition-colors dark:bg-slate-900">
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-2xl font-bold dark:text-slate-100 text-slate-900">Analytics</h2>
          <p className="text-slate-500 text-sm">Performance tracking and insights.</p>
        </div>
        <button 
          onClick={exportDailySales}
          className={`bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 p-2.5 rounded-2xl shadow-sm flex items-center gap-2 text-xs font-bold hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors`}
        >
          <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
          Export Today
        </button>
      </div>

      {/* Stats Summary */}
      <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm flex items-center justify-between">
        <div className="space-y-1">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Lifetime Sales</p>
          <h3 className="text-3xl font-black dark:text-slate-100 text-slate-900">₱{totalRevenue.toLocaleString()}</h3>
        </div>
        <div className={`w-12 h-12 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-full flex items-center justify-center`}>
          <TrendingUp className="w-6 h-6" />
        </div>
      </div>

      {/* Weekly Trend Chart */}
      <div className="space-y-4">
        <h4 className={`font-bold dark:text-slate-100 text-slate-800 flex items-center gap-2`}>
          <Calendar className={`w-4 h-4 ${colorStyles.accent}`} />
          Weekly Revenue
        </h4>
        <div className="h-64 bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={weeklyData}>
              <defs>
                <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={chartColor} stopOpacity={0.1}/>
                  <stop offset="95%" stopColor={chartColor} stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={theme === 'dark' ? "#334155" : "#f1f5f9"} />
              <XAxis 
                dataKey="name" 
                axisLine={false} 
                tickLine={false} 
                tick={{fontSize: 10, fill: '#94a3b8'}} 
              />
              <YAxis 
                axisLine={false} 
                tickLine={false} 
                tick={{fontSize: 10, fill: '#94a3b8'}} 
                tickFormatter={(val) => `₱${val.toLocaleString()}`}
              />
              <Tooltip 
                formatter={(value: number) => [`₱${value.toLocaleString()}`, 'Total']}
                contentStyle={{ 
                  borderRadius: '12px', 
                  border: 'none', 
                  boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
                  backgroundColor: theme === 'dark' ? '#1e293b' : '#ffffff',
                  color: theme === 'dark' ? '#f1f5f9' : '#000000'
                }}
              />
              <Area 
                type="monotone" 
                dataKey="total" 
                stroke={chartColor} 
                strokeWidth={3}
                fillOpacity={1} 
                fill="url(#colorTotal)" 
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Top Products Bar Chart */}
      <div className="space-y-4 pb-12">
        <h4 className="font-bold dark:text-slate-100 text-slate-800">Popular Products</h4>
        <div className="h-64 bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={topCategories} layout="vertical">
              <XAxis type="number" hide />
              <YAxis 
                type="category" 
                dataKey="name" 
                axisLine={false} 
                tickLine={false} 
                width={80}
                tick={{fontSize: 10, fill: '#64748b'}}
              />
              <Tooltip cursor={{fill: 'transparent'}} />
              <Bar dataKey="count" radius={[0, 4, 4, 0]}>
                {topCategories.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={index === 0 ? chartColor : `${chartColor}88`} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default Reports;
