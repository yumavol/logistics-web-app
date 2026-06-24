export const ORDER_STATUS = {
  PENDING: {
    label: 'Pending',
    value: 'PENDING',
  },
  IN_TRANSIT: {
    label: 'In Transit',
    value: 'IN_TRANSIT',
  },
  DELIVERED: {
    label: 'Delivered',
    value: 'DELIVERED',
  },
  CANCELED: {
    label: 'Canceled',
    value: 'CANCELED',
  },
};

export const ORDER_STATUS_OPTIONS = Object.values(ORDER_STATUS);

export const UPDATABLE_ORDER_STATUS_OPTIONS = [ORDER_STATUS.PENDING, ORDER_STATUS.IN_TRANSIT, ORDER_STATUS.DELIVERED];

export const OrderStatusBadge = ({ status }: { status: string }) => {
  switch (status) {
    case ORDER_STATUS.PENDING.value:
      return <span className="badge badge-sm badge-warning">{ORDER_STATUS.PENDING.label}</span>;
    case ORDER_STATUS.IN_TRANSIT.value:
      return <span className="badge badge-sm badge-info">{ORDER_STATUS.IN_TRANSIT.label}</span>;
    case ORDER_STATUS.DELIVERED.value:
      return <span className="badge badge-sm badge-success">{ORDER_STATUS.DELIVERED.label}</span>;
    case ORDER_STATUS.CANCELED.value:
      return <span className="badge badge-sm badge-error">{ORDER_STATUS.CANCELED.label}</span>;
    default:
      return <span className="badge badge-sm">{status}</span>;
  }
};
