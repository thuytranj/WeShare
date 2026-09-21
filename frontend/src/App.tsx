import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { Sparkles, MessageCircle, Heart, Share2 } from 'lucide-react';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 2, // 2 minutes
      retry: 1,
    },
  },
});

export function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <main className="min-h-screen flex flex-col items-center justify-center p-6 bg-gradient-to-br from-slate-50 via-indigo-50/30 to-violet-50/30 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
          <div className="max-w-md w-full p-8 rounded-3xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-md shadow-xl border border-slate-200 dark:border-slate-800 text-center space-y-6">
            <div className="inline-flex items-center justify-center p-3 rounded-2xl bg-gradient-to-tr from-indigo-600 to-violet-600 text-white shadow-lg shadow-indigo-500/20">
              <Sparkles className="w-8 h-8" />
            </div>

            <div className="space-y-2">
              <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent">
                WeShare
              </h1>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Mạng Xã Hội Thu Nhỏ Hiệu Năng Cao &amp; Sẵn Sàng Production
              </p>
            </div>

            <div className="flex items-center justify-center gap-4 text-slate-400 pt-2 border-t border-slate-100 dark:border-slate-800">
              <span className="flex items-center gap-1 text-xs">
                <Heart className="w-4 h-4 text-rose-500" /> Reactions
              </span>
              <span className="flex items-center gap-1 text-xs">
                <MessageCircle className="w-4 h-4 text-indigo-500" /> Real-time Chat
              </span>
              <span className="flex items-center gap-1 text-xs">
                <Share2 className="w-4 h-4 text-violet-500" /> Feed Sharing
              </span>
            </div>
          </div>
        </main>
      </BrowserRouter>
      {process.env.NODE_ENV === 'development' && <ReactQueryDevtools initialIsOpen={false} />}
    </QueryClientProvider>
  );
}

export default App;
