import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Layout } from "@/components/layout";
import NotFound from "@/pages/not-found";

import Home from "@/pages/home";
import Intake from "@/pages/intake";
import Results from "@/pages/results";
import Insights from "@/pages/insights";
import Referrals from "@/pages/referrals";

const queryClient = new QueryClient();

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/intake" component={Intake} />
      <Route path="/results/:id" component={Results} />
      <Route path="/insights" component={Insights} />
      <Route path="/referrals" component={Referrals} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
          <Layout>
            <Router />
          </Layout>
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
