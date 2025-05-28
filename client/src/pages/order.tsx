import { useState, useEffect } from "react";
import { useParams, Link, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Helmet } from "react-helmet";
import { Home, ChevronRight, Calendar, Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import Loading from "@/components/loading";
import OrderQRCode from "@/components/order-qr-code";
import { type Order } from "@shared/schema";

// Helper function to format date
function formatDate(dateString: string): string {
  try {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', { 
      day: 'numeric', 
      month: 'long', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  } catch (e) {
    return dateString;
  }
}

export default function OrderPage() {
  const { phoneNumber, orderNumber } = useParams();
  const [, navigate] = useLocation();
  
  // If we have both phone number and order number, fetch that specific order
  // Otherwise, fetch all orders for this phone number
  const isMultipleOrders = phoneNumber && !orderNumber;
  
  const { 
    data, 
    isLoading, 
    isError, 
    error
  } = useQuery({
    queryKey: [
      phoneNumber && orderNumber 
        ? `/api/orders/phone/${phoneNumber}/${orderNumber}` 
        : `/api/orders/phone/${phoneNumber}`
    ],
    retry: 1
  });
  
  // If there's an error, navigate to the error page
  useEffect(() => {
    if (isError) {
      // For 404 errors, show a specific message
      const errorMsg = error instanceof Error 
        ? error.message 
        : "Order information not found. Please check your phone number and try again";
      
      navigate("/error", { 
        replace: true, 
        state: { 
          orderNumber: phoneNumber,
          error: errorMsg
        }
      });
    }
  }, [isError, navigate, phoneNumber, error]);
  
  // Show loading state while fetching
  if (isLoading) {
    return <Loading />;
  }
  
  // If no order is found, redirect to error page
  if (!data) {
    return null; // Will be handled by the useEffect above
  }
  
  // If we're showing multiple orders (or even a single order from a phone number search)
  if (Array.isArray(data)) {
    return (
      <>
        <Helmet>
          
          <title>All Orders - Orderb Tracking System</title>
          <meta name="description" content={`Order list for phone number ${phoneNumber}`} />
        </Helmet>
        
        <div className="page-container">
          <div className="bg-white/80 rounded-xl shadow-lg p-8 backdrop-blur-sm">
            {/* <nav className="flex mb-6" aria-label="Breadcrumb">
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
                    <span className="ml-4 text-sm font-medium text-gray-500">Orders List</span>
                  </div>
                </li>
              </ol>
            </nav> */}
            {/* Logo added above the heading */}
            <div className="flex justify-center mb-6">
              <img 
                src="https://in2it-service.com/Sake/sake.png" 
                alt="Sake Week Thailand 2025 Logo" 
                className="h-24 w-auto"
              />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-6">Orders for phone number {phoneNumber}</h1>
            
            <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-2">
              {data.map((order: Order) => (
        // Card component with order items summary
        <Card key={order.orderNumber} className="hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <h2 className="text-lg font-semibold mb-2">
                  Order #{order.orderNumber}
                </h2>
                <p className="text-sm text-gray-500 mb-4">{order.recipientName}</p>

                <div className="flex items-center text-sm text-gray-500 mb-4">
                  <Package className="h-4 w-4 mr-2" />
                  <span>Status: {
                    order.paymentStatus === "PAID" ? "Paid" :
                    order.paymentStatus === "REFUND" ? "Refunded" :
                    order.paymentStatus === "NO_PAYMENT" ? "No Payment" :
                    "Pending Payment"
                  }</span>
                </div>
              </div>

              {/* Status badge */}
              <div className={`text-xs font-medium rounded-full px-2.5 py-1 ${
                order.paymentStatus === "PAID" ? "bg-green-100 text-green-800" :
                order.paymentStatus === "REFUND" ? "bg-blue-100 text-blue-800" :
                order.paymentStatus === "NO_PAYMENT" ? "bg-yellow-100 text-yellow-800" :
                "bg-yellow-100 text-yellow-800"
              }`}>
                {
                  order.paymentStatus === "PAID" ? "Paid" :
                  order.paymentStatus === "REFUND" ? "Refunded" :
                  order.paymentStatus === "NO_PAYMENT" ? "No Payment" :
                  "Pending Payment"
                }
              </div>
            </div>

            {/* Order Items Summary */}
            <div className="mt-4 mb-4 pt-4 border-t border-gray-100">
              <h3 className="text-sm font-medium text-gray-700 mb-2">Order:</h3>
              <div className="bg-gray-50 rounded p-3 text-sm text-gray-800">
                {typeof order.orderItemsSummary === 'string' 
                  ? order.orderItemsSummary.replace(/^"|"$/g, '') 
                  : 'No order items information available'}
              </div>
            </div>

            <div className="pt-4 border-t border-gray-100">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-lg font-bold">{order.totalPrice} THB</p>
                </div>
                <Link href={`/order/${phoneNumber}/${order.orderNumber}`}>
                  <Button variant="outline" size="sm">
                    View Details
                  </Button>
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>
              ))}
            </div>
          </div>
        </div>
      </>
    );
  }
  
  // Single order mode
  const order = Array.isArray(data) ? data[0] : data;

  return (
    <>
      <Helmet>
        <title>Order {order.orderNumber} - Order Tracking System</title>
        <meta name="description" content={`Order details for ${order.orderNumber}`} />
      </Helmet>
      
      <div className="page-container">
        <div className="bg-white/80 rounded-xl shadow-lg p-8 backdrop-blur-sm">
          {/* <nav className="flex mb-6" aria-label="Breadcrumb">
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
                  <span className="ml-4 text-sm font-medium text-gray-900 font-mono">{order.orderNumber}</span>
                </div>
              </li>
            </ol>
          </nav> */}

          {/* Show QR Code at the top for paid orders */}
          {order.paymentStatus === "PAID" && (
            /* QR Code */
            <OrderQRCode order={order} />
          )}

          {/* Note: We're no longer checking orderStatus, only paymentStatus */}
          
          {/* Refund Status Alert */}
          {order.paymentStatus === "REFUND" && (
            <div className="bg-blue-50 border-l-4 border-blue-400 p-4 mb-8">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-blue-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                    <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-blue-700">
                    <span className="font-medium">Refund Processed:</span> A refund has been processed for this order.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* No Payment Status Alert */}
          {order.paymentStatus === "NO_PAYMENT" && (
            <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-8">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-yellow-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-yellow-700">
                    <span className="font-medium">Please Note:</span> Payment is required to view full order details or if you have already paid please wait 15 minutes and then come back to the link.<br></br>
                    <span className="font-medium">โปรดทราบ:</span> จำเป็นต้องชำระเงินเพื่อดูรายละเอียดคำสั่งซื้อทั้งหมด หรือหากคุณได้ชำระเงินไปแล้ว โปรดรอ 15 นาทีแล้วกลับมาที่ลิงก์
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Order Details (Basic information for all orders) */}
          <div className="bg-white shadow overflow-hidden sm:rounded-lg mb-8">
            <div className="px-4 py-5 sm:px-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900">Order Details</h3>
              <p className="mt-1 max-w-2xl text-sm text-gray-500">Information about this order</p>
            </div>
            <div className="border-t border-gray-200">
              <dl>
                <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-gray-500">Order Number</dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2 font-mono">{order.orderNumber}</dd>
                </div>
                <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-gray-500">Recipient Name</dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{order.recipientName}</dd>
                </div>
                <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-gray-500">Phone Number</dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{order.phoneNumber}</dd>
                </div>
                {order.paymentStatus === "PAID" && (
                  <>
                    <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                      <dt className="text-sm font-medium text-gray-500">Email</dt>
                      <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{order.email}</dd>
                    </div>
                    <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                      <dt className="text-sm font-medium text-gray-500">Total Price</dt>
                      <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2 font-medium">{order.totalPrice} THB</dd>
                    </div>
                  </>
                )}
              </dl>
            </div>
          </div>
          
          {/* Show Order Items Summary only for paid orders */}
          {order.paymentStatus === "PAID" && (
            /* Order Items Summary */
            <div className="bg-white shadow overflow-hidden sm:rounded-lg mb-8">
              <div className="px-4 py-5 sm:px-6">
                <h3 className="text-lg leading-6 font-medium text-gray-900">Order Items</h3>
                <p className="mt-1 max-w-2xl text-sm text-gray-500">Summary of ordered items</p>
              </div>
              <div className="border-t border-gray-200">
                <div className="px-6 py-5">
                  <div className="bg-gray-50 rounded-lg p-4 text-base text-gray-800">
                    {/* Remove quotes from the string if it starts and ends with quotes */}
                    {typeof order.orderItemsSummary === 'string' 
                      ? order.orderItemsSummary.replace(/^"|"$/g, '') 
                      : 'No order items information available'}
                  </div>
                </div>
              </div>
            </div>
          )}
          
  

        </div>
      </div>
    </>
  );
}
