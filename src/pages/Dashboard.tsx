import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { db } from '@/lib/firebase';
import { collection, query, where, limit, getDocs, orderBy } from 'firebase/firestore';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { 
  Calculator, 
  FileText, 
  MessageSquare, 
  TrendingUp, 
  TrendingDown,
  Clock,
  CheckCircle2,
  AlertCircle,
  ChevronRight,
  Star
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Invoice, AIUsageLog } from '@/types';
import { useNavigate } from 'react-router-dom';
import { format, addMonths, startOfMonth } from 'date-fns';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';

export default function Dashboard() {
  const { profile } = useAuth();
  const navigate = useNavigate();
  
  const currentMonth = new Date();
  const nextMonth = addMonths(currentMonth, 1);
  const monthName = format(currentMonth, 'MMMM');

  const [recentInvoices, setRecentInvoices] = useState<Invoice[]>([]);
  const [recentAiLogs, setRecentAiLogs] = useState<AIUsageLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalGstInvoiced, setTotalGstInvoiced] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      if (!profile?.uid) return;
      
      try {
        const invQuery = query(
          collection(db, 'invoices'), 
          where('userId', '==', profile.uid),
          orderBy('date', 'desc')
        );
        const invSnap = await getDocs(invQuery);
        const allInvoices = invSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Invoice));
        setRecentInvoices(allInvoices.slice(0, 5));

        const aiQuery = query(
          collection(db, 'ai_usage_logs'),
          where('userId', '==', profile.uid),
          orderBy('timestamp', 'desc'),
          limit(5)
        );
        const aiSnap = await getDocs(aiQuery);
        setRecentAiLogs(aiSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as AIUsageLog)));

        // Calculate total GST
        const totalGst = allInvoices.reduce((acc, inv) => acc + inv.totalGst, 0);
        setTotalGstInvoiced(totalGst);
      } catch (error) {
        console.error("Dashboard error:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [profile?.uid]);

  const stats = [
    { title: "Current Plan", value: (profile?.plan || 'Free').toUpperCase(), icon: TrendingUp, color: "text-blue-600", bg: "bg-blue-100" },
    { title: "Total Invoices", value: recentInvoices.length, icon: FileText, color: "text-green-600", bg: "bg-green-100" },
    { title: "AI Requests Left", value: '∞', icon: MessageSquare, color: "text-purple-600", bg: "bg-purple-100" },
    { title: "Total GST Amount", value: `₹ ${totalGstInvoiced.toLocaleString()}`, icon: TrendingDown, color: "text-orange-600", bg: "bg-orange-100" },
  ];

  return (
    <div className="space-y-10">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-4xl md:text-5xl font-black tracking-tighter">
            Dashboard
          </h1>
          <p className="text-muted-foreground font-medium">
            Welcome back, <span className="text-foreground">{profile?.displayName}</span>. 
            Your compliance score is <span className="text-primary">optimal</span>.
          </p>
        </div>
        <div className="flex gap-2">
           <Button onClick={() => navigate('/invoices')} className="btn-intelligent">New Invoice</Button>
           <Button variant="outline" onClick={() => navigate('/ai-chat')}>AI Assistant</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <motion.div
            key={stat.title}
            whileHover={{ scale: 1.02 }}
            className="group"
          >
            <Card className="glass-card overflow-hidden h-full">
              <CardContent className="p-6 flex flex-col gap-4">
                <div className={`${stat.bg} p-3 rounded-2xl w-fit group-hover:scale-110 transition-transform`}>
                  <stat.icon className={`h-6 w-6 ${stat.color}`} />
                </div>
                <div className="space-y-1">
                  <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">{stat.title}</p>
                  <p className="text-3xl font-black tracking-tight">{stat.value}</p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <Card className="lg:col-span-2 glass-card">
          <CardHeader className="flex flex-row items-center justify-between border-b bg-muted/5 p-6">
            <div className="space-y-1">
              <CardTitle>Recent Transactions</CardTitle>
              <CardDescription>Latest generated business invoices</CardDescription>
            </div>
            <Button variant="ghost" size="sm" onClick={() => navigate('/invoices')} className="text-primary font-bold">
               All <ChevronRight className="ml-1 h-3 w-3" />
            </Button>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y">
              {recentInvoices.length === 0 ? (
                <p className="text-center text-muted-foreground py-16">No transactions recorded yet.</p>
              ) : (
                recentInvoices.map((inv) => (
                  <div key={inv.id} className="flex items-center justify-between p-6 hover:bg-muted/50 transition-colors">
                    <div className="flex items-center gap-4">
                      <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                        <FileText className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="font-bold">{inv.clientName}</p>
                        <p className="text-xs text-muted-foreground font-medium">{format(new Date(inv.date), 'dd MMM yyyy')}</p>
                      </div>
                    </div>
                    <div className="text-right">
                       <p className="font-black text-lg">₹ {inv.grandTotal.toLocaleString('en-IN')}</p>
                       <Badge variant="outline" className="text-[10px] uppercase tracking-tighter">Invoiced</Badge>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        <div className="space-y-8">
          <Card className="glass-card">
            <CardHeader className="border-b bg-muted/5">
              <CardTitle>AI Activity</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
               <div className="divide-y">
                {recentAiLogs.length === 0 ? (
                  <p className="text-center text-muted-foreground py-12">System idle.</p>
                ) : (
                  recentAiLogs.map((log) => (
                    <div key={log.id} className="p-4 space-y-2 hover:bg-muted/50 transition-colors">
                       <div className="flex justify-between items-center">
                          <Badge className="bg-primary/10 text-primary hover:bg-primary/20 border-none capitalize text-[10px]">
                            {log.tool.replace('_', ' ')}
                          </Badge>
                          <span className="text-[10px] font-medium text-muted-foreground opacity-60">
                            {format(new Date(log.timestamp), 'h:mm a')}
                          </span>
                       </div>
                       <p className="text-xs font-medium line-clamp-2 italic text-muted-foreground">"{log.prompt}"</p>
                    </div>
                  ))
                )}
               </div>
            </CardContent>
          </Card>
          
          {profile?.plan !== 'practitioner' && (
            <Card className="bg-primary text-primary-foreground overflow-hidden relative">
               <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-3xl -mr-16 -mt-16" />
               <CardContent className="p-6 space-y-4">
                  <h3 className="font-bold">Scale Your Practice</h3>
                  <p className="text-xs text-white/70 leading-relaxed font-medium">
                    Unlock ITR Planning, GSTR Reconciliation, and Advanced Tax Chat with a Practitioner Membership.
                  </p>
                  <Button variant="secondary" className="w-full text-xs font-bold" onClick={() => navigate('/subscription')}>Upgrade Now</Button>
               </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Compliance Reminders */}
      <Card className="border-primary/20 bg-primary/5">
        <CardHeader>
          <CardTitle className="text-primary flex items-center gap-2">
            <AlertCircle className="h-5 w-5" />
            Compliance Status: {monthName}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="h-5 w-5 text-green-600" />
              <div>
                <p className="text-sm font-bold">GSTR-1 ({monthName})</p>
                <p className="text-xs text-muted-foreground">Due by 11th {format(nextMonth, 'MMM')}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Clock className="h-5 w-5 text-orange-600" />
              <div>
                <p className="text-sm font-bold">GSTR-3B ({monthName})</p>
                <p className="text-xs text-muted-foreground">Due by 20th {format(nextMonth, 'MMM')}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <TrendingUp className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-sm font-bold">Annual Reconciliation</p>
                <p className="text-xs text-muted-foreground font-medium text-blue-600">Pro Feature Active</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
