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
    return new Intl.DateTimeFormat('th-TH', { 
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
        : "ไม่พบข้อมูลคำสั่งซื้อของท่าน โปรดตรวจสอบหมายเลขโทรศัพท์อีกครั้ง";
      
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
          <title>คำสั่งซื้อทั้งหมด - ระบบติดตามคำสั่งซื้อ</title>
          <meta name="description" content={`รายการคำสั่งซื้อสำหรับเบอร์โทรศัพท์ ${phoneNumber}`} />
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
                      <span className="sr-only">หน้าหลัก</span>
                    </Link>
                  </div>
                </li>
                <li>
                  <div className="flex items-center">
                    <ChevronRight className="text-gray-400 h-5 w-5" />
                    <span className="ml-4 text-sm font-medium text-gray-500">รายการคำสั่งซื้อ</span>
                  </div>
                </li>
                <li>
                  <div className="flex items-center">
                    <ChevronRight className="text-gray-400 h-5 w-5" />
                    <span className="ml-4 text-sm font-medium text-gray-900">{phoneNumber}</span>
                  </div>
                </li>
              </ol>
            </nav>
            
            <h1 className="text-2xl font-bold text-gray-900 mb-6">คำสั่งซื้อสำหรับเบอร์โทรศัพท์ {phoneNumber}</h1>
            
            <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-2">
              {data.map((order: Order) => (
                <Card key={order.orderNumber} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start">
                      <div>
                        <h2 className="text-lg font-semibold mb-2">
                          คำสั่งซื้อ #{order.orderNumber}
                        </h2>
                        <p className="text-sm text-gray-500 mb-4">{order.recipientName}</p>
                        
                        <div className="flex items-center text-sm text-gray-500 mb-1">
                          <Calendar className="h-4 w-4 mr-2" />
                          <span>วันที่สั่งซื้อ: ไม่มีข้อมูล</span>
                        </div>
                        
                        <div className="flex items-center text-sm text-gray-500 mb-4">
                          <Package className="h-4 w-4 mr-2" />
                          <span>สถานะ: {
                            order.orderStatus === "CANCELED" ? "ยกเลิกแล้ว" :
                            order.orderStatus === "EXPIRED" ? "หมดอายุ" :
                            order.paymentStatus === "PAID" ? "ชำระเงินแล้ว" :
                            "รอดำเนินการ"
                          }</span>
                        </div>
                      </div>
                      
                      {/* Status badge */}
                      <div className={`text-xs font-medium rounded-full px-2.5 py-1 ${
                        order.orderStatus === "CANCELED" ? "bg-red-100 text-red-800" :
                        order.orderStatus === "EXPIRED" ? "bg-gray-100 text-gray-800" :
                        order.paymentStatus === "PAID" ? "bg-green-100 text-green-800" :
                        "bg-yellow-100 text-yellow-800"
                      }`}>
                        {
                          order.orderStatus === "CANCELED" ? "ยกเลิกแล้ว" :
                          order.orderStatus === "EXPIRED" ? "หมดอายุ" :
                          order.paymentStatus === "PAID" || 
                          order.paymentStatus === "PAYMENT_LS_RLP" || 
                          order.paymentStatus === "PAYMENT_LS_QR_PROMPTPAY" ? "ชำระเงินแล้ว" :
                          "รอชำระเงิน"
                        }
                      </div>
                    </div>
                    
                    <div className="mt-4 pt-4 border-t border-gray-100">
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="text-lg font-bold">{order.totalPrice} บาท</p>
                        </div>
                        <Link href={`/order/${phoneNumber}/${order.orderNumber}`}>
                          <Button variant="outline" size="sm">
                            ดูรายละเอียด
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
        <title>คำสั่งซื้อ {order.orderNumber} - ระบบติดตามคำสั่งซื้อ</title>
        <meta name="description" content={`รายละเอียดคำสั่งซื้อหมายเลข ${order.orderNumber}`} />
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
                  <span className="ml-4 text-sm font-medium text-gray-500">รายละเอียดคำสั่งซื้อ</span>
                </div>
              </li>
              <li>
                <div className="flex items-center">
                  <ChevronRight className="text-gray-400 h-5 w-5" />
                  <span className="ml-4 text-sm font-medium text-gray-900 font-mono">{order.orderNumber}</span>
                </div>
              </li>
            </ol>
          </nav>

          {/* Show QR Code at the top for paid orders */}
          {(order.paymentStatus === "PAYMENT_LS_RLP" || 
            order.paymentStatus === "PAYMENT_LS_QR_PROMPTPAY" || 
            order.paymentStatus === "PAID") && (
            /* QR Code */
            <OrderQRCode order={order} />
          )}

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
                    <span className="font-medium">คำสั่งซื้อถูกยกเลิก:</span> คำสั่งซื้อนี้ได้ถูกยกเลิกแล้ว
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
                    <span className="font-medium">คำสั่งซื้อหมดอายุ:</span> คำสั่งซื้อนี้ได้หมดอายุแล้ว
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
                    <span className="font-medium">โปรดทราบ:</span> จำเป็นต้องชำระเงินก่อนเพื่อดูรายละเอียดคำสั่งซื้อทั้งหมด
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Order Details (Basic information for all orders) */}
          <div className="bg-white shadow overflow-hidden sm:rounded-lg mb-8">
            <div className="px-4 py-5 sm:px-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900">รายละเอียดคำสั่งซื้อ</h3>
              <p className="mt-1 max-w-2xl text-sm text-gray-500">ข้อมูลเกี่ยวกับคำสั่งซื้อนี้</p>
            </div>
            <div className="border-t border-gray-200">
              <dl>
                <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-gray-500">หมายเลขคำสั่งซื้อ</dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2 font-mono">{order.orderNumber}</dd>
                </div>
                <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-gray-500">ชื่อผู้รับ</dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{order.recipientName}</dd>
                </div>
                <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-gray-500">หมายเลขโทรศัพท์</dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{order.phoneNumber}</dd>
                </div>
                {(order.paymentStatus === "PAYMENT_LS_RLP" || 
                  order.paymentStatus === "PAYMENT_LS_QR_PROMPTPAY" || 
                  order.paymentStatus === "PAID") && (
                  <>
                    <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                      <dt className="text-sm font-medium text-gray-500">อีเมล</dt>
                      <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{order.email}</dd>
                    </div>
                    <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                      <dt className="text-sm font-medium text-gray-500">ราคารวม</dt>
                      <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2 font-medium">{order.totalPrice} บาท</dd>
                    </div>
                  </>
                )}
              </dl>
            </div>
          </div>
          
          {/* Show Order Items Summary only for paid orders */}
          {(order.paymentStatus === "PAYMENT_LS_RLP" || 
            order.paymentStatus === "PAYMENT_LS_QR_PROMPTPAY" || 
            order.paymentStatus === "PAID") && (
            /* Order Items Summary */
            <div className="bg-white shadow overflow-hidden sm:rounded-lg mb-8">
              <div className="px-4 py-5 sm:px-6">
                <h3 className="text-lg leading-6 font-medium text-gray-900">รายการสินค้า</h3>
                <p className="mt-1 max-w-2xl text-sm text-gray-500">สรุปรายการสินค้าที่สั่งซื้อ</p>
              </div>
              <div className="border-t border-gray-200">
                <div className="px-6 py-5">
                  <div className="bg-gray-50 rounded-lg p-4 text-base text-gray-800">
                    {/* Remove quotes from the string if it starts and ends with quotes */}
                    {typeof order.orderItemsSummary === 'string' 
                      ? order.orderItemsSummary.replace(/^"|"$/g, '') 
                      : 'ไม่มีข้อมูลรายการสินค้า'}
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
