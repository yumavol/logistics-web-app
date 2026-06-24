import { useQuery } from '@tanstack/react-query';
import { httpGet } from '@/helper/axios';
import { OrderStatusBadge } from '@/models/statuses';
import { formatDateTime } from '@/helper';

export default function Home() {
  const {
    data: orders,
    isLoading,
    isError,
  } = useQuery<OrderResponse[]>({
    queryKey: ['orders'],
    queryFn: async () => {
      const response = await httpGet('/orders').then((res) => res.data);
      return response.data;
    },
  });

  return (
    <main className="min-h-screen bg-base-100 font-sans">
      <div className="max-w-6xl mx-auto px-4 py-10">
        <h1 className="text-4xl font-bold text-center mb-6">Logistics Apps</h1>

        <div className="card bg-base-100 shadow border border-base-200 overflow-hidden">
          <div className="card-body p-0">
            <div className="overflow-x-auto">
              <table className="table w-full">
                <thead>
                  <tr>
                    <th>Tracking Number</th>
                    <th>Sender</th>
                    <th>Recipient</th>
                    <th>Route</th>
                    <th>Status</th>
                    <th>updated At</th>
                  </tr>
                </thead>
                <tbody>
                  {isLoading && (
                    <tr>
                      <td colSpan={6} className="text-center py-8">
                        <span className="loading loading-spinner loading-md" />
                      </td>
                    </tr>
                  )}
                  {!isLoading && isError && (
                    <tr>
                      <td colSpan={6} className="text-center py-8 text-error">
                        Failed to load orders. Please try again.
                      </td>
                    </tr>
                  )}
                  {!isLoading && !isError && (!orders || orders.length === 0) && (
                    <tr>
                      <td colSpan={6} className="text-center py-8 text-base-content/50">
                        No orders found.
                      </td>
                    </tr>
                  )}
                  {!isError &&
                    orders?.map((order) => (
                      <tr key={order.id}>
                        <td className="font-mono font-medium">{order.trackingNumber}</td>
                        <td>{order.senderName}</td>
                        <td>{order.recipientName}</td>
                        <td>
                          {order.origin} - {order.destination}
                        </td>
                        <td>
                          <OrderStatusBadge status={order.status} />
                        </td>
                        <td>{formatDateTime(order.updatedAt)}</td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
