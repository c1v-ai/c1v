'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Activity, Clock, CheckCircle, AlertCircle } from 'lucide-react';

interface ConnectionStatusProps {
  projectId: number;
}

interface StatusInfo {
  status: 'active' | 'recent' | 'inactive' | 'never';
  lastUsed: string | null;
  keyCount: number;
}

export function ConnectionStatus({ projectId }: ConnectionStatusProps) {
  const [statusInfo, setStatusInfo] = useState<StatusInfo | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const response = await fetch(`/api/projects/${projectId}/keys`);
        if (response.ok) {
          const data = await response.json();
          const keys = data.keys || [];
          const activeKeys = keys.filter((k: { revokedAt: string | null }) => !k.revokedAt);

          // Find most recent usage
          let lastUsedTime: number | null = null;
          activeKeys.forEach((key: { lastUsedAt: string | null }) => {
            if (key.lastUsedAt) {
              const keyTime = new Date(key.lastUsedAt).getTime();
              if (!lastUsedTime || keyTime > lastUsedTime) {
                lastUsedTime = keyTime;
              }
            }
          });

          // Determine status based on last usage
          let status: StatusInfo['status'] = 'never';
          if (lastUsedTime) {
            const hoursSinceUse = (Date.now() - lastUsedTime) / (1000 * 60 * 60);
            if (hoursSinceUse < 1) {
              status = 'active';
            } else if (hoursSinceUse < 24) {
              status = 'recent';
            } else {
              status = 'inactive';
            }
          }

          setStatusInfo({
            status,
            lastUsed: lastUsedTime ? new Date(lastUsedTime).toISOString() : null,
            keyCount: activeKeys.length,
          });
        }
      } catch (error) {
        console.error('Error fetching connection status:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStatus();
    // Poll every 30 seconds
    const interval = setInterval(fetchStatus, 30000);
    return () => clearInterval(interval);
  }, [projectId]);

  if (loading) {
    return (
      <Card>
        <CardContent className="py-4">
          <div className="flex items-center gap-3">
            <div className="h-4 w-4 rounded-full bg-muted animate-pulse" />
            <span className="text-sm text-muted-foreground">Checking connection...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!statusInfo) {
    return null;
  }

  const statusConfig = {
    active: {
      icon: <Activity className="h-5 w-5 text-green-500" />,
      color: 'bg-green-500',
      label: 'Active',
      description: 'MCP server in use',
    },
    recent: {
      icon: <CheckCircle className="h-5 w-5 text-blue-500" />,
      color: 'bg-blue-500',
      label: 'Connected',
      description: 'Used in the last 24 hours',
    },
    inactive: {
      icon: <Clock className="h-5 w-5 text-yellow-500" />,
      color: 'bg-yellow-500',
      label: 'Inactive',
      description: 'Not used recently',
    },
    never: {
      icon: <AlertCircle className="h-5 w-5 text-gray-400" />,
      color: 'bg-gray-400',
      label: 'Not Connected',
      description: 'No activity yet',
    },
  };

  const config = statusConfig[statusInfo.status];

  const formatLastUsed = (dateStr: string | null) => {
    if (!dateStr) return 'Never';
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} minutes ago`;
    if (diffHours < 24) return `${diffHours} hours ago`;
    if (diffDays < 7) return `${diffDays} days ago`;
    return date.toLocaleDateString();
  };

  return (
    <Card>
      <CardContent className="py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative">
              {config.icon}
              <span
                className={`absolute -top-0.5 -right-0.5 h-2.5 w-2.5 rounded-full ${config.color} ${statusInfo.status === 'active' ? 'animate-pulse' : ''}`}
              />
            </div>
            <div>
              <div className="font-medium text-sm">{config.label}</div>
              <div className="text-xs text-muted-foreground">{config.description}</div>
            </div>
          </div>
          <div className="text-right text-xs text-muted-foreground">
            <div>Last activity: {formatLastUsed(statusInfo.lastUsed)}</div>
            <div>{statusInfo.keyCount} active key{statusInfo.keyCount !== 1 ? 's' : ''}</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
