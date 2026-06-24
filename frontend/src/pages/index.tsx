/* eslint-disable react-hooks/refs */
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { httpGet, httpPost } from '@/helper/axios';
import { useRef, useState } from 'react';
import cn from 'classnames';
import Modal from '@/components/modal';
import SimpleReactValidator from 'simple-react-validator';
import { OrderStatusBadge, ORDER_STATUS_OPTIONS } from '@/models/statuses';
import { CITY_OPTIONS } from '@/models/cities';
import { alertToast, formatDateTime, waitAsync } from '@/helper';
import { useDebounce } from 'use-debounce';

export default function Home() {
  const [modalForm, setModalForm] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string | undefined>(undefined);
  const [search, setSearch] = useState('');
  const [debouncedSearch] = useDebounce(search, 400);

  const {
    data: orders,
    isLoading,
    isError,
  } = useQuery<OrderResponse[]>({
    queryKey: ['orders', statusFilter, debouncedSearch],
    queryFn: async () => {
      const response = await httpGet('/orders', false, {
        status: statusFilter,
        search: debouncedSearch || undefined,
      }).then((res) => res.data);
      return response.data;
    },
  });

  return (
    <main className="min-h-screen bg-base-100 font-sans">
      <div className="max-w-6xl mx-auto px-4 py-10">
        <h1 className="text-4xl font-bold text-center mb-6">Logistics Apps</h1>

        <div className="flex justify-end mb-4">
          <button className="btn btn-primary" onClick={() => setModalForm(true)}>
            Create Order
          </button>
        </div>

        <div className="flex flex-wrap items-end gap-3 mb-4">
          <div className="flex flex-wrap gap-2">
            <button
              className={cn('btn btn-sm', statusFilter === undefined ? 'btn-primary' : 'btn-outline')}
              onClick={() => setStatusFilter(undefined)}
            >
              All
            </button>
            {ORDER_STATUS_OPTIONS.map((status) => (
              <button
                key={status.value}
                className={cn('btn btn-sm', statusFilter === status.value ? 'btn-primary' : 'btn-outline')}
                onClick={() => setStatusFilter(status.value)}
              >
                {status.label}
              </button>
            ))}
          </div>
          <div className="flex-1" />
          <input
            type="text"
            placeholder="Search tracking, sender, recipient"
            className="input input-bordered input-sm w-72"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

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

      <OrderForm setShowModal={setModalForm} showModal={modalForm} />
    </main>
  );
}

function OrderForm({ setShowModal, showModal }: { setShowModal: (show: boolean) => void; showModal: boolean }) {
  const [, rerender] = useState(0);
  const validator = useRef(new SimpleReactValidator());
  const queryClient = useQueryClient();

  const [senderName, setSenderName] = useState('');
  const [recipientName, setRecipientName] = useState('');
  const [origin, setOrigin] = useState('');
  const [destination, setDestination] = useState('');

  const resetForm = () => {
    setSenderName('');
    setRecipientName('');
    setOrigin('');
    setDestination('');
    validator.current.hideMessages();
  };

  const { mutate: save, isPending } = useMutation({
    mutationFn: async (payload: { senderName: string; recipientName: string; origin: string; destination: string }) => {
      const [response] = await Promise.all([httpPost('/orders', payload), waitAsync(1000)]);
      return response;
    },
    onSuccess: () => {
      alertToast('success', 'Order created successfully');
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      resetForm();
      setShowModal(false);
    },
  });

  const performSubmit = () => {
    if (!validator.current.allValid()) {
      validator.current.showMessages();
      rerender((prev) => prev + 1);
      alertToast('error', 'Please fill in all required fields');
      return;
    }

    save({ senderName, recipientName, origin, destination });
  };

  const validate = {
    senderName: validator.current.message('sender name', senderName, 'required', validateConfig),
    recipientName: validator.current.message('recipient name', recipientName, 'required', validateConfig),
    origin: validator.current.message('origin', origin, 'required', validateConfig),
    destination: validator.current.message('destination', destination, 'required', validateConfig),
  };

  return (
    <Modal
      onModalClose={() => {
        resetForm();
        setShowModal(false);
      }}
      showModal={showModal}
      size="md"
      title="Create Order"
    >
      <form
        onSubmit={(e) => {
          e.preventDefault();
          e.stopPropagation();
          performSubmit();
        }}
        className="flex flex-col gap-4"
      >
        <div>
          <div className="form-label">Sender Name</div>
          <input
            type="text"
            placeholder="Sender Name"
            className={cn('input input-bordered w-full', validate.senderName && 'input-error')}
            value={senderName}
            onChange={(e) => setSenderName(e.target.value)}
          />
          {validate.senderName}
        </div>

        <div>
          <div className="form-label">Recipient Name</div>
          <input
            type="text"
            placeholder="Recipient Name"
            className={cn('input input-bordered w-full', validate.recipientName && 'input-error')}
            value={recipientName}
            onChange={(e) => setRecipientName(e.target.value)}
          />
          {validate.recipientName}
        </div>

        <div>
          <div className="form-label">Origin</div>
          <select
            className={cn('select select-bordered w-full', validate.origin && 'select-error')}
            value={origin}
            onChange={(e) => setOrigin(e.target.value)}
          >
            <option value="">Select origin</option>
            {CITY_OPTIONS.map((city) => (
              <option key={city.value} value={city.value}>
                {city.label}
              </option>
            ))}
          </select>
          {validate.origin}
        </div>

        <div>
          <div className="form-label">Destination</div>
          <select
            className={cn('select select-bordered w-full', validate.destination && 'select-error')}
            value={destination}
            onChange={(e) => setDestination(e.target.value)}
          >
            <option value="">Select destination</option>
            {CITY_OPTIONS.map((city) => (
              <option key={city.value} value={city.value}>
                {city.label}
              </option>
            ))}
          </select>
          {validate.destination}
        </div>

        <div className="w-full pt-4">
          <button type="submit" className="btn btn-primary w-full" disabled={isPending}>
            {isPending ? <span className="loading loading-spinner loading-sm" /> : 'Create'}
          </button>
        </div>
      </form>
    </Modal>
  );
}

const validateConfig = { className: 'text-red-500 text-sm' };
