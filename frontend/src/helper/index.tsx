import { toast } from 'react-toastify';
import { format } from 'date-fns';

export const waitAsync = (sec: number) => new Promise<void>((resolve) => setTimeout(() => resolve(), sec));

export const formatDate = (date: string | Date, pattern = 'dd MMM yyyy') => format(new Date(date), pattern);
export const formatDateTime = (date: string | Date, pattern = 'dd MMM yyyy HH:mm') => format(new Date(date), pattern);

export const alertToast = (type: 'success' | 'error' | 'info' | 'warning', message: string, id?: string) => {
  switch (type) {
    case 'success':
      toast.success(message, { toastId: id });
      break;
    case 'error':
      toast.error(message, { toastId: id });
      break;
    case 'info':
      toast.info(message, { toastId: id });
      break;
    case 'warning':
      toast.warning(message, { toastId: id });
      break;
  }
};

export const formatMoney = (amount: number) => {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(amount);
};
