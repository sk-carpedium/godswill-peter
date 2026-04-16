import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { api } from '@/api/client';
import { RefreshCw, CheckCircle2, AlertCircle, Clock, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

export default function SyncStatusCard({ accounts }) {
  const [syncing, setSyncing] = useState(false);
  const [syncingId, setSyncingId] = useState(null);

  const handleSyncAccount = async (account) => {
    setSyncing(true);
    setSyncingId(account.id);
    
    try {
      await api.functions.invoke('syncSocialData', {
        platform: account.platform,
        account_id: account.id
      });
      
      toast.success(`${account.account_name} synced successfully`);
      window.location.reload();
    } catch (error) {
      toast.error(`Failed to sync ${account.account_name}: ${error.message}`);
    } finally {
      setSyncing(false);
      setSyncingId(null);
    }
  };

  const handleSyncAll = async () => {
    setSyncing(true);
    
    try {
      const result = await api.functions.invoke('syncAllAccounts', {});
      toast.success(`Synced ${result.data.summary.synced} of ${result.data.summary.total} accounts`);
      window.location.reload();
    } catch (error) {
      toast.error(`Failed to sync accounts: ${error.message}`);
    } finally {
      setSyncing(false);
    }
  };

  const getLastSyncTime = (lastSyncedAt) => {
    if (!lastSyncedAt) return 'Never synced';
    
    const now = new Date();
    const synced = new Date(lastSyncedAt);
    const diffMs = now - synced;
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffMins < 1440) return `${Math.floor(diffMins / 60)}h ago`;
    return `${Math.floor(diffMins / 1440)}d ago`;
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Data Sync Status</CardTitle>
            <CardDescription>Real-time synchronization with all platforms</CardDescription>
          </div>
          <Button 
            onClick={handleSyncAll}
            disabled={syncing}
            className="bg-[#d4af37] hover:bg-[#c9a961] text-slate-950"
          >
            {syncing ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Syncing...
              </>
            ) : (
              <>
                <RefreshCw className="w-4 h-4 mr-2" />
                Sync All
              </>
            )}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {accounts.map((account) => (
            <div
              key={account.id}
              className="flex items-center justify-between p-4 rounded-xl border border-slate-200 hover:border-[#d4af37]/30 transition-colors"
            >
              <div className="flex items-center gap-4">
                <div className={cn(
                  "w-10 h-10 rounded-xl flex items-center justify-center",
                  account.health_status === 'healthy' ? 'bg-emerald-50' : 'bg-amber-50'
                )}>
                  {account.health_status === 'healthy' ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                  ) : (
                    <AlertCircle className="w-5 h-5 text-amber-600" />
                  )}
                </div>
                <div>
                  <p className="font-medium text-slate-900">{account.account_name}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant="secondary" className="text-xs capitalize">
                      {account.platform}
                    </Badge>
                    <span className="text-xs text-slate-500 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {getLastSyncTime(account.last_synced_at)}
                    </span>
                  </div>
                </div>
              </div>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleSyncAccount(account)}
                disabled={syncing}
              >
                {syncingId === account.id ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <RefreshCw className="w-4 h-4" />
                )}
              </Button>
            </div>
          ))}
        </div>

        <div className="mt-6 p-4 rounded-xl bg-blue-50 border border-blue-100">
          <p className="text-sm text-blue-900">
            <strong>Auto-sync enabled:</strong> All accounts sync automatically every 30 minutes to keep your data fresh.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}