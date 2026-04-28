import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap, Cloud, Droplets } from 'lucide-react';

const STATS = [
  { icon: Zap, label: 'kWh of energy', value: '0.0087', color: 'text-yellow-400' },
  { icon: Cloud, label: 'grams of CO₂', value: '4.32', color: 'text-emerald-400' },
  { icon: Droplets, label: 'ml of water', value: '7.20', color: 'text-blue-400' },
];

export default function HeroCounter() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setIndex(i => (i + 1) % STATS.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const current = STATS[index];
  const Icon = current.icon;

  return (
    <div className="h-20 flex items-center justify-center">
      <AnimatePresence mode="wait">
        <motion.div
          key={index}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.4 }}
          className="flex items-center gap-3"
        >
          <Icon className={`w-6 h-6 ${current.color}`} />
          <div className="font-mono">
            <span className="text-3xl sm:text-4xl font-bold text-primary">{current.value}</span>
            <span className="text-lg text-muted-foreground ml-2">{current.label}</span>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}