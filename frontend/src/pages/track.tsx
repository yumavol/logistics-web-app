import { useState, type FormEvent } from 'react';
import { useQuery } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import { httpGet } from '@/helper/axios';
import { formatDateTime } from '@/helper';
import { OrderStatusBadge } from '@/models/statuses';
import Menu from '@/components/menu';

export default function Track() {
  const [search, setSearch] = useState('');
  const [trackingNumber, setTrackingNumber] = useState('');

  const {
    data: order,
    isLoading,
    isError,
    error,
  } = useQuery<OrderResponse, AxiosError>({
    queryKey: ['track', trackingNumber],
    enabled: !!trackingNumber,
    retry: false,
    queryFn: async () => {
      const response = await httpGet(`/orders/track/${encodeURIComponent(trackingNumber)}`).then((res) => res.data);
      return response.data;
    },
  });

  const notFound = isError && error?.response?.status === 404;

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setTrackingNumber(search.trim());
  };

  return (
    <main className="min-h-screen bg-base-100 font-sans">
      <Menu />
      <div className="max-w-2xl mx-auto px-4 pb-10">
        <h1 className="text-3xl font-bold text-center mb-6">Track Order</h1>

        <form onSubmit={handleSubmit} className="flex gap-2 mb-6">
          <input
            type="text"
            placeholder="Enter tracking number"
            className="input input-bordered flex-1"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <button type="submit" className="btn btn-primary" disabled={!search.trim() || isLoading}>
            {isLoading ? <span className="loading loading-spinner loading-sm" /> : 'Track'}
          </button>
        </form>

        {notFound && (
          <div className="alert alert-error alert-soft">
            <span>No order found with tracking number &quot;{trackingNumber}&quot;.</span>
          </div>
        )}

        {isError && !notFound && (
          <div className="alert alert-error">
            <span>Something went wrong. Please try again.</span>
          </div>
        )}

        {order && !isError && (
          <div className="card bg-base-100 shadow border border-base-200">
            <div className="card-body gap-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm text-base-content/60">Tracking Number</div>
                  <div className="font-mono text-lg font-medium">{order.trackingNumber}</div>
                </div>
                <OrderStatusBadge status={order.status} />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <Detail label="Sender" value={order.senderName} />
                <Detail label="Recipient" value={order.recipientName} />
                <Detail label="Origin" value={order.origin} />
                <Detail label="Destination" value={order.destination} />
                <Detail label="Created At" value={formatDateTime(order.createdAt)} />
                <Detail label="Updated At" value={formatDateTime(order.updatedAt)} />
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-sm text-base-content/60">{label}</div>
      <div className="font-medium">{value}</div>
    </div>
  );
}
