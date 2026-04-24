import React, { useState, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { db } from '@/lib/firebase';
import { collection, addDoc, doc, updateDoc, increment } from 'firebase/firestore';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { generateAIResponse, GST_NOTICE_SYSTEM_INSTRUCTION } from '@/services/gemini';
import { toast } from 'sonner';
import { Loader2, Send, Copy, MessageSquare, AlertTriangle, ShieldAlert, Star, Upload, FileText, X, Download } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import LegalDisclaimer from '@/components/LegalDisclaimer';
import { motion, AnimatePresence } from 'framer-motion';
import * as pdfjsLib from 'pdfjs-dist';
import ReactMarkdown from 'react-markdown';
import jsPDF from 'jspdf';

// Configure PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`;

export default function AiNoticeTools() {
  const { profile } = useAuth();
  const [noticeText, setNoticeText] = useState('');
  const [result, setResult] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [keyError, setKeyError] = useState<string | null>(null);
  const [isExtracting, setIsExtracting] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const extractTextFromPDF = async (file: File): Promise<string> => {
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    let fullText = '';
    
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const textContent = await page.getTextContent();
      const pageText = textContent.items.map((item: any) => item.str).join(' ');
      fullText += pageText + '\n';
    }
    
    return fullText;
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    setIsExtracting(true);
    
    try {
      if (file.type === 'application/pdf') {
        const text = await extractTextFromPDF(file);
        setNoticeText(text);
        toast.success('Text extracted from PDF successfully!');
      } else if (file.type === 'text/plain') {
        const text = await file.text();
        setNoticeText(text);
        toast.success('Text file loaded successfully!');
      } else if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = async (event) => {
          const base64 = event.target?.result as string;
          setNoticeText(`[Image: ${file.name} uploaded - AI will analyze this directly]`);
          setUploadedImage(base64);
          toast.success('Image loaded! AI will analyze the notice content from the image.');
        };
        reader.readAsDataURL(file);
      } else {
        toast.error('Unsupported file format. Please use PDF, TXT, or Image.');
        setFileName(null);
      }
    } catch (error) {
      console.error('File extraction error:', error);
      toast.error('Failed to extract text from file.');
      setFileName(null);
    } finally {
      setIsExtracting(false);
    }
  };

  const clearFile = () => {
    setFileName(null);
    setNoticeText('');
    setUploadedImage(null);
  };

  const handleGenerate = async () => {
    if (!noticeText.trim()) {
      toast.error('Please provide notice content first');
      return;
    }

    setIsGenerating(true);
    setKeyError(null);
    setResult('');
    try {
      await generateAIResponse(
        `Please analyze the following notice content (either extracted text or provided image) and draft a professional, legally structured reply. If an image is provided, extract the critical details like notice number, date, and allegations first. \n\nContent: ${noticeText}`,
        GST_NOTICE_SYSTEM_INSTRUCTION,
        uploadedImage || undefined,
        (chunk) => {
          setResult(prev => prev + chunk);
        }
      );
      
      if (profile?.uid) {
        await addDoc(collection(db, 'ai_usage_logs'), {
          userId: profile.uid,
          tool: 'notice',
          timestamp: new Date().toISOString(),
          prompt: noticeText.substring(0, 100),
        });
        await updateDoc(doc(db, 'users', profile.uid), { aiUsageCount: increment(1) });
      }
      toast.success('Reply generated successfully!');
    } catch (error: any) {
      console.error("Notice Reply Error:", error);
      const msg = error.message || 'Generation failed';
      toast.error(msg);
      if (msg.toLowerCase().includes('key') || msg.toLowerCase().includes('fail')) {
        const aKey = process.env.ANTHROPIC_API_KEY || "";
        const mKey = aKey ? `Anthropic: ${aKey.substring(0, 8)}...` : "Anthropic: None";
        setKeyError(`${msg} (${mKey})`);
      }
    } finally {
      setIsGenerating(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(result);
    toast.success('Copied to clipboard');
  };

  const downloadAsPdf = () => {
    if (!result) return;
    
    const doc = new jsPDF();
    const margin = 20;
    const pageWidth = doc.internal.pageSize.getWidth();
    const contentWidth = pageWidth - (2 * margin);
    
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(22);
    doc.text('GST NOTICE REPLY', margin, 25);
    
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100);
    doc.text(`Consultant: Waseem Khan • GSTSmartAI.com`, margin, 32);
    doc.text(`Generated on ${new Date().toLocaleDateString()}`, margin, 37);
    
    doc.setDrawColor(200);
    doc.line(margin, 43, pageWidth - margin, 43);
    
    doc.setFontSize(11);
    doc.setTextColor(0);
    
    // Simple text wrapping for PDF
    const splitText = doc.splitTextToSize(result, contentWidth);
    doc.text(splitText, margin, 50);
    
    doc.save(`Notice_Reply_${new Date().toISOString().slice(0,10)}.pdf`);
    toast.success('PDF downloaded successfully!');
  };

  return (
    <div className="space-y-10">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-4xl md:text-5xl font-black tracking-tighter uppercase">Notice Responder</h1>
          <p className="text-muted-foreground font-medium italic">Powered by Advanced Legal AI</p>
        </div>
      </div>

      {keyError && (
        <Alert variant="destructive" className="bg-destructive/10 border-destructive/20 animate-pulse rounded-2xl">
          <ShieldAlert className="h-4 w-4" />
          <AlertTitle className="text-xs font-black uppercase tracking-widest">Critical API Service Error</AlertTitle>
          <AlertDescription className="text-sm font-bold leading-relaxed pt-1">
            {keyError}
          </AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
        <motion.div 
           initial={{ opacity: 0, y: 20 }}
           animate={{ opacity: 1, y: 0 }}
        >
          <Card className="glass-card shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-5">
               <ShieldAlert className="h-24 w-24" />
            </div>
            <CardHeader className="border-b bg-muted/5 flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-lg">Notice Content</CardTitle>
                <CardDescription>Paste text or upload a document (PDF/TXT)</CardDescription>
              </div>
              <div className="flex gap-2">
                <input
                  type="file"
                  ref={fileInputRef}
                  className="hidden"
                  accept=".pdf,.txt,image/*"
                  onChange={handleFileUpload}
                  disabled={isExtracting || isGenerating}
                />
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isExtracting || isGenerating}
                  className="h-8 font-bold text-xs uppercase tracking-widest gap-2"
                >
                  {isExtracting ? <Loader2 className="h-3 w-3 animate-spin" /> : <Upload className="h-3 w-3" />}
                  {fileName ? 'Change File' : 'Upload File'}
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              <AnimatePresence>
                {fileName && (
                  <motion.div 
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="bg-primary/5 border border-primary/20 rounded-xl p-3 flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3 truncate">
                      <FileText className="h-5 w-5 text-primary shrink-0" />
                      <span className="text-sm font-bold truncate">{fileName}</span>
                    </div>
                    <Button variant="ghost" size="sm" onClick={clearFile} className="h-8 w-8 p-0 hover:bg-destructive/10 hover:text-destructive">
                      <X className="h-4 w-4" />
                    </Button>
                  </motion.div>
                )}
              </AnimatePresence>

              <Textarea 
                placeholder={isExtracting ? "Extracting text..." : "Paste notice text here (e.g. ASMT-10 contents)..."}
                className="min-h-[350px] text-sm leading-relaxed glass resize-none p-4"
                value={noticeText}
                onChange={(e) => setNoticeText(e.target.value)}
                disabled={isExtracting}
              />
              <Button 
                onClick={handleGenerate} 
                disabled={isGenerating || !noticeText.trim()}
                className="w-full btn-intelligent h-14 text-base font-bold shadow-xl shadow-primary/20"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    AI is Analyzing Law Precedents...
                  </>
                ) : (
                  <>
                    <Send className="mr-2 h-5 w-5" />
                    Generate Professional Reply
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div 
           initial={{ opacity: 0, y: 20 }}
           animate={{ opacity: 1, y: 0 }}
           transition={{ delay: 0.1 }}
           className="h-full"
        >
          <Card className="glass-card shadow-2xl min-h-[560px] flex flex-col">
            <CardHeader className="border-b bg-muted/5 flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-lg">AI Generated Draft</CardTitle>
                <CardDescription>Review and download your legal response</CardDescription>
              </div>
              {result && (
                <div className="flex gap-2">
                   <Button variant="outline" size="sm" onClick={copyToClipboard} className="font-bold">
                    Copy
                  </Button>
                  <Button variant="outline" size="sm" onClick={downloadAsPdf} className="font-bold">
                    <Download className="h-3 w-3 mr-1" />
                    PDF
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => window.print()} className="font-bold">
                    Print
                  </Button>
                </div>
              )}
            </CardHeader>
            <CardContent className="p-0 flex-1 overflow-hidden">
              <ScrollArea className="h-[480px] p-6">
                {!result && !isGenerating ? (
                  <div className="h-full flex flex-col items-center justify-center text-center space-y-4 opacity-30 mt-20">
                    <div className="bg-muted p-6 rounded-full text-muted-foreground">
                      <Star className="h-12 w-12" />
                    </div>
                    <p className="max-w-xs text-sm font-medium">Your professional tax reply will appear here after analysis.</p>
                  </div>
                ) : (
                  <div className="prose prose-sm lg:prose-base dark:prose-invert max-w-none whitespace-pre-wrap leading-relaxed animate-in fade-in slide-in-from-bottom-4 duration-500">
                    {isGenerating ? result : <ReactMarkdown>{result}</ReactMarkdown>}
                  </div>
                )}
              </ScrollArea>
            </CardContent>
          </Card>
        </motion.div>
      </div>
      <LegalDisclaimer />
    </div>
  );
}


