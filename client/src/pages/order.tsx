import { useState, useEffect } from "react";
import { useParams, Link, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Helmet } from "react-helmet";
import { Home, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import Loading from "@/components/loading";
import OrderQRCode from "@/components/order-qr-code";
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
      // For 404 errors, show a specific message
      const errorMsg = error instanceof Error 
        ? error.message 
        : "We encountered an error while searching for your order.";
      
      navigate("/error", { 
        replace: true, 
        state: { 
          orderNumber,
          error: errorMsg
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

          {/* Order Status Alert */}
          {order.orderStatus === "CANCELED" && (
            <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-8">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-red-700">
                    <span className="font-medium">Order Canceled:</span> This order has been canceled.
                  </p>
                </div>
              </div>
            </div>
          )}
          
          {/* Expired Order Alert */}
          {order.orderStatus === "EXPIRED" && (
            <div className="bg-gray-50 border-l-4 border-gray-400 p-4 mb-8">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-gray-700">
                    <span className="font-medium">Order Expired:</span> This order has expired.
                  </p>
                </div>
              </div>
            </div>
          )}
          
          {/* Payment Status Alert */}
          {order.orderStatus !== "CANCELED" && 
           order.orderStatus !== "EXPIRED" &&
           order.paymentStatus !== "PAYMENT_LS_RLP" && 
           order.paymentStatus !== "PAYMENT_LS_QR_PROMPTPAY" && 
           order.paymentStatus !== "PAID" && (
            <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-8">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-yellow-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-yellow-700">
                    <span className="font-medium">Please Note:</span> Payment is required to view complete order details.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Order Details (Basic information for all orders) */}
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
                {(order.paymentStatus === "PAYMENT_LS_RLP" || 
                  order.paymentStatus === "PAYMENT_LS_QR_PROMPTPAY" || 
                  order.paymentStatus === "PAID") && (
                  <>
                    <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                      <dt className="text-sm font-medium text-gray-500">Email</dt>
                      <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{order.email}</dd>
                    </div>
                    <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                      <dt className="text-sm font-medium text-gray-500">Total price</dt>
                      <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2 font-medium">{order.totalPrice}</dd>
                    </div>
                  </>
                )}
              </dl>
            </div>
          </div>
          
          {/* Show the following components only for paid orders */}
          {(order.paymentStatus === "PAYMENT_LS_RLP" || 
            order.paymentStatus === "PAYMENT_LS_QR_PROMPTPAY" || 
            order.paymentStatus === "PAID") && (
            <>
              {/* QR Code */}
              <OrderQRCode order={order} />
              
              {/* Order Items Summary */}
              <div className="bg-white shadow overflow-hidden sm:rounded-lg mb-8">
                <div className="px-4 py-5 sm:px-6">
                  <h3 className="text-lg leading-6 font-medium text-gray-900">Order Items</h3>
                  <p className="mt-1 max-w-2xl text-sm text-gray-500">Summary of ordered items.</p>
                </div>
                <div className="border-t border-gray-200">
                  <div className="px-6 py-5">
                    <div className="bg-gray-50 rounded-lg p-4 text-base text-gray-800">
                      {/* Remove quotes from the string if it starts and ends with quotes */}
                      {typeof order.orderItemsSummary === 'string' 
                        ? order.orderItemsSummary.replace(/^"|"$/g, '') 
                        : 'No items data available'}
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
          
  

        </div>
      </div>
    </>
  );
}
