import { type Order, type TrackingUpdate } from "@shared/schema";
import { Check, Truck, Warehouse, Package, PackageOpen } from "lucide-react";

interface TrackingTimelineProps {
  order: Order;
}

export default function TrackingTimeline({ order }: TrackingTimelineProps) {
  const trackingUpdates = order.trackingUpdates as TrackingUpdate[] || [];
  
  // Get icon component based on the icon string
  const getIcon = (icon: string) => {
    switch (icon.toLowerCase()) {
      case 'check':
        return <Check className="h-4 w-4 text-white" />;
      case 'truck':
        return <Truck className="h-4 w-4 text-white" />;
      case 'warehouse':
        return <Warehouse className="h-4 w-4 text-white" />;
      case 'package':
        return <Package className="h-4 w-4 text-white" />;
      case 'package-open':
        return <PackageOpen className="h-4 w-4 text-white" />;
      default:
        return <Package className="h-4 w-4 text-white" />;
    }
  };
  
  // If no tracking updates are available, don't show the component
  if (!trackingUpdates.length) {
    return null;
  }
  
  // Sort updates by timestamp in descending order (newest first)
  const sortedUpdates = [...trackingUpdates].sort((a, b) => {
    return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
  });

  return (
    <div className="mt-8 bg-white shadow sm:rounded-lg">
      <div className="px-4 py-5 sm:px-6">
        <h3 className="text-lg leading-6 font-medium text-gray-900">Shipping Updates</h3>
        <p className="mt-1 max-w-2xl text-sm text-gray-500">Tracking information for your order.</p>
      </div>
      <div className="border-t border-gray-200 px-4 py-5 sm:px-6">
        <div className="flow-root">
          <ul role="list" className="-mb-8">
            {sortedUpdates.map((update, index) => {
              const isLast = index === sortedUpdates.length - 1;
              
              return (
                <li key={index}>
                  <div className={`relative pb-8 ${!isLast ? '' : ''}`}>
                    {!isLast && (
                      <span 
                        className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-gray-200" 
                        aria-hidden="true"
                      />
                    )}
                    <div className="relative flex space-x-3">
                      <div>
                        <span className={`h-8 w-8 rounded-full ${index === 0 ? 'bg-green-500' : 'bg-blue-500'} flex items-center justify-center ring-8 ring-white`}>
                          {getIcon(update.icon)}
                        </span>
                      </div>
                      <div className="min-w-0 flex-1 pt-1.5 flex justify-between space-x-4">
                        <div>
                          <p className="text-sm text-gray-900">{update.status}</p>
                        </div>
                        <div className="text-sm text-gray-500">
                          <time dateTime={update.timestamp}>{update.date}</time>
                        </div>
                      </div>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </div>
  );
}
