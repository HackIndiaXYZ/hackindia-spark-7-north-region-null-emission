import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { format } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Trash2, ChevronDown, ChevronUp, Download, Filter, Link as LinkIcon, Copy } from 'lucide-react';
import { toast } from 'sonner';
import { TASK_TYPE_LABELS } from '@/utils/classifier';
import { formatNumber } from '@/utils/equivalents';
import ImpactCard from './ImpactCard';

export default function HistoryTable({ logs, coefficients }) {
  const queryClient = useQueryClient();
  const [expandedId, setExpandedId] = useState(null);
  const [filterModel, setFilterModel] = useState('all');
  const [filterTask, setFilterTask] = useState('all');
  const [page, setPage] = useState(0);
  const perPage = 20;

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.PromptLog.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['prompt-logs'] });
      toast.success('Log deleted');
    }
  });

  const models = [...new Set(logs.map(l => l.model_used))];
  const taskTypes = [...new Set(logs.map(l => l.task_type).filter(Boolean))];

  const filtered = logs.filter(l => {
    if (filterModel !== 'all' && l.model_used !== filterModel) return false;
    if (filterTask !== 'all' && l.task_type !== filterTask) return false;
    return true;
  });

  const paginated = filtered.slice(page * perPage, (page + 1) * perPage);
  const totalPages = Math.ceil(filtered.length / perPage);

  const exportCSV = () => {
    const headers = ['Date', 'Prompt', 'Model', 'Tokens', 'Energy (kWh)', 'CO2 (g)', 'Water (ml)', 'Task Type'];
    const rows = filtered.map(l => [
      format(new Date(l.created_date), 'yyyy-MM-dd HH:mm'),
      `"${(l.prompt_text || '').replace(/"/g, '""')}"`,
      l.model_used,
      l.token_count,
      l.energy_kwh,
      l.co2_grams,
      l.water_ml,
      l.task_type
    ]);
    const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `llumen-history-${format(new Date(), 'yyyy-MM-dd')}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('CSV exported');
  };

  const copyShareLink = (id) => {
    const url = `${window.location.origin}/share/${id}`;
    navigator.clipboard.writeText(url);
    toast.success('Share link copied');
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2">
          <Filter className="w-3.5 h-3.5 text-muted-foreground" />
          <Select value={filterModel} onValueChange={v => { setFilterModel(v); setPage(0); }}>
            <SelectTrigger className="w-40 font-mono text-xs bg-secondary/30 border-border/50">
              <SelectValue placeholder="All models" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all" className="font-mono text-xs">All models</SelectItem>
              {models.map(m => (
                <SelectItem key={m} value={m} className="font-mono text-xs">{m}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <Select value={filterTask} onValueChange={v => { setFilterTask(v); setPage(0); }}>
          <SelectTrigger className="w-40 font-mono text-xs bg-secondary/30 border-border/50">
            <SelectValue placeholder="All types" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all" className="font-mono text-xs">All types</SelectItem>
            {taskTypes.map(t => (
              <SelectItem key={t} value={t} className="font-mono text-xs">{TASK_TYPE_LABELS[t] || t}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <div className="flex-1" />
        <Button
          variant="outline"
          size="sm"
          onClick={exportCSV}
          className="gap-2 font-mono text-xs border-border/50"
        >
          <Download className="w-3.5 h-3.5" />
          Export CSV
        </Button>
      </div>

      <div className="rounded-xl border border-border/50 overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-secondary/30 hover:bg-secondary/30">
                <TableHead className="font-mono text-xs uppercase tracking-wider">Date</TableHead>
                <TableHead className="font-mono text-xs uppercase tracking-wider">Prompt</TableHead>
                <TableHead className="font-mono text-xs uppercase tracking-wider">Model</TableHead>
                <TableHead className="font-mono text-xs uppercase tracking-wider text-right">Tokens</TableHead>
                <TableHead className="font-mono text-xs uppercase tracking-wider text-right">CO₂ (g)</TableHead>
                <TableHead className="font-mono text-xs uppercase tracking-wider">Type</TableHead>
                <TableHead className="font-mono text-xs uppercase tracking-wider w-24"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginated.map(log => (
                <React.Fragment key={log.id}>
                  <TableRow
                    className="cursor-pointer hover:bg-secondary/20 transition-colors"
                    onClick={() => setExpandedId(expandedId === log.id ? null : log.id)}
                  >
                    <TableCell className="font-mono text-xs text-muted-foreground whitespace-nowrap">
                      {format(new Date(log.created_date), 'MMM dd, HH:mm')}
                    </TableCell>
                    <TableCell className="max-w-[200px] truncate font-mono text-xs">
                      {log.prompt_text}
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary" className="font-mono text-xs">{log.model_used}</Badge>
                    </TableCell>
                    <TableCell className="font-mono text-xs text-right">{log.token_count}</TableCell>
                    <TableCell className="font-mono text-xs text-right text-primary">
                      {formatNumber(log.co2_grams)}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="font-mono text-xs border-border/50">
                        {TASK_TYPE_LABELS[log.task_type] || log.task_type}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        {expandedId === log.id ? (
                          <ChevronUp className="w-3.5 h-3.5 text-muted-foreground" />
                        ) : (
                          <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" />
                        )}
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7"
                          onClick={(e) => { e.stopPropagation(); copyShareLink(log.id); }}
                        >
                          <Copy className="w-3 h-3 text-muted-foreground" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 text-destructive hover:text-destructive"
                          onClick={(e) => { e.stopPropagation(); deleteMutation.mutate(log.id); }}
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                  <AnimatePresence>
                    {expandedId === log.id && (
                      <TableRow>
                        <TableCell colSpan={7} className="p-0">
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="overflow-hidden"
                          >
                            <div className="p-4">
                              <ImpactCard log={log} />
                            </div>
                          </motion.div>
                        </TableCell>
                      </TableRow>
                    )}
                  </AnimatePresence>
                </React.Fragment>
              ))}
              {paginated.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-12 text-muted-foreground font-mono text-sm">
                    No logs found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-xs font-mono text-muted-foreground">
            {filtered.length} total • Page {page + 1} of {totalPages}
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={page === 0}
              onClick={() => setPage(p => p - 1)}
              className="font-mono text-xs"
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={page >= totalPages - 1}
              onClick={() => setPage(p => p + 1)}
              className="font-mono text-xs"
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}