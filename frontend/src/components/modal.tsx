import { Dialog, DialogBackdrop, DialogPanel, DialogTitle } from '@headlessui/react';
import cn from 'classnames';

interface IModal {
  onModalClose: (show: boolean) => void;
  showModal: boolean;
  children: any;
  size: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl' | '5xl' | '6xl' | '7xl';
  title?: string | any;
  bodyClassName?: string;
  id?: string;
  zIndex?: number;
}

function Modal({ onModalClose: setShowModal, showModal, children, size, title = null, bodyClassName, zIndex }: IModal) {
  const classSize = {
    xs: 'w-full max-w-xs',
    sm: 'w-full max-w-sm',
    md: 'w-full max-w-md',
    lg: 'w-full max-w-lg',
    xl: 'w-full max-w-xl',
    '2xl': 'w-full max-w-2xl',
    '3xl': 'w-full max-w-3xl',
    '4xl': 'w-full max-w-4xl',
    '5xl': 'w-full max-w-5xl',
    '6xl': 'w-full max-w-6xl',
    '7xl': 'w-full max-w-7xl',
  };

  return (
    <>
      <Dialog open={!!showModal} onClose={() => setShowModal(false)} className={cn('relative')} style={{ zIndex: zIndex || 104 }}>
        <DialogBackdrop transition className="fixed inset-0 bg-black/40 duration-300 ease-out data-closed:opacity-0" />

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4">
            <DialogPanel
              transition
              className={cn(
                'relative w-full flex flex-col rounded-xl border-0 bg-white shadow-lg outline-none focus:outline-none',
                classSize[size],
                'transition-all duration-200 ease-out',
                'data-enter:opacity-0 data-enter:scale-95',
                'data-leave:opacity-0 data-leave:scale-95',
              )}
            >
              <div className="flex justify-between items-center px-4 pt-4 pb-2">
                <DialogTitle className="text-base leading-4 font-bold">{title}</DialogTitle>
                <div>
                  <div className="translate-x-1">
                    <button className="btn btn-circle btn-sm btn-ghost text-lg font-light" onClick={() => setShowModal(false)}>
                      ✕
                    </button>
                  </div>
                </div>
              </div>
              <div className={cn('relative flex-auto p-4', bodyClassName)}>{children}</div>
            </DialogPanel>
          </div>
        </div>
      </Dialog>
    </>
  );
}

export default Modal;
