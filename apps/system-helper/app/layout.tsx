import './theme.css';
import './globals.css';
import type { Metadata, Viewport } from 'next';
import { getUser, getTeamForUser } from '@/lib/db/queries';
import { SWRConfig } from 'swr';
import { Toaster } from 'sonner';
import { ServiceWorkerRegister } from '@/components/sw-register';
import { ThemeProvider } from '@/components/theme/theme-provider';

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  viewportFit: 'cover', // Critical for iOS safe areas
};

export const metadata: Metadata = {
  title: 'Product Helper - AI-Powered PRD Generation',
  description: 'Create engineering-quality Product Requirements Documents in minutes through AI-powered conversational requirements gathering.',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Product Helper',
  },
};

export default function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
    >
      <body className="min-h-[100dvh]">
        <SWRConfig
          value={{
            fallback: {
              // We do NOT await here
              // Only components that read this data will suspend
              '/api/user': getUser(),
              '/api/team': getTeamForUser()
            }
          }}
        >
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            {children}
          </ThemeProvider>
        </SWRConfig>
        <Toaster position="top-center" richColors />
        <ServiceWorkerRegister />
      </body>
    </html>
  );
}
