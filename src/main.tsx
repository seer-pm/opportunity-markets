/// <reference types="vite/client" />
import { StrictMode, useLayoutEffect, useState } from 'react';
import { useTheme } from './hooks/useTheme';
import { createRoot } from 'react-dom/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { WagmiProvider } from 'wagmi';
import { Buffer } from 'buffer';
import { Slide, ToastContainer } from 'react-toastify';
import { ConnectKitProvider } from 'connectkit';
import { configureCredits, initApiHost } from '@seer-pm/sdk';
import App from './App';
import { wagmiConfig } from './config/wagmi';
import { getSeerAppUrl } from './lib/seerAuth';
import './styles/toastify-slide.css';
import '@seer-pm/discussions/style.css';
import './index.css';

configureCredits('OPPORTUNITY_CREDITS');
initApiHost(getSeerAppUrl());

const queryClient = new QueryClient();

// ensure Buffer exists on globalThis for deps that expect it
(globalThis as any).Buffer = (globalThis as any).Buffer || Buffer;

function readWalletTheme() {
  const css = getComputedStyle(document.documentElement);
  const token = (name: string) => css.getPropertyValue(`--seer-${name}`).trim();
  return {
    '--ck-font-family': token('font-sans'),
    '--ck-border-radius': token('radius-md'),
    '--ck-primary-button-border-radius': token('radius-sm'),
    '--ck-secondary-button-border-radius': token('radius-sm'),
    '--ck-body-background': token('surface'),
    '--ck-body-background-secondary': token('surface-raised'),
    '--ck-primary-button-background': token('surface-raised'),
    '--ck-primary-button-color': token('text'),
    '--ck-body-divider': token('border'),
    '--ck-body-color-danger': token('negative'),
    '--ck-body-color-valid': token('positive'),
    '--ck-body-color': token('text'),
    '--ck-body-color-muted': token('muted'),
    '--ck-focus-color': token('brand-purple'),
    '--ck-secondary-button-background': token('brand-purple'),
    '--ck-secondary-button-hover-background': token('brand-purple-hover'),
    '--ck-secondary-button-color': token('brand-white'),
    '--ck-secondary-button-hover-color': token('brand-white'),
  };
}

function ThemedApp() {
  const { theme } = useTheme();
  const [walletTheme, setWalletTheme] = useState(readWalletTheme);
  useLayoutEffect(() => {
    setWalletTheme(readWalletTheme());
  }, [theme]);
  return (
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        <ConnectKitProvider mode={theme} customTheme={walletTheme}>
          <App />
          <ToastContainer
            position="top-center"
            theme={theme}
            transition={Slide}
            autoClose={5000}
            hideProgressBar={false}
            newestOnTop
            closeOnClick
            pauseOnHover
            draggable
            toastClassName="lot-toast"
          />
        </ConnectKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ThemedApp />
  </StrictMode>,
);
