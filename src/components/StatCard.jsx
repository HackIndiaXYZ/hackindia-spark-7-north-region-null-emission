import React from 'react';
import { motion } from 'framer-motion';

export default function StatCard({ icon: Icon, label, value, unit, equivalent, color = 'text-primary', delay = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.5 }}
      className="relative overflow-hidden rounded-xl border border-border/50 bg-card p-5 group hover:border-primary/30 transition-colors"
    >
      <div className="absolute top-0 right-0 w-24 h-24 -translate-y-6 translate-x-6 rounded-full bg-primary/5 group-hover:bg-primary/10 transition-colors" />
      
      <div className="flex items-start gap-3">
        <div className={`p-2 rounded-lg bg-primary/10 ${color}`}>
          <Icon className="w-4 h-4" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs font-mono uppercase tracking-wider text-muted-foreground mb-1">
            {label}
          </p>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl font-mono font-bold text-foreground">
              {value}
            </span>
            {unit && (
              <span className="text-sm font-mono text-muted-foreground">
                {unit}
              </span>
            )}
          </div>
          {equivalent && (
            <p className="text-xs text-muted-foreground mt-1.5 font-mono">
              ≈ {equivalent}
            </p>
          )}
        </div>
      </div>
    </motion.div>
  );
}