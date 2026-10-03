import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, Compass, Plus, Bell, MessageSquare, User } from 'lucide-react';

export const MobileBottomNav: React.FC = () => {
  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/85 dark:bg-surface-dark/85 backdrop-blur-lg border-t border-slate-200/60 dark:border-white/5 px-4 py-2 transition-colors">
      <div className="flex items-center justify-around max-w-md mx-auto">
        {/* Home */}
        <NavLink
          to="/"
          className={({ isActive }) =>
            `p-2.5 rounded-2xl flex flex-col items-center transition-colors ${
              isActive
                ? 'text-pastel-violet dark:text-pastel-lavender'
                : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'
            }`
          }
        >
          <Home size={22} />
        </NavLink>

        {/* Explore */}
        <NavLink
          to="/explore"
          className={({ isActive }) =>
            `p-2.5 rounded-2xl flex flex-col items-center transition-colors ${
              isActive
                ? 'text-pastel-violet dark:text-pastel-lavender'
                : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'
            }`
          }
        >
          <Compass size={22} />
        </NavLink>

        {/* Central Floating Plus */}
        <button
          type="button"
          aria-label="Create Post"
          className="w-12 h-12 -mt-5 rounded-2xl neu-btn-primary flex items-center justify-center text-white shadow-neu-glow-pastel transition-transform active:scale-95"
        >
          <Plus size={24} className="stroke-[2.5]" />
        </button>

        {/* Notifications */}
        <NavLink
          to="/notifications"
          className={({ isActive }) =>
            `p-2.5 rounded-2xl flex flex-col items-center relative transition-colors ${
              isActive
                ? 'text-pastel-violet dark:text-pastel-lavender'
                : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'
            }`
          }
        >
          <Bell size={22} />
          <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-rose-500" />
        </NavLink>

        {/* Messages */}
        <NavLink
          to="/messages"
          className={({ isActive }) =>
            `p-2.5 rounded-2xl flex flex-col items-center transition-colors ${
              isActive
                ? 'text-pastel-violet dark:text-pastel-lavender'
                : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'
            }`
          }
        >
          <MessageSquare size={22} />
        </NavLink>

        {/* Profile */}
        <NavLink
          to="/profile"
          className={({ isActive }) =>
            `p-2.5 rounded-2xl flex flex-col items-center transition-colors ${
              isActive
                ? 'text-pastel-violet dark:text-pastel-lavender'
                : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'
            }`
          }
        >
          <User size={22} />
        </NavLink>
      </div>
    </nav>
  );
};
