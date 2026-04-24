import { useState, useRef, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { db } from '@/lib/firebase';
import { collection, addDoc, doc, updateDoc, increment } from 'firebase/firestore';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { generateAIResponse, GST_COMPLIANCE_SYSTEM_INSTRUCTION } from '@/services/gemini';
import { toast } from 'sonner';
import { Loader2, Send, Bot, User, ShieldAlert, Image as ImageIcon, X } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import ReactMarkdown from 'react-markdown';
import { motion, AnimatePresence } from 'framer-motion';

interface Message {
  role: 'user' | 'ai';
  content: string;
  image?: string;
}

export default function AiChat() {
  const { user, profile } = useAuth();
  const [messages, setMessages] = useState<Message[]>([
    { role: 'ai', content: 'Hello! I am your GSTSmartAI assistant. Aap mujhse GST rules, rates ya notices ke baare mein Hindi, Hinglish ya English mein pooch sakte hain. How can I help you today?' }
  ]);
  const [input, setInput] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [keyError, setKeyError] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Image size should be less than 5MB');
        return;
      }
      const reader = new FileReader();
      reader.onload = (event) => {
        setSelectedImage(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSend = async () => {
    if ((!input.trim() && !selectedImage) || isGenerating) return;

    const userMessage = input.trim();
    const currentImage = selectedImage;
    setInput('');
    setSelectedImage(null);
    setMessages(prev => [
      ...prev, 
      { role: 'user', content: userMessage, image: currentImage || undefined },
      { role: 'ai', content: '' }
    ]);
    
    setIsGenerating(true);
    setKeyError(null);
    try {
      // Create context from last 5 messages
      const historyContext = messages.slice(-5).map(m => `${m.role.toUpperCase()}: ${m.content}`).join('\n');
      const enrichedPrompt = `Chat History:\n${historyContext}\n\nUSER: ${userMessage || "Please analyze this image related to GST."}`;

      await generateAIResponse(
        enrichedPrompt, 
        GST_COMPLIANCE_SYSTEM_INSTRUCTION,
        currentImage || undefined,
        (chunk) => {
          setMessages(prev => {
            const newMsgs = [...prev];
            const lastIdx = newMsgs.length - 1;
            if (newMsgs[lastIdx].role === 'ai') {
              newMsgs[lastIdx].content += chunk;
            }
            return [...newMsgs];
          });
        }
      );
      
      if (profile?.uid) {
        await addDoc(collection(db, 'ai_usage_logs'), {
          userId: profile.uid,
          tool: 'chat',
          timestamp: new Date().toISOString(),
          prompt: userMessage.substring(0, 100),
          hasImage: !!currentImage
        });
        await updateDoc(doc(db, 'users', profile.uid), { aiUsageCount: increment(1) });
      }
    } catch (error: any) {
      console.error("Chat Error:", error);
      const msg = error.message || 'Failed to get AI response';
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

  return (
    <div className="h-[calc(100vh-8rem)] flex flex-col gap-4">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">GSTSmartAI.com AI Assistant</h1>
        <p className="text-muted-foreground">Premium Tax Intelligence System for GST compliance and rules.</p>
      </div>

      {keyError && (
        <Alert variant="destructive" className="bg-destructive/10 border-destructive/20 animate-pulse">
          <ShieldAlert className="h-4 w-4" />
          <AlertTitle className="text-xs font-black uppercase tracking-widest">Critical API Service Error</AlertTitle>
          <AlertDescription className="text-sm font-bold leading-relaxed pt-1">
            {keyError}
          </AlertDescription>
        </Alert>
      )}

      <Card className="flex-1 flex flex-col overflow-hidden">
        <CardHeader className="border-b bg-muted/30">
          <div className="flex items-center gap-3">
            <div className="bg-primary p-2 rounded-full">
              <Bot className="h-5 w-5 text-white" />
            </div>
            <div>
              <CardTitle className="text-base">GSTSmartAI</CardTitle>
              <CardDescription className="text-xs">Always online • Powered by Claude 3.5 Sonnet</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="flex-1 overflow-hidden p-0">
          <ScrollArea ref={scrollRef} className="h-full p-4">
            <div className="space-y-4">
              {messages.map((msg, i) => (
                <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`flex gap-3 max-w-[80%] ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                    <Avatar className="h-8 w-8 mt-1">
                      {msg.role === 'user' ? (
                        <>
                          <AvatarImage src={user?.photoURL || ""} />
                          <AvatarFallback><User className="h-4 w-4" /></AvatarFallback>
                        </>
                      ) : (
                        <div className="bg-primary text-white h-full w-full flex items-center justify-center">
                          <Bot className="h-4 w-4" />
                        </div>
                      )}
                    </Avatar>
                    <div className={`rounded-2xl px-4 py-2 text-sm max-w-full overflow-hidden ${
                      msg.role === 'user' 
                        ? 'bg-primary text-primary-foreground rounded-tr-none' 
                        : 'bg-muted rounded-tl-none prose prose-sm dark:prose-invert prose-p:leading-relaxed prose-pre:bg-background/50'
                    }`}>
                      {msg.image && (
                        <div className="mb-2 rounded-lg overflow-hidden border border-white/20">
                          <img src={msg.image} alt="User upload" className="max-h-60 w-auto object-contain" referrerPolicy="no-referrer" />
                        </div>
                      )}
                      {msg.role === 'user' ? (
                        msg.content
                      ) : (
                        (isGenerating && messages.indexOf(msg) === messages.length - 1) ? (
                          <div className="whitespace-pre-wrap">{msg.content}</div>
                        ) : (
                          <ReactMarkdown>{msg.content}</ReactMarkdown>
                        )
                      )}
                    </div>
                  </div>
                </div>
              ))}
              {isGenerating && (
                <div className="flex justify-start">
                  <div className="flex gap-3 max-w-[80%]">
                    <div className="bg-primary text-white h-8 w-8 rounded-full flex items-center justify-center">
                      <Bot className="h-4 w-4" />
                    </div>
                    <div className="bg-muted rounded-2xl rounded-tl-none px-4 py-3 flex items-center gap-1">
                      <div className="h-1.5 w-1.5 bg-foreground/30 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                      <div className="h-1.5 w-1.5 bg-foreground/30 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                      <div className="h-1.5 w-1.5 bg-foreground/30 rounded-full animate-bounce"></div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>
        </CardContent>
        <CardFooter className="p-4 border-t bg-muted/10 flex flex-col gap-3">
          <AnimatePresence>
            {selectedImage && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="w-full flex items-center gap-3 p-2 bg-muted/50 rounded-xl"
              >
                <div className="relative h-16 w-16 rounded-lg overflow-hidden border border-primary/20">
                  <img src={selectedImage} alt="selected" className="h-full w-full object-cover" referrerPolicy="no-referrer" />
                  <button 
                    onClick={() => setSelectedImage(null)}
                    className="absolute top-1 right-1 bg-background/80 rounded-full p-0.5"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
                <span className="text-xs text-muted-foreground font-medium">Image ready for analysis</span>
              </motion.div>
            )}
          </AnimatePresence>
          <form 
            onSubmit={(e) => { e.preventDefault(); handleSend(); }}
            className="flex w-full gap-2"
          >
            <input 
              type="file" 
              ref={fileInputRef} 
              className="hidden" 
              accept="image/*"
              onChange={handleImageSelect}
              disabled={isGenerating}
            />
            <Button 
              type="button" 
              variant="ghost" 
              size="icon" 
              onClick={() => fileInputRef.current?.click()}
              disabled={isGenerating}
            >
              <ImageIcon className="h-5 w-5" />
            </Button>
            <Input 
              placeholder="Ask about GST rules, rates..." 
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={isGenerating}
              className="flex-1"
            />
            <Button type="submit" disabled={isGenerating || (!input.trim() && !selectedImage)}>
              {isGenerating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            </Button>
          </form>
        </CardFooter>
      </Card>
      
      <div className="flex items-center gap-2 text-[10px] text-muted-foreground justify-center">
        <ShieldAlert className="h-3 w-3" />
        <span>AI models can make mistakes. Always verify tax data with official sources.</span>
      </div>
    </div>
  );
}
