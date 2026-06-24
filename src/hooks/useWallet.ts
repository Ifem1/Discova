'use client';

import { useState, useEffect, useCallback } from 'react';
import { generatePrivateKey, privateKeyToAccount } from 'viem/accounts';
import { EXPLORER_URL } from '@/lib/genlayer';

const STORAGE_KEY = 'discova-wallet';

interface StoredWallet {
  address: `0x${string}`;
  privateKey: `0x${string}`;
}

interface WalletState {
  address: `0x${string}` | null;
  privateKey: `0x${string}` | null;
  connected: boolean;
}

function loadStored(): StoredWallet | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as StoredWallet) : null;
  } catch {
    return null;
  }
}

function saveStored(w: StoredWallet) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(w));
}

function clearStored() {
  localStorage.removeItem(STORAGE_KEY);
}

export function useWallet() {
  const [state, setState] = useState<WalletState>({
    address: null,
    privateKey: null,
    connected: false,
  });

  useEffect(() => {
    const stored = loadStored();
    if (stored) {
      setState({ address: stored.address, privateKey: stored.privateKey, connected: true });
    }
  }, []);

  const generateWallet = useCallback(() => {
    const pk = generatePrivateKey();
    const account = privateKeyToAccount(pk);
    const w: StoredWallet = { address: account.address, privateKey: pk };
    saveStored(w);
    setState({ address: account.address, privateKey: pk, connected: true });
    return w;
  }, []);

  const importWallet = useCallback((pk: string) => {
    const key = (pk.startsWith('0x') ? pk : `0x${pk}`) as `0x${string}`;
    const account = privateKeyToAccount(key);
    const w: StoredWallet = { address: account.address, privateKey: key };
    saveStored(w);
    setState({ address: account.address, privateKey: key, connected: true });
    return account.address;
  }, []);

  const removeWallet = useCallback(() => {
    clearStored();
    setState({ address: null, privateKey: null, connected: false });
  }, []);

  const shortenAddress = state.address
    ? state.address.slice(0, 6) + '...' + state.address.slice(-4)
    : '';

  const explorerUrl = state.address
    ? `${EXPLORER_URL}/address/${state.address}`
    : '';

  return {
    ...state,
    generateWallet,
    importWallet,
    removeWallet,
    shortenAddress,
    explorerUrl,
  };
}
