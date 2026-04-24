import * as React from 'react';
import LateFeeCalculator from '@/components/LateFeeCalculator';
import { motion } from 'framer-motion';
import { Clock, ShieldCheck } from 'lucide-react';

export default function LateFeePage() {
  return (
    <div className="space-y-12 pb-20">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 border-b pb-8 border-slate-100 dark:border-slate-800">
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-primary font-bold uppercase tracking-widest text-[10px]">
            <Clock className="h-3 w-3" />
            Compliance Utility
          </div>
          <h1 className="text-4xl font-black tracking-tight uppercase text-slate-900 dark:text-white">Late Fee Calculator</h1>
          <p className="text-slate-500 font-medium italic">Minimize penalties with accurate liability & interest forecasting.</p>
        </div>
        <div className="flex items-center gap-4 bg-white dark:bg-slate-900 px-6 py-3 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm">
           <div className="h-10 w-10 bg-primary/10 rounded-xl flex items-center justify-center">
              <ShieldCheck className="h-6 w-6 text-primary" />
           </div>
           <div>
              <p className="text-[10px] font-black uppercase text-slate-400">Rules Engine</p>
              <p className="text-sm font-black text-slate-700 dark:text-slate-200 uppercase tracking-tighter">Updated for FY 2024-25</p>
           </div>
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <LateFeeCalculator />
      </motion.div>
    </div>
  );
}
