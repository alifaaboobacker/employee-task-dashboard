import { LogOut, Menu } from 'lucide-react';
import { useState } from 'react';
import { Avatar } from '@/components/ui/Avatar';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/hooks/useAuth';

export const Topbar = ({ onMenuClick }: { onMenuClick: () => void }) => {
  const { admin, signOut } = useAuth();
  const [isSigningOut, setIsSigningOut] = useState(false);

  const handleSignOut = async () => {
    setIsSigningOut(true);
    try {
      await signOut();
    } finally {
      setIsSigningOut(false);
    }
  };

  return (
    <header className="sticky top-0 z-20 flex h-16 items-center justify-between gap-3 border-b border-line bg-white/85 px-4 backdrop-blur-sm sm:px-6">
      <button
        type="button"
        onClick={onMenuClick}
        aria-label="Open navigation"
        className="rounded-lg p-2 text-ink-500 transition-colors hover:bg-surface hover:text-ink-900 lg:hidden"
      >
        <Menu className="size-5" />
      </button>

      <div className="ml-auto flex items-center gap-3">
        <div className="hidden text-right leading-tight sm:block">
          <p className="text-sm font-semibold text-ink-900">{admin?.name}</p>
          <p className="text-xs text-ink-500">{admin?.email}</p>
        </div>
        <Avatar name={admin?.name ?? 'Admin'} />
        <Button
          variant="outline"
          size="sm"
          onClick={handleSignOut}
          isLoading={isSigningOut}
          leftIcon={<LogOut className="size-4" />}
        >
          <span className="hidden sm:inline">Sign out</span>
        </Button>
      </div>
    </header>
  );
};
