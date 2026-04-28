import React from 'react';
import { motion } from 'framer-motion';
import PromptCalculator from '@/components/PromptCalculator';

export default function Calculator() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12 sm:py-16 space-y-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 'clamp(32px,5vw,52px)', color: '#7fff00', letterSpacing: '0.05em', marginBottom: 8 }}>
          CALCULATE YOUR IMPACT
        </h1>
        <p style={{ fontFamily: "'DM Mono', monospace", fontSize: 13, color: '#a0b8a8' }}>
          Paste a prompt, pick a model, see the real environmental cost.
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="rounded-2xl border border-border/50 bg-card/50 backdrop-blur-sm p-6 sm:p-8"
      >
        <PromptCalculator />
      </motion.div>
    </div>
  );
}