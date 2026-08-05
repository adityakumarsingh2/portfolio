import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Outlet, useLocation } from "react-router-dom";
import { ThemeProvider } from "next-themes";
import Index from "./pages/Index";
import Articles from "./pages/Articles";
import ArticleDetail from "./pages/ArticleDetail";
import CategoryPage from "./pages/CategoryPage";
import SeriesPage from "./pages/SeriesPage";
import NotFound from "./pages/NotFound";
import { RAGChatWidget } from "./components/articles/RAGChatWidget";

const queryClient = new QueryClient();

/** Layout wrapper that adds the RAG chat widget to all /articles/* routes */
function ArticlesLayout() {
  const location = useLocation();
  // Show the widget on /articles, /articles/:slug, /articles/category/:slug, /articles/series/:slug
  const isArticlesRoute = location.pathname.startsWith("/articles");

  return (
    <>
      <Outlet />
      {isArticlesRoute && <RAGChatWidget />}
    </>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            {/* Articles routes with RAG chat widget */}
            <Route element={<ArticlesLayout />}>
              <Route path="/articles" element={<Articles />} />
              {/* Category + Series pages — must be before :slug to avoid conflicts */}
              <Route path="/articles/category/:slug" element={<CategoryPage />} />
              <Route path="/articles/series/:slug" element={<SeriesPage />} />
              <Route path="/articles/:slug" element={<ArticleDetail />} />
            </Route>
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;


