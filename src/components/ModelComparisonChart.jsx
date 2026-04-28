import React from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { calculateCost } from '@/utils/calculator';

const MODEL_COLORS = {
  'gpt-4o': '#10b981',
  'gpt-4-turbo': '#059669',
  'gpt-3.5-turbo': '#34d399',
  'claude-3-opus': '#8b5cf6',
  'claude-3-sonnet': '#a78bfa',
  'claude-3-haiku': '#c4b5fd',
  'gemini-1.5-pro': '#f59e0b',
  'gemini-1.5-flash': '#fbbf24',
  'llama-3-70b': '#3b82f6',
  'mistral-large': '#ef4444'
};

const CustomTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null;
  const data = payload[0].payload;
  return (
    <div className="bg-card border border-border rounded-lg p-3 shadow-xl">
      <p className="font-mono text-sm font-semibold text-foreground">{data.model}</p>
      <p className="font-mono text-xs text-muted-foreground">{data.provider}</p>
      <p className="font-mono text-xs text-primary mt-1">{data.co2.toFixed(4)} g CO₂</p>
    </div>
  );
};

export default function ModelComparisonChart({ tokenCount, coefficients, currentModel }) {
  const data = coefficients.map(c => {
    const cost = calculateCost(tokenCount, c);
    return {
      model: c.model,
      provider: c.provider,
      co2: cost.co2_grams,
      isCurrent: c.model === currentModel
    };
  }).sort((a, b) => b.co2 - a.co2);

  return (
    <div className="w-full">
      <h3 className="text-xs font-mono uppercase tracking-wider text-muted-foreground mb-4">
        CO₂ comparison across models
      </h3>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data} layout="vertical" margin={{ left: 10, right: 20 }}>
          <XAxis
            type="number"
            tick={{ fill: 'hsl(120 5% 55%)', fontSize: 10, fontFamily: 'JetBrains Mono' }}
            axisLine={{ stroke: 'hsl(152 15% 18%)' }}
            tickLine={false}
          />
          <YAxis
            type="category"
            dataKey="model"
            tick={{ fill: 'hsl(120 10% 92%)', fontSize: 10, fontFamily: 'JetBrains Mono' }}
            axisLine={false}
            tickLine={false}
            width={120}
          />
          <Tooltip content={<CustomTooltip />} />
          <Bar dataKey="co2" radius={[0, 4, 4, 0]} barSize={18}>
            {data.map((entry) => (
              <Cell
                key={entry.model}
                fill={entry.isCurrent ? 'hsl(90 100% 50%)' : (MODEL_COLORS[entry.model] || '#666')}
                opacity={entry.isCurrent ? 1 : 0.5}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}