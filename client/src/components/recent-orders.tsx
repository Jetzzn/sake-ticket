import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { History } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { type RecentOrder } from "@shared/schema";
import { formatDistanceToNow } from "date-fns";

export default function RecentOrders() {
  const { data: recentOrders, isLoading, error } = useQuery<RecentOrder[]>({
    queryKey: ['/api/recent-orders'],
  });

  // Format the date for display
  const formatViewedDate = (dateString: string | Date) => {
    const date = typeof dateString === 'string' 
      ? new Date(dateString) 
      : dateString;
    
    return `Viewed ${formatDistanceToNow(date, { addSuffix: true })}`;
  };

  // Get status color classes
  const getStatusColor = (status: string) => {
    const statusLower = status.toLowerCase();
    
    if (statusLower === 'delivered') {
      return 'bg-green-100 text-green-800';
    } else if (statusLower === 'shipped') {
      return 'bg-blue-100 text-blue-800';
    } else if (statusLower === 'processing') {
      return 'bg-yellow-100 text-yellow-800';
    } else if (statusLower === 'cancelled') {
      return 'bg-red-100 text-red-800';
    } else {
      return 'bg-gray-100 text-gray-800';
    }
  };

  if (isLoading) {
    return (
      <div className="mt-10">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Recently Viewed Orders</h2>
        <div className="bg-white shadow-md rounded-lg overflow-hidden">
          <div className="divide-y divide-gray-200">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="p-4">
                <Skeleton className="h-5 w-32 mb-2" />
                <Skeleton className="h-4 w-48" />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mt-10">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Recently Viewed Orders</h2>
        <div className="bg-white shadow-md rounded-lg overflow-hidden p-6 text-center">
          <p className="text-red-500">Error loading recent orders</p>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-10">
      <h2 className="text-xl font-semibold text-gray-800 mb-4">Recently Viewed Orders</h2>
      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        {(!recentOrders || recentOrders.length === 0) ? (
          <div className="p-6 text-center">
            <div className="mx-auto h-12 w-12 text-gray-400">
              <History className="h-12 w-12 mx-auto" />
            </div>
            <h3 className="mt-2 text-sm font-medium text-gray-900">No recent orders</h3>
            <p className="mt-1 text-sm text-gray-500">Search for an order to see it appear here.</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {recentOrders.map((order) => (
              <Link 
                key={`${order.orderNumber}-${order.viewedAt.toString()}`} 
                href={`/${order.orderNumber}`}
                className="block hover:bg-gray-50"
              >
                <div className="px-4 py-4 sm:px-6">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-primary truncate font-mono">
                      {order.orderNumber}
                    </p>
                    <div className="ml-2 flex-shrink-0 flex">
                      <p className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(order.status)}`}>
                        {order.status}
                      </p>
                    </div>
                  </div>
                  <div className="mt-2 sm:flex sm:justify-between">
                    <div className="sm:flex">
                      <p className="flex items-center text-sm text-gray-500">
                        <History className="flex-shrink-0 mr-1.5 h-4 w-4 text-gray-400" />
                        {formatViewedDate(order.viewedAt)}
                      </p>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
