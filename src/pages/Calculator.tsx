import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';

import { motion } from 'framer-motion';

export default function GstCalculator() {
  const [amount, setAmount] = useState<string>('');
  const [gstRate, setGstRate] = useState<number>(18);
  const [type, setType] = useState<'exclusive' | 'inclusive'>('exclusive');

  const calculate = () => {
    const val = parseFloat(amount) || 0;
    let netAmount = 0;
    let totalGst = 0;
    let totalAmount = 0;

    if (type === 'exclusive') {
      netAmount = val;
      totalGst = (val * gstRate) / 100;
      totalAmount = val + totalGst;
    } else {
      totalAmount = val;
      netAmount = (val * 100) / (100 + gstRate);
      totalGst = val - netAmount;
    }

    const cgst = totalGst / 2;
    const sgst = totalGst / 2;

    return { netAmount, totalGst, totalAmount, cgst, sgst };
  };

  const result = calculate();

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-2">
        <h1 className="text-4xl font-extrabold tracking-tight">GST Calculator</h1>
        <p className="text-muted-foreground">Precision tax analysis for professional compliance.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
        >
          <Card className="glass-card shadow-2xl">
            <CardHeader>
              <CardTitle>Configuration</CardTitle>
              <CardDescription>Enter values for automated calculation</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-3">
                <Label htmlFor="amount">Principal Amount (₹)</Label>
                <Input
                  id="amount"
                  type="number"
                  placeholder="0.00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="h-12 text-lg font-bold"
                />
              </div>

              <div className="space-y-3">
                <Label>Tax Calculation Logic</Label>
                <Tabs value={type} onValueChange={(v) => setType(v as any)} className="w-full">
                  <TabsList className="grid w-full grid-cols-2 h-11">
                    <TabsTrigger value="exclusive">Exclusive</TabsTrigger>
                    <TabsTrigger value="inclusive">Inclusive</TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>

              <div className="space-y-3">
                <Label>GST Slab</Label>
                <div className="flex flex-wrap gap-3">
                  {[5, 12, 18, 28].map((rate) => (
                    <Badge
                      key={rate}
                      variant={gstRate === rate ? "default" : "outline"}
                      className={`cursor-pointer text-sm px-6 py-2 rounded-xl transition-all ${gstRate === rate ? 'shadow-lg shadow-primary/25 scale-105' : ''}`}
                      onClick={() => setGstRate(rate)}
                    >
                      {rate}%
                    </Badge>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
        >
          <Card className="bg-primary text-primary-foreground shadow-2xl overflow-hidden relative">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-3xl -mr-16 -mt-16" />
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-blue-400/20 rounded-full blur-3xl -ml-16 -mb-16" />
            
            <CardHeader>
              <CardTitle className="text-white/90">Financial Summary</CardTitle>
              <CardDescription className="text-white/60">Breakdown of applicable levies</CardDescription>
            </CardHeader>
            <CardContent className="space-y-8">
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-1">
                  <p className="text-xs font-bold uppercase tracking-wider text-white/50">Base Value</p>
                  <p className="text-2xl font-bold">₹ {result.netAmount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs font-bold uppercase tracking-wider text-white/50">GST Levy</p>
                  <p className="text-2xl font-bold">₹ {result.totalGst.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                </div>
              </div>

              <div className="pt-6 border-t border-white/10 space-y-4">
                <div className="flex justify-between items-center bg-white/5 p-4 rounded-2xl">
                  <span className="text-sm font-medium text-white/70">CGST ({gstRate/2}%)</span>
                  <span className="font-bold">₹ {result.cgst.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                </div>
                <div className="flex justify-between items-center bg-white/5 p-4 rounded-2xl">
                  <span className="text-sm font-medium text-white/70">SGST ({gstRate/2}%)</span>
                  <span className="font-bold">₹ {result.sgst.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                </div>
                <div className="flex justify-between items-center pt-4">
                  <span className="text-lg font-bold">Grand total</span>
                  <span className="text-4xl font-black">₹ {result.totalAmount.toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
