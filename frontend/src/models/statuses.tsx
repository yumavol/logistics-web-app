export const ITEM_STATUS = {
  DRAFT: {
    label: 'Draft',
    value: 'DRAFT',
  },
  ACTIVE: {
    label: 'Active',
    value: 'ACTIVE',
  },
  ARCHIVED: {
    label: 'Archived',
    value: 'ARCHIVED',
  },
};

export const ITEM_STATUS_OPTIONS = Object.values(ITEM_STATUS);

export const ItemStatusBadge = ({ status }: { status: string }) => {
  switch (status) {
    case ITEM_STATUS.DRAFT.value:
      return <span className="badge badge-sm badge-warning">{ITEM_STATUS.DRAFT.label}</span>;
    case ITEM_STATUS.ACTIVE.value:
      return <span className="badge badge-sm badge-success">{ITEM_STATUS.ACTIVE.label}</span>;
    case ITEM_STATUS.ARCHIVED.value:
      return <span className="badge badge-sm badge-neutral">{ITEM_STATUS.ARCHIVED.label}</span>;
    default:
      return <span className="badge badge-sm">{status}</span>;
  }
};
