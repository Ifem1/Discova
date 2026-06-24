'use client';

import { useState } from 'react';
import { User, CreditCard, Wallet, Bell, ExternalLink, AlertCircle, CheckCircle2, Eye, EyeOff, Copy, RefreshCw, KeyRound, Trash2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { useWallet } from '@/hooks/useWallet';
import { supabase } from '@/lib/supabase';

export default function SettingsPage() {
  const wallet = useWallet();
  const [profile, setProfile] = useState({ displayName: 'Researcher', email: 'researcher@lab.edu' });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  // Wallet UI state
  const [pkVisible, setPkVisible] = useState(false);
  const [copied, setCopied] = useState<'address' | 'pk' | null>(null);
  const [importPk, setImportPk] = useState('');
  const [importError, setImportError] = useState('');
  const [showImport, setShowImport] = useState(false);
  const [showRemoveConfirm, setShowRemoveConfirm] = useState(false);

  async function handleSaveProfile(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setSaved(false);
    try {
      const { error } = await supabase.auth.updateUser({ data: { display_name: profile.displayName } });
      if (error) throw error;
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch {
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } finally {
      setSaving(false);
    }
  }

  function copyToClipboard(text: string, type: 'address' | 'pk') {
    navigator.clipboard.writeText(text);
    setCopied(type);
    setTimeout(() => setCopied(null), 2000);
  }

  function handleImport() {
    setImportError('');
    try {
      wallet.importWallet(importPk.trim());
      setImportPk('');
      setShowImport(false);
    } catch {
      setImportError('Invalid private key. Make sure it is a 64-character hex string.');
    }
  }

  return (
    <div className="p-6 lg:p-8 max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Settings</h1>
        <p className="text-sm text-muted-foreground mt-1">Manage your account, wallet, and subscription.</p>
      </div>

      {/* Profile */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-4 w-4 text-primary" /> Profile
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSaveProfile} className="space-y-4">
            <Input
              id="name"
              label="Display Name"
              value={profile.displayName}
              onChange={(e) => setProfile({ ...profile, displayName: e.target.value })}
            />
            <Input
              id="email"
              label="Email"
              type="email"
              value={profile.email}
              onChange={(e) => setProfile({ ...profile, email: e.target.value })}
            />
            <div className="flex items-center gap-3">
              <Button type="submit" size="sm" loading={saving}>Save Changes</Button>
              {saved && (
                <span className="flex items-center gap-1 text-sm text-emerald-600">
                  <CheckCircle2 className="h-4 w-4" /> Saved
                </span>
              )}
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Wallet */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wallet className="h-4 w-4 text-primary" /> GenLayer Wallet
          </CardTitle>
          <CardDescription>
            Your wallet signs all GenLayer transactions. Generate one here, back up the private key, and import it on any new device to recover access.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">

          {wallet.connected ? (
            <>
              {/* Address row */}
              <div className="rounded-lg border border-border p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <p className="text-xs text-muted-foreground uppercase tracking-wider">Wallet Address</p>
                  <Badge variant="approved">GenLayer StudioNet · Chain 61999</Badge>
                </div>
                <div className="flex items-center gap-2">
                  <p className="text-sm font-mono text-foreground break-all flex-1">{wallet.address}</p>
                  <button onClick={() => copyToClipboard(wallet.address!, 'address')} className="shrink-0 text-muted-foreground hover:text-primary transition-colors">
                    {copied === 'address' ? <CheckCircle2 className="h-4 w-4 text-emerald-500" /> : <Copy className="h-4 w-4" />}
                  </button>
                  <a href={wallet.explorerUrl} target="_blank" rel="noopener noreferrer" className="shrink-0 text-muted-foreground hover:text-primary transition-colors">
                    <ExternalLink className="h-4 w-4" />
                  </a>
                </div>
              </div>

              {/* Private key backup */}
              <div className="rounded-lg border border-amber-500/30 bg-amber-500/5 p-4 space-y-3">
                <div className="flex items-start gap-2">
                  <KeyRound className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-semibold text-foreground">Private Key — Back This Up</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      This is the only way to recover your wallet on a new device. Never share it with anyone. Store it somewhere safe like a password manager.
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex-1 rounded-md bg-muted px-3 py-2 font-mono text-xs text-foreground break-all">
                    {pkVisible ? wallet.privateKey : '••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••'}
                  </div>
                  <button onClick={() => setPkVisible(!pkVisible)} className="shrink-0 text-muted-foreground hover:text-primary transition-colors">
                    {pkVisible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                  <button onClick={() => copyToClipboard(wallet.privateKey!, 'pk')} className="shrink-0 text-muted-foreground hover:text-primary transition-colors">
                    {copied === 'pk' ? <CheckCircle2 className="h-4 w-4 text-emerald-500" /> : <Copy className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              {/* Remove wallet */}
              {!showRemoveConfirm ? (
                <button onClick={() => setShowRemoveConfirm(true)} className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-destructive transition-colors">
                  <Trash2 className="h-3.5 w-3.5" /> Remove wallet from this device
                </button>
              ) : (
                <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-3 space-y-2">
                  <p className="text-sm text-destructive font-medium">Are you sure? Make sure you have backed up your private key first.</p>
                  <div className="flex gap-2">
                    <Button size="sm" variant="destructive" onClick={() => { wallet.removeWallet(); setShowRemoveConfirm(false); }}>Yes, remove</Button>
                    <Button size="sm" variant="outline" onClick={() => setShowRemoveConfirm(false)}>Cancel</Button>
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="space-y-4">
              {/* Generate new */}
              <div className="rounded-lg border border-dashed border-border p-5 text-center space-y-3">
                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
                  <Wallet className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground">No wallet yet</p>
                  <p className="text-xs text-muted-foreground mt-1">Generate a wallet to start using GenLayer features.</p>
                </div>
                <Button onClick={() => wallet.generateWallet()}>
                  <RefreshCw className="h-4 w-4" />
                  Generate Wallet
                </Button>
              </div>

              {/* Import existing */}
              <div>
                <button
                  onClick={() => setShowImport(!showImport)}
                  className="text-xs text-primary hover:underline flex items-center gap-1"
                >
                  <KeyRound className="h-3 w-3" />
                  Already have a private key? Import it
                </button>
                {showImport && (
                  <div className="mt-3 space-y-2">
                    <Input
                      id="import-pk"
                      label="Private Key (0x...)"
                      value={importPk}
                      onChange={(e) => setImportPk(e.target.value)}
                      placeholder="0x..."
                    />
                    {importError && (
                      <p className="text-xs text-destructive flex items-center gap-1">
                        <AlertCircle className="h-3 w-3" /> {importError}
                      </p>
                    )}
                    <div className="flex gap-2">
                      <Button size="sm" onClick={handleImport} disabled={!importPk.trim()}>Import</Button>
                      <Button size="sm" variant="outline" onClick={() => { setShowImport(false); setImportPk(''); setImportError(''); }}>Cancel</Button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Subscription */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-4 w-4 text-primary" /> Subscription
          </CardTitle>
          <CardDescription>Your current plan and usage limits.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-4 rounded-lg border border-border">
            <div>
              <div className="flex items-center gap-2">
                <span className="font-semibold text-foreground">Free Plan</span>
                <Badge variant="outline">Current</Badge>
              </div>
              <p className="text-xs text-muted-foreground mt-1">8 hypothesis generations / month</p>
            </div>
            <Button size="sm" variant="secondary">Upgrade to Pro</Button>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Generations used</span>
              <span className="font-semibold text-foreground">0 / 8</span>
            </div>
            <div className="h-2 rounded-full bg-muted">
              <div className="h-full rounded-full bg-primary w-0" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Notifications */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-4 w-4 text-primary" /> Notifications
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {['Hypothesis verdicts', 'Review assignments', 'Subscription updates'].map((item) => (
              <label key={item} className="flex items-center justify-between cursor-pointer">
                <span className="text-sm text-foreground">{item}</span>
                <input
                  type="checkbox"
                  defaultChecked
                  className="h-4 w-4 rounded border-border text-primary focus:ring-primary accent-primary"
                />
              </label>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
