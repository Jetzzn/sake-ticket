import { QrCode } from "lucide-react";
import { type Order } from "@shared/schema";

interface OrderQRCodeProps {
  order: Order;
}

export default function OrderQRCode({ order }: OrderQRCodeProps) {
  // Generate the full URL for the QR code
  const qrCodeUrl = `${window.location.origin}/order/${order.orderNumber}`;
  
  return (
    <div className="bg-white shadow overflow-hidden sm:rounded-lg mb-8">
      <div className="px-4 py-5 sm:px-6 flex items-center">
        <QrCode className="h-5 w-5 text-gray-500 mr-2" />
        <div>
          <h3 className="text-lg leading-6 font-medium text-gray-900">Order QR Code</h3>
          <p className="mt-1 max-w-2xl text-sm text-gray-500">Scan to view this order.</p>
        </div>
      </div>
      <div className="border-t border-gray-200">
        <div className="px-6 py-5 flex justify-center">
          <div className="flex flex-col items-center">
            <img 
              src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${qrCodeUrl}`}
              alt={`QR Code for Order ${order.orderNumber}`}
              className="h-40 w-40 mb-3"
            />
            <span className="text-sm text-gray-500">Scan to access order information</span>
          </div>
        </div>
      </div>
    </div>
  );
}