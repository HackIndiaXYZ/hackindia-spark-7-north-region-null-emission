import React, { useMemo } from 'react';
import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer,
  BarChart, Bar, PieChart, Pie, Cell
} from 'recharts';
import { format, subDays, parseISO, isAfter } from 'date-fns';
import { TASK_TYPE_LABELS, TASK_TYPE_COLORS } from '@/utils/classifier';

const ChartTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-card border border-border rounded-lg p-3 shadow-xl">
      <p className="font-mono text-xs text-muted-foreground mb-1">{label}</p>
      {payload.map((p, i) => (
        <p key={i} className="font-mono text-sm" style={{ color: p.color }}>
          {p.value?.toFixed(2)} {p.name}
        </p>
      ))}
    </div>
  );
};

export function DailyCO2Chart({ logs }) {
  const data = useMemo(() => {
    const thirtyDaysAgo = subDays(new Date(), 30);
    const dailyMap = {};
    for (let i = 0; i < 30; i++) {
      const date = format(subDays(new Date(), 29 - i), 'MMM dd');
      dailyMap[date] = 0;
    }
    logs.filter(l => isAfter(new Date(l.created_date), thirtyDaysAgo)).forEach(l => {
      const date = format(new Date(l.created_date), 'MMM dd');
      if (dailyMap[date] !== undefined) {
        dailyMap[date] += l.co2_grams || 0;
      }
    });
    return Object.entries(dailyMap).map(([date, co2]) => ({ date, co2: parseFloat(co2.toFixed(2)) }));
  }, [logs]);

  return (
    <div className="rounded-xl border border-border/50 bg-card p-5">
      <h3 className="text-xs font-mono uppercase tracking-wider text-muted-foreground mb-4">
        Daily CO₂ — Last 30 Days
      </h3>
      <ResponsiveContainer width="100%" height={220}>
        <LineChart data={data}>
          <XAxis
            dataKey="date"
            tick={{ fill: 'hsl(120 5% 55%)', fontSize: 9, fontFamily: 'JetBrains Mono' }}
            axisLine={{ stroke: 'hsl(152 15% 18%)' }}
            tickLine={false}
            interval="preserveStartEnd"
          />
          <YAxis
            tick={{ fill: 'hsl(120 5% 55%)', fontSize: 9, fontFamily: 'JetBrains Mono' }}
            axisLine={false}
            tickLine={false}
            width={40}
          />
          <Tooltip content={<ChartTooltip />} />
          <Line
            type="monotone"
            dataKey="co2"
            name="g CO₂"
            stroke="hsl(90 100% 50%)"
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 4, fill: 'hsl(90 100% 50%)' }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

export function TaskTypeChart({ logs }) {
  const data = useMemo(() => {
    const counts = {};
    logs.forEach(l => {
      const t = l.task_type || 'other';
      counts[t] = (counts[t] || 0) + 1;
    });
    return Object.entries(counts).map(([type, count]) => ({
      name: TASK_TYPE_LABELS[type] || type,
      value: count,
      color: TASK_TYPE_COLORS[type] || '#78909c'
    }));
  }, [logs]);

  return (
    <div className="rounded-xl border border-border/50 bg-card p-5">
      <h3 className="text-xs font-mono uppercase tracking-wider text-muted-foreground mb-4">
        Task Type Distribution
      </h3>
      <ResponsiveContainer width="100%" height={220}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={55}
            outerRadius={85}
            paddingAngle={3}
            dataKey="value"
          >
            {data.map((entry, i) => (
              <Cell key={i} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip content={<ChartTooltip />} />
        </PieChart>
      </ResponsiveContainer>
      <div className="flex flex-wrap gap-3 mt-2 justify-center">
        {data.map(d => (
          <div key={d.name} className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full" style={{ background: d.color }} />
            <span className="text-xs font-mono text-muted-foreground">{d.name}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export function TopModelsChart({ logs }) {
  const data = useMemo(() => {
    const counts = {};
    logs.forEach(l => {
      counts[l.model_used] = (counts[l.model_used] || 0) + 1;
    });
    return Object.entries(counts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 6)
      .map(([model, count]) => ({ model, count }));
  }, [logs]);

  return (
    <div className="rounded-xl border border-border/50 bg-card p-5">
      <h3 className="text-xs font-mono uppercase tracking-wider text-muted-foreground mb-4">
        Most Used Models
      </h3>
      <ResponsiveContainer width="100%" height={220}>
        <BarChart data={data}>
          <XAxis
            dataKey="model"
            tick={{ fill: 'hsl(120 5% 55%)', fontSize: 9, fontFamily: 'JetBrains Mono' }}
            axisLine={{ stroke: 'hsl(152 15% 18%)' }}
            tickLine={false}
            angle={-20}
            textAnchor="end"
            height={50}
          />
          <YAxis
            tick={{ fill: 'hsl(120 5% 55%)', fontSize: 9, fontFamily: 'JetBrains Mono' }}
            axisLine={false}
            tickLine={false}
            width={30}
          />
          <Tooltip content={<ChartTooltip />} />
          <Bar dataKey="count" name="prompts" fill="hsl(90 100% 50%)" radius={[4, 4, 0, 0]} barSize={24} opacity={0.8} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}