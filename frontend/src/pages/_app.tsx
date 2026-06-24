import '@/styles/globals.css';
import type { AppProps } from 'next/app';
import Head from 'next/head';
import { QueryClient, QueryClientProvider, HydrationBoundary } from '@tanstack/react-query';
import ToastContainer from '@/components/toast-container';
import { Geist } from 'next/font/google';
import cn from 'classnames';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

export default function App({ Component, pageProps }: AppProps) {
  const queryClient = new QueryClient();
  return (
    <div>
      <Head>
        <title>Logistics</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <QueryClientProvider client={queryClient}>
        <HydrationBoundary state={pageProps.dehydratedState}>
          <main className={cn(geistSans.variable, 'font-sans')}>
            <Component {...pageProps} />
          </main>
        </HydrationBoundary>
      </QueryClientProvider>
      <ToastContainer />
    </div>
  );
}
