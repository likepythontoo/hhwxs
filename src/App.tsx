import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import About from "./pages/About";
import Leadership from "./pages/Leadership";
import News from "./pages/News";
import Auth from "./pages/Auth";
import Admin from "./pages/Admin";
import Join from "./pages/Join";
import CheckIn from "./pages/CheckIn";
import Profile from "./pages/Profile";
import Forum from "./pages/Forum";
import Submit from "./pages/Submit";
import Events from "./pages/Events";
import Works from "./pages/Works";
import Contact from "./pages/Contact";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/about" element={<About />} />
          <Route path="/leadership" element={<Leadership />} />
          <Route path="/news" element={<News />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/admin" element={<Admin />} />
          <Route path="/join" element={<Join />} />
          <Route path="/checkin" element={<CheckIn />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/forum" element={<Forum />} />
          <Route path="/submit" element={<Submit />} />
          <Route path="/events" element={<Events />} />
          <Route path="/works" element={<Works />} />
          <Route path="/contact" element={<Contact />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
