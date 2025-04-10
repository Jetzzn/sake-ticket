import { Link } from "wouter";
import { Helmet } from "react-helmet";
import { AlertCircle, ArrowLeft, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useState } from "react";

export default function NotFound() {
  const [searchValue, setSearchValue] = useState<string>("");

  // Handle form submission to search for an order
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchValue.trim()) {
      window.location.href = `/order/${searchValue.trim()}`;
    }
  };

  return (
    <>
      <Helmet>
        <title>Page Not Found - Order Tracking System</title>
        <meta name="description" content="The requested page could not be found" />
      </Helmet>
      
      <div className="page-container flex items-center justify-center min-h-[80vh]">
        <div className="bg-white/80 rounded-xl shadow-lg p-8 backdrop-blur-sm w-full max-w-lg">
          <div className="text-center">
            <AlertCircle className="mx-auto h-16 w-16 text-red-500 mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-3">Page Not Found</h2>
            <div className="text-gray-600 mb-6 space-y-2">
              <p>
                The page you're looking for doesn't exist or has been moved.
              </p>
              <p>
                You can search for orders by phone number instead:
              </p>
            </div>

            <form onSubmit={handleSubmit} className="mt-6 mb-6">
              <div className="flex w-full max-w-sm mx-auto items-center space-x-2">
                <Input 
                  type="text" 
                  placeholder="Enter your phone number" 
                  value={searchValue}
                  onChange={(e) => setSearchValue(e.target.value)}
                  className="text-center"
                />
                <Button type="submit" disabled={!searchValue.trim()}>
                  <Search className="h-4 w-4 mr-2" />
                  Search
                </Button>
              </div>
            </form>
            
            <div className="border-t pt-6">
              <Link href="/">
                <Button variant="outline" className="flex items-center mx-auto">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to Home
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
