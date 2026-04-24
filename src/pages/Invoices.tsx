import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { db } from '@/lib/firebase';
import { collection, query, where, getDocs, addDoc, deleteDoc, doc, orderBy, limit } from 'firebase/firestore';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Plus, Download, Trash2, FileText, Loader2, Eye, Printer, Send, IndianRupee, Share2, MessageCircle } from 'lucide-react';
import { toast } from 'sonner';
import { Invoice, InvoiceItem } from '@/types';
import { INDIAN_STATES } from '@/constants/states';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { motion, AnimatePresence } from 'framer-motion';

export default function Invoices() {
  const { profile } = useAuth();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  
  // Form State
  const [invoiceNumber, setInvoiceNumber] = useState('');
  const [businessName, setBusinessName] = useState('');
  const [businessGstin, setBusinessGstin] = useState('');
  const [businessState, setBusinessState] = useState('Rajasthan');
  const [clientName, setClientName] = useState('');
  const [clientGstin, setClientGstin] = useState('');
  const [clientState, setClientState] = useState('Rajasthan');
  const [items, setItems] = useState<InvoiceItem[]>([
    { description: '', hsnSac: '', quantity: 1, rate: 0, amount: 0, gstRate: 18 }
  ]);

  const [invoiceToDelete, setInvoiceToDelete] = useState<string | null>(null);

  useEffect(() => {
    fetchInvoices();
    if (profile) {
      setBusinessName(profile.businessName || '');
      setBusinessGstin(profile.businessGstin || '');
    }
  }, [profile]);

  useEffect(() => {
    // Generate auto invoice number
    if (invoices.length >= 0) {
      const year = new Date().getFullYear();
      setInvoiceNumber(`INV/${year}/${(invoices.length + 1).toString().padStart(3, '0')}`);
    }
  }, [invoices.length]);

  const fetchInvoices = async () => {
    if (!profile?.uid) return;
    setLoading(true);
    try {
      const q = query(
        collection(db, 'invoices'), 
        where('userId', '==', profile.uid),
        orderBy('date', 'desc')
      );
      const snap = await getDocs(q);
      setInvoices(snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Invoice)));
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const addItem = () => setItems([...items, { description: '', hsnSac: '', quantity: 1, rate: 0, amount: 0, gstRate: 18 }]);
  const removeItem = (index: number) => setItems(items.filter((_, i) => i !== index));
  
  const updateItem = (index: number, field: keyof InvoiceItem, value: any) => {
    const newItems = [...items];
    const item = { ...newItems[index], [field]: value };
    
    // Auto calculate amount when quantity or rate changes
    if (field === 'quantity' || field === 'rate') {
      item.amount = (item.quantity || 0) * (item.rate || 0);
    }
    
    newItems[index] = item;
    setItems(newItems);
  };

  const calculateTotals = () => {
    let totalTaxable = 0;
    let totalTax = 0;
    
    items.forEach(item => {
      totalTaxable += item.amount;
      totalTax += (item.amount * item.gstRate) / 100;
    });

    const isInterState = businessState !== clientState;
    const cgst = isInterState ? 0 : totalTax / 2;
    const sgst = isInterState ? 0 : totalTax / 2;
    const igst = isInterState ? totalTax : 0;

    return { 
      totalTaxable, 
      totalTax, 
      cgst, 
      sgst, 
      igst, 
      grandTotal: totalTaxable + totalTax 
    };
  };

  const handleSave = async () => {
    if (!profile?.uid) return;
    if (!clientName || items.some(i => !i.description || i.amount <= 0)) {
      toast.error('Please fill client name and item details');
      return;
    }

    const { totalTaxable, totalTax, cgst, sgst, igst, grandTotal } = calculateTotals();
    
    const invoice: Omit<Invoice, 'id'> = {
      userId: profile.uid,
      invoiceNumber,
      date: new Date().toISOString(),
      businessName,
      businessGstin,
      businessState,
      clientName,
      clientGstin,
      clientState,
      items,
      totalAmount: totalTaxable,
      totalGst: totalTax,
      cgst,
      sgst,
      igst,
      grandTotal
    };

    try {
      await addDoc(collection(db, 'invoices'), invoice);
      toast.success('Invoice saved to database!');
      setIsAdding(false);
      fetchInvoices();
    } catch (error) {
      toast.error('Failed to save invoice');
    }
  };

  const generatePdfBlob = (inv: Invoice): Blob => {
    const doc = new jsPDF();
    const margin = 15;
    const pageWidth = doc.internal.pageSize.getWidth();

    // Title
    doc.setFillColor(37, 99, 235);
    doc.rect(0, 0, pageWidth, 40, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(24);
    doc.setFont('helvetica', 'bold');
    doc.text('TAX INVOICE', margin, 25);
    
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.text(`GST COMPLIANT DRAFT`, margin, 32);

    doc.setTextColor(0, 0, 0);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text('FROM:', margin, 50);
    doc.setFont('helvetica', 'normal');
    doc.text(inv.businessName, margin, 55);
    doc.text(`GSTIN: ${inv.businessGstin}`, margin, 60);
    doc.text(`State: ${inv.businessState}`, margin, 65);

    doc.setFont('helvetica', 'bold');
    doc.text('TO:', 110, 50);
    doc.setFont('helvetica', 'normal');
    doc.text(inv.clientName, 110, 55);
    doc.text(`GSTIN: ${inv.clientGstin || 'URP'}`, 110, 60);
    doc.text(`State: ${inv.clientState}`, 110, 65);

    doc.setFont('helvetica', 'bold');
    doc.text('INVOICE #:', 160, 50);
    doc.setFont('helvetica', 'normal');
    doc.text(inv.invoiceNumber, 160, 55);
    doc.text('DATE:', 160, 60);
    doc.text(new Date(inv.date).toLocaleDateString(), 160, 65);

    const tableData = inv.items.map(item => [
      item.description,
      item.hsnSac || '-',
      item.quantity.toString(),
      `Rs. ${item.rate.toLocaleString('en-IN')}`,
      `${item.gstRate}%`,
      `Rs. ${item.amount.toLocaleString('en-IN')}`
    ]);

    autoTable(doc, {
      startY: 75,
      head: [['Description', 'HSN/SAC', 'Qty', 'Rate', 'GST', 'Amount']],
      body: tableData,
      theme: 'grid',
      headStyles: { fillColor: [37, 99, 235], textColor: [255, 255, 255], fontStyle: 'bold' },
      styles: { fontSize: 9, cellPadding: 3 },
      columnStyles: {
        3: { halign: 'right' },
        5: { halign: 'right' }
      }
    });

    const finalY = (doc as any).lastAutoTable.finalY + 10;
    const totalX = 140;
    doc.setFontSize(10);
    doc.text('Taxable Amount:', totalX, finalY);
    doc.text(`Rs. ${inv.totalAmount.toLocaleString('en-IN')}`, 190, finalY, { align: 'right' });
    
    let currentY = finalY + 6;
    if (inv.igst && inv.igst > 0) {
      doc.text(`IGST:`, totalX, currentY);
      doc.text(`Rs. ${inv.igst.toLocaleString('en-IN')}`, 190, currentY, { align: 'right' });
      currentY += 6;
    } else {
      doc.text(`CGST:`, totalX, currentY);
      doc.text(`Rs. ${(inv.cgst || 0).toLocaleString('en-IN')}`, 190, currentY, { align: 'right' });
      currentY += 6;
      doc.text(`SGST:`, totalX, currentY);
      doc.text(`Rs. ${(inv.sgst || 0).toLocaleString('en-IN')}`, 190, currentY, { align: 'right' });
      currentY += 6;
    }

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.setTextColor(37, 99, 235);
    doc.text('Grand Total:', totalX, currentY + 4);
    doc.text(`Rs. ${inv.grandTotal.toLocaleString('en-IN')}`, 190, currentY + 4, { align: 'right' });

    doc.setTextColor(0, 0, 0);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'italic');
    doc.setTextColor(150, 150, 150);
    doc.text('This is a computer-generated invoice and does not require a physical signature.', margin, 285);

    return doc.output('blob');
  };

  const downloadPdf = (inv: Invoice) => {
    try {
      const blob = generatePdfBlob(inv);
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${inv.invoiceNumber}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      toast.success('Professional Invoice PDF generated!');
    } catch (err) {
      console.error('PDF Generation Error:', err);
      toast.error('Failed to generate PDF. Please check console.');
    }
  };

  const shareToWhatsApp = async (inv: Invoice) => {
    try {
      const blob = generatePdfBlob(inv);
      const file = new File([blob], `${inv.invoiceNumber}.pdf`, { type: 'application/pdf' });

      // Check if navigator.share is available and supports files
      if (navigator.share && navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({
          files: [file],
          title: `Invoice ${inv.invoiceNumber}`,
          text: `Professional Tax Invoice for ${inv.clientName} from ${inv.businessName}`,
        });
        return;
      }
    } catch (e) {
      console.error("Web Share failed:", e);
    }

    // Fallback to text sharing if Web Share fails or is not supported
    const text = `
*TAX INVOICE - GST COMPLIANT*
--------------------------
*From:* ${inv.businessName}
*Invoice #:* ${inv.invoiceNumber}
*Date:* ${new Date(inv.date).toLocaleDateString('en-IN')}
--------------------------
*Client:* ${inv.clientName}
*Total Amount:* ₹${inv.grandTotal.toLocaleString('en-IN')}
--------------------------
_Generated via GSTSmartAI.com_
    `.trim();
    
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(text)}`;
    window.open(whatsappUrl, '_blank');
  };

  const totals = calculateTotals();

  return (
    <div className="space-y-10">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-4xl md:text-5xl font-black tracking-tighter uppercase">Invoice Studio</h1>
          <p className="text-muted-foreground font-medium italic">Generate GSIT-Compliant B2B & B2C Invoices</p>
        </div>
        <Button onClick={() => setIsAdding(true)} className="btn-intelligent shadow-xl shadow-primary/20 gap-2 h-12 px-6">
          <Plus className="h-5 w-5" />
          <span className="font-bold">Create Professional Invoice</span>
        </Button>
      </div>

      <AnimatePresence>
        {isAdding && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
          >
            <Card className="glass-card shadow-2xl relative overflow-hidden border-primary/20">
              <CardHeader className="bg-primary/5 border-b flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Invoice Editor</CardTitle>
                  <CardDescription>Live preview updates automatically based on state logic</CardDescription>
                </div>
                <Button variant="ghost" size="sm" onClick={() => setIsAdding(false)}>Cancel</Button>
              </CardHeader>
              <CardContent className="p-8">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                  {/* Form Side */}
                  <div className="lg:col-span-8 space-y-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                       <div className="space-y-4 p-4 border rounded-2xl bg-muted/20">
                          <h3 className="text-xs font-black uppercase tracking-widest text-primary">Your Business (Seller)</h3>
                          <div className="space-y-3">
                            <div className="space-y-1">
                              <Label className="text-[10px] font-bold uppercase opacity-60">Legal Name</Label>
                              <Input value={businessName} onChange={e => setBusinessName(e.target.value)} className="glass" />
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                              <div className="space-y-1">
                                <Label className="text-[10px] font-bold uppercase opacity-60">GSTIN</Label>
                                <Input value={businessGstin} onChange={e => setBusinessGstin(e.target.value)} className="glass text-xs" />
                              </div>
                              <div className="space-y-1">
                                <Label className="text-[10px] font-bold uppercase opacity-60">State</Label>
                                <Select value={businessState} onValueChange={setBusinessState}>
                                  <SelectTrigger className="glass h-9 text-xs">
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {INDIAN_STATES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                                  </SelectContent>
                                </Select>
                              </div>
                            </div>
                          </div>
                       </div>

                       <div className="space-y-4 p-4 border rounded-2xl bg-muted/20">
                          <h3 className="text-xs font-black uppercase tracking-widest text-orange-600">Client Details (Buyer)</h3>
                          <div className="space-y-3">
                            <div className="space-y-1">
                              <Label className="text-[10px] font-bold uppercase opacity-60">Client Name</Label>
                              <Input value={clientName} onChange={e => setClientName(e.target.value)} className="glass" placeholder="e.g. Acme Corp" />
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                              <div className="space-y-1">
                                <Label className="text-[10px] font-bold uppercase opacity-60">State of Supply</Label>
                                <Select value={clientState} onValueChange={setClientState}>
                                  <SelectTrigger className="glass h-9 text-xs">
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {INDIAN_STATES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                                  </SelectContent>
                                </Select>
                              </div>
                              <div className="space-y-1">
                                <Label className="text-[10px] font-bold uppercase opacity-60">Invoice Date</Label>
                                <Input type="date" className="glass h-9 text-xs" defaultValue={new Date().toISOString().split('T')[0]} />
                              </div>
                            </div>
                          </div>
                       </div>
                    </div>

                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                         <h3 className="text-sm font-black uppercase tracking-widest">Line Items</h3>
                         <Button variant="outline" size="sm" onClick={addItem} className="h-8 font-bold text-[10px] uppercase tracking-wider">Add Item</Button>
                      </div>
                      <div className="border rounded-2xl overflow-hidden">
                        <Table>
                          <TableHeader className="bg-muted/50">
                            <TableRow>
                              <TableHead className="text-[10px] font-black uppercase tracking-tighter">Description & HSN</TableHead>
                              <TableHead className="w-[80px] text-[10px] font-black uppercase tracking-tighter">Qty</TableHead>
                              <TableHead className="w-[120px] text-[10px] font-black uppercase tracking-tighter">Rate</TableHead>
                              <TableHead className="w-[100px] text-[10px] font-black uppercase tracking-tighter">GST %</TableHead>
                              <TableHead className="w-[40px]"></TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {items.map((item, index) => (
                              <TableRow key={index} className="hover:bg-muted/30">
                                <TableCell>
                                  <div className="space-y-1">
                                    <Input value={item.description} onChange={e => updateItem(index, 'description', e.target.value)} className="h-8 text-sm" placeholder="Service Descr." />
                                    <Input value={item.hsnSac} onChange={e => updateItem(index, 'hsnSac', e.target.value)} className="h-6 text-[10px] opacity-60 italic" placeholder="HSN/SAC" />
                                  </div>
                                </TableCell>
                                <TableCell>
                                  <Input type="number" value={item.quantity} onChange={e => updateItem(index, 'quantity', parseFloat(e.target.value))} className="h-8 text-sm" />
                                </TableCell>
                                <TableCell>
                                  <div className="relative">
                                    <IndianRupee className="absolute left-2 top-2.5 h-3 w-3 text-muted-foreground" />
                                    <Input type="number" value={item.rate} onChange={e => updateItem(index, 'rate', parseFloat(e.target.value))} className="h-8 text-sm pl-6" />
                                  </div>
                                </TableCell>
                                <TableCell>
                                  <Select value={item.gstRate.toString()} onValueChange={v => updateItem(index, 'gstRate', parseInt(v))}>
                                    <SelectTrigger className="h-8 text-xs">
                                      <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                      {[0, 5, 12, 18, 28].map(r => <SelectItem key={r} value={r.toString()}>{r}%</SelectItem>)}
                                    </SelectContent>
                                  </Select>
                                </TableCell>
                                <TableCell>
                                  <Button variant="ghost" size="sm" onClick={() => removeItem(index)} className="h-8 w-8 p-0 text-destructive hover:bg-destructive/10"><Trash2 className="h-4 w-4" /></Button>
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    </div>
                  </div>

                  {/* Summary Side */}
                  <div className="lg:col-span-4 space-y-6">
                    <Card className="bg-slate-900 text-white border-none shadow-2xl p-6 space-y-6">
                       <div className="flex justify-between items-center border-b border-white/10 pb-4">
                          <p className="text-xs font-black uppercase tracking-widest text-white/50">Tax Summary</p>
                          <Badge className="bg-primary hover:bg-primary text-white border-none text-[8px] font-black tracking-tighter">
                            {businessState === clientState ? 'INTRA-STATE (CGST/SGST)' : 'INTER-STATE (IGST)'}
                          </Badge>
                       </div>
                       
                       <div className="space-y-4 font-mono">
                          <div className="flex justify-between text-xs">
                             <span className="opacity-60 uppercase">Taxable Value</span>
                             <span className="font-bold">₹{totals.totalTaxable.toLocaleString()}</span>
                          </div>
                          {totals.igst > 0 ? (
                            <div className="flex justify-between text-xs text-primary font-bold">
                               <span className="uppercase">IGST (Fixed)</span>
                               <span>₹{totals.igst.toLocaleString()}</span>
                            </div>
                          ) : (
                            <>
                              <div className="flex justify-between text-xs">
                                 <span className="opacity-60 uppercase">CGST (9%)</span>
                                 <span>₹{totals.cgst.toLocaleString()}</span>
                              </div>
                              <div className="flex justify-between text-xs">
                                 <span className="opacity-60 uppercase">SGST (9%)</span>
                                 <span>₹{totals.sgst.toLocaleString()}</span>
                              </div>
                            </>
                          )}
                          <div className="flex justify-between text-xl font-black border-t border-white/10 pt-4">
                             <span className="uppercase tracking-tighter text-sm mt-1.5 opacity-50">Total</span>
                             <span>₹{totals.grandTotal.toLocaleString()}</span>
                          </div>
                       </div>
                    </Card>

                    <div className="space-y-3 pt-6">
                       <Button onClick={handleSave} className="w-full btn-intelligent h-12 text-sm font-bold shadow-lg shadow-primary/20">
                          Save & Log Transaction
                       </Button>
                       <Button variant="outline" onClick={() => downloadPdf({ 
                         userId: profile?.uid || '', 
                         invoiceNumber, 
                         date: new Date().toISOString(),
                         businessName, businessGstin, businessState,
                         clientName, clientGstin, clientState,
                         items,
                         totalAmount: totals.totalTaxable,
                         totalGst: totals.totalTax,
                         cgst: totals.cgst, sgst: totals.sgst, igst: totals.igst,
                         grandTotal: totals.grandTotal
                       })} className="w-full glass h-12 text-sm font-bold gap-2">
                          <Download className="h-4 w-4" />
                          Download PDF Preview
                       </Button>
                       <Button variant="outline" onClick={() => shareToWhatsApp({ 
                         userId: profile?.uid || '', 
                         invoiceNumber, 
                         date: new Date().toISOString(),
                         businessName, businessGstin, businessState,
                         clientName, clientGstin, clientState,
                         items,
                         totalAmount: totals.totalTaxable,
                         totalGst: totals.totalTax,
                         cgst: totals.cgst, sgst: totals.sgst, igst: totals.igst,
                         grandTotal: totals.grandTotal
                       })} className="w-full bg-green-500/10 text-green-600 border-green-500/20 hover:bg-green-500/20 h-12 text-sm font-bold gap-2">
                          <MessageCircle className="h-4 w-4" />
                          Share on WhatsApp
                       </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 gap-6">
        <Card className="glass-card shadow-xl overflow-hidden border-muted/30">
          <CardHeader className="bg-muted/5 border-b p-6">
            <CardTitle className="text-xl">Invoice History</CardTitle>
            <CardDescription font-medium>Manage your previous professional filings</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
             <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/20">
                      <TableHead className="font-black uppercase tracking-widest text-[10px]">Reference</TableHead>
                      <TableHead className="font-black uppercase tracking-widest text-[10px]">Client / Entity</TableHead>
                      <TableHead className="font-black uppercase tracking-widest text-[10px]">Date</TableHead>
                      <TableHead className="font-black uppercase tracking-widest text-[10px]">Amount</TableHead>
                      <TableHead className="text-right font-black uppercase tracking-widest text-[10px]">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {loading ? (
                      <TableRow><TableCell colSpan={5} className="text-center py-16"><Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" /></TableCell></TableRow>
                    ) : invoices.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-24 text-muted-foreground">
                           <FileText className="h-12 w-12 mx-auto mb-4 opacity-5" />
                           <p className="font-bold">No Invoices Found</p>
                        </TableCell>
                      </TableRow>
                    ) : (
                      invoices.map((inv) => (
                        <TableRow key={inv.id} className="group hover:bg-muted/50 transition-colors">
                          <TableCell className="font-black text-primary">{inv.invoiceNumber}</TableCell>
                          <TableCell>
                             <div>
                               <p className="font-bold">{inv.clientName}</p>
                               <p className="text-[10px] text-muted-foreground opacity-60 uppercase font-bold">{inv.clientState}</p>
                             </div>
                          </TableCell>
                          <TableCell className="text-xs font-medium">{new Date(inv.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</TableCell>
                          <TableCell>
                             <div className="font-black">₹ {inv.grandTotal.toLocaleString()}</div>
                             <div className="text-[8px] uppercase tracking-tighter opacity-50">Incl. GST</div>
                          </TableCell>
                          <TableCell className="text-right">
                             <div className="flex justify-end gap-2">
                                <Button variant="ghost" size="sm" onClick={() => downloadPdf(inv)} title="Download PDF" className="h-8 w-8 p-0 hover:bg-primary/10 hover:text-primary">
                                   <Download className="h-4 w-4" />
                                </Button>
                                <Button variant="ghost" size="sm" onClick={() => shareToWhatsApp(inv)} title="Share on WhatsApp" className="h-8 w-8 p-0 hover:bg-green-100 hover:text-green-600">
                                   <MessageCircle className="h-4 w-4" />
                                </Button>
                                <Button variant="ghost" size="sm" onClick={() => inv.id && setInvoiceToDelete(inv.id)} title="Delete" className="h-8 w-8 p-0 hover:bg-destructive/10 hover:text-destructive">
                                   <Trash2 className="h-4 w-4" />
                                </Button>
                             </div>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
             </div>
          </CardContent>
        </Card>
      </div>

      {/* Delete Dialog */}
      <Dialog open={!!invoiceToDelete} onOpenChange={(open) => !open && setInvoiceToDelete(null)}>
        <DialogContent className="glass-card sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl font-black uppercase tracking-tight">Delete Transaction?</DialogTitle>
            <DialogDescription className="font-medium">
              This will remove the invoice from your cloud records. This action is irreversible.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0 mt-6">
            <Button variant="ghost" onClick={() => setInvoiceToDelete(null)} className="font-bold">Cancel</Button>
            <Button variant="destructive" onClick={async () => {
               if (invoiceToDelete) {
                 await deleteDoc(doc(db, 'invoices', invoiceToDelete));
                 fetchInvoices();
                 setInvoiceToDelete(null);
                 toast.success('Invoice deleted');
               }
            }} className="font-bold">Permanently Delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
