import React, { useMemo } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/lib/AuthContext';
import { motion } from 'framer-motion';
import { Zap, Cloud, Droplets, Hash, Flame } from 'lucide-react';
import StatCard from '@/components/StatCard';
import { DailyCO2Chart, TaskTypeChart, TopModelsChart } from '@/components/DashboardCharts';
import { formatNumber, energyEquivalent, co2Equivalent, waterEquivalent } from '@/utils/equivalents';
import { isAfter, subDays, format, startOfDay } from 'date-fns';

function calculateStreak(logs) {
  if (!logs.length) return 0;
  
  const daysWithLogs = new Set(
    logs.map(l => format(new Date(l.created_date), 'yyyy-MM-dd'))
  );
  
  let streak = 0;
  let checkDate = new Date();
  
  while (true) {
    const dateStr = format(checkDate, 'yyyy-MM-dd');
    if (daysWithLogs.has(dateStr)) {
      streak++;
      checkDate = subDays(checkDate, 1);
    } else {
      break;
    }
  }
  
  return streak;
}

export default function Dashboard() {
  const { user } = useAuth();

  const { data: logs = [], isLoading } = useQuery({
    queryKey: ['prompt-logs'],
    queryFn: () => base44.entities.PromptLog.filter({ created_by: user.email }, '-created_date'),
  });

  const stats = useMemo(() => {
    const totalEnergy = logs.reduce((s, l) => s + (l.energy_kwh || 0), 0);
    const totalCo2 = logs.reduce((s, l) => s + (l.co2_grams || 0), 0);
    const totalWater = logs.reduce((s, l) => s + (l.water_ml || 0), 0);
    const streak = calculateStreak(logs);
    return { totalEnergy, totalCo2, totalWater, streak, count: logs.length };
  }, [logs]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-8 h-8 border-4 border-border border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-12 space-y-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-3xl sm:text-4xl font-heading font-bold tracking-tight">
          Dashboard
        </h1>
        <p className="text-muted-foreground font-heading mt-1">
          Your environmental impact overview
        </p>
      </motion.div>

      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <StatCard
          icon={Hash}
          label="Total Prompts"
          value={stats.count}
          delay={0}
        />
        <StatCard
          icon={Zap}
          label="Total Energy"
          value={formatNumber(stats.totalEnergy)}
          unit="kWh"
          equivalent={energyEquivalent(stats.totalEnergy)}
          delay={0.05}
        />
        <StatCard
          icon={Cloud}
          label="Total CO₂"
          value={formatNumber(stats.totalCo2)}
          unit="g"
          equivalent={co2Equivalent(stats.totalCo2)}
          delay={0.1}
        />
        <StatCard
          icon={Droplets}
          label="Total Water"
          value={formatNumber(stats.totalWater)}
          unit="ml"
          equivalent={waterEquivalent(stats.totalWater)}
          delay={0.15}
        />
        <StatCard
          icon={Flame}
          label="Streak"
          value={stats.streak}
          unit={stats.streak === 1 ? 'day' : 'days'}
          delay={0.2}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <DailyCO2Chart logs={logs} />
        <TaskTypeChart logs={logs} />
      </div>

      <TopModelsChart logs={logs} />
    </div>
  );
}