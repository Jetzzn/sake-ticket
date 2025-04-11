import { Switch, Route } from "wouter";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import HomePage from "@/pages/home";
import OrderPage from "@/pages/order";
import ErrorPage from "@/pages/error";

function App() {
  return (
    <div className="min-h-screen flex flex-col ">
      <main className="flex-grow">
        <Switch>
          <Route path="/" component={HomePage} />
          <Route path="/error" component={ErrorPage} />
          <Route path="/order/:phoneNumber/:orderNumber" component={OrderPage} />
          <Route path="/order/:phoneNumber" component={OrderPage} />
          <Route component={NotFound} />
        </Switch>
      </main>
      <Toaster />
    </div>
  );
}

export default App;
