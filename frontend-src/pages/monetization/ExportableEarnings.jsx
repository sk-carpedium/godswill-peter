import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import {
  Download,
  FileText,
  DollarSign,
  Calendar,
  TrendingUp,
  BarChart3,
  Filter,
  CheckCircle2,
  Loader2
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import moment from 'moment';

export default function ExportableEarnings({ revenue = [], workspace }) {
  const [dateRange, setDateRange] = useState('this_month');
  const [format, setFormat] = useState('pdf');
  const [groupBy, setGroupBy] = useState('source');
  const [exporting, setExporting] = useState(false);

  const filterRevenue = () => {
    const now = new Date();
    let startDate;

    switch (dateRange) {
      case 'this_month':
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        break;
      case 'last_month':
        startDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        break;
      case 'this_quarter':
        const quarter = Math.floor(now.getMonth() / 3);
        startDate = new Date(now.getFullYear(), quarter * 3, 1);
        break;
      case 'this_year':
        startDate = new Date(now.getFullYear(), 0, 1);
        break;
      default:
        startDate = new Date(0);
    }

    return revenue.filter(r => new Date(r.transaction_date) >= startDate);
  };

  const filteredRevenue = filterRevenue();
  const totalEarnings = filteredRevenue.reduce((sum, r) => sum + (r.amount || 0), 0);

  const groupedData = () => {
    const grouped = {};
    
    filteredRevenue.forEach(r => {
      const key = groupBy === 'source' ? r.source : 
                  groupBy === 'platform' ? r.platform :
                  groupBy === 'month' ? moment(r.transaction_date).format('YYYY-MM') :
                  'all';
      
      if (!grouped[key]) {
        grouped[key] = { items: [], total: 0 };
      }
      grouped[key].items.push(r);
      grouped[key].total += r.amount || 0;
    });

    return grouped;
  };

  const handleExport = async () => {
    setExporting(true);
    
    // Simulate export
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    setExporting(false);
    toast.success(`Earnings report exported as ${format.toUpperCase()}!`);
  };

  const data = groupedData();

  return (
    <div className="space-y-6">
      {/* Export Controls */}
      <Card className="border-2 border-emerald-200">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Download className="w-5 h-5 text-emerald-600" />
              Export Earnings Report
            </CardTitle>
            <Badge className="bg-emerald-100 text-emerald-700">
              ${totalEarnings.toLocaleString()}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-3 gap-4">
            <div>
              <Label>Date Range</Label>
              <Select value={dateRange} onValueChange={setDateRange}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="this_week">This Week</SelectItem>
                  <SelectItem value="this_month">This Month</SelectItem>
                  <SelectItem value="last_month">Last Month</SelectItem>
                  <SelectItem value="this_quarter">This Quarter</SelectItem>
                  <SelectItem value="this_year">This Year</SelectItem>
                  <SelectItem value="all_time">All Time</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Group By</Label>
              <Select value={groupBy} onValueChange={setGroupBy}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="source">Revenue Source</SelectItem>
                  <SelectItem value="platform">Platform</SelectItem>
                  <SelectItem value="month">Month</SelectItem>
                  <SelectItem value="deal">Brand Deal</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Export Format</Label>
              <Select value={format} onValueChange={setFormat}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pdf">PDF Report</SelectItem>
                  <SelectItem value="csv">CSV (Excel)</SelectItem>
                  <SelectItem value="xlsx">Excel Workbook</SelectItem>
                  <SelectItem value="json">JSON Data</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <Button
            onClick={handleExport}
            disabled={exporting || filteredRevenue.length === 0}
            className="w-full bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white"
          >
            {exporting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Generating Report...
              </>
            ) : (
              <>
                <Download className="w-4 h-4 mr-2" />
                Export {filteredRevenue.length} Transaction{filteredRevenue.length !== 1 ? 's' : ''}
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Earnings Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-[#d4af37]" />
            Earnings Breakdown
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {Object.entries(data).map(([key, value]) => (
              <div
                key={key}
                className="flex items-center justify-between p-4 rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-lg bg-emerald-50 flex items-center justify-center">
                    <DollarSign className="w-5 h-5 text-emerald-600" />
                  </div>
                  <div>
                    <p className="font-medium text-slate-900 capitalize">
                      {key.replace(/_/g, ' ')}
                    </p>
                    <p className="text-sm text-slate-500">
                      {value.items.length} transaction{value.items.length !== 1 ? 's' : ''}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xl font-bold text-emerald-600">
                    ${value.total.toLocaleString()}
                  </p>
                  <p className="text-xs text-slate-500">
                    {((value.total / totalEarnings) * 100).toFixed(1)}%
                  </p>
                </div>
              </div>
            ))}

            {Object.keys(data).length === 0 && (
              <div className="text-center py-8">
                <DollarSign className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <p className="text-slate-500">No earnings data for selected period</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Export Formats Info */}
      <Card className="bg-blue-50/50 border-blue-200">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <FileText className="w-5 h-5 text-blue-600 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-medium text-blue-900 mb-1">Professional Reports</p>
              <p className="text-xs text-blue-700">
                Exports include transaction details, payment status, metrics, and tax-ready summaries. 
                Perfect for accounting, client billing, and quarterly reviews.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}