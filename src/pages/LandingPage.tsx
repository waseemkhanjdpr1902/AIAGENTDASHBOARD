import * as React from 'react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Calculator, 
  FileText, 
  MessageSquare, 
  ShieldCheck, 
  Zap, 
  Star,
  ArrowRight,
  TrendingUp,
  Cpu,
  Menu,
  X,
  CheckCircle,
  ShieldAlert,
  PieChart,
  Sparkles,
  Bot,
  BarChart3,
  Mail,
  MapPin,
  MessageCircle,
  Download,
  Lock
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import SEO from '@/components/SEO';

export default function LandingPage() {
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);

  return (
    <div className="min-h-screen bg-white text-slate-900 font-sans selection:bg-primary/20">
      <SEO 
        title="GSTSmartAI.com - India's High-Precision GST AI" 
        description="Reply to GST Notices in seconds. Expert ITR Planner. Professional GST suite for Businesses & CAs."
      />
      
      {/* Header */}
      <header className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-md border-b">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate('/')}>
            <div className="h-10 w-10 bg-primary rounded-xl flex items-center justify-center text-white shadow-lg shadow-primary/20">
              <ShieldCheck className="h-6 w-6" />
            </div>
            <span className="text-xl font-black tracking-tighter uppercase">GSTSmartAI.com</span>
          </div>

          <nav className="hidden md:flex items-center gap-8 text-sm font-bold uppercase tracking-widest text-slate-600">
            <a href="#features" className="hover:text-primary transition-colors">Features</a>
            <a href="#pricing" className="hover:text-primary transition-colors">Pricing</a>
            <a href="/about" className="hover:text-primary transition-colors">About</a>
          </nav>

          <div className="hidden md:flex items-center gap-4">
            <Button variant="ghost" onClick={() => navigate('/login')} className="font-bold">Log In</Button>
            <Button onClick={() => navigate('/login')} className="font-bold shadow-lg shadow-primary/20">Get Started Free</Button>
          </div>

          <button className="md:hidden" onClick={() => setIsMenuOpen(!isMenuOpen)}>
            {isMenuOpen ? <X /> : <Menu />}
          </button>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {isMenuOpen && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden bg-white border-b overflow-hidden"
            >
              <div className="p-6 space-y-4">
                <nav className="flex flex-col gap-4 text-sm font-bold uppercase tracking-widest text-slate-600">
                  <a href="#features" onClick={() => setIsMenuOpen(false)}>Features</a>
                  <a href="#pricing" onClick={() => setIsMenuOpen(false)}>Pricing</a>
                  <a href="/about">About</a>
                </nav>
                <div className="flex flex-col gap-2 pt-4 border-t">
                  <Button variant="outline" onClick={() => navigate('/login')} className="w-full">Log In</Button>
                  <Button onClick={() => navigate('/login')} className="w-full">Sign Up</Button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-6 overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[600px] bg-primary/5 blur-[120px] rounded-full -z-10" />
        
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-8 text-center lg:text-left">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-bold uppercase tracking-widest"
            >
              <Sparkles className="h-3 w-3 fill-primary" />
              Empowering 10,000+ Indian Taxpayers
            </motion.div>
            
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-5xl md:text-8xl font-black tracking-tighter leading-[0.9]"
            >
              REPLY TO GST NOTICES <br /> IN <span className="text-primary italic">2 MINUTES</span>.
            </motion.h1>
            
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-xl text-slate-500 max-w-xl mx-auto lg:mx-0 leading-relaxed font-medium"
            >
              Don't panic about ASMT-10 or SCNs. Our CA-trained AI analyzes your notices and drafts structured, legally-rigorous replies instantly.
            </motion.p>
            
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-4"
            >
              <Button size="lg" onClick={() => navigate('/login')} className="h-14 px-10 text-base font-bold shadow-2xl shadow-primary/30">
                Start Analysis Free <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <div className="flex items-center gap-3 px-2">
                 <div className="flex -space-x-3">
                    {[1, 2, 3].map(i => (
                      <div key={i} className="h-10 w-10 rounded-full border-2 border-white bg-slate-100 overflow-hidden">
                         <img src={`https://picsum.photos/seed/user${i}/100/100`} alt="user" referrerPolicy="no-referrer" />
                      </div>
                    ))}
                 </div>
                 <p className="text-sm font-bold text-slate-500">Trusted by 500+ Businesses</p>
              </div>
            </motion.div>
            
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="flex items-center justify-center lg:justify-start gap-6 pt-4 text-slate-400"
            >
               <div className="flex items-center gap-2"><CheckCircle className="h-4 w-4 text-green-500" /> <span className="text-xs font-bold uppercase tracking-wider">Expert-Guided Support</span></div>
               <div className="flex items-center gap-2"><CheckCircle className="h-4 w-4 text-green-500" /> <span className="text-xs font-bold uppercase tracking-wider">Indian Law Compliant</span></div>
            </motion.div>
          </div>

          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="relative"
          >
            <div className="absolute inset-0 bg-primary/10 rounded-3xl blur-3xl transform rotate-6" />
            <Card className="glass-card border-none shadow-[0_32px_64px_-16px_rgba(0,0,0,0.1)] overflow-hidden relative border border-slate-200/50">
               <div className="bg-slate-900 p-4 flex items-center justify-between">
                  <div className="flex gap-1.5">
                    <div className="h-2 w-2 rounded-full bg-red-500" />
                    <div className="h-2 w-2 rounded-full bg-yellow-500" />
                    <div className="h-2 w-2 rounded-full bg-green-500" />
                  </div>
                  <Badge variant="outline" className="text-[10px] text-white/50 border-white/10 uppercase tracking-tighter">AI Analysis Engine v4.0</Badge>
               </div>
               <div className="p-6 space-y-6 bg-slate-50">
                  <div className="space-y-2">
                    <div className="h-4 w-1/3 bg-slate-200 rounded animate-pulse" />
                    <div className="h-24 w-full bg-white border rounded-xl p-4 text-[10px] font-mono text-slate-400 leading-relaxed">
                       NOTICE UNDER SECTION 61: <br/>  
                       alleged excess ITC claim of ₹4,50,0,00... <br/>
                       discrepancy in GSTR-2B vs GSTR-3B...
                    </div>
                  </div>
                  <div className="flex justify-center">
                    <div className="h-10 w-10 bg-primary rounded-full flex items-center justify-center text-white animate-bounce shadow-lg shadow-primary/40">
                       <Zap className="h-5 w-5 fill-white" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="h-4 w-1/4 bg-slate-200 rounded" />
                    <div className="space-y-2">
                       <div className="h-3 w-full bg-green-100 rounded" />
                       <div className="h-3 w-[90%] bg-green-100 rounded" />
                       <div className="h-3 w-[95%] bg-green-100 rounded" />
                    </div>
                  </div>
               </div>
            </Card>
            
            {/* Floating Stats */}
            <div className="absolute -bottom-6 -left-6 bg-white p-4 rounded-2xl shadow-xl border flex items-center gap-4">
               <div className="h-10 w-10 rounded-xl bg-orange-100 flex items-center justify-center text-orange-600">
                  <PieChart className="h-6 w-6" />
               </div>
               <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Precision</p>
                  <p className="text-lg font-black">99.2%</p>
               </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 px-6 bg-slate-50">
        <div className="max-w-7xl mx-auto space-y-16">
          <div className="text-center space-y-4">
             <Badge variant="outline" className="text-primary border-primary/20 px-4 py-1 font-bold uppercase tracking-widest text-[10px]">Tax Tech Stack</Badge>
             <h2 className="text-4xl md:text-5xl font-black tracking-tight uppercase">Everything you need to <br/> scale your compliance.</h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              { 
                title: "AI Notice Analysis", 
                desc: "Upload any GST notice and get a structured legal response based on latest CBIC circulars.",
                icon: ShieldAlert,
                color: "bg-red-50 text-red-600"
              },
              { 
                title: "Smart Invoicing", 
                desc: "GST split logic (IGST/CGST/SGST) built-in. Generate professional PDFs in seconds.",
                icon: FileText,
                color: "bg-blue-50 text-blue-600"
              },
              { 
                title: "Returns Reconciliation", 
                desc: "Compare GSTR-2B vs 3B and identify missing ITC before the department sends a notice.",
                icon: Calculator,
                color: "bg-green-50 text-green-600"
              },
              { 
                title: "Legal Reference Library", 
                desc: "Query tax laws using natural language. No more scrolling through complex PDF rulebooks.",
                icon: Bot,
                color: "bg-purple-50 text-purple-600"
              },
              { 
                title: "Usage Analytics", 
                desc: "Monitor your team's filing status and AI usage through an intuitive dashboard.",
                icon: PieChart,
                color: "bg-orange-50 text-orange-600"
              },
              { 
                title: "Bank Grade Security", 
                desc: "Your proprietary tax data is encrypted and never used for training public models.",
                icon: ShieldCheck,
                color: "bg-slate-900 text-white"
              }
            ].map((f, i) => (
              <Card key={i} className="glass-card hover:shadow-2xl transition-all border-none p-8 space-y-6 bg-white">
                <div className={`${f.color} h-14 w-14 rounded-2xl flex items-center justify-center shadow-sm`}>
                   <f.icon className="h-7 w-7" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-xl font-bold">{f.title}</h3>
                  <p className="text-sm text-slate-500 font-medium leading-relaxed">{f.desc}</p>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-24 px-6 overflow-hidden">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center gap-16">
           <div className="flex-1 space-y-12">
              <h2 className="text-4xl md:text-6xl font-black tracking-tighter uppercase leading-[0.9]">
                Why the <span className="text-primary">Best CAs</span> are switching to AI tools.
              </h2>
              <div className="space-y-8">
                 {[
                   { t: "Save 10+ Hours/Week", d: "Stop drafting repetitive letters. Generate notice replies instantly." },
                   { t: "Minimize Compliance Risk", d: "AI flags discrepancies before they become expensive penalties." },
                   { t: "No Learning Curve", d: "If you can chat on WhatsApp, you can use GSTSmartAI.com." }
                 ].map((b, i) => (
                   <div key={i} className="flex gap-4">
                      <div className="h-6 w-6 rounded-full bg-primary/20 flex items-center justify-center mt-1">
                         <CheckCircle className="h-4 w-4 text-primary" />
                      </div>
                      <div>
                         <p className="font-bold text-lg">{b.t}</p>
                         <p className="text-slate-500 font-medium">{b.d}</p>
                      </div>
                   </div>
                 ))}
              </div>
              <Button size="lg" onClick={() => navigate('/login')} className="h-14 px-10 font-bold uppercase tracking-widest text-xs btn-intelligent group">
                Try it for yourself <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </Button>
           </div>
           <div className="flex-1 relative">
              <div className="absolute inset-0 bg-primary/20 blur-[100px] rounded-full animate-pulse" />
              <img 
                src="https://picsum.photos/seed/taxpro/800/800" 
                alt="Tax Professional" 
                className="relative z-10 rounded-3xl h-[500px] w-full object-cover shadow-2xl grayscale hover:grayscale-0 transition-all duration-700" 
                referrerPolicy="no-referrer"
              />
           </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-24 px-6 bg-slate-900 text-white">
        <div className="max-w-7xl mx-auto space-y-16">
          <div className="text-center space-y-4">
             <Badge className="bg-white/10 text-white border-none px-4 py-1 font-bold uppercase tracking-widest text-[10px]">Simple Pricing</Badge>
             <h2 className="text-4xl md:text-6xl font-black tracking-tight uppercase">Scale without <br/> blowing the budget.</h2>
             <p className="text-white/40 text-sm font-bold uppercase tracking-widest italic">Get 2 Months FREE with Annual Billing</p>
          </div>

          <div className="grid md:grid-cols-4 gap-6 items-end">
            <Card className="bg-white/5 border-white/10 p-6 space-y-6 text-white h-full flex flex-col">
               <div className="space-y-2">
                  <p className="text-xs font-bold uppercase tracking-widest text-white/50">Free</p>
                  <p className="text-4xl font-black">₹0</p>
                  <p className="text-[10px] text-white/40 font-medium uppercase">Hook & Acquire</p>
               </div>
               <ul className="space-y-3 text-[11px] font-medium text-white/70 flex-1">
                  <li className="flex items-center gap-2"><CheckCircle className="h-3 w-3 text-primary" /> 5 Invoices / month</li>
                  <li className="flex items-center gap-2"><CheckCircle className="h-3 w-3 text-primary" /> AI Chat (10 queries/day)</li>
                  <li className="flex items-center gap-2"><CheckCircle className="h-3 w-3 text-primary" /> GST Calculator</li>
               </ul>
               <Button variant="outline" onClick={() => navigate('/login')} className="w-full border-white/20 text-white hover:bg-white/10 h-11 font-bold text-xs uppercase">Start Free</Button>
            </Card>

            <Card className="bg-white/5 border-white/10 p-6 space-y-6 text-white h-full flex flex-col">
               <div className="space-y-2">
                  <p className="text-xs font-bold uppercase tracking-widest text-white/50">Starter</p>
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-black">₹199</span>
                    <span className="text-[10px] font-bold text-white/50 uppercase">/month</span>
                  </div>
                  <p className="text-[10px] text-white/40 font-medium uppercase">Freelancers & Shops</p>
               </div>
               <ul className="space-y-3 text-[11px] font-medium text-white/70 flex-1">
                  <li className="flex items-center gap-2"><CheckCircle className="h-3 w-3 text-primary" /> 50 Invoices / month</li>
                  <li className="flex items-center gap-2"><CheckCircle className="h-3 w-3 text-primary" /> WhatsApp PDF Sharing</li>
                  <li className="flex items-center gap-2"><CheckCircle className="h-3 w-3 text-primary" /> Notice Reader (Basic)</li>
                  <li className="flex items-center gap-2 text-primary font-bold"><Zap className="h-3 w-3" /> ₹1,990 / year (2 Months Free)</li>
               </ul>
               <Button variant="outline" onClick={() => navigate('/login')} className="w-full border-white/20 text-white hover:bg-white/10 h-11 font-bold text-xs uppercase">Choose Starter</Button>
            </Card>

            <Card className="bg-primary text-white p-8 space-y-6 relative overflow-hidden transform scale-105 shadow-2xl z-10 border-none h-full flex flex-col">
               <div className="absolute top-0 right-0 p-3">
                  <Badge className="bg-white text-primary uppercase font-black text-[10px] tracking-tighter shadow-sm">Standard</Badge>
               </div>
               <div className="space-y-2">
                  <p className="text-xs font-bold uppercase tracking-widest text-white/50">Pro</p>
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-black">₹499</span>
                    <span className="text-[10px] font-bold text-white/50 uppercase">/month</span>
                  </div>
                  <p className="text-[10px] text-white/70 font-medium uppercase">Growing SMEs</p>
               </div>
               <ul className="space-y-3 text-[11px] font-medium flex-1">
                  <li className="flex items-center gap-2"><CheckCircle className="h-3 w-3" /> Unlimited Invoices</li>
                  <li className="flex items-center gap-2"><CheckCircle className="h-3 w-3" /> Notice Responder + Templates</li>
                  <li className="flex items-center gap-2"><CheckCircle className="h-3 w-3" /> ITR Planner Assistant</li>
                  <li className="flex items-center gap-2"><CheckCircle className="h-3 w-3" /> Priority AI Systems</li>
                  <li className="flex items-center gap-2 font-bold"><Zap className="h-3 w-3" /> ₹4,990 / year (Save 20%)</li>
               </ul>
               <Button onClick={() => navigate('/login')} className="w-full bg-white text-primary hover:bg-slate-100 h-12 font-black text-xs uppercase shadow-xl shadow-black/20">Upgrade Pro</Button>
            </Card>

            <Card className="bg-white/5 border-white/10 p-6 space-y-6 text-white h-full flex flex-col">
               <div className="space-y-2">
                  <p className="text-xs font-bold uppercase tracking-widest text-white/50">CA / Business</p>
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-black">₹999</span>
                    <span className="text-[10px] font-bold text-white/50 uppercase">/month</span>
                  </div>
                  <p className="text-[10px] text-white/40 font-medium uppercase">Professionals</p>
               </div>
               <ul className="space-y-3 text-[11px] font-medium text-white/70 flex-1">
                  <li className="flex items-center gap-2"><CheckCircle className="h-3 w-3 text-primary" /> Multi-client (Up to 10 GSTINs)</li>
                  <li className="flex items-center gap-2"><CheckCircle className="h-3 w-3 text-primary" /> Bulk Invoicing Tools</li>
                  <li className="flex items-center gap-2"><CheckCircle className="h-3 w-3 text-primary" /> API Access (Beta)</li>
                  <li className="flex items-center gap-2 font-bold"><Zap className="h-3 w-3 text-primary" /> ₹9,990 / year</li>
               </ul>
               <Button variant="outline" onClick={() => navigate('/login')} className="w-full border-white/20 text-white hover:bg-white/10 h-11 font-bold text-xs uppercase">Go Enterprise</Button>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Footer Section */}
      <section className="py-24 px-6 text-center space-y-8">
         <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tighter">Ready to automate your <br/> GST compliance?</h2>
         <p className="text-slate-500 font-medium max-w-lg mx-auto italic">Join the next generation of tax-smart entrepreneurs in India.</p>
         <div className="flex justify-center gap-4">
            <Button size="lg" onClick={() => navigate('/login')} className="h-14 px-10 font-bold shadow-2xl shadow-primary/20 uppercase tracking-widest text-xs">Empower My Business Now</Button>
         </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-16 px-6 bg-slate-50">
        <div className="max-w-7xl mx-auto">
           <div className="grid md:grid-cols-4 gap-12 mb-12">
              <div className="space-y-6 col-span-1">
                 <div className="flex items-center gap-2">
                    <ShieldCheck className="h-6 w-6 text-primary" />
                    <span className="font-bold uppercase tracking-tight">GSTSmartAI.com</span>
                 </div>
                 <p className="text-xs text-slate-500 font-medium leading-relaxed uppercase tracking-tighter">
                    Revolutionizing Indian Tax Compliance <br/> with Private, Secure AI.
                 </p>
                 <div className="inline-flex items-center gap-2 px-3 py-1 bg-primary text-white rounded-full text-[8px] font-black uppercase tracking-widest">
                    🇮🇳 Made in India
                 </div>
              </div>

              <div className="space-y-4">
                 <h4 className="text-xs font-black uppercase tracking-[0.2em] text-slate-400">Legal</h4>
                 <nav className="flex flex-col gap-2 text-[10px] font-bold uppercase tracking-widest text-slate-600">
                    <a href="/privacy" className="hover:text-primary transition-colors">Privacy Policy</a>
                    <a href="/terms" className="hover:text-primary transition-colors">Terms of Service</a>
                    <a href="/refund" className="hover:text-primary transition-colors">Refund Policy</a>
                 </nav>
              </div>

              <div className="space-y-4">
                 <h4 className="text-xs font-black uppercase tracking-[0.2em] text-slate-400">Contact</h4>
                 <div className="flex flex-col gap-3 text-[10px] font-bold tracking-widest text-slate-600 uppercase">
                    <div className="flex items-center gap-2">
                       <Mail className="h-3 w-3 text-primary" />
                       <span>support@gstsmartai.com</span>
                    </div>
                    <div className="flex items-center gap-2">
                       <MessageCircle className="h-3 w-3 text-green-500" />
                       <span>+91 96603 57076</span>
                    </div>
                    <div className="flex items-start gap-2">
                       <MapPin className="h-3 w-3 text-primary mt-0.5" />
                       <span>Jodhpur, Rajasthan, <br/> India - 342001</span>
                    </div>
                 </div>
              </div>

              <div className="space-y-4">
                 <h4 className="text-xs font-black uppercase tracking-[0.2em] text-slate-400">Business</h4>
                 <div className="text-[10px] font-black text-slate-400 italic">
                    GST Smart AI Solutions <br/>
                    Empowering Indian SMEs.
                 </div>
              </div>
           </div>
           
           <div className="pt-8 border-t flex flex-col md:flex-row justify-between items-center gap-4">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">© {new Date().getFullYear()} GSTSmartAI.com Solutions. All rights reserved.</p>
              <div className="flex gap-4 opacity-50">
                 <ShieldCheck className="h-4 w-4" />
                 <CheckCircle className="h-4 w-4" />
                 <Lock className="h-4 w-4" />
              </div>
           </div>
        </div>
      </footer>
    </div>
  );
}
