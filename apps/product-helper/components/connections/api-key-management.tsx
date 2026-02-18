'use client';

import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Key, Plus, Trash2, Copy, Check, AlertTriangle } from 'lucide-react';

interface ApiKey {
  id: number;
  keyPrefix: string;
  name: string | null;
  createdAt: string;
  expiresAt: string | null;
  lastUsedAt: string | null;
  revokedAt: string | null;
}

interface InlineApiKeyCreationProps {
  projectId: number;
  onKeyCreated: (fullKey: string) => void;
  onKeyRevoked?: () => void;
}

export function InlineApiKeyCreation({ projectId, onKeyCreated, onKeyRevoked }: InlineApiKeyCreationProps) {
  const [keys, setKeys] = useState<ApiKey[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [newKeyName, setNewKeyName] = useState('');
  const [newKeyFull, setNewKeyFull] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [revokeDialogKeyId, setRevokeDialogKeyId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [revokeError, setRevokeError] = useState<string | null>(null);

  const fetchKeys = useCallback(async () => {
    try {
      const response = await fetch(`/api/projects/${projectId}/keys`);
      if (response.ok) {
        const data = await response.json();
        setKeys(data.keys || []);
      }
    } catch {
      // Silent — keys list is non-critical
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  useEffect(() => {
    fetchKeys();
  }, [fetchKeys]);

  const createKey = async () => {
    setCreating(true);
    setError(null);
    try {
      const response = await fetch(`/api/projects/${projectId}/keys`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newKeyName || undefined }),
      });

      if (response.ok) {
        const data = await response.json();
        setNewKeyFull(data.key);
        setNewKeyName('');
        onKeyCreated(data.key);
        await fetchKeys();
      } else {
        const data = await response.json().catch(() => null);
        setError(data?.error || `Failed to create key (${response.status})`);
      }
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setCreating(false);
    }
  };

  const revokeKey = async (keyId: number) => {
    setRevokeError(null);
    try {
      const response = await fetch(`/api/projects/${projectId}/keys/${keyId}`, {
        method: 'DELETE',
      });
      if (response.ok) {
        await fetchKeys();
        setRevokeDialogKeyId(null);
        onKeyRevoked?.();
      } else {
        setRevokeError('Failed to revoke key. Please try again.');
      }
    } catch {
      setRevokeError('Network error. Please try again.');
    }
  };

  const copyKey = async (key: string) => {
    try {
      await navigator.clipboard.writeText(key);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard API not available
    }
  };

  const resetForm = () => {
    setNewKeyFull(null);
    setNewKeyName('');
    setError(null);
  };

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return 'Never';
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const activeKeys = keys.filter((k) => !k.revokedAt);

  return (
    <div className="space-y-4">
      {/* Inline creation form */}
      {newKeyFull ? (
        <div className="space-y-3">
          <div role="alert" className="p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
            <div className="flex items-start gap-2">
              <AlertTriangle className="h-4 w-4 text-yellow-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm">
                <p className="font-semibold text-yellow-800 dark:text-yellow-200">
                  Save this key — it won&apos;t be shown again
                </p>
              </div>
            </div>
          </div>
          <div className="relative">
            <Input
              value={newKeyFull}
              readOnly
              className="pr-10 font-mono text-sm"
            />
            <Button
              size="sm"
              variant="ghost"
              className="absolute right-1 top-1/2 -translate-y-1/2"
              aria-label="Copy API key"
              onClick={() => copyKey(newKeyFull)}
            >
              {copied ? (
                <Check className="h-4 w-4 text-green-500" />
              ) : (
                <Copy className="h-4 w-4" />
              )}
            </Button>
          </div>
          <div className="flex items-center justify-between">
            <p className="text-xs text-muted-foreground">
              Your API key has been auto-filled into the IDE setup commands below.
            </p>
            <Button variant="ghost" size="sm" onClick={resetForm}>
              Create another key
            </Button>
          </div>
        </div>
      ) : (
        <div className="flex flex-col sm:flex-row sm:items-end gap-3">
          <div className="flex-1 space-y-1.5">
            <Label htmlFor="keyName" className="text-sm">Key name (optional)</Label>
            <Input
              id="keyName"
              placeholder="e.g., Claude Code - MacBook"
              value={newKeyName}
              onChange={(e) => setNewKeyName(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') createKey(); }}
            />
          </div>
          <Button onClick={createKey} disabled={creating} className="shrink-0">
            {creating ? (
              'Creating...'
            ) : (
              <>
                <Plus className="h-4 w-4 mr-1" />
                Create Key
              </>
            )}
          </Button>
        </div>
      )}

      {error && (
        <div role="alert" className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-sm text-red-700 dark:text-red-300">
          {error}
        </div>
      )}

      {/* Existing keys list */}
      {!loading && activeKeys.length > 0 && (
        <div className="space-y-2 pt-2 border-t">
          <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Active Keys</h4>
          {activeKeys.map((key) => (
            <div
              key={key.id}
              className="flex flex-col sm:flex-row sm:items-center justify-between p-2.5 bg-muted rounded-lg text-sm gap-2"
            >
              <div className="flex items-center gap-2 flex-wrap">
                <Key className="h-3.5 w-3.5 text-muted-foreground" />
                <code className="text-xs font-mono">{key.keyPrefix}...</code>
                {key.name && (
                  <Badge variant="secondary" className="text-xs">{key.name}</Badge>
                )}
              </div>
              <div className="flex items-center gap-3">
                <span className="text-xs text-muted-foreground">
                  Created {formatDate(key.createdAt)}
                </span>
                <span className="text-xs text-muted-foreground">
                  Last used: {formatDate(key.lastUsedAt)}
                </span>
                <Button
                  size="sm"
                  variant="ghost"
                  className="text-destructive hover:text-destructive h-7 w-7 p-0"
                  aria-label={`Revoke key ${key.keyPrefix}`}
                  onClick={() => setRevokeDialogKeyId(key.id)}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Controlled revoke confirmation dialog */}
      <Dialog open={revokeDialogKeyId !== null} onOpenChange={(open) => { if (!open) { setRevokeDialogKeyId(null); setRevokeError(null); } }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Revoke API Key</DialogTitle>
            <DialogDescription>
              Are you sure? Integrations using this key will stop working immediately.
            </DialogDescription>
          </DialogHeader>
          {revokeError && (
            <div role="alert" className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-sm text-red-700 dark:text-red-300">
              {revokeError}
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => { setRevokeDialogKeyId(null); setRevokeError(null); }}>Cancel</Button>
            <Button variant="destructive" onClick={() => revokeDialogKeyId && revokeKey(revokeDialogKeyId)}>
              Revoke Key
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
