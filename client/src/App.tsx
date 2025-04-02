import { Switch, Route } from "wouter";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import HomePage from "@/pages/home";
import OrderPage from "@/pages/order";
import ErrorPage from "@/pages/error";
import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";

function App() {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />
      <main className="flex-grow">
        <Switch>
          <Route path="/" component={HomePage} />
          <Route path="/:orderNumber" component={OrderPage} />
          <Route path="/error" component={ErrorPage} />
          <Route component={NotFound} />
        </Switch>
      </main>
      <Footer />
      <Toaster />
    </div>
  );
}

export default App;
