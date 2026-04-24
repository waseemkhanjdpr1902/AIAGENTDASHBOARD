import * as React from 'react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { ChevronRight, Star, CheckCircle2 } from 'lucide-react';
import SEO from '@/components/SEO';
import { motion } from 'framer-motion';

interface FAQ {
  q: string;
  a: string;
}

interface SEOPageProps {
  title: string;
  description: string;
  heroTitle: string;
  heroSubtitle: string;
  content: React.ReactNode;
  faqs: FAQ[];
  canonical: string;
  schema?: object;
}

export default function SEOPageLayout({
  title,
  description,
  heroTitle,
  heroSubtitle,
  content,
  faqs,
  canonical,
  schema
}: SEOPageProps) {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      <SEO 
        title={title} 
        description={description} 
        canonical={canonical}
        schemaMarkup={schema}
      />
      
      {/* Navigation */}
      <nav className="border-b glass fixed top-0 w-full z-50">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate('/')}>
            <div className="bg-primary text-primary-foreground p-1.5 rounded-xl">
              <Star className="h-5 w-5" />
            </div>
            <span className="font-bold text-xl gradient-text">GSTSmartAI.com</span>
          </div>
          <div className="flex items-center gap-4">
            <Button variant="ghost" onClick={() => navigate('/login')}>Login</Button>
            <Button onClick={() => navigate('/login')} className="btn-intelligent">Get Started</Button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <header className="pt-32 pb-16 px-4">
        <div className="max-w-4xl mx-auto text-center space-y-6">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-5xl md:text-7xl font-bold tracking-tight"
          >
            {heroTitle}
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-xl text-muted-foreground"
          >
            {heroSubtitle}
          </motion.p>
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="flex flex-wrap justify-center gap-4 pt-4"
          >
            <Button size="lg" onClick={() => navigate('/login')} className="btn-intelligent px-8">
              Try for Free <ChevronRight className="ml-2 h-4 w-4" />
            </Button>
            <Button size="lg" variant="outline" className="px-8">
              Watch Demo
            </Button>
          </motion.div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-4xl mx-auto px-4 py-16 space-y-24">
        <section className="prose prose-lg dark:prose-invert max-w-none">
          {content}
        </section>

        {/* FAQs */}
        <section className="space-y-8">
          <h2 className="text-3xl font-bold text-center">Frequently Asked Questions</h2>
          <div className="grid gap-4">
            {faqs.map((faq, i) => (
              <Card key={i} className="glass-card">
                <CardContent className="p-6 space-y-2">
                  <h3 className="font-bold text-lg flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 text-primary mt-1 shrink-0" />
                    {faq.q}
                  </h3>
                  <p className="text-muted-foreground leading-relaxed pl-8">
                    {faq.a}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t py-12 mt-24 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 text-center space-y-4">
          <p className="font-bold gradient-text">GSTSmartAI.com India</p>
          <p className="text-sm text-muted-foreground max-w-md mx-auto">
            The intelligent GST compliance platform built for Indian businesses and tax professionals.
          </p>
          <div className="flex justify-center gap-6 text-sm py-4">
            <a href="/gst-calculator" className="hover:text-primary transition-colors">GST Calculator</a>
            <a href="/invoice-generator" className="hover:text-primary transition-colors">Invoice Generator</a>
            <a href="/gst-notice-reply" className="hover:text-primary transition-colors">Notice Reply</a>
            <a href="/gstr-helper" className="hover:text-primary transition-colors">GSTR Helper</a>
          </div>
          <p className="text-xs text-muted-foreground pt-8">
            © {new Date().getFullYear()} GSTSmartAI.com. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
