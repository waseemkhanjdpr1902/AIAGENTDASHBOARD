import { 
  Building2, 
  Target, 
  Users2, 
  Heart,
  Globe,
  Award
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

export default function AboutUs() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-muted/20 py-12 px-6">
      <div className="max-w-4xl mx-auto space-y-12">
        <div className="text-center space-y-4">
          <Button variant="ghost" onClick={() => navigate('/')} className="text-primary font-bold">← Back to Home</Button>
          <h1 className="text-4xl font-black uppercase tracking-tight">About Our Mission</h1>
          <p className="text-muted-foreground max-w-xl mx-auto">Digitizing Indian Taxation through high-performance Artificial Intelligence.</p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
           <div className="space-y-6">
              <h2 className="text-2xl font-bold">The Problem</h2>
              <p className="text-muted-foreground leading-relaxed">
                GST compliance in India is complex. With thousands of notifications and complex reconciliation requirements, business owners and even many young practitioners struggle to keep up. Professional help is expensive, and manual errors lead to heavy penalties.
              </p>
           </div>
           <div className="space-y-6">
              <h2 className="text-2xl font-bold">Contact Our Office</h2>
              <div className="bg-white p-6 rounded-3xl border border-primary/20 space-y-4">
                 <div>
                    <p className="text-[10px] font-black uppercase text-primary tracking-widest">Main Consultant</p>
                    <p className="text-lg font-black uppercase">Waseem Khan</p>
                 </div>
                 <div className="space-y-2">
                    <p className="text-sm font-medium flex items-center gap-2">
                       <Globe className="h-4 w-4 text-primary" />
                       waseemkhanjdpr@gmail.com
                    </p>
                    <p className="text-sm font-medium italic text-muted-foreground">
                       Based in Rajasthan, supporting businesses across India.
                    </p>
                 </div>
              </div>
           </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
           {[
             { label: "Founded", val: "2024", icon: Building2 },
             { label: "Vision", val: "AI-First", icon: Target },
             { label: "Support", val: "24/7", icon: Heart },
             { label: "Market", val: "India", icon: Globe }
           ].map((stat, i) => (
             <Card key={i} className="text-center p-6 border-none bg-primary/5">
                <stat.icon className="h-6 w-6 mx-auto mb-2 text-primary" />
                <p className="text-xs uppercase font-bold text-muted-foreground">{stat.label}</p>
                <p className="text-xl font-black">{stat.val}</p>
             </Card>
           ))}
        </div>

        <Card className="bg-primary text-primary-foreground">
           <CardContent className="p-12 text-center space-y-6">
              <Award className="h-12 w-12 mx-auto" />
              <h2 className="text-3xl font-black">Ready to simplify your taxes?</h2>
              <p className="text-primary-foreground/70">Join 500+ Indian businesses automating their compliance.</p>
              <Button variant="secondary" size="lg" onClick={() => navigate('/login')} className="font-bold">Initialize Dashboard</Button>
           </CardContent>
        </Card>
      </div>
    </div>
  );
}
