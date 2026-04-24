import * as React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { SAMPLE_BLOGS } from './BlogIndex';
import SEO from '@/components/SEO';
import { Button } from '@/components/ui/button';
import { ChevronLeft, Share2, Bookmark } from 'lucide-react';

export default function BlogPost() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const blog = SAMPLE_BLOGS.find(b => b.slug === slug);

  if (!blog) return <div>Post not found</div>;

  return (
    <div className="min-h-screen bg-background">
      <SEO 
        title={blog.title} 
        description={blog.excerpt} 
        ogType="article"
      />

       {/* Mobile-style sticky header */}
       <nav className="border-b glass fixed top-0 w-full z-50">
        <div className="max-w-4xl mx-auto px-4 h-16 flex items-center justify-between">
          <Button variant="ghost" size="sm" onClick={() => navigate('/blog')}>
            <ChevronLeft className="mr-2 h-4 w-4" /> Back to Blog
          </Button>
          <div className="flex gap-2">
            <Button variant="ghost" size="icon"><Share2 className="h-4 w-4" /></Button>
            <Button variant="ghost" size="icon"><Bookmark className="h-4 w-4" /></Button>
          </div>
        </div>
      </nav>

      <main className="pt-32 pb-24 px-4 max-w-3xl mx-auto space-y-12">
        <header className="space-y-6">
          <div className="flex gap-4 text-xs font-bold text-primary uppercase tracking-widest">
            <span>{blog.category}</span>
            <span className="text-muted-foreground">•</span>
            <span className="text-muted-foreground">{blog.readTime}</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight leading-tight">
            {blog.title}
          </h1>
          <div className="flex items-center gap-4 py-4 border-y">
             <div className="h-10 w-10 rounded-full bg-muted overflow-hidden">
                <img src="https://picsum.photos/seed/author/100/100" alt="Author" />
             </div>
             <div>
                <p className="text-sm font-bold">Waseem Khan</p>
                <p className="text-xs text-muted-foreground">GST Solutions Expert • {blog.date}</p>
             </div>
          </div>
        </header>

        <figure className="rounded-3xl overflow-hidden shadow-2xl">
           <img 
            src={blog.image} 
            alt={blog.title} 
            className="w-full h-auto"
            referrerPolicy="no-referrer"
          />
        </figure>

        <article className="prose prose-lg dark:prose-invert max-w-none space-y-8">
           <p className="text-xl font-medium leading-relaxed">
             Navigating the Indian GST landscape is becoming increasingly complex. As the department moves toward digital scrutiny, receiving a notice is no longer a matter of "if" but "when".
           </p>

           <h2 className="text-3xl font-bold">Understanding the Intent Behind the Notice</h2>
           <p>
             Before you start drafting your reply, it's essential to understand whether the notice is an automated ASMT-10 or a specific DRC-01 intimation. The GST department uses sophisticated algorithms to match your electronic credit ledger with your supplier's declarations. Any mismatch triggers an automated alert.
           </p>

           <h3 className="text-2xl font-bold">Steps to Draft a Professional Response</h3>
           <ol className="space-y-4">
              <li>
                <strong>Analyze the Discrepancy:</strong> Download your GSTR-2B and compare it with your purchase register. Use a tool like GST AI Pro to find the exact invoices caused by the mismatch.
              </li>
              <li>
                <strong>Gather Documentary Evidence:</strong> For a successful reply, you need proof of receipt of goods, payment proofs (bank statements), and valid invoices.
              </li>
              <li>
                <strong>Draft Point-by-Point Basis:</strong> Address every specific discrepancy mentioned in the notice. Do not give vague answers.
              </li>
           </ol>

           <div className="bg-primary/5 border-l-4 border-primary p-6 rounded-r-xl">
              <h4 className="font-bold text-primary mb-2">Pro Tip:</h4>
              <p className="text-sm italic">
                "Always submit your reply within the prescribed time limit (usually 30 days) even if your data collection is incomplete. You can request an extension or submit a partial reply to avoid ex-parte orders."
              </p>
           </div>

           <h2 className="text-3xl font-bold">Conclusion</h2>
           <p>
             In the age of Faceless Assessment, your written word is your only representative. Make it count by using structured formats and clear logic. If you're unsure, our <strong>AI Notice Responder</strong> can help you generate a compliant draft in seconds.
           </p>
        </article>

        <div className="pt-12 border-t text-center space-y-6">
           <h3 className="text-2xl font-bold">Found this helpful?</h3>
           <p className="text-muted-foreground">Start using GSTSmartAI.com to automate your notices today.</p>
           <Button size="lg" onClick={() => navigate('/login')} className="btn-intelligent px-8">Get Started for Free</Button>
        </div>
      </main>

      <footer className="py-12 border-t text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} GSTSmartAI.com India. Built for Compliance.
      </footer>
    </div>
  );
}
