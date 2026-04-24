import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { db } from '@/lib/firebase';
import { doc, updateDoc } from 'firebase/firestore';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Check, User, Shield, Zap, Info } from 'lucide-react';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';

export default function Subscription() {
  const { profile } = useAuth();
  const [isUpgrading, setIsUpgrading] = useState<string | null>(null);

  // Razorpay Integration
  const handleUpgrade = async (planType: 'pro' | 'practitioner', amount: number) => {
    const rawKeyId = import.meta.env.VITE_RAZORPAY_KEY_ID;
    const keyId = rawKeyId?.trim();
    
    if (!keyId) {
      toast.error('Razorpay Key ID is missing from environment variables.');
      return;
    }

    if (!(window as any).Razorpay) {
      toast.error('Payment gateway is not loaded. Refreshing page might help.');
      return;
    }

    setIsUpgrading(planType);

    // Safety timeout: clear loading state if modal fails to show after 10s
    const safetyTimeout = setTimeout(() => {
      setIsUpgrading(prev => prev === planType ? null : prev);
    }, 10000);

    const options = {
      key: keyId,
      amount: Math.round(amount * 100), // Ensure integer paise
      currency: "INR",
      name: "GST Practioner",
      description: `${planType.toUpperCase()} Subscription Plan`,
      image: window.location.origin + "/favicon.ico",
      handler: async function (response: any) {
        clearTimeout(safetyTimeout);
        try {
          if (profile?.uid) {
            await updateDoc(doc(db, 'users', profile.uid), {
              plan: planType,
              lastPaymentId: response.razorpay_payment_id
            });
            toast.success(`Upgraded to ${planType} Plan!`);
          }
        } catch (error) {
          toast.error('Update failed. Payment ID: ' + response.razorpay_payment_id);
        } finally {
          setIsUpgrading(null);
        }
      },
      prefill: {
        name: profile?.displayName || "",
        email: profile?.email || "",
      },
      theme: {
        color: "#2563eb",
      },
      modal: {
        ondismiss: function() {
          clearTimeout(safetyTimeout);
          setIsUpgrading(null);
        }
      }
    };

    try {
      const rzp = new (window as any).Razorpay(options);
      rzp.on('payment.failed', function (err: any) {
        clearTimeout(safetyTimeout);
        toast.error('Payment Failed: ' + err.error.description);
        setIsUpgrading(null);
      });
      rzp.open();
    } catch (error) {
      clearTimeout(safetyTimeout);
      toast.error('Failed to open payment window.');
      setIsUpgrading(null);
    }
  };

  const plans = [
    {
      id: 'free',
      name: "Free",
      price: "₹0",
      description: "For individuals exploring GST AI",
      features: [
        "5 AI requests per day",
        "GST Calculator",
        "Community Support",
        "Basic Invoicing"
      ],
      buttonText: profile?.plan === 'free' ? 'Current Plan' : 'Downgrade',
      disabled: profile?.plan === 'free',
      active: profile?.plan === 'free'
    },
    {
      id: 'pro',
      name: "Pro",
      price: "₹499",
      period: "/month",
      amount: 499,
      description: "Advanced tools for businesses",
      features: [
        "Unlimited AI Requests",
        "Unlimited PDF Invoices",
        "Multi-modal Chat Support",
        "Priority AI Analysis"
      ],
      buttonText: profile?.plan === 'pro' ? 'Current Plan' : 'Upgrade to Pro',
      disabled: profile?.plan === 'pro' || profile?.plan === 'practitioner',
      active: profile?.plan === 'pro',
      popular: true
    },
    {
      id: 'practitioner',
      name: "Practitioner",
      price: "₹999",
      period: "/month",
      amount: 999,
      description: "Ultimate suite for tax experts",
      features: [
        "Everything in Pro Plan",
        "ITR Planner (Full Access)",
        "Advanced Data Reconciliation",
        "Export Documents to Excel/PDF",
        "VIP Support & Early Access"
      ],
      buttonText: profile?.plan === 'practitioner' ? 'Current Plan' : 'Go Practitioner',
      disabled: profile?.plan === 'practitioner',
      active: profile?.plan === 'practitioner',
      popular: false
    }
  ];

  return (
    <div className="space-y-8">
      <div className="text-center space-y-4">
        <h1 className="text-5xl font-black tracking-tighter uppercase italic text-primary">Membership Tiers</h1>
        <p className="text-muted-foreground font-medium max-w-2xl mx-auto italic">
          Empower your practice with high-precision AI specialized for Indian Taxation.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
        {plans.map((plan) => (
          <Card key={plan.name} className={`relative flex flex-col transition-all duration-300 hover:shadow-2xl ${plan.popular ? 'border-primary ring-2 ring-primary shadow-xl bg-primary/5' : 'glass-card'}`}>
            {plan.popular && (
              <Badge className="absolute top-0 right-1/2 transform translate-x-1/2 -translate-y-1/2 bg-primary text-white font-bold px-4 py-1">
                BEST VALUE
              </Badge>
            )}
            <CardHeader className="text-center">
              <CardTitle className="text-2xl font-black uppercase italic">{plan.name}</CardTitle>
              <CardDescription className="font-medium">{plan.description}</CardDescription>
              <div className="mt-6 flex flex-col items-center">
                <span className="text-5xl font-black tracking-tighter">{plan.price}</span>
                <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground mt-1">per user {plan.period}</span>
              </div>
            </CardHeader>
            <CardContent className="flex-1 space-y-6 px-8">
              <div className="h-px bg-border/50 w-full" />
              <ul className="space-y-4">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-3 text-sm font-medium">
                    <Check className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
            <CardFooter className="p-6">
              <Button 
                className={`w-full h-12 text-sm font-bold uppercase tracking-widest transition-all ${plan.popular ? 'btn-intelligent' : ''}`}
                variant={plan.popular ? "default" : "outline"}
                disabled={plan.disabled || (!!isUpgrading)}
                onClick={plan.active ? undefined : () => handleUpgrade(plan.id as any, plan.amount || 0)}
              >
                {isUpgrading === plan.id ? 'Securing Transaction...' : plan.buttonText}
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>

      <div className="max-w-4xl mx-auto bg-muted/30 p-8 rounded-xl border space-y-6">
        <h3 className="text-xl font-bold flex items-center gap-2">
          <Info className="h-5 w-5 text-primary" />
          Integration Guide (Razorpay)
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm">
          <div className="space-y-2">
            <div className="bg-primary/10 w-8 h-8 rounded-full flex items-center justify-center font-bold text-primary">1</div>
            <p className="font-bold">Setup Account</p>
            <p className="text-muted-foreground">Sign up at Razorpay and get your <code className="bg-muted px-1">KEY_ID</code> and <code className="bg-muted px-1">KEY_SECRET</code>.</p>
          </div>
          <div className="space-y-2">
            <div className="bg-primary/10 w-8 h-8 rounded-full flex items-center justify-center font-bold text-primary">2</div>
            <p className="font-bold">Add Hook</p>
            <p className="text-muted-foreground">Create a server route to verify signature and update Firestore when payment is successful.</p>
          </div>
          <div className="space-y-2">
            <div className="bg-primary/10 w-8 h-8 rounded-full flex items-center justify-center font-bold text-primary">3</div>
            <p className="font-bold">Client SDK</p>
            <p className="text-muted-foreground">Use the Razorpay Checkout script in the frontend to trigger the payment modal.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
