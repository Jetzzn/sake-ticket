import { useEffect, useState } from "react";
import { Link, useLocation } from "wouter";
import { Helmet } from "react-helmet";
import { AlertCircle, ArrowLeft, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

export default function ErrorPage() {
  const [location, navigate] = useLocation();
  const [orderNumber, setOrderNumber] = useState<string>("");
  const [searchValue, setSearchValue] = useState<string>("");
  const [errorMessage, setErrorMessage] = useState<string>("Order information not found");

  // Extract state from location if available
  useEffect(() => {
    // Access state if it was passed via navigation
    const state = (window as any).history.state;
    if (state && state.orderNumber) {
      setOrderNumber(state.orderNumber);
      setSearchValue(state.orderNumber);
    }
    if (state && state.error) {
      setErrorMessage(state.error);
    }
  }, [location]);

  // Handle form submission to search for a new order
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchValue.trim()) {
      navigate(`/order/${searchValue.trim()}`);
    }
  };

  return (
    <>
      <Helmet>
        <title>Order Not Found - Order Tracking System</title>
        <meta name="description" content="The specified order could not be found" />
      </Helmet>
      
      <div className="page-container flex items-center justify-center min-h-[80vh]">
        <div className="bg-white/80 rounded-xl shadow-lg p-8 backdrop-blur-sm w-full max-w-lg">
          <div className="text-center">
            <AlertCircle className="mx-auto h-16 w-16 text-red-500 mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-3">Order Not Found</h2>
            <div className="text-gray-600 mb-6 space-y-2">
              <p>
                {orderNumber 
                  ? `No orders found matching the phone number "${orderNumber}"` 
                  : errorMessage}
              </p>
              <p>
                กรุณาตรวจสอบหมายเลขโทรศัพท์ของคุณหรือหากถูกต้องกรุณารอประมาณ 15 นาทีแล้วกลับมาที่ลิงก์อีกครั้ง<br></br>Please check your phone number or if it is correct please wait for about 15 minutes and come back to the link again.
              </p>
            </div>
            
            <Link href="/">
              <Button variant="outline" className="flex items-center mx-auto mt-4">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Home
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
