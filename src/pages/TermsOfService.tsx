import * as React from 'react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, FileText } from 'lucide-react';

export default function TermsOfService() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-slate-50 py-20 px-6">
      <div className="max-w-3xl mx-auto space-y-12">
        <Button variant="ghost" onClick={() => navigate('/')} className="gap-2 font-bold uppercase tracking-widest text-xs">
          <ArrowLeft className="h-4 w-4" /> Back to Home
        </Button>

        <div className="bg-white rounded-3xl p-12 shadow-xl space-y-8">
          <div className="flex items-center gap-3">
            <FileText className="h-8 w-8 text-primary" />
            <h1 className="text-4xl font-black tracking-tight uppercase">Terms of Service</h1>
          </div>

          <div className="prose prose-slate max-w-none space-y-6 text-slate-600 font-medium leading-relaxed">
            <p className="text-xl font-bold text-slate-900 italic">Effective Date: April 23, 2026</p>
            
            <section className="space-y-4">
              <h2 className="text-xl font-black text-slate-900 uppercase tracking-tight">1. AI Disclaimer</h2>
              <p>GSTSmartAI provides AI-generated guidance. While we strive for high precision, AI models can make mistakes. All responses should be verified against official CGST/IGST Acts or with a qualified Chartered Accountant.</p>
            </section>

            <section className="space-y-4">
              <h2 className="text-xl font-black text-slate-900 uppercase tracking-tight">2. No Professional Advice</h2>
              <p>The use of this platform does not create a CA-Client relationship. We provide a productivity tool, not legal or financial advice.</p>
            </section>

            <section className="space-y-4">
              <h2 className="text-xl font-black text-slate-900 uppercase tracking-tight">3. User Responsibility</h2>
              <p>Users are responsible for the accuracy of data entered and for meeting their own tax filing deadlines as per government regulations.</p>
            </section>

            <section className="space-y-4">
              <h2 className="text-xl font-black text-slate-900 uppercase tracking-tight">4. Limitation of Liability</h2>
              <p>GSTSmartAI Solutions shall not be liable for any penalties, interest, or losses incurred due to use of the application's outputs.</p>
            </section>

            <p className="pt-8 border-t text-sm">By using GSTSmartAI.com, you agree to these terms.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
