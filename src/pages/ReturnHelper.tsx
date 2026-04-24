import * as React from 'react';
import { useState, useMemo } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { db } from '@/lib/firebase';
import { collection, addDoc, doc, updateDoc, increment } from 'firebase/firestore';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Loader2, 
  IndianRupee, 
  Calculator, 
  FileCheck, 
  ArrowRight,
  Info,
  ShieldCheck,
  Zap,
  TrendingUp,
  AlertCircle,
  Sparkles,
  Bot,
  Download,
  ShieldAlert
} from 'lucide-react';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import LegalDisclaimer from '@/components/LegalDisclaimer';
import { motion, AnimatePresence } from 'framer-motion';
import { generateAIResponse, ITR_PLANNING_SYSTEM_INSTRUCTION } from '@/services/gemini';
import ReactMarkdown from 'react-markdown';
import jsPDF from 'jspdf';

export default function ReturnHelper() {
  const { profile } = useAuth();
  const [totalIncome, setTotalIncome] = useState<number>(0);
  const [deductions, setDeductions] = useState<number>(0);
  const [activeITR, setActiveITR] = useState('itr1');
  const [aiReport, setAiReport] = useState('');
  const [keyError, setKeyError] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  // PDF Generation Logic
  const downloadITRPdf = () => {
    if (!aiReport) return;
    
    const doc = new jsPDF() as any;
    const margin = 15;
    const pageWidth = doc.internal.pageSize.getWidth();
    
    // Header
    doc.setFillColor(15, 23, 42); // slate-900
    doc.rect(0, 0, pageWidth, 40, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(22);
    doc.setFont('helvetica', 'bold');
    doc.text('ITR AUDIT REPORT', margin, 25);
    
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.text('PREMIUM TAX PLANNING ADVISORY • AY 2025-26', margin, 32);

    // Profile Info
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text('USER PROFILE:', margin, 50);
    doc.setFont('helvetica', 'normal');
    doc.text(`Email: ${profile?.email || 'N/A'}`, margin, 55);
    doc.text(`ITR Target: ${activeITR.toUpperCase()}`, margin, 60);

    // Financial Summary
    doc.setFont('helvetica', 'bold');
    doc.text('FINANCIAL DATA:', 110, 50);
    doc.setFont('helvetica', 'normal');
    doc.text(`Gross Income: Rs. ${totalIncome.toLocaleString()}`, 110, 55);
    doc.text(`Total Deductions: Rs. ${deductions.toLocaleString()}`, 110, 60);

    // Divider
    doc.setDrawColor(200, 200, 200);
    doc.line(margin, 70, pageWidth - margin, 70);

    // Report Content
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('EXPERT ADVISORY & ANALYSIS', margin, 80);
    
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    
    // Clean markdown for PDF (simplified)
    const cleanContent = aiReport
      .replace(/#/g, '')
      .replace(/\*\*/g, '')
      .replace(/\*/g, '•')
      .split('\n');

    let y = 90;
    cleanContent.forEach(line => {
      if (line.trim()) {
        const splitLines = doc.splitTextToSize(line, pageWidth - (margin * 2));
        splitLines.forEach((l: string) => {
          if (y > 275) {
            doc.addPage();
            y = 20;
          }
          doc.text(l, margin, y);
          y += 6;
        });
      } else {
        y += 4;
      }
    });

    // Footer
    const pageCount = (doc.internal as any).getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setTextColor(150, 150, 150);
        doc.text('Lead Consultant: Waseem Khan • GSTSmartAI.com', margin, 275);
        doc.text('Professional Tax Advisory • Confidential Tax Analysis', margin, 285);
        doc.text(`Page ${i} of ${pageCount}`, pageWidth - margin - 20, 285);
    }

    try {
      const blob = doc.output('blob');
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `ITR_Audit_Report_${new Date().getTime()}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      toast.success('Professional ITR Report downloaded!');
    } catch (err) {
      doc.save('ITR_Audit_Report.pdf');
    }
  };

  // ITR Selection Logic
  const itrTypes = [
    { id: 'itr1', name: 'ITR-1 (Sahaj)', for: 'Salary & One House Prop', limit: '< 50 Lakhs' },
    { id: 'itr2', name: 'ITR-2', for: 'Salary & Capital Gains', limit: '> 50 Lakhs' },
    { id: 'itr3', name: 'ITR-3', for: 'Business / Profession', limit: 'Audit Required' },
    { id: 'itr4', name: 'ITR-4 (Sugam)', for: 'Presumptive Business (44AD)', limit: '< 2 Cr' }
  ];

  const handleAiAudit = async () => {
    if (!totalIncome) {
      toast.error('Please enter your projected income first');
      return;
    }

    setIsGenerating(true);
    setKeyError(null);
    setAiReport('');
    try {
      const prompt = `My background: I am targeting ${activeITR}. My annual income is approximately ₹${totalIncome} and my planned deductions are ₹${deductions}. Please provide an expert ITR audit draft and planning report.`;
      
      await generateAIResponse(
        prompt, 
        ITR_PLANNING_SYSTEM_INSTRUCTION,
        undefined,
        (chunk) => {
          setAiReport(prev => prev + chunk);
        }
      );
      
      if (profile?.uid) {
        await addDoc(collection(db, 'ai_usage_logs'), {
          userId: profile.uid,
          tool: 'itr_planner',
          timestamp: new Date().toISOString(),
          prompt: prompt.substring(0, 100),
        });
        await updateDoc(doc(db, 'users', profile.uid), { aiUsageCount: increment(1) });
      }
      toast.success('AI ITR Review Generated!');
    } catch (error: any) {
      console.error('ITR Audit Error:', error);
      const msg = error.message || 'Failed to generate AI report';
      toast.error(msg);
      if (msg.toLowerCase().includes('key') || msg.toLowerCase().includes('fail')) {
        const aKey = process.env.ANTHROPIC_API_KEY || "";
        const mKey = aKey ? `Anthropic: ${aKey.substring(0, 8)}...` : "Anthropic: None";
        setKeyError(`${msg} (${mKey})`);
      }
    } finally {
      setIsGenerating(false);
    }
  };

  const calculateTax = (income: number, deductions: number, regime: 'old' | 'new') => {
    let taxable = Math.max(0, regime === 'old' ? income - deductions - 50000 : income - 75000); // Standard deduction

    let tax = 0;
    if (regime === 'new') {
      // New Regime (Slab based)
      if (taxable <= 300000) tax = 0;
      else if (taxable <= 600000) tax = (taxable - 300000) * 0.05;
      else if (taxable <= 900000) tax = 15000 + (taxable - 600000) * 0.10;
      else if (taxable <= 1200000) tax = 45000 + (taxable - 900000) * 0.15;
      else if (taxable <= 1500000) tax = 90000 + (taxable - 1200000) * 0.20;
      else tax = 150000 + (taxable - 1500000) * 0.30;
      
      // Rebate under 87A for New Regime (New: tax free up to 7L)
      if (taxable <= 700000) tax = 0;
    } else {
      // Old Regime
      if (taxable <= 250000) tax = 0;
      else if (taxable <= 500000) tax = (taxable - 250000) * 0.05;
      else if (taxable <= 1000000) tax = 12500 + (taxable - 500000) * 0.20;
      else tax = 112500 + (taxable - 1000000) * 0.30;
      
      // Rebate under 87A for Old Regime (Old: tax free up to 5L)
      if (taxable <= 500000) tax = 0;
    }

    const cess = tax * 0.04;
    return tax + cess;
  };

  const oldTax = useMemo(() => calculateTax(totalIncome, deductions, 'old'), [totalIncome, deductions]);
  const newTax = useMemo(() => calculateTax(totalIncome, deductions, 'new'), [totalIncome, deductions]);
  const savings = Math.abs(oldTax - newTax);
  const recommended = newTax < oldTax ? 'New Regime' : 'Old Regime';

  const isPro = true; // Testing mode: Allow all access

  if (!isPro) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-8 bg-muted/10 rounded-3xl p-12 lg:p-24 border border-dashed border-primary/20">
        <div className="relative">
          <div className="absolute inset-0 bg-primary/20 blur-3xl rounded-full" />
          <div className="bg-primary text-white p-6 rounded-3xl relative">
            <Calculator className="h-16 w-16" />
          </div>
        </div>
        <div className="space-y-3 max-w-xl">
           <Badge className="bg-orange-100 text-orange-600 border-none uppercase font-black text-[10px] tracking-widest mb-4">Pro Feature</Badge>
           <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tight">Tax Planning & <br/> ITR Assistant</h1>
           <p className="text-muted-foreground font-medium text-lg leading-relaxed">
             Our smart ITR helper compares regimes, identifies the right form for you, and reconciles your GST turnover with Income Tax reporting automatically.
           </p>
        </div>
        <Button size="lg" onClick={() => window.location.href='/subscription'} className="btn-intelligent h-14 px-10 text-base font-bold shadow-2xl shadow-primary/30">
          Initialize Tax Planner
          <ArrowRight className="ml-2 h-5 w-5" />
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-12">
      {keyError && (
        <Alert variant="destructive" className="bg-destructive/10 border-destructive/20 animate-pulse rounded-2xl">
          <ShieldAlert className="h-4 w-4" />
          <AlertTitle className="text-xs font-black uppercase tracking-widest">Critical API Service Error</AlertTitle>
          <AlertDescription className="text-sm font-bold leading-relaxed pt-1">
            {keyError}
          </AlertDescription>
        </Alert>
      )}

      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-1">
           <h1 className="text-4xl md:text-5xl font-black tracking-tighter uppercase">Tax Planner Pro</h1>
           <p className="text-muted-foreground font-medium italic">Advanced ITR Selection & Regime Optimization (AY 2025-26)</p>
        </div>
        <div className="flex items-center gap-3 bg-primary/5 p-3 rounded-2xl border border-primary/10">
           <div className="h-10 w-10 bg-primary rounded-xl flex items-center justify-center text-white">
              <Zap className="h-5 w-5" />
           </div>
           <div>
              <p className="text-[10px] font-black uppercase text-primary tracking-widest">Decision Logic</p>
              <p className="text-sm font-bold">Standard Indian Tax Rules</p>
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
         {/* Input Section */}
         <div className="lg:col-span-7 space-y-10">
            <section className="space-y-6">
               <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-lg bg-slate-900 text-white flex items-center justify-center text-sm font-bold">01</div>
                  <h2 className="text-xl font-black uppercase tracking-tight">Identify Your ITR Form</h2>
               </div>
               <div className="grid sm:grid-cols-2 gap-4">
                  {itrTypes.map(itr => (
                    <Card 
                      key={itr.id} 
                      className={`cursor-pointer transition-all border-2 rounded-2xl ${activeITR === itr.id ? 'border-primary bg-primary/5' : 'hover:border-slate-300'}`}
                      onClick={() => setActiveITR(itr.id)}
                    >
                      <CardContent className="p-5 space-y-2">
                        <div className="flex justify-between items-center">
                           <span className="text-xs font-black uppercase tracking-widest text-primary">{itr.id}</span>
                           <Badge variant="outline" className="text-[10px] opacity-70 tracking-tighter">{itr.limit}</Badge>
                        </div>
                        <p className="text-lg font-black">{itr.name}</p>
                        <p className="text-xs text-muted-foreground font-medium leading-relaxed">{itr.for}</p>
                      </CardContent>
                    </Card>
                  ))}
               </div>
            </section>

            <section className="space-y-6">
               <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-lg bg-slate-900 text-white flex items-center justify-center text-sm font-bold">02</div>
                  <h2 className="text-xl font-black uppercase tracking-tight">Projected Annual Income</h2>
               </div>
               <Card className="glass-card border-none shadow-xl">
                  <CardContent className="p-8 space-y-8">
                     <div className="grid sm:grid-cols-2 gap-8">
                        <div className="space-y-3">
                           <Label className="text-xs font-black uppercase tracking-widest opacity-60">Gross Annual Income</Label>
                           <div className="relative">
                              <IndianRupee className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                              <Input 
                                type="number" 
                                value={totalIncome || ''} 
                                onChange={e => setTotalIncome(parseFloat(e.target.value) || 0)}
                                className="h-16 pl-12 text-2xl font-black rounded-2xl border-2 focus:border-primary transition-all"
                                placeholder="0.00"
                              />
                           </div>
                           <p className="text-[10px] text-muted-foreground italic">Include Salary, Interest, Rentals, and Business Turnover</p>
                        </div>
                        <div className="space-y-3">
                           <Label className="text-xs font-black uppercase tracking-widest opacity-60">Total Deductions (80C, 80D, etc.)</Label>
                           <div className="relative">
                              <IndianRupee className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                              <Input 
                                type="number" 
                                value={deductions || ''} 
                                onChange={e => setDeductions(parseFloat(e.target.value) || 0)}
                                className="h-16 pl-12 text-2xl font-black rounded-2xl border-2 focus:border-primary transition-all disabled:opacity-50 disabled:bg-slate-100"
                                placeholder="0.00"
                                disabled={false}
                              />
                           </div>
                           <p className="text-[10px] text-muted-foreground italic">Applicable only for OLD tax regime planning.</p>
                        </div>
                     </div>

                     <div className="p-4 bg-muted/40 rounded-2xl border flex items-center gap-4 text-sm font-medium">
                        <Info className="h-5 w-5 text-primary" />
                        <span>Standard deduction of ₹50,000 (Old) / ₹75,000 (New) is automatically applied.</span>
                     </div>
                  </CardContent>
               </Card>
            </section>
         </div>

         {/* Result Side */}
         <div className="lg:col-span-5 space-y-8">
            <Card className="bg-slate-900 text-white rounded-[40px] p-10 border-none shadow-[0_32px_64px_-16px_rgba(37,99,235,0.2)] overflow-hidden relative">
               <div className="absolute top-0 right-0 p-8">
                  <TrendingUp className="h-12 w-12 text-primary opacity-20" />
               </div>
               
               <div className="space-y-10 relative">
                  <div className="space-y-2">
                     <p className="text-xs font-black uppercase tracking-widest text-white/50">Optimal Choice</p>
                     <h3 className="text-4xl font-black italic tracking-tighter">{recommended}</h3>
                  </div>

                  <div className="space-y-6">
                     <div className="space-y-2">
                        <div className="flex justify-between text-xs font-bold uppercase tracking-widest text-primary">
                           <span>New Regime Tax</span>
                           <span>₹{newTax.toLocaleString()}</span>
                        </div>
                        <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                           <div className="h-full bg-primary" style={{ width: `${Math.min(100, (newTax/oldTax) * 100 || 0)}%` }} />
                        </div>
                     </div>

                     <div className="space-y-2">
                        <div className="flex justify-between text-xs font-bold uppercase tracking-widest text-white/40">
                           <span>Old Regime Tax</span>
                           <span>₹{oldTax.toLocaleString()}</span>
                        </div>
                        <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                           <div className="h-full bg-white/40" style={{ width: '100%' }} />
                        </div>
                     </div>
                  </div>

                  <div className="bg-white/5 rounded-3xl p-6 border border-white/10 space-y-4">
                     <div className="flex items-center gap-4">
                        <div className="h-12 w-12 bg-green-500 rounded-2xl flex items-center justify-center shadow-lg shadow-green-500/20">
                           <ShieldCheck className="h-6 w-6 text-white" />
                        </div>
                        <div>
                           <p className="text-xs font-bold text-white/50 uppercase tracking-widest">Potential Savings</p>
                           <p className="text-2xl font-black">₹{savings.toLocaleString()}</p>
                        </div>
                     </div>
                  </div>

                  <Button 
                    onClick={handleAiAudit} 
                    disabled={isGenerating || !totalIncome}
                    className="w-full h-14 bg-white text-slate-900 hover:bg-slate-100 font-black uppercase tracking-widest text-xs rounded-2xl gap-2"
                  >
                     {isGenerating ? <Loader2 className="h-5 w-5 animate-spin" /> : <Sparkles className="h-5 w-5 text-primary" />}
                     {isGenerating ? 'Analyzing Laws...' : 'Generate AI ITR Audit'}
                  </Button>
               </div>
            </Card>

            <AnimatePresence>
               {aiReport && (
                 <motion.div
                   initial={{ opacity: 0, y: 10 }}
                   animate={{ opacity: 1, y: 0 }}
                 >
                   <Card className="glass-card shadow-2xl overflow-hidden border-primary/20">
                     <CardHeader className="bg-primary/5 p-6 border-b">
                        <CardTitle className="text-sm font-black uppercase tracking-widest flex items-center gap-2">
                           <Bot className="h-4 w-4 text-primary" />
                           Expert ITR Advisory Report
                        </CardTitle>
                     </CardHeader>
                     <CardContent className="p-8">
                        <div className="prose prose-sm dark:prose-invert max-w-none prose-headings:text-primary prose-strong:text-primary leading-relaxed text-slate-600 whitespace-pre-wrap">
                           {isGenerating ? aiReport : <ReactMarkdown>{aiReport}</ReactMarkdown>}
                        </div>
                     </CardContent>
                     <CardFooter className="bg-muted/30 p-4 border-t flex justify-between items-center gap-4">
                        <p className="text-[10px] font-bold text-muted-foreground uppercase">AI generated advice is for guidance only.</p>
                        <div className="flex gap-2">
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={downloadITRPdf}
                            className="text-[10px] font-black uppercase h-8 gap-2 bg-white"
                          >
                            <Download className="h-3 w-3" />
                            Download PDF
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => setAiReport('')} className="text-[10px] font-black uppercase h-8">Clear</Button>
                        </div>
                     </CardFooter>
                   </Card>
                 </motion.div>
               )}
            </AnimatePresence>

            <Alert className="bg-primary/5 border-primary/20 rounded-2xl text-slate-900 dark:text-white">
               <AlertCircle className="h-4 w-4 text-primary" />
               <AlertTitle className="text-xs font-black uppercase tracking-widest">ITR Compliance Note</AlertTitle>
               <AlertDescription className="text-xs opacity-70 leading-relaxed pt-2">
                 Section 115BAC defaults to the New Tax Regime from FY 2023-24. You must specifically 'opt-out' of the new regime to claim 80C/80D/HRA deductions under the old regime.
               </AlertDescription>
            </Alert>
         </div>
      </div>
      
      <LegalDisclaimer />
    </div>
  );
}
