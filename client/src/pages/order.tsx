import { useState, useEffect } from "react";
import { useParams, Link, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Helmet } from "react-helmet";
import { Home, ChevronRight, Headset } from "lucide-react";
import { Button } from "@/components/ui/button";
import Loading from "@/components/loading";
import OrderSummary from "@/components/order-summary";
import OrderItems from "@/components/order-items";
import TrackingTimeline from "@/components/tracking-timeline";
import { type Order } from "@shared/schema";

export default function OrderPage() {
  const { orderNumber } = useParams();
  const [, navigate] = useLocation();
  
  // Fetch order data
  const { 
    data: order, 
    isLoading, 
    isError, 
    error
  } = useQuery<Order>({
    queryKey: [`/api/orders/${orderNumber}`],
    retry: 1
  });
  
  // If there's an error, navigate to the error page
  useEffect(() => {
    if (isError) {
      navigate("/error", { 
        replace: true, 
        state: { 
          orderNumber,
          error: error instanceof Error ? error.message : "Unknown error"
        }
      });
    }
  }, [isError, navigate, orderNumber, error]);
  
  // Show loading state while fetching
  if (isLoading) {
    return <Loading />;
  }
  
  // If no order is found, redirect to error page
  if (!order) {
    return null; // Will be handled by the useEffect above
  }

  return (
    <>
      <Helmet>
        <title>Order {orderNumber} - Order Tracker</title>
        <meta name="description" content={`Order details for ${orderNumber}`} />
      </Helmet>
      
      <div className="py-10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Breadcrumbs */}
          <nav className="flex mb-6" aria-label="Breadcrumb">
            <ol className="flex items-center space-x-4">
              <li>
                <div>
                  <Link href="/" className="text-gray-400 hover:text-gray-500">
                    <Home className="h-5 w-5" />
                    <span className="sr-only">Home</span>
                  </Link>
                </div>
              </li>
              <li>
                <div className="flex items-center">
                  <ChevronRight className="text-gray-400 h-5 w-5" />
                  <span className="ml-4 text-sm font-medium text-gray-500">Order Details</span>
                </div>
              </li>
              <li>
                <div className="flex items-center">
                  <ChevronRight className="text-gray-400 h-5 w-5" />
                  <span className="ml-4 text-sm font-medium text-gray-900 font-mono">{orderNumber}</span>
                </div>
              </li>
            </ol>
          </nav>
          
          {/* Order Summary */}
          <OrderSummary order={order} />
          
          {/* Order Items */}
          <OrderItems order={order} />
          
          {/* Tracking Timeline */}
          <TrackingTimeline order={order} />
          
          {/* Help Section */}
          <div className="mt-8 bg-white shadow sm:rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900">Need help with your order?</h3>
              <div className="mt-2 max-w-xl text-sm text-gray-500">
                <p>If you have any questions or concerns about your order, our customer service team is here to help.</p>
              </div>
              <div className="mt-5">
                <Button className="flex items-center">
                  <Headset className="mr-2 h-4 w-4" />
                  Contact Support
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
