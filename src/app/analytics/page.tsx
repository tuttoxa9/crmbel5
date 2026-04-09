"use client";

import { useState, useMemo } from "react";
import { useLeads } from "@/hooks/use-leads";
import { STATUS_NAMES, SOURCE_NAMES, LeadStatus } from "@/types/lead";
import { format, subDays, isAfter, startOfDay, isSameDay, isBefore, endOfDay } from "date-fns";
import { ru } from "date-fns/locale";
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer,
  PieChart, Pie, Cell
} from "recharts";
import { Calendar as CalendarIcon } from "lucide-react";

type Period = "week" | "month" | "custom";

const STATUS_COLORS: Record<LeadStatus, string> = {
  "new": "#0A84FF",
  "in-work": "#FF9F0A",
  "visit": "#FF9F0A",
  "thinking": "#8E8E93",
  "callback": "#FF9F0A",
  "success": "#32D74B",
  "no-answer": "#FF453A",
  "decline": "#FF453A",
  "bank-decline": "#FF453A",
  "defect": "#FF453A",
};

const PIE_COLORS = ["#0A84FF", "#32D74B", "#FF9F0A", "#FF453A", "#BF5AF2"];

export default function AnalyticsPage() {
  const { leads, loading } = useLeads();
  const [period, setPeriod] = useState<Period>("month");

  const [customRange, setCustomRange] = useState({
    startDate: subDays(new Date(), 30),
    endDate: new Date()
  });

  const filteredLeads = useMemo(() => {
    const now = new Date();
    let startDate: Date;
    let endDate: Date = endOfDay(now);

    if (period === "week") {
      startDate = startOfDay(subDays(now, 7));
    } else if (period === "month") {
      startDate = startOfDay(subDays(now, 30));
    } else {
      startDate = startOfDay(customRange.startDate);
      endDate = endOfDay(customRange.endDate);
    }

    return leads.filter(l => {
      const createdAt = new Date(l.createdAt);
      return isAfter(createdAt, startDate) && isBefore(createdAt, endDate);
    });
  }, [leads, period, customRange]);

  // Metrics
  const totalLeads = filteredLeads.length;
  const newToday = leads.filter(l => isSameDay(new Date(l.createdAt), new Date())).length;
  const boughtLeads = filteredLeads.filter(l => l.status === "success").length;
  const conversionRate = totalLeads > 0 ? Math.round((boughtLeads / totalLeads) * 100) : 0;

  // Chart Data (Line)
  const lineChartData = useMemo(() => {
    const data: Record<string, number> = {};
    let startDate: Date;
    let endDate: Date = new Date();

    if (period === "week") {
      startDate = startOfDay(subDays(new Date(), 7));
    } else if (period === "month") {
      startDate = startOfDay(subDays(new Date(), 30));
    } else {
      startDate = startOfDay(customRange.startDate);
      endDate = endOfDay(customRange.endDate);
    }

    const diffDays = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
    
    // Initialize days
    for (let i = diffDays; i >= 0; i--) {
      const date = format(subDays(endDate, i), "dd MMM", { locale: ru });
      data[date] = 0;
    }

    filteredLeads.forEach(l => {
      const dateStr = format(new Date(l.createdAt), "dd MMM", { locale: ru });
      if (data[dateStr] !== undefined) {
        data[dateStr]++;
      }
    });

    return Object.keys(data).map(date => ({ date, count: data[date] }));
  }, [filteredLeads, period, customRange.startDate, customRange.endDate]);

  // Chart Data (Pie)
  const pieChartData = useMemo(() => {
    const counts: Record<string, number> = {};
    filteredLeads.forEach(l => {
      counts[l.source] = (counts[l.source] || 0) + 1;
    });
    return Object.keys(counts).map((source) => ({
      name: SOURCE_NAMES[source as keyof typeof SOURCE_NAMES],
      value: counts[source]
    })).sort((a, b) => b.value - a.value);
  }, [filteredLeads]);

  // Status Distribution
  const statusDistribution = useMemo(() => {
    const counts: Record<string, number> = {};
    filteredLeads.forEach(l => {
      counts[l.status] = (counts[l.status] || 0) + 1;
    });
    return Object.keys(STATUS_NAMES).map((status) => ({
      status: status as LeadStatus,
      count: counts[status] || 0,
      percent: totalLeads > 0 ? Math.round(((counts[status] || 0) / totalLeads) * 100) : 0
    })).filter(s => s.count > 0).sort((a, b) => b.count - a.count);
  }, [filteredLeads, totalLeads]);

  // Loss Reasons
  const lossDistribution = useMemo(() => {
    const lossStatuses = ["decline", "bank-decline", "defect"];
    const totalLost = filteredLeads.filter(l => lossStatuses.includes(l.status)).length;
    
    return lossStatuses.map((status) => {
      const count = filteredLeads.filter(l => l.status === status).length;
      return {
        status: status as LeadStatus,
        count,
        percent: totalLost > 0 ? Math.round((count / totalLost) * 100) : 0
      };
    }).filter(s => s.count > 0);
  }, [filteredLeads]);

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <span className="w-32 h-32 border-4 border-accent border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-24">
      {/* Header & Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-16">
        <h1 className="text-page-title text-textPrimary">Аналитика</h1>
        
        <div className="flex flex-col sm:flex-row items-center gap-12">
           {period === "custom" && (
             <div className="flex items-center bg-surfaceSecondary rounded-md border border-border p-4 relative group">
                <CalendarIcon className="w-16 h-16 ml-12 text-textMuted group-hover:text-textPrimary transition-colors" />
                <div className="flex items-center px-12 h-32 gap-8 text-caption cursor-pointer">
                  <span>{format(customRange.startDate, "dd.MM.yyyy")}</span>
                  <span className="text-textMuted">-</span>
                  <span>{format(customRange.endDate, "dd.MM.yyyy")}</span>
                </div>
                <input
                  type="date"
                  className="absolute left-0 top-0 w-1/2 h-full opacity-0 cursor-pointer"
                  value={format(customRange.startDate, "yyyy-MM-dd")}
                  onChange={(e) => {
                    if (e.target.value) {
                       setCustomRange(prev => ({...prev, startDate: new Date(e.target.value)}));
                    }
                  }}
                />
                <input
                  type="date"
                  className="absolute right-0 top-0 w-1/2 h-full opacity-0 cursor-pointer"
                  value={format(customRange.endDate, "yyyy-MM-dd")}
                  onChange={(e) => {
                    if (e.target.value) {
                       setCustomRange(prev => ({...prev, endDate: new Date(e.target.value)}));
                    }
                  }}
                />
             </div>
           )}

          <div className="flex bg-surfaceSecondary rounded-md border border-border p-4">
            {(["week", "month", "custom"] as const).map((p) => {
              const labels = { week: "Неделя", month: "Месяц", custom: "Период" };
              const isActive = period === p;
              return (
                <button
                  key={p}
                  onClick={() => setPeriod(p)}
                  className={`px-16 py-8 rounded-sm text-caption-bold transition-colors ${
                    isActive
                      ? "bg-surface shadow-sm text-textPrimary"
                      : "text-textMuted hover:text-textPrimary"
                  }`}
                >
                  {labels[p]}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-16">
        <div className="card-base p-20 rounded-[12px]">
          <h3 className="text-caption text-textMuted mb-8">Всего лидов</h3>
          <p className="text-[32px] font-bold text-textPrimary leading-none">{totalLeads}</p>
        </div>
        <div className="card-base p-20 rounded-[12px]">
          <h3 className="text-caption text-textMuted mb-8">Новых сегодня</h3>
          <p className="text-[32px] font-bold text-textPrimary leading-none text-accent">{newToday}</p>
        </div>
        <div className="card-base p-20 rounded-[12px]">
          <h3 className="text-caption text-textMuted mb-8">Купили за период</h3>
          <p className="text-[32px] font-bold text-textPrimary leading-none text-[#32D74B]">{boughtLeads}</p>
        </div>
        <div className="card-base p-20 rounded-[12px]">
          <h3 className="text-caption text-textMuted mb-8">Конверсия</h3>
          <p className="text-[32px] font-bold text-textPrimary leading-none">{conversionRate}%</p>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-24">
        <div className="card-base p-20 rounded-[12px] h-[400px] flex flex-col">
          <h3 className="text-section-title text-textPrimary mb-24">Динамика лидов</h3>
          <div className="flex-1 min-h-0">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={lineChartData} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
                <XAxis 
                  dataKey="date" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: 'var(--text-muted)', fontSize: 12 }} 
                  dy={10}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: 'var(--text-muted)', fontSize: 12 }} 
                />
                <RechartsTooltip 
                  contentStyle={{ 
                    backgroundColor: 'var(--surface)', 
                    borderColor: 'var(--border)', 
                    borderRadius: '8px',
                    boxShadow: 'var(--shadow-card-lg)'
                  }}
                  itemStyle={{ color: 'var(--text-primary)' }}
                />
                <Line 
                  type="monotone" 
                  dataKey="count" 
                  stroke="var(--accent)" 
                  strokeWidth={3} 
                  dot={false}
                  activeDot={{ r: 6, fill: "var(--accent)", stroke: "var(--surface)", strokeWidth: 2 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card-base p-20 rounded-[12px] h-[400px] flex flex-col">
          <h3 className="text-section-title text-textPrimary mb-24">Источники</h3>
          <div className="flex-1 min-h-0">
            {pieChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieChartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {pieChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <RechartsTooltip 
                    contentStyle={{ 
                      backgroundColor: 'var(--surface)', 
                      borderColor: 'var(--border)', 
                      borderRadius: '8px',
                    }}
                    itemStyle={{ color: 'var(--text-primary)' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-textMuted">Нет данных</div>
            )}
          </div>
          {pieChartData.length > 0 && (
            <div className="flex flex-wrap justify-center gap-12 mt-16 pt-16 border-t border-border">
              {pieChartData.map((entry, index) => (
                <div key={entry.name} className="flex items-center gap-6 text-caption text-textPrimary">
                  <div className="w-8 h-8 rounded-full" style={{ backgroundColor: PIE_COLORS[index % PIE_COLORS.length] }} />
                  {entry.name}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Status Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-24">
        <div className="card-base p-20 rounded-[12px]">
          <h3 className="text-section-title text-textPrimary mb-24">Распределение по статусам</h3>
          <div className="space-y-16">
            {statusDistribution.map((item) => (
              <div key={item.status}>
                <div className="flex justify-between text-body mb-8">
                  <div className="flex items-center gap-8">
                    <div className="w-8 h-8 rounded-full" style={{ backgroundColor: STATUS_COLORS[item.status] }} />
                    <span className="text-textPrimary">{STATUS_NAMES[item.status]}</span>
                  </div>
                  <div className="text-textMuted">
                    <span className="font-medium text-textPrimary mr-8">{item.count}</span>
                    <span>({item.percent}%)</span>
                  </div>
                </div>
                <div className="h-[6px] w-full bg-surfaceSecondary rounded-full overflow-hidden">
                  <div 
                    className="h-full rounded-full transition-all duration-500" 
                    style={{ 
                      width: `${item.percent}%`,
                      backgroundColor: STATUS_COLORS[item.status]
                    }} 
                  />
                </div>
              </div>
            ))}
            {statusDistribution.length === 0 && (
              <div className="text-center text-textMuted py-24">Нет данных</div>
            )}
          </div>
        </div>

        <div className="card-base p-20 rounded-[12px]">
          <h3 className="text-section-title text-textPrimary mb-24">Причины потерь</h3>
          <div className="space-y-16">
            {lossDistribution.map((item) => (
              <div key={item.status}>
                <div className="flex justify-between text-body mb-8">
                  <div className="flex items-center gap-8">
                    <div className="w-8 h-8 rounded-full bg-[#FF453A]" />
                    <span className="text-textPrimary">{STATUS_NAMES[item.status]}</span>
                  </div>
                  <div className="text-textMuted">
                    <span className="font-medium text-textPrimary mr-8">{item.count}</span>
                    <span>({item.percent}%)</span>
                  </div>
                </div>
                <div className="h-[6px] w-full bg-surfaceSecondary rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-[#FF453A] rounded-full transition-all duration-500" 
                    style={{ width: `${item.percent}%` }} 
                  />
                </div>
              </div>
            ))}
            {lossDistribution.length === 0 && (
              <div className="text-center text-textMuted py-24">Потерь не найдено</div>
            )}
          </div>
        </div>
      </div>

    </div>
  );
}
