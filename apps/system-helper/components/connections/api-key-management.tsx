'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
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
  DialogTrigger,
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

interface ApiKeyManagementProps {
  projectId: number;
}

export function ApiKeyManagement({ projectId }: ApiKeyManagementProps) {
  const [keys, setKeys] = useState<ApiKey[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [newKeyName, setNewKeyName] = useState('');
  const [newKeyFull, setNewKeyFull] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [deleteKeyId, setDeleteKeyId] = useState<number | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  const fetchKeys = async () => {
    try {
      const response = await fetch(`/api/projects/${projectId}/keys`);
      if (response.ok) {
        const data = await response.json();
        setKeys(data.keys || []);
      }
    } catch (error) {
      console.error('Error fetching API keys:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchKeys();
  }, [projectId]);

  const createKey = async () => {
    setCreating(true);
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
        await fetchKeys();
      }
    } catch (error) {
      console.error('Error creating API key:', error);
    } finally {
      setCreating(false);
    }
  };

  const revokeKey = async (keyId: number) => {
    try {
      const response = await fetch(`/api/projects/${projectId}/keys/${keyId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        await fetchKeys();
        setDeleteKeyId(null);
      }
    } catch (error) {
      console.error('Error revoking API key:', error);
    }
  };

  const copyKey = async (key: string) => {
    await navigator.clipboard.writeText(key);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return 'Never';
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const activeKeys = keys.filter((k) => !k.revokedAt);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Key className="h-5 w-5" />
              API Keys
            </CardTitle>
            <CardDescription>
              Manage API keys for MCP server authentication
            </CardDescription>
          </div>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm">
                <Plus className="h-4 w-4 mr-1" />
                Create Key
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create API Key</DialogTitle>
                <DialogDescription>
                  Create a new API key for MCP server access. The full key will only be shown once.
                </DialogDescription>
              </DialogHeader>

              {newKeyFull ? (
                <div className="space-y-4">
                  <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                    <div className="flex items-start gap-2">
                      <AlertTriangle className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                      <div className="text-sm">
                        <p className="font-semibold text-yellow-800 dark:text-yellow-200">
                          Save this key now!
                        </p>
                        <p className="text-yellow-700 dark:text-yellow-300">
                          This is the only time you&apos;ll see the full key.
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
                      onClick={() => copyKey(newKeyFull)}
                    >
                      {copied ? (
                        <Check className="h-4 w-4 text-green-500" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                  <DialogFooter>
                    <Button
                      onClick={() => {
                        setNewKeyFull(null);
                        setDialogOpen(false);
                      }}
                    >
                      Done
                    </Button>
                  </DialogFooter>
                </div>
              ) : (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="keyName">Key Name (optional)</Label>
                    <Input
                      id="keyName"
                      placeholder="e.g., Claude Code - MacBook"
                      value={newKeyName}
                      onChange={(e) => setNewKeyName(e.target.value)}
                    />
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button onClick={createKey} disabled={creating}>
                      {creating ? 'Creating...' : 'Create Key'}
                    </Button>
                  </DialogFooter>
                </>
              )}
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="text-center py-8 text-muted-foreground">
            Loading keys...
          </div>
        ) : activeKeys.length === 0 ? (
          <div className="text-center py-8">
            <Key className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
            <p className="text-muted-foreground mb-4">
              No API keys yet. Create one to connect your IDE.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {activeKeys.map((key) => (
              <div
                key={key.id}
                className="flex items-center justify-between p-3 bg-muted rounded-lg"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <code className="text-sm font-mono">{key.keyPrefix}...</code>
                    {key.name && (
                      <Badge variant="secondary" className="text-xs">
                        {key.name}
                      </Badge>
                    )}
                  </div>
                  <div className="flex gap-4 mt-1 text-xs text-muted-foreground">
                    <span>Created: {formatDate(key.createdAt)}</span>
                    <span>Last used: {formatDate(key.lastUsedAt)}</span>
                  </div>
                </div>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="text-destructive hover:text-destructive"
                      onClick={() => setDeleteKeyId(key.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Revoke API Key</DialogTitle>
                      <DialogDescription>
                        Are you sure you want to revoke this API key? Any integrations using this
                        key will stop working immediately.
                      </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setDeleteKeyId(null)}>
                        Cancel
                      </Button>
                      <Button
                        variant="destructive"
                        onClick={() => deleteKeyId && revokeKey(deleteKeyId)}
                      >
                        Revoke Key
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
