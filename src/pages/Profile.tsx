import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Shield, Zap, Mail, Calendar, User as UserIcon, Building2, Save, Loader2 } from 'lucide-react';
import { db } from '@/lib/firebase';
import { doc, updateDoc } from 'firebase/firestore';
import { toast } from 'sonner';

export default function Profile() {
  const { user, profile } = useAuth();
  const [businessName, setBusinessName] = useState('');
  const [businessGstin, setBusinessGstin] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (profile) {
      setBusinessName(profile.businessName || '');
      setBusinessGstin(profile.businessGstin || '');
    }
  }, [profile]);

  const handleSaveBusiness = async () => {
    if (!user?.uid) return;
    setIsSaving(true);
    try {
      await updateDoc(doc(db, 'users', user.uid), {
        businessName,
        businessGstin
      });
      toast.success('Business details updated!');
    } catch (error) {
      toast.error('Failed to update details');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Account Profile</h1>
        <p className="text-muted-foreground">Manage your account settings and business details.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <Card className="lg:col-span-1">
          <CardHeader className="text-center border-b bg-muted/30">
            <div className="flex justify-center mb-4">
              <Avatar className="h-24 w-24 border-4 border-primary/10">
                <AvatarImage src={user?.photoURL || ""} />
                <AvatarFallback className="text-3xl">{user?.displayName?.[0] || "U"}</AvatarFallback>
              </Avatar>
            </div>
            <CardTitle>{user?.displayName}</CardTitle>
            <CardDescription>{user?.email}</CardDescription>
            <div className="pt-4">
              <Badge variant={profile?.plan === 'pro' ? 'default' : 'secondary'} className="px-4 py-1">
                {profile?.plan?.toUpperCase()} PLAN
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4 pt-6">
            <div className="flex items-center gap-3 text-sm">
              <Shield className="h-4 w-4 text-muted-foreground" />
              <span>Status: Active</span>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span>Joined: {new Date(user?.metadata.creationTime || '').toLocaleDateString()}</span>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <Zap className="h-4 w-4 text-muted-foreground" />
              <span>AI Usage: {profile?.aiUsageCount} lifetime requests</span>
            </div>
          </CardContent>
        </Card>

        <div className="lg:col-span-2 space-y-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5 text-primary" />
                Business Settings
              </CardTitle>
              <CardDescription>Default details used for generating invoices.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="b-name">Registered Business Name</Label>
                  <Input 
                    id="b-name" 
                    value={businessName} 
                    onChange={e => setBusinessName(e.target.value)} 
                    placeholder="Enter your company name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="b-gstin">Your GSTIN</Label>
                  <Input 
                    id="b-gstin" 
                    value={businessGstin} 
                    onChange={e => setBusinessGstin(e.target.value)} 
                    placeholder="e.g. 07AAAAA0000A1Z5"
                  />
                </div>
              </div>
            </CardContent>
            <CardFooter className="border-t bg-muted/10">
              <Button onClick={handleSaveBusiness} disabled={isSaving} className="ml-auto flex items-center gap-2">
                {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                Save Business Profile
              </Button>
            </CardFooter>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Security & Preferences</CardTitle>
              <CardDescription>Update your personal information and login methods.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <p className="text-sm font-medium">Display Name</p>
                <div className="p-3 bg-muted rounded-md text-sm">{user?.displayName || 'Not Set'}</div>
              </div>
              <div className="space-y-2">
                <p className="text-sm font-medium">Email Address</p>
                <div className="p-3 bg-muted rounded-md text-sm">{user?.email}</div>
              </div>
              <div className="space-y-4 pt-6 border-t">
                <h3 className="font-bold">Subscription Details</h3>
                <div className="p-4 bg-primary/5 rounded-lg border border-primary/20 flex items-center justify-between">
                  <div className="space-y-1">
                    <p className="font-bold">GSTSmartAI.com {profile?.plan === 'pro' ? '(Active)' : '(Inactive)'}</p>
                    <p className="text-xs text-muted-foreground">
                      {profile?.plan === 'pro' ? 'Unlimited access to all AI tools and features.' : 'Upgrade to get unlimited AI requests and pro invoicing.'}
                    </p>
                  </div>
                  {profile?.plan === 'free' && (
                    <Button size="sm">Upgrade</Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
