import * as React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { 
  calculateLateFee, 
  getDueDate, 
  getUpcomingDueDates, 
  formatIndianCurrency,
  ReturnType,
  FilerType,
  LateFeeResult,
  DueDateEntry
} from "@/lib/gst-late-fee";
import { format, isAfter, differenceInDays } from "date-fns";
import { Calendar, AlertTriangle, CheckCircle2, Bell, BellRing, Info, IndianRupee } from "lucide-react";
import { toast } from "sonner";

export default function LateFeeCalculator() {
  const [returnType, setReturnType] = React.useState<ReturnType>('GSTR-1');
  const [filerType, setFilerType] = React.useState<FilerType>('Monthly');
  const [isNil, setIsNil] = React.useState(false);
  const [taxDue, setTaxDue] = React.useState<number>(0);
  const [turnover, setTurnover] = React.useState<number>(0);
  const [dueDateStr, setDueDateStr] = React.useState<string>(format(new Date(), 'yyyy-MM-dd'));
  const [filingDateStr, setFilingDateStr] = React.useState<string>(format(new Date(), 'yyyy-MM-dd'));
  const [reminders, setReminders] = React.useState<Record<string, boolean>>({});

  // Calculations
  const result = React.useMemo<LateFeeResult>(() => {
    return calculateLateFee({
      returnType,
      filerType,
      isNil,
      taxDue,
      annualTurnover: turnover,
      dueDate: new Date(dueDateStr),
      filingDate: new Date(filingDateStr)
    });
  }, [returnType, filerType, isNil, taxDue, turnover, dueDateStr, filingDateStr]);

  const upcomingDates = React.useMemo<DueDateEntry[]>(() => {
    return getUpcomingDueDates(filerType);
  }, [filerType]);

  // Sync Due Date when Return Type or Filer Type changes
  React.useEffect(() => {
    const today = new Date();
    const calculatedDueDate = getDueDate(returnType, filerType, today);
    setDueDateStr(format(calculatedDueDate, 'yyyy-MM-dd'));
  }, [returnType, filerType]);

  // Load reminders
  React.useEffect(() => {
    const savedReminders: Record<string, boolean> = {};
    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key?.startsWith('gst_reminder_')) {
            savedReminders[key] = true;
        }
    }
    setReminders(savedReminders);
  }, []);

  const handleSetReminder = async (entry: DueDateEntry) => {
    const key = `gst_reminder_${entry.name}_${format(entry.date, 'MMM_yyyy')}`;
    
    if (Notification.permission !== 'granted') {
        const permission = await Notification.requestPermission();
        if (permission !== 'granted') {
            toast.error("Notification permission denied");
            return;
        }
    }

    localStorage.setItem(key, JSON.stringify({ date: entry.date, notified: false }));
    setReminders(prev => ({ ...prev, [key]: true }));
    toast.success(`Reminder set for ${entry.name}`);
  };

  const getStatusBadge = (date: Date) => {
    const today = new Date();
    const diff = differenceInDays(date, today);
    
    if (isAfter(today, date)) {
        return <Badge className="bg-rose-600 text-white border-none uppercase text-[10px] font-black tracking-widest">Overdue</Badge>;
    }
    if (diff <= 7) {
        return <Badge className="bg-amber-500 text-white border-none uppercase text-[10px] font-black tracking-widest">Due Soon</Badge>;
    }
    return <Badge className="bg-emerald-600 text-white border-none uppercase text-[10px] font-black tracking-widest">Upcoming</Badge>;
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto py-8">
      <div className="space-y-2 text-center mb-12">
        <h1 className="text-4xl font-black tracking-tighter uppercase text-slate-900 dark:text-white">GST Late Fee & Interest Calculator</h1>
        <p className="text-slate-500 font-medium italic">Accurate computation for FY 2024-25 as per CGST/SGST Rules.</p>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Section 1: Inputs */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="border-none shadow-xl bg-white dark:bg-slate-950 rounded-3xl overflow-hidden">
            <CardHeader className="bg-slate-50/50 dark:bg-slate-900/50 border-b p-6">
              <CardTitle className="text-sm font-black uppercase tracking-widest flex items-center gap-2">
                <Calendar className="h-4 w-4 text-primary" />
                Filing Parameters
              </CardTitle>
            </CardHeader>
            <CardContent className="p-8 space-y-8">
              <div className="grid md:grid-cols-2 gap-8">
                {/* Row 1 */}
                <div className="space-y-4">
                  <Label className="text-xs font-bold uppercase tracking-widest text-slate-400">Return Type</Label>
                  <Select value={returnType} onValueChange={(v) => setReturnType(v as ReturnType)}>
                    <SelectTrigger className="h-12 rounded-xl bg-slate-50 dark:bg-slate-900 border-slate-100 dark:border-slate-800 font-bold">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="GSTR-1" className="font-bold">GSTR-1 (Sales)</SelectItem>
                      <SelectItem value="GSTR-3B" className="font-bold">GSTR-3B (Summary)</SelectItem>
                      <SelectItem value="GSTR-9" className="font-bold">GSTR-9 (Annual)</SelectItem>
                      <SelectItem value="GSTR-4" className="font-bold">GSTR-4 (Composition)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-4">
                  <Label className="text-xs font-bold uppercase tracking-widest text-slate-400">Filer Category</Label>
                  <div className="grid grid-cols-2 p-1 bg-slate-100 dark:bg-slate-900 rounded-xl h-12">
                    <button 
                      onClick={() => setFilerType('Monthly')}
                      className={`rounded-lg text-xs font-black uppercase tracking-widest transition-all ${filerType === 'Monthly' ? 'bg-white dark:bg-slate-800 shadow-sm text-primary' : 'text-slate-500'}`}
                    >
                      Monthly
                    </button>
                    <button 
                      onClick={() => setFilerType('Quarterly')}
                      className={`rounded-lg text-xs font-black uppercase tracking-widest transition-all ${filerType === 'Quarterly' ? 'bg-white dark:bg-slate-800 shadow-sm text-primary' : 'text-slate-500'}`}
                    >
                      Quarterly
                    </button>
                  </div>
                </div>

                {/* Row 2 */}
                <div className="space-y-4">
                  <Label className="text-xs font-bold uppercase tracking-widest text-slate-400">Liability Status</Label>
                  <div className="grid grid-cols-2 p-1 bg-slate-100 dark:bg-slate-900 rounded-xl h-12">
                    <button 
                      onClick={() => setIsNil(false)}
                      className={`rounded-lg text-xs font-black uppercase tracking-widest transition-all ${!isNil ? 'bg-white dark:bg-slate-800 shadow-sm text-primary' : 'text-slate-500'}`}
                    >
                      Liability
                    </button>
                    <button 
                      onClick={() => setIsNil(true)}
                      className={`rounded-lg text-xs font-black uppercase tracking-widest transition-all ${isNil ? 'bg-white dark:bg-slate-800 shadow-sm text-primary' : 'text-slate-500'}`}
                    >
                      NIL Return
                    </button>
                  </div>
                </div>

                {!isNil && (
                  <div className="space-y-4 animate-in slide-in-from-left-4">
                    <Label className="text-xs font-bold uppercase tracking-widest text-slate-400">Tax Amount Due (₹)</Label>
                    <div className="relative">
                      <IndianRupee className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                      <Input 
                        type="number" 
                        value={taxDue || ''} 
                        onChange={(e) => setTaxDue(Number(e.target.value))}
                        className="pl-10 h-12 rounded-xl bg-slate-50 dark:bg-slate-900 border-slate-100 dark:border-slate-800 font-black italic"
                        placeholder="0"
                      />
                    </div>
                  </div>
                )}

                {returnType === 'GSTR-9' && (
                  <div className="space-y-4 animate-in slide-in-from-left-4">
                    <Label className="text-xs font-bold uppercase tracking-widest text-slate-400">Annual Turnover (₹)</Label>
                    <div className="relative">
                      <IndianRupee className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                      <Input 
                        type="number" 
                        value={turnover || ''} 
                        onChange={(e) => setTurnover(Number(e.target.value))}
                        className="pl-10 h-12 rounded-xl bg-slate-50 dark:bg-slate-900 border-slate-100 dark:border-slate-800 font-black italic"
                        placeholder="0"
                      />
                    </div>
                  </div>
                )}

                {/* Row 3 */}
                <div className="space-y-4">
                  <Label className="text-xs font-bold uppercase tracking-widest text-slate-400">Due Date</Label>
                  <Input 
                    type="date" 
                    value={dueDateStr} 
                    onChange={(e) => setDueDateStr(e.target.value)}
                    className="h-12 rounded-xl bg-slate-50 dark:bg-slate-900 border-slate-100 dark:border-slate-800 font-bold"
                  />
                </div>

                <div className="space-y-4">
                  <Label className="text-xs font-bold uppercase tracking-widest text-slate-400">Date of Filing</Label>
                  <Input 
                    type="date" 
                    value={filingDateStr} 
                    onChange={(e) => setFilingDateStr(e.target.value)}
                    className="h-12 rounded-xl bg-slate-50 dark:bg-slate-900 border-slate-100 dark:border-slate-800 font-bold"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Section 3: Filing Calendar */}
          <Card className="border-none shadow-xl bg-white dark:bg-slate-950 rounded-3xl overflow-hidden">
            <CardHeader className="bg-slate-50/50 dark:bg-slate-900/50 border-b p-6">
              <CardTitle className="text-sm font-black uppercase tracking-widest flex items-center gap-2">
                <Bell className="h-4 w-4 text-primary" />
                Upcoming Due Dates
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
                <div className="divide-y divide-slate-100 dark:divide-slate-800">
                    {upcomingDates.map((entry, idx) => {
                        const key = `gst_reminder_${entry.name}_${format(entry.date, 'MMM_yyyy')}`;
                        const isSet = reminders[key];
                        return (
                            <div key={idx} className="flex flex-col md:flex-row md:items-center justify-between p-6 gap-4 hover:bg-slate-50 transition-colors">
                                <div className="space-y-1">
                                    <h4 className="text-sm font-black uppercase tracking-widest text-slate-900">{entry.name}</h4>
                                    <p className="text-xs font-bold text-slate-500 uppercase">{format(entry.date, 'dd MMM yyyy')}</p>
                                </div>
                                <div className="flex items-center gap-4">
                                    {getStatusBadge(entry.date)}
                                    <Button 
                                        onClick={() => handleSetReminder(entry)}
                                        disabled={isSet}
                                        variant={isSet ? "ghost" : "outline"} 
                                        className={`h-9 px-4 rounded-lg text-[10px] font-black uppercase tracking-widest gap-2 ${isSet ? 'text-emerald-600' : ''}`}
                                    >
                                        {isSet ? (
                                            <>
                                                <CheckCircle2 className="h-3 w-3" />
                                                Reminder Set ✓
                                            </>
                                        ) : (
                                            <>
                                                <BellRing className="h-3 w-3" />
                                                Remind Me
                                            </>
                                        )}
                                    </Button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </CardContent>
          </Card>
        </div>

        {/* Section 2: Results */}
        <div className="space-y-6">
          <Card className={`border-none shadow-2xl rounded-3xl overflow-hidden font-sans transition-all duration-500 ${result.daysLate === 0 ? 'bg-emerald-600' : 'bg-slate-950 text-white'}`}>
            <CardContent className="p-8 space-y-10">
              {result.daysLate === 0 ? (
                <div className="py-12 text-center space-y-4">
                    <div className="h-20 w-20 rounded-full bg-white/20 flex items-center justify-center mx-auto ring-8 ring-white/10 animate-pulse">
                        <CheckCircle2 className="h-10 w-10 text-white" />
                    </div>
                    <div className="space-y-1">
                        <h3 className="text-2xl font-black uppercase tracking-tight text-white">Filed on time</h3>
                        <p className="text-emerald-100 font-bold uppercase tracking-widest text-[10px]">₹0 Penalty Applicable</p>
                    </div>
                </div>
              ) : (
                <>
                  <div className="text-center space-y-2">
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Total Penalty Days</p>
                    <p className="text-8xl font-black tracking-tighter text-rose-500 italic leading-none">{result.daysLate}</p>
                    <p className="text-xs font-bold uppercase text-slate-500">Days Late</p>
                  </div>

                  <div className="space-y-4 pt-6 border-t border-white/10">
                    <div className="flex justify-between items-center text-xs font-bold uppercase tracking-widest text-slate-400">
                      <span>CGST Late Fee</span>
                      <span className="text-white italic">{formatIndianCurrency(result.cgstLateFee)}</span>
                    </div>
                    <div className="flex justify-between items-center text-xs font-bold uppercase tracking-widest text-slate-400">
                      <span>SGST Late Fee</span>
                      <span className="text-white italic">{formatIndianCurrency(result.sgstLateFee)}</span>
                    </div>
                    {returnType === 'GSTR-3B' && !isNil && (
                        <div className="flex justify-between items-center text-xs font-bold uppercase tracking-widest text-slate-400 animate-in fade-in">
                            <span>Interest (18%)</span>
                            <span className="text-amber-400 italic">{formatIndianCurrency(result.interest)}</span>
                        </div>
                    )}
                    <div className="pt-4 border-t border-white/10 flex justify-between items-end">
                      <span className="text-[10px] font-black uppercase text-slate-500 mb-1">Total Payable</span>
                      <span className="text-4xl font-black text-white italic tracking-tighter shadow-sm">{formatIndianCurrency(result.totalPayable)}</span>
                    </div>
                  </div>

                  {/* Warning Boxes */}
                  {result.isMaxCap && (
                    <div className="bg-rose-500/20 border border-rose-500/50 p-4 rounded-xl flex gap-3 items-start animate-in zoom-in-95">
                        <AlertTriangle className="h-5 w-5 text-rose-500 shrink-0" />
                        <p className="text-[10px] font-bold text-rose-200 uppercase leading-relaxed">
                            Maximum cap reached — late fee fixed at {formatIndianCurrency(result.maxCapValue)}
                        </p>
                    </div>
                  )}

                  {result.isApproachingCap && (
                    <div className="bg-amber-500/20 border border-amber-500/50 p-4 rounded-xl flex gap-3 items-start animate-in zoom-in-95">
                        <Info className="h-5 w-5 text-amber-500 shrink-0" />
                        <p className="text-[10px] font-bold text-amber-200 uppercase leading-relaxed">
                            Approaching maximum late fee cap of {formatIndianCurrency(result.maxCapValue)}
                        </p>
                    </div>
                  )}
                </>
              )}
            </CardContent>
          </Card>

          <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl border-2 border-dashed border-slate-100 dark:border-slate-800 space-y-4">
             <div className="flex items-center gap-2">
                <Info className="h-4 w-4 text-primary" />
                <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-900 dark:text-white">Rule Reference</h4>
             </div>
             <div className="space-y-4 text-[10px] font-medium text-slate-500 italic leading-relaxed">
                <p>• Late fee is calculated from the day following the deadline until the date of filing.</p>
                <p>• For GSTR-1/3B, NIL return late fee is ₹20/day total (₹10 CGST + ₹10 SGST).</p>
                <p>• Maximum cap is restricted based on your annual turnover & liability status.</p>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}
