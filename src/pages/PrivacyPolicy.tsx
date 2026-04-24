import * as React from 'react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ShieldCheck } from 'lucide-react';

export default function PrivacyPolicy() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-slate-50 py-20 px-6">
      <div className="max-w-3xl mx-auto space-y-12">
        <Button variant="ghost" onClick={() => navigate('/')} className="gap-2 font-bold uppercase tracking-widest text-xs">
          <ArrowLeft className="h-4 w-4" /> Back to Home
        </Button>

        <div className="bg-white rounded-3xl p-12 shadow-xl space-y-8">
          <div className="flex items-center gap-3">
            <ShieldCheck className="h-8 w-8 text-primary" />
            <h1 className="text-4xl font-black tracking-tight uppercase">Privacy Policy</h1>
          </div>

          <div className="prose prose-slate max-w-none space-y-6 text-slate-600 font-medium leading-relaxed">
            <p className="text-xl font-bold text-slate-900 italic">Last Updated: April 23, 2026</p>
            
            <section className="space-y-4">
              <h2 className="text-xl font-black text-slate-900 uppercase tracking-tight">1. Data Ownership</h2>
              <p>Your tax data is your property. GSTSmartAI.com acts only as a processor. We do not sell, rent, or trade your personal or business data to third parties.</p>
            </section>

            <section className="space-y-4">
              <h2 className="text-xl font-black text-slate-900 uppercase tracking-tight">2. Information We Collect</h2>
              <p>We collect only the minimum data required to provide our services: Business Name, Email, GSTIN (optional), and user-provided notice text or documents for AI analysis.</p>
            </section>

            <section className="space-y-4">
              <h2 className="text-xl font-black text-slate-900 uppercase tracking-tight">3. AI Data Security</h2>
              <p>We use enterprise-grade AI models. Your data is encrypted in transit and at rest. We do not use your proprietary tax data to train public AI models.</p>
            </section>

            <section className="space-y-4">
              <h2 className="text-xl font-black text-slate-900 uppercase tracking-tight">4. Retention Policy</h2>
              <p>You can delete your account and all associated data at any time through the dashboard settings. Residual logs may be kept for security purposes for up to 30 days.</p>
            </section>
            
            <p className="pt-8 border-t text-sm">For privacy concerns, contact: <span className="font-bold text-primary">support@gstsmartai.com</span></p>
          </div>
        </div>
      </div>
    </div>
  );
}
