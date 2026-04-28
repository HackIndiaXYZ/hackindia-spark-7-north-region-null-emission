import React from 'react';
import { Zap, Cloud, Droplets, Tag } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { formatNumber } from '@/utils/equivalents';
import { energyEquivalent, co2Equivalent, waterEquivalent } from '@/utils/equivalents';
import { TASK_TYPE_LABELS } from '@/utils/classifier';

export default function ImpactCard({ log }) {
  return (
    <div className="rounded-xl border border-border/50 bg-card p-6 space-y-4">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <p className="text-sm text-foreground font-mono leading-relaxed line-clamp-3">
            "{log.prompt_text}"
          </p>
        </div>
        {log.task_type && (
          <Badge variant="outline" className="shrink-0 font-mono text-xs border-primary/30 text-primary">
            {TASK_TYPE_LABELS[log.task_type] || log.task_type}
          </Badge>
        )}
      </div>

      <div className="flex items-center gap-2">
        <Badge variant="secondary" className="font-mono text-xs">
          {log.model_used}
        </Badge>
        <span className="text-xs text-muted-foreground font-mono">
          {log.token_count} tokens
        </span>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <div className="rounded-lg bg-secondary/50 p-3 text-center">
          <Zap className="w-4 h-4 mx-auto mb-1 text-yellow-400" />
          <p className="font-mono text-sm font-bold text-foreground">
            {formatNumber(log.energy_kwh, 4)}
          </p>
          <p className="text-xs text-muted-foreground font-mono">kWh</p>
          <p className="text-xs text-muted-foreground mt-1">
            {energyEquivalent(log.energy_kwh)}
          </p>
        </div>
        <div className="rounded-lg bg-secondary/50 p-3 text-center">
          <Cloud className="w-4 h-4 mx-auto mb-1 text-emerald-400" />
          <p className="font-mono text-sm font-bold text-foreground">
            {formatNumber(log.co2_grams)}
          </p>
          <p className="text-xs text-muted-foreground font-mono">g CO₂</p>
          <p className="text-xs text-muted-foreground mt-1">
            {co2Equivalent(log.co2_grams)}
          </p>
        </div>
        <div className="rounded-lg bg-secondary/50 p-3 text-center">
          <Droplets className="w-4 h-4 mx-auto mb-1 text-blue-400" />
          <p className="font-mono text-sm font-bold text-foreground">
            {formatNumber(log.water_ml)}
          </p>
          <p className="text-xs text-muted-foreground font-mono">ml</p>
          <p className="text-xs text-muted-foreground mt-1">
            {waterEquivalent(log.water_ml)}
          </p>
        </div>
      </div>
    </div>
  );
}