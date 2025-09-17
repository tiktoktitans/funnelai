'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { Search, Download, Mail, User, Calendar, MessageSquare, Filter } from 'lucide-react';
import { formatDateTime } from '@/lib/utils';

export default function FormsPage() {
  const { toast } = useToast();
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');

  useEffect(() => {
    fetchSubmissions();
  }, []);

  const fetchSubmissions = async () => {
    try {
      const response = await fetch('/api/forms/submissions');
      if (!response.ok) throw new Error('Failed to fetch submissions');
      const data = await response.json();
      setSubmissions(data);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to load form submissions',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const exportToCSV = () => {
    const headers = ['Date', 'Name', 'Email', 'Form Type', 'Project'];
    const rows = submissions.map(s => [
      new Date(s.createdAt).toLocaleString(),
      s.data.name,
      s.data.email,
      s.form.kind,
      s.form.project.name,
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(r => r.join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `submissions-${Date.now()}.csv`;
    a.click();
  };

  const filteredSubmissions = submissions.filter(submission => {
    const matchesSearch =
      submission.data.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      submission.data.email?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesFilter =
      filterType === 'all' || submission.form.kind === filterType;

    return matchesSearch && matchesFilter;
  });

  const stats = {
    total: submissions.length,
    optins: submissions.filter(s => s.form.kind === 'OPTIN').length,
    applications: submissions.filter(s => s.form.kind === 'APPLICATION').length,
    today: submissions.filter(s =>
      new Date(s.createdAt).toDateString() === new Date().toDateString()
    ).length,
  };

  return (
    <div className="container mx-auto py-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Form Submissions</h1>
          <p className="text-muted-foreground">
            Manage and export your form submissions
          </p>
        </div>
        <Button onClick={exportToCSV} disabled={submissions.length === 0}>
          <Download className="mr-2 h-4 w-4" />
          Export CSV
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-4 mb-8">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">
              Total Submissions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">
              Opt-ins
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.optins}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">
              Applications
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.applications}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">
              Today
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.today}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Submissions</CardTitle>
            <div className="flex items-center gap-4">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8 w-[200px]"
                />
              </div>
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="px-3 py-2 border rounded-md"
              >
                <option value="all">All Types</option>
                <option value="OPTIN">Opt-in</option>
                <option value="APPLICATION">Application</option>
                <option value="CONTACT">Contact</option>
              </select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8 text-muted-foreground">
              Loading submissions...
            </div>
          ) : filteredSubmissions.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No submissions found
            </div>
          ) : (
            <div className="space-y-4">
              {filteredSubmissions.map((submission) => (
                <div
                  key={submission.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-start gap-4">
                    <div className="p-2 bg-primary/10 rounded-full">
                      <User className="h-4 w-4 text-primary" />
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{submission.data.name}</span>
                        <Badge variant="outline" className="text-xs">
                          {submission.form.kind}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Mail className="h-3 w-3" />
                          {submission.data.email}
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {formatDateTime(submission.createdAt)}
                        </span>
                      </div>
                      {submission.data.message && (
                        <div className="flex items-start gap-1 text-sm">
                          <MessageSquare className="h-3 w-3 text-muted-foreground mt-1" />
                          <span>{submission.data.message}</span>
                        </div>
                      )}
                      <p className="text-xs text-muted-foreground">
                        Project: {submission.form.project?.name || 'Unknown'}
                      </p>
                    </div>
                  </div>
                  <Button variant="outline" size="sm">
                    View Details
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}