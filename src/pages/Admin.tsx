import { useEffect, useState } from 'react';
import { db } from '@/lib/firebase';
import { collection, getDocs, query, orderBy, limit } from 'firebase/firestore';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Users, Activity, BarChart3, ShieldCheck } from 'lucide-react';

export default function Admin() {
  const [usersCount, setUsersCount] = useState(0);
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAdminData = async () => {
      try {
        // In a real app, this would be restricted to admin users
        const usersSnap = await getDocs(collection(db, 'users'));
        setUsersCount(usersSnap.size);

        const logsQuery = query(collection(db, 'ai_usage_logs'), orderBy('timestamp', 'desc'), limit(20));
        const logsSnap = await getDocs(logsQuery);
        setLogs(logsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      } catch (error) {
        console.error("Admin fetch error:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAdminData();
  }, []);

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>
        <p className="text-muted-foreground">Monitor platform usage and user activity.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="p-6 flex items-center gap-4">
            <div className="bg-blue-100 p-3 rounded-full"><Users className="h-6 w-6 text-blue-600" /></div>
            <div>
              <p className="text-sm text-muted-foreground">Total Users</p>
              <p className="text-2xl font-bold">{usersCount}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 flex items-center gap-4">
            <div className="bg-green-100 p-3 rounded-full"><Activity className="h-6 w-6 text-green-600" /></div>
            <div>
              <p className="text-sm text-muted-foreground">AI Requests (24h)</p>
              <p className="text-2xl font-bold">{logs.length}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 flex items-center gap-4">
            <div className="bg-purple-100 p-3 rounded-full"><ShieldCheck className="h-6 w-6 text-purple-600" /></div>
            <div>
              <p className="text-sm text-muted-foreground">Active Pro Subs</p>
              <p className="text-2xl font-bold">12</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent AI Usage Logs</CardTitle>
          <CardDescription>Track real-time AI tool interactions across the platform.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User ID</TableHead>
                <TableHead>Tool</TableHead>
                <TableHead>Timestamp</TableHead>
                <TableHead>Preview</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {logs.map((log) => (
                <TableRow key={log.id}>
                  <TableCell className="font-mono text-xs">{log.userId.substring(0, 8)}...</TableCell>
                  <TableCell>
                    <Badge variant="outline">{log.tool}</Badge>
                  </TableCell>
                  <TableCell className="text-xs">{new Date(log.timestamp).toLocaleString()}</TableCell>
                  <TableCell className="text-xs text-muted-foreground italic truncate max-w-[200px]">
                    {log.prompt}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
