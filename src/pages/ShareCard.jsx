import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Leaf, Copy, Share2, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';
import { Link } from 'react-router-dom';
import ImpactCard from '@/components/ImpactCard';

export default function ShareCard() {
  const [log, setLog] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const urlParams = new URLSearchParams(window.location.search);
  const pathParts = window.location.pathname.split('/');
  const logId = pathParts[pathParts.length - 1];

  useEffect(() => {
    async function fetchLog() {
      const results = await base44.entities.PromptLog.list();
      const found = results.find(l => String(l.id) === logId);
      if (found) {
        setLog(found);
      } else {
        setError('Prompt log not found');
      }
      setLoading(false);
    }
    fetchLog();
  }, [logId]);

  const copyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    toast.success('Link copied to clipboard');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-8 h-8 border-4 border-border border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  if (error || !log) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <p className="text-muted-foreground font-mono">{error || 'Not found'}</p>
        <Link to="/">
          <Button variant="outline" className="gap-2 font-mono text-xs">
            <ArrowLeft className="w-3.5 h-3.5" />
            Back to calculator
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-12 sm:py-20">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-6"
      >
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-primary/20 bg-primary/5">
            <Leaf className="w-3.5 h-3.5 text-primary" />
            <span className="text-xs font-mono uppercase tracking-wider text-primary">
              LLumen Impact Report
            </span>
          </div>
          <h1 className="text-2xl font-heading font-bold">Prompt Impact</h1>
        </div>

        <div id="share-card">
          <ImpactCard log={log} />
        </div>

        <div className="flex justify-center gap-3">
          <Button
            variant="outline"
            onClick={copyLink}
            className="gap-2 font-mono text-xs border-border/50"
          >
            <Copy className="w-3.5 h-3.5" />
            Copy Link
          </Button>
          <Link to="/">
            <Button
              className="gap-2 font-mono text-xs bg-primary text-primary-foreground hover:bg-primary/90"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Try it yourself
            </Button>
          </Link>
        </div>
      </motion.div>
    </div>
  );
}