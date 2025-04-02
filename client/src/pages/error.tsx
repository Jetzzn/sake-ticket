import { useEffect, useState } from "react";
import { Link, useLocation } from "wouter";
import { Helmet } from "react-helmet";
import { AlertCircle, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function ErrorPage() {
  const [location, navigate] = useLocation();
  const [orderNumber, setOrderNumber] = useState<string>("");
  const [errorMessage, setErrorMessage] = useState<string>("We couldn't find any order with the number you provided.");

  // Extract state from location if available
  useEffect(() => {
    // Access state if it was passed via navigation
    const state = (window as any).history.state;
    if (state && state.orderNumber) {
      setOrderNumber(state.orderNumber);
    }
    if (state && state.error) {
      setErrorMessage(state.error);
    }
  }, [location]);

  return (
    <>
      <Helmet>
        <title>Order Not Found - Order Tracker</title>
        <meta name="description" content="The requested order could not be found" />
      </Helmet>
      
      <div className="py-10">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <Card>
            <CardContent className="pt-6 pb-6 text-center">
              <AlertCircle className="mx-auto h-16 w-16 text-red-500 mb-4" />
              <h2 className="text-2xl font-semibold text-gray-900 mb-2">Order Not Found</h2>
              <p className="text-gray-600 mb-6">
                {orderNumber 
                  ? `We couldn't find any order with the number "${orderNumber}".` 
                  : errorMessage}
                <br />
                Please check the order number and try again.
              </p>
              <Link href="/">
                <Button className="flex items-center mx-auto">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to Search
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}
