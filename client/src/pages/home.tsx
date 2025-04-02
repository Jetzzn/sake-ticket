import { Helmet } from "react-helmet";
import SearchForm from "@/components/search-form";

export default function HomePage() {
  return (
    <>
      <Helmet>
        <title>ระบบติดตามคำสั่งซื้อ - ค้นหาคำสั่งซื้อของคุณ</title>
        <meta name="description" content="ติดตามคำสั่งซื้อของคุณด้วยการใส่หมายเลขโทรศัพท์" />
      </Helmet>
      
      <div className="py-10">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">ติดตามคำสั่งซื้อของคุณ</h1>
            <p className="text-gray-600 max-w-xl mx-auto">
              กรุณาใส่หมายเลขโทรศัพท์ของคุณเพื่อดูข้อมูลรายละเอียดเกี่ยวกับสถานะคำสั่งซื้อ 
              รายละเอียดการจัดส่ง และอื่นๆ
            </p>
          </div>
          
          <SearchForm />
        </div>
      </div>
    </>
  );
}
