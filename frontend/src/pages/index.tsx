/* eslint-disable react-hooks/refs */
import { Geist } from 'next/font/google';
import cn from 'classnames';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { httpGet, httpPost, httpPatch, httpDelete } from '@/helper/axios';
import { useEffect, useRef, useState } from 'react';
import Modal from '@/components/modal';
import SimpleReactValidator from 'simple-react-validator';
import { alertToast } from '@/helper';
import { ITEM_STATUS, ITEM_STATUS_OPTIONS, ItemStatusBadge } from '@/models/statuses';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

export default function Home() {
  const [statusFilter, setStatusFilter] = useState<string | undefined>(undefined);
  const [modalForm, setModalForm] = useState(false);
  const [editData, setEditData] = useState<ItemResponse | null>(null);

  const queryClient = useQueryClient();

  const { data: items, isLoading } = useQuery<ItemResponse[]>({
    queryKey: ['items', statusFilter],
    queryFn: async () => {
      const response = await httpGet('/items', false, { status: statusFilter }).then((res) => res.data);
      return response.data;
    },
  });

  const { mutate: deleteItem } = useMutation({
    mutationFn: (id: string) => httpDelete(`/items/${id}`),
    onSuccess: () => {
      alertToast('success', 'Item deleted successfully');
      queryClient.invalidateQueries({ queryKey: ['items'] });
    },
  });

  const openCreate = () => {
    setEditData(null);
    setModalForm(true);
  };

  const openEdit = (item: ItemResponse) => {
    setEditData(item);
    setModalForm(true);
  };

  return (
    <main className={cn(geistSans.variable, 'min-h-screen bg-base-100 font-sans')}>
      <div className="max-w-6xl mx-auto px-4 py-10">
        <h1 className="text-4xl font-bold text-center">Logistics</h1>
        <div className="text-center text-gray-400 mb-8 pt-2">Shipment Orders</div>

        <div className="flex justify-between mb-4">
          <div className="flex-1">
            <button
              className={cn('btn btn-sm mr-2 mb-2', statusFilter === undefined ? 'btn-primary' : 'btn-outline')}
              onClick={() => setStatusFilter(undefined)}
            >
              All Status
            </button>
            {ITEM_STATUS_OPTIONS.map((status) => (
              <button
                key={status.value}
                className={cn('btn btn-sm mr-2 mb-2', statusFilter === status.value ? 'btn-primary' : 'btn-outline')}
                onClick={() => setStatusFilter(status.value)}
              >
                {status.label}
              </button>
            ))}
          </div>
          <div>
            <button className="btn btn-primary" onClick={openCreate}>
              Create Item
            </button>
          </div>
        </div>

        <div className="card bg-base-100 shadow border border-base-200 overflow-hidden">
          <div className="card-body p-0">
            <div className="overflow-x-auto">
              <table className="table w-full">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Description</th>
                    <th>Status</th>
                    <th>Priority</th>
                    <th>Created At</th>
                    <th className="w-32"></th>
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
                  {!isLoading && (!items || items.length === 0) && (
                    <tr>
                      <td colSpan={6} className="text-center py-8 text-base-content/50">
                        No items found. Create one to get started.
                      </td>
                    </tr>
                  )}
                  {items?.map((item) => (
                    <tr key={item.id}>
                      <td className="font-medium">{item.name}</td>
                      <td>{item.description ?? '—'}</td>
                      <td>
                        <ItemStatusBadge status={item.status} />
                      </td>
                      <td>{item.priority}</td>
                      <td>{new Date(item.createdAt).toLocaleDateString()}</td>
                      <td>
                        <div className="flex gap-2">
                          <button className="btn btn-sm btn-outline btn-primary" onClick={() => openEdit(item)}>
                            Edit
                          </button>
                          <button className="btn btn-sm btn-outline btn-error" onClick={() => deleteItem(item.id)}>
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      <ItemForm setShowModal={setModalForm} showModal={modalForm} data={editData} />
    </main>
  );
}

function ItemForm({
  setShowModal,
  showModal,
  data,
}: {
  setShowModal: (show: boolean) => void;
  showModal: boolean;
  data: ItemResponse | null;
}) {
  const [, rerender] = useState(0);
  const validator = useRef(new SimpleReactValidator());
  const queryClient = useQueryClient();

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState('');
  const [priority, setPriority] = useState('0');

  useEffect(() => {
    const initData = () => {
      if (data && showModal) {
        setName(data?.name);
        setDescription(data.description || '');
        setStatus(data?.status ?? ITEM_STATUS.DRAFT.value);
        setPriority(data ? String(data.priority) : '0');
      }
    };
    initData();
  }, [data, showModal]);

  const resetForm = () => {
    setName('');
    setDescription('');
    setStatus(ITEM_STATUS.DRAFT.value);
    setPriority('0');
    validator.current.hideMessages();
    validator.current.hideMessageFor('name');
    validator.current.hideMessageFor('priority');
  };

  const { mutate: save, isPending } = useMutation({
    mutationFn: (payload: { name: string; description: string; status: string; priority: number }) =>
      data ? httpPatch(`/items/${data.id}`, payload) : httpPost('/items', payload),
    onSuccess: () => {
      alertToast('success', data ? 'Item updated successfully' : 'Item created successfully');
      queryClient.invalidateQueries({ queryKey: ['items'] });
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

    save({ name, description, status, priority: Number(priority) });
  };

  const validate = {
    name: validator.current.message('name', name, 'required', validateConfig),
    priority: validator.current.message('priority', priority, 'required|numeric', validateConfig),
  };

  return (
    <Modal
      onModalClose={() => {
        resetForm();
        setShowModal(false);
      }}
      showModal={showModal}
      size="md"
      title={data ? 'Edit Item' : 'Create Item'}
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
          <div className="form-label">Name</div>
          <input
            type="text"
            placeholder="Name"
            className={cn('input input-bordered w-full', validate.name && 'input-error')}
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          {validate.name}
        </div>

        <div>
          <div className="form-label">Description</div>
          <textarea
            placeholder="Description"
            className="textarea textarea-bordered w-full"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>

        <div>
          <div className="form-label">Status</div>
          <select className="select select-bordered w-full" value={status} onChange={(e) => setStatus(e.target.value)}>
            {ITEM_STATUS_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <div className="form-label">Priority</div>
          <input
            placeholder="Priority"
            className={cn('input input-bordered w-full', validate.priority && 'input-error')}
            value={priority}
            onChange={(e) => setPriority(e.target.value)}
          />
          {validate.priority}
        </div>

        <div className="w-full pt-4">
          <button type="submit" className="btn btn-primary w-full" disabled={isPending}>
            {isPending ? <span className="loading loading-spinner loading-sm" /> : data ? 'Save' : 'Create'}
          </button>
        </div>
      </form>
    </Modal>
  );
}

const validateConfig = { className: 'text-red-500 text-sm' };
