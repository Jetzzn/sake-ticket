import { Helmet } from "react-helmet";
import SearchForm from "@/components/search-form";

export default function HomePage() {
  return (
    <>
      <Helmet>
        <title>Get E-ticket</title>
        <meta name="description" content="ติดตามคำสั่งซื้อของคุณด้วยการใส่หมายเลขโทรศัพท์" />
      </Helmet>

      <div className="page-container">
        <div className="bg-white/80 rounded-xl shadow-lg p-8 backdrop-blur-sm">
          {/* Logo added above the heading */}
          <div className="flex justify-center mb-6">
            <img 
              src="/src/assets/sake.png" 
              alt="Sake Week Thailand 2025 Logo" 
              className="h-24 w-auto"
            />
          </div>

          <div className="text-center mb-10">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">Get E-ticket</h1>
            <p className="text-gray-600 max-w-xl mx-auto">
              Please enter your phone number to get E-ticket to join the Sake Week Thailand 2025.
            </p>
          </div>

          <SearchForm />
        </div>
      </div>
    </>
  );
}