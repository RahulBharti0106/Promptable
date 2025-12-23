import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Sparkles, LogOut, User, LayoutDashboard, Plus } from 'lucide-react';
import { Button } from '../ui/Button';
import { Tooltip } from '../ui/Tooltip';

export const Navbar = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate('/login');
  };

  return (
    <nav className="sticky top-0 z-50 border-b border-slate-800 bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
        <Link to="/" className="flex items-center space-x-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-white">
            <Sparkles size={18} fill="currentColor" />
          </div>
          <span className="text-xl font-bold text-slate-100">Promptable</span>
        </Link>

        <div className="flex items-center space-x-6">
          {user ? (
            <>
              <Link to="/prompts/new" className="hidden sm:block">
                 <Button variant="primary" className="h-9 px-3 text-sm">
                   <Plus size={16} className="mr-2" />
                   New Prompt
                 </Button>
              </Link>
              
              <Tooltip content="Dashboard">
                <Link to="/dashboard" className="text-slate-400 hover:text-white transition-colors">
                  <LayoutDashboard size={20} />
                </Link>
              </Tooltip>

              <Tooltip content="Profile">
                <Link to="/profile" className="text-slate-400 hover:text-white transition-colors">
                  <User size={20} />
                </Link>
              </Tooltip>

              <Tooltip content="Logout">
                <button onClick={handleSignOut} className="text-slate-400 hover:text-red-400 transition-colors">
                  <LogOut size={20} />
                </button>
              </Tooltip>
            </>
          ) : (
            <>
              <Link to="/login" className="text-sm font-medium text-slate-400 hover:text-white">Log in</Link>
              <Link to="/signup">
                <Button variant="primary" className="h-9 px-4 text-sm">Sign up</Button>
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};