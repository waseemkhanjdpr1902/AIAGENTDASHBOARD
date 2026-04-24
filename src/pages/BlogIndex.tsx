import * as React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useNavigate } from 'react-router-dom';
import SEO from '@/components/SEO';
import { motion } from 'framer-motion';
import { Calendar, Clock, ChevronRight, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';

export const SAMPLE_BLOGS = [
  {
    title: "How to Reply to a GST Notice: A Step-by-Step Guide",
    slug: "how-to-reply-gst-notice",
    excerpt: "Received an ASMT-10 or DRC-01A? Learn the strategic way to draft a professional response and avoid penalties.",
    date: "May 15, 2026",
    readTime: "8 min read",
    category: "Compliance",
    image: "https://picsum.photos/seed/legal/800/400"
  },
  {
    title: "Top 10 Common GST Mistakes Made by Small Businesses",
    slug: "common-gst-mistakes",
    excerpt: "From incorrect HSN codes to claiming ineligible ITC, these common errors can trigger GST audits.",
    date: "May 12, 2026",
    readTime: "12 min read",
    category: "GST Guide",
    image: "https://picsum.photos/seed/business/800/400"
  },
  {
    title: "GST Calculator Guide: Inclusive vs Exclusive Calculations",
    slug: "gst-calculator-guide",
    excerpt: "Master the math behind Indian GST tax slabs and learn how to price your products correctly.",
    date: "May 10, 2026",
    readTime: "6 min read",
    category: "Tax Tool",
    image: "https://picsum.photos/seed/math/800/400"
  }
];

export default function BlogIndex() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      <SEO 
        title="GST AI Pro Blog - Expert GST Guides & Tax Insights" 
        description="Stay updated with the latest in Indian GST law, compliance tips, and business growth strategies. Expert insights for CAs and SMEs."
      />
      
      {/* Navigation */}
      <nav className="border-b glass fixed top-0 w-full z-50">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate('/')}>
            <span className="font-bold text-xl gradient-text">GST AI Pro Blog</span>
          </div>
          <Button onClick={() => navigate('/login')}>Launch App</Button>
        </div>
      </nav>

      {/* Hero */}
      <header className="pt-32 pb-16 px-4 bg-muted/20">
        <div className="max-w-4xl mx-auto text-center space-y-6">
          <h1 className="text-5xl font-bold tracking-tight">The Indian Tax Library</h1>
          <p className="text-xl text-muted-foreground">Mastering compliance in the age of Artificial Intelligence.</p>
          
          <div className="relative max-w-lg mx-auto">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search for guides, notices, or slabs..." className="pl-10 h-12 rounded-full" />
          </div>
        </div>
      </header>

      {/* Blog Grid */}
      <main className="max-w-7xl mx-auto px-4 py-16 grid md:grid-cols-2 lg:grid-cols-3 gap-8">
        {SAMPLE_BLOGS.map((blog, i) => (
          <motion.div 
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
          >
            <Card className="overflow-hidden glass-card group cursor-pointer h-full" onClick={() => navigate(`/blog/${blog.slug}`)}>
              <div className="aspect-video overflow-hidden">
                <img 
                  src={blog.image} 
                  alt={blog.title} 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  referrerPolicy="no-referrer"
                />
              </div>
              <CardContent className="p-6 space-y-4">
                <div className="flex gap-4 text-xs font-bold text-primary uppercase tracking-wider">
                  <span>{blog.category}</span>
                </div>
                <h2 className="text-xl font-bold line-clamp-2 group-hover:text-primary transition-colors">{blog.title}</h2>
                <p className="text-sm text-muted-foreground line-clamp-3">{blog.excerpt}</p>
                
                <div className="pt-4 flex items-center justify-between text-xs text-muted-foreground">
                  <div className="flex items-center gap-4">
                    <span className="flex items-center gap-1"><Calendar className="h-3 w-3" /> {blog.date}</span>
                    <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> {blog.readTime}</span>
                  </div>
                  <ChevronRight className="h-4 w-4 text-primary" />
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </main>

      {/* Newsletter */}
      <section className="bg-primary text-primary-foreground py-20 px-4 mt-20">
        <div className="max-w-3xl mx-auto text-center space-y-8">
           <h2 className="text-4xl font-bold">Simplify your month-end.</h2>
           <p className="text-primary-foreground/80">Get the only GST newsletter that doesn't put you to sleep. Sent every Friday.</p>
           <form className="flex gap-2 max-w-md mx-auto">
             <Input placeholder="Email Address" className="bg-white text-black h-12" />
             <Button variant="secondary" className="h-12 px-8">Subscribe</Button>
           </form>
        </div>
      </section>

       {/* Footer */}
       <footer className="py-12 border-t text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} GST AI PRO India. Built for Compliance.
      </footer>
    </div>
  );
}
