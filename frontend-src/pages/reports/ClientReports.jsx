import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  Plus, 
  FileText, 
  Download, 
  Mail, 
  Calendar,
  Search,
  Filter,
  MoreVertical,
  Eye
} from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';
import moment from 'moment';
import ReportBuilder from '@/components/reports/ReportBuilder';
import ClientAnalyticsDashboard from '@/components/reports/ClientAnalyticsDashboard';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';

export default function ClientReports() {
  const [showBuilder, setShowBuilder] = useState(false);
  const [selectedReport, setSelectedReport] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const queryClient = useQueryClient();

  const { data: reports = [], isLoading } = useQuery({
    queryKey: ['client-reports'],
    queryFn: async () => {
      const workspaces = await base44.entities.Workspace.filter({ status: 'active' });
      if (workspaces.length === 0) return [];
      return base44.entities.ClientReport.filter({ workspace_id: workspaces[0].id });
    }
  });

  const createReportMutation = useMutation({
    mutationFn: async (reportData) => {
      const workspaces = await base44.entities.Workspace.filter({ status: 'active' });
      return base44.entities.ClientReport.create({
        ...reportData,
        workspace_id: workspaces[0].id
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['client-reports'] });
      setShowBuilder(false);
      toast.success('Report created successfully');
    }
  });

  const generateReportMutation = useMutation({
    mutationFn: async (report) => {
      const response = await base44.functions.invoke('generateClientReport', {
        reportData: report
      });
      return response.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['client-reports'] });
      toast.success('Report generated successfully');
      window.open(data.pdf_url, '_blank');
    }
  });

  const handleSaveReport = async (reportData) => {
    await createReportMutation.mutateAsync(reportData);
  };

  const filteredReports = reports.filter(report =>
    report.report_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    report.client_email?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (showBuilder) {
    return (
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Create Client Report</h1>
            <p className="text-slate-600 mt-1">Configure and generate comprehensive analytics reports</p>
          </div>
          <Button variant="outline" onClick={() => setShowBuilder(false)}>
            Cancel
          </Button>
        </div>
        <ReportBuilder
          report={selectedReport}
          onSave={handleSaveReport}
          onClose={() => setShowBuilder(false)}
        />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Client Reports</h1>
          <p className="text-slate-600 mt-1">Manage and schedule client performance reports</p>
        </div>
        <Button onClick={() => { setSelectedReport(null); setShowBuilder(true); }}>
          <Plus className="w-4 h-4 mr-2" />
          Create Report
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">Total Reports</p>
                <p className="text-2xl font-bold text-slate-900 mt-1">{reports.length}</p>
              </div>
              <FileText className="w-8 h-8 text-violet-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">Scheduled</p>
                <p className="text-2xl font-bold text-slate-900 mt-1">
                  {reports.filter(r => r.auto_send_enabled).length}
                </p>
              </div>
              <Calendar className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">Sent This Month</p>
                <p className="text-2xl font-bold text-slate-900 mt-1">
                  {reports.filter(r => r.status === 'sent').length}
                </p>
              </div>
              <Mail className="w-8 h-8 text-emerald-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">Active Clients</p>
                <p className="text-2xl font-bold text-slate-900 mt-1">
                  {new Set(reports.map(r => r.client_email)).size}
                </p>
              </div>
              <Eye className="w-8 h-8 text-amber-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filter */}
      <div className="flex items-center gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input
            placeholder="Search reports..."
            className="pl-9"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Button variant="outline">
          <Filter className="w-4 h-4 mr-2" />
          Filter
        </Button>
      </div>

      {/* Reports List */}
      <Card>
        <CardHeader>
          <CardTitle>All Reports</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {filteredReports.map((report) => (
              <div
                key={report.id}
                className="flex items-center justify-between p-4 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <h3 className="font-medium text-slate-900">{report.report_name}</h3>
                    <Badge variant={report.status === 'sent' ? 'default' : 'secondary'}>
                      {report.status}
                    </Badge>
                    {report.auto_send_enabled && (
                      <Badge variant="outline" className="bg-blue-50 text-blue-700">
                        Auto-Send
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-4 mt-2 text-sm text-slate-600">
                    <span>Client: {report.client_email}</span>
                    <span>•</span>
                    <span className="capitalize">Frequency: {report.frequency}</span>
                    {report.last_sent_at && (
                      <>
                        <span>•</span>
                        <span>Last sent: {moment(report.last_sent_at).fromNow()}</span>
                      </>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {report.pdf_url && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => window.open(report.pdf_url, '_blank')}
                    >
                      <Download className="w-4 h-4" />
                    </Button>
                  )}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => generateReportMutation.mutate(report)}
                    disabled={generateReportMutation.isPending}
                  >
                    <FileText className="w-4 h-4 mr-2" />
                    Generate
                  </Button>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreVertical className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => { setSelectedReport(report); setShowBuilder(true); }}>
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem>Send Now</DropdownMenuItem>
                      <DropdownMenuItem className="text-red-600">Delete</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}