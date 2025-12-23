import { useState, useRef, useEffect } from 'react';
import { User, LogOut, Settings, History } from 'lucide-react';

interface UserMenuProps {
  user: { name: string; email: string };
  onLogout: () => void;
  onViewHistory?: () => void;
}

export function UserMenu({ user, onLogout, onViewHistory }: UserMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 bg-white border-2 border-white hover:border-[#ff0055] transition-all"
      >
        <div className="w-8 h-8 bg-[#ff0055] flex items-center justify-center text-white text-sm uppercase tracking-wide">
          {getInitials(user.name)}
        </div>
        <span className="text-sm text-black hidden sm:block uppercase tracking-wide">{user.name}</span>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-64 bg-[#202020] border-4 border-white overflow-hidden z-50">
          {/* User Info */}
          <div className="px-4 py-3 border-b-2 border-gray-700 bg-[#202020]">
            <p className="text-sm text-white uppercase tracking-wide">{user.name}</p>
            <p className="text-xs text-gray-400">{user.email}</p>
          </div>

          {/* Menu Items */}
          <div className="py-2">
            {onViewHistory && (
              <button
                onClick={() => {
                  onViewHistory();
                  setIsOpen(false);
                }}
                className="w-full flex items-center gap-3 px-4 py-2 text-sm text-white hover:bg-[#ff0055] transition-colors uppercase tracking-wide"
              >
                <History className="w-4 h-4" />
                Session History
              </button>
            )}
            
            <button
              onClick={() => setIsOpen(false)}
              className="w-full flex items-center gap-3 px-4 py-2 text-sm text-white hover:bg-[#ff0055] transition-colors uppercase tracking-wide"
            >
              <Settings className="w-4 h-4" />
              Settings
            </button>
          </div>

          {/* Logout */}
          <div className="border-t-2 border-gray-700">
            <button
              onClick={() => {
                onLogout();
                setIsOpen(false);
              }}
              className="w-full flex items-center gap-3 px-4 py-3 text-sm text-[#ff0055] hover:bg-[#ff0055] hover:text-white transition-colors uppercase tracking-wide"
            >
              <LogOut className="w-4 h-4" />
              Sign Out
            </button>
          </div>
        </div>
      )}
    </div>
  );
}