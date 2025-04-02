import { Helmet } from "react-helmet";
import SearchForm from "@/components/search-form";

export default function HomePage() {
  return (
    <>
      <Helmet>
        <title>Order Tracker - Search for your order</title>
        <meta name="description" content="Track your order by entering your order number" />
      </Helmet>
      
      <div className="py-10">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">Track Your Order</h1>
            <p className="text-gray-600 max-w-xl mx-auto">
              Enter your order number to view detailed information about your order status, 
              shipping details, and more.
            </p>
          </div>
          
          <SearchForm />
        </div>
      </div>
    </>
  );
}
