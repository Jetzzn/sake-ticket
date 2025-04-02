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
  const [errorMessage, setErrorMessage] = useState<string>("ไม่พบข้อมูลคำสั่งซื้อของท่าน");

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
        <title>ไม่พบคำสั่งซื้อ - ระบบติดตามคำสั่งซื้อ</title>
        <meta name="description" content="ไม่พบข้อมูลคำสั่งซื้อตามที่ระบุ" />
      </Helmet>
      
      <div className="min-h-[80vh] flex items-center justify-center py-10">
        <div className="max-w-lg w-full mx-auto px-4 sm:px-6 lg:px-8">
          <Card className="shadow-lg">
            <CardContent className="pt-6 pb-4 text-center">
              <AlertCircle className="mx-auto h-16 w-16 text-red-500 mb-4" />
              <h2 className="text-2xl font-bold text-gray-900 mb-3">ไม่พบคำสั่งซื้อ</h2>
              <div className="text-gray-600 mb-6 space-y-2">
                <p>
                  {orderNumber 
                    ? `ไม่พบคำสั่งซื้อที่ตรงกับหมายเลขโทรศัพท์ "${orderNumber}"` 
                    : errorMessage}
                </p>
                <p>
                  โปรดตรวจสอบหมายเลขโทรศัพท์และลองใหม่อีกครั้ง
                </p>
              </div>

              <form onSubmit={handleSearch} className="mt-6 mb-2">
                <div className="flex w-full max-w-sm mx-auto items-center space-x-2">
                  <Input 
                    type="text" 
                    placeholder="กรุณาใส่หมายเลขโทรศัพท์" 
                    value={searchValue}
                    onChange={(e) => setSearchValue(e.target.value)}
                    className="text-center"
                  />
                  <Button type="submit" disabled={!searchValue.trim()}>
                    <Phone className="h-4 w-4 mr-2" />
                    ค้นหา
                  </Button>
                </div>
              </form>
            </CardContent>
            <CardFooter className="justify-center border-t pt-4 pb-6">
              <Link href="/">
                <Button variant="outline" className="flex items-center mx-auto">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  กลับสู่หน้าหลัก
                </Button>
              </Link>
            </CardFooter>
          </Card>
        </div>
      </div>
    </>
  );
}
