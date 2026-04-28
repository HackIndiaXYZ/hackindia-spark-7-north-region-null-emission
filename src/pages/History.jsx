import React from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/lib/AuthContext';
import { motion } from 'framer-motion';
import HistoryTable from '@/components/HistoryTable';

export default function History() {
  const { user } = useAuth();

  const { data: logs = [], isLoading } = useQuery({
    queryKey: ['prompt-logs'],
    queryFn: () => base44.entities.PromptLog.filter({ created_by: user.email }, '-created_date'),
  });

  const { data: coefficients = [] } = useQuery({
    queryKey: ['llm-coefficients'],
    queryFn: () => base44.entities.LlmCoefficient.list(),
  });

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
          History
        </h1>
        <p className="text-muted-foreground font-heading mt-1">
          Your prompt impact log — {logs.length} entries
        </p>
      </motion.div>

      <HistoryTable logs={logs} coefficients={coefficients} />
    </div>
  );
}