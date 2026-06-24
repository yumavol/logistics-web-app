import Link from 'next/link';
import { useRouter } from 'next/router';
import cn from 'classnames';

const LINKS = [
  { href: '/', label: 'Orders' },
  { href: '/track', label: 'Track Order' },
];

function Menu() {
  const router = useRouter();

  return (
    <div className="navbar bg-base-100 border-b border-base-200 mb-6">
      <div className="max-w-6xl mx-auto w-full px-4 flex items-center gap-2">
        <span className="text-lg font-bold mr-4">Logistics Apps</span>
        <div className="flex gap-1">
          {LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn('btn btn-sm', router.pathname === link.href ? 'btn-primary' : 'btn-ghost')}
            >
              {link.label}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Menu;
