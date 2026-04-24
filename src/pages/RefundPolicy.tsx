import * as React from 'react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, IndianRupee } from 'lucide-react';

export default function RefundPolicy() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-slate-50 py-20 px-6">
      <div className="max-w-3xl mx-auto space-y-12">
        <Button variant="ghost" onClick={() => navigate('/')} className="gap-2 font-bold uppercase tracking-widest text-xs">
          <ArrowLeft className="h-4 w-4" /> Back to Home
        </Button>

        <div className="bg-white rounded-3xl p-12 shadow-xl space-y-8">
          <div className="flex items-center gap-3">
            <IndianRupee className="h-8 w-8 text-primary" />
            <h1 className="text-4xl font-black tracking-tight uppercase">Refund Policy</h1>
          </div>

          <div className="prose prose-slate max-w-none space-y-6 text-slate-600 font-medium leading-relaxed">
            <p className="text-xl font-bold text-slate-900 italic">Version 1.0</p>
            
            <section className="space-y-4">
              <h2 className="text-xl font-black text-slate-900 uppercase tracking-tight">1. Subscription Cancellations</h2>
              <p>You may cancel your subscription at any time via your Billing Dashboard. Your access will remain active until the end of the current billing cycle.</p>
            </section>

            <section className="space-y-4">
              <h2 className="text-xl font-black text-slate-900 uppercase tracking-tight">2. Refund Eligibility</h2>
              <p>As we offer a Free Tier for testing our services, we generally do not offer refunds once a paid subscription has been activated or renewed. If you have a special case, please contact us within 24 hours of payment.</p>
            </section>

            <section className="space-y-4">
              <h2 className="text-xl font-black text-slate-900 uppercase tracking-tight">3. Technical Issues</h2>
              <p>If you are unable to access the service due to sustained technical failure on our end, we may offer a pro-rata refund or credit for future use at our discretion.</p>
            </section>

            <section className="space-y-4">
              <h2 className="text-xl font-black text-slate-900 uppercase tracking-tight">4. Contact Support</h2>
              <p>For refund requests regarding billing errors, please email <span className="font-bold text-primary">support@gstsmartai.com</span> with your transaction ID and business details.</p>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
