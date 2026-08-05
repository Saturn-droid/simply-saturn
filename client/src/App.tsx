import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import About from "@/pages/About";
import Calendar from "@/pages/Calendar";
import Contact from "@/pages/Contact";
import ContactDetail from "@/pages/ContactDetail";
import Contacts from "@/pages/Contacts";
import Dashboard from "@/pages/Dashboard";
import Deals from "@/pages/Deals";
import Features from "@/pages/Features";
import ForgotPassword from "@/pages/ForgotPassword";
import Home from "@/pages/Home";
import Inbox from "@/pages/Inbox";
import Invite from "@/pages/Invite";
import LegalPlaceholder from "@/pages/LegalPlaceholder";
import Login from "@/pages/Login";
import NotFound from "@/pages/NotFound";
import Pricing from "@/pages/Pricing";
import Product from "@/pages/Product";
import SignUp from "@/pages/SignUp";
import Team from "@/pages/Team";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/product" component={Product} />
      <Route path="/features" component={Features} />
      <Route path="/pricing" component={Pricing} />
      <Route path="/about" component={About} />
      <Route path="/contact" component={Contact} />
      <Route path="/login" component={Login} />
      <Route path="/signup" component={SignUp} />
      <Route path="/invite" component={Invite} />
      <Route path="/forgot-password" component={ForgotPassword} />
      <Route path="/app/inbox" component={Inbox} />
      <Route path="/app/calendar" component={Calendar} />
      <Route path="/app/deals" component={Deals} />
      <Route path="/app/contacts/:contactId" component={ContactDetail} />
      <Route path="/app/contacts" component={Contacts} />
      <Route path="/app/team" component={Team} />
      <Route path="/app" component={Dashboard} />
      <Route path="/privacy" component={LegalPlaceholder} />
      <Route path="/terms" component={LegalPlaceholder} />
      <Route path="/security" component={LegalPlaceholder} />
      <Route path="/accessibility" component={LegalPlaceholder} />
      <Route path="/404" component={NotFound} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light">
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
