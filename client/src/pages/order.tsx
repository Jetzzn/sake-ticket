import { useState, useEffect } from "react";
import { useParams, Link, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Helmet } from "react-helmet";
import { Home, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import Loading from "@/components/loading";
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
          
          {/* Order Details */}
          <div className="bg-white shadow overflow-hidden sm:rounded-lg mb-8">
            <div className="px-4 py-5 sm:px-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900">Order Details</h3>
              <p className="mt-1 max-w-2xl text-sm text-gray-500">Information about this order.</p>
            </div>
            <div className="border-t border-gray-200">
              <dl>
                <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-gray-500">Order number</dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2 font-mono">{order.orderNumber}</dd>
                </div>
                <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-gray-500">Recipient name</dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{order.recipientName}</dd>
                </div>
                <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-gray-500">Phone number</dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{order.phoneNumber}</dd>
                </div>
                <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-gray-500">Email</dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{order.email}</dd>
                </div>
                <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-gray-500">Total price</dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2 font-medium">{order.totalPrice}</dd>
                </div>
              </dl>
            </div>
          </div>
          
          {/* Order Items Summary */}
          <div className="bg-white shadow overflow-hidden sm:rounded-lg mb-8">
            <div className="px-4 py-5 sm:px-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900">Order Items</h3>
              <p className="mt-1 max-w-2xl text-sm text-gray-500">Summary of ordered items.</p>
            </div>
            <div className="border-t border-gray-200 px-4 py-5 sm:px-6">
              <pre className="text-sm text-gray-800 whitespace-pre-wrap">{JSON.stringify(order.orderItemsSummary, null, 2)}</pre>
            </div>
          </div>
          

        </div>
      </div>
    </>
  );
}
