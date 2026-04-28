import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useAuth } from '@/lib/AuthContext';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Zap, Cloud, Droplets, Sparkles, Save, ArrowRight, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import StatCard from './StatCard';
import ModelComparisonChart from './ModelComparisonChart';
import { estimateTokenCount, calculateCost } from '@/utils/calculator';
import { classifyPrompt, TASK_TYPE_LABELS } from '@/utils/classifier';
import { recommendModel } from '@/utils/recommender';
import { energyEquivalent, co2Equivalent, waterEquivalent, formatNumber } from '@/utils/equivalents';

export default function PromptCalculator() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [prompt, setPrompt] = useState('');
  const [selectedModel, setSelectedModel] = useState('');
  const [results, setResults] = useState(null);

  const { data: coefficients = [] } = useQuery({
    queryKey: ['llm-coefficients'],
    queryFn: () => base44.entities.LlmCoefficient.list(),
  });

  const saveMutation = useMutation({
    mutationFn: (data) => base44.entities.PromptLog.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['prompt-logs'] });
      toast.success('Saved to your history');
    }
  });

  const handleCalculate = () => {
    if (!prompt.trim() || !selectedModel) return;
    
    const coeff = coefficients.find(c => c.model === selectedModel);
    if (!coeff) return;

    const tokenCount = estimateTokenCount(prompt);
    const cost = calculateCost(tokenCount, coeff);
    const taskType = classifyPrompt(prompt);
    const recommendation = recommendModel(taskType, selectedModel, coefficients);

    setResults({
      tokenCount,
      taskType,
      recommendation,
      ...cost,
    });
  };

  const handleSave = () => {
    if (!results) return;
    saveMutation.mutate({
      prompt_text: prompt,
      model_used: selectedModel,
      token_count: results.tokenCount,
      energy_kwh: results.energy_kwh,
      co2_grams: results.co2_grams,
      water_ml: results.water_ml,
      task_type: results.taskType,
    });
  };

  return (
    <div className="space-y-8">
      <div className="space-y-4">
        <Textarea
          placeholder="Paste or type your LLM prompt here..."
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          className="min-h-[140px] font-mono text-sm bg-secondary/30 border-border/50 resize-none focus:border-primary/50 placeholder:text-muted-foreground/50"
        />
        
        <div className="flex flex-col sm:flex-row gap-3">
          <Select value={selectedModel} onValueChange={setSelectedModel}>
            <SelectTrigger className="sm:w-64 font-mono text-sm bg-secondary/30 border-border/50">
              <SelectValue placeholder="Select model" />
            </SelectTrigger>
            <SelectContent>
              {coefficients.map(c => (
                <SelectItem key={c.model} value={c.model} className="font-mono text-sm">
                  <span>{c.model}</span>
                  <span className="text-muted-foreground ml-2">({c.provider})</span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Button
            onClick={handleCalculate}
            disabled={!prompt.trim() || !selectedModel}
            className="bg-primary text-primary-foreground hover:bg-primary/90 font-heading font-semibold gap-2"
          >
            <Sparkles className="w-4 h-4" />
            Calculate Impact
          </Button>
        </div>

        {prompt.trim() && (
          <div className="flex items-center gap-3 text-xs font-mono text-muted-foreground">
            <span>~{estimateTokenCount(prompt)} tokens</span>
            <span>•</span>
            <Badge variant="outline" className="text-xs font-mono border-border/50">
              {TASK_TYPE_LABELS[classifyPrompt(prompt)]}
            </Badge>
          </div>
        )}
      </div>

      <AnimatePresence mode="wait">
        {results && (
          <motion.div
            key="results"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-6"
          >
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <StatCard
                icon={Zap}
                label="Energy"
                value={formatNumber(results.energy_kwh, 4)}
                unit="kWh"
                equivalent={energyEquivalent(results.energy_kwh)}
                delay={0}
              />
              <StatCard
                icon={Cloud}
                label="CO₂ Emissions"
                value={formatNumber(results.co2_grams)}
                unit="grams"
                equivalent={co2Equivalent(results.co2_grams)}
                delay={0.1}
              />
              <StatCard
                icon={Droplets}
                label="Water Usage"
                value={formatNumber(results.water_ml)}
                unit="ml"
                equivalent={waterEquivalent(results.water_ml)}
                delay={0.2}
              />
            </div>

            {results.recommendation.savings > 0 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="rounded-xl border border-primary/20 bg-primary/5 p-4 flex flex-col sm:flex-row items-start sm:items-center gap-3"
              >
                <div className="p-2 rounded-lg bg-primary/10">
                  <ArrowRight className="w-4 h-4 text-primary" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-heading font-semibold text-foreground">
                    Save ~{results.recommendation.savings}% CO₂ with{' '}
                    <span className="text-primary">{results.recommendation.model}</span>
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {results.recommendation.provider} • Great for {TASK_TYPE_LABELS[results.taskType].toLowerCase()} tasks
                  </p>
                </div>
              </motion.div>
            )}

            <ModelComparisonChart
              tokenCount={results.tokenCount}
              coefficients={coefficients}
              currentModel={selectedModel}
            />

            <div className="flex justify-end">
              {user ? (
                <Button
                  onClick={handleSave}
                  disabled={saveMutation.isPending}
                  variant="outline"
                  className="gap-2 font-mono text-xs border-primary/30 text-primary hover:bg-primary/10"
                >
                  {saveMutation.isPending ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Save className="w-3.5 h-3.5" />
                  )}
                  Save to History
                </Button>
              ) : (
                <Button
                  onClick={() => base44.auth.redirectToLogin()}
                  variant="outline"
                  className="gap-2 font-mono text-xs border-border/50 text-muted-foreground hover:text-foreground"
                >
                  Sign in to save
                </Button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}