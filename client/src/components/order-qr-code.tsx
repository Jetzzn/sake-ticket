import { QrCode, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { type Order } from "@shared/schema";

interface OrderQRCodeProps {
  order: Order;
}

export default function OrderQRCode({ order }: OrderQRCodeProps) {
  // Generate the full URL for the QR code
  const qrCodeUrl = `${order.orderNumber}`;
  
  // QR code image URL
  const qrCodeImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${qrCodeUrl}`;
  
  // Handle download
  const handleDownload = () => {
    // Create an element to hold the canvas
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    
    // Set canvas dimensions
    canvas.width = 600;
    canvas.height = 750;
    
    if (ctx) {
      // Fill background
      ctx.fillStyle = "#FFFFFF";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      // Create image for QR code
      const img = new Image();
      img.crossOrigin = "anonymous";
      
      img.onload = () => {
        // Draw QR code
        ctx.drawImage(img, 150, 100, 300, 300);
        
        // Draw border
        ctx.strokeStyle = "#e5e7eb";
        ctx.lineWidth = 2;
        ctx.strokeRect(140, 90, 320, 320);
        
        // Add title
        ctx.fillStyle = "#111827";
        ctx.font = "bold 32px Arial";
        ctx.textAlign = "center";
        ctx.fillText("Order QR Code", canvas.width / 2, 60);
        
        // Add order number
        ctx.font = "bold 24px monospace";
        ctx.fillText(`Order: ${order.orderNumber}`, canvas.width / 2, 480);
        

        
        // Create a download link
        const dataUrl = canvas.toDataURL("image/png");
        const link = document.createElement("a");
        link.download = `order-qrcode-${order.orderNumber}.png`;
        link.href = dataUrl;
        link.click();
      };
      
      // Set the source of the image
      img.src = qrCodeImageUrl;
    }
  };
  
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
        <div className="px-6 py-5 flex flex-col items-center">
          <div className="flex flex-col items-center mb-4">
            <img 
              src={qrCodeImageUrl}
              alt={`QR Code for Order ${order.orderNumber}`}
              className="h-40 w-40 mb-3 border border-gray-200 rounded"
            />

            <span className="text-xs font-mono font-semibold text-gray-700">Order: {order.orderNumber}</span>
          </div>
          
          <Button 
            onClick={handleDownload}
            className="flex items-center gap-2"
            variant="outline"
          >
            <Download className="h-4 w-4" />
            Download QR Code Image
          </Button>
        </div>
      </div>
    </div>
  );
}