import React from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { Cloud, FolderLock, LogOut, Album, Trash2 } from 'lucide-react';
import { supabase } from '../lib/supabase';

export function Layout() {
  const location = useLocation();
  const navigate = useNavigate();
  
  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut();
      // Clear any cached states and redirect to home
      navigate('/', { replace: true });
      // Reload the page to ensure all states are reset
      window.location.reload();
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <Link to="/" className="flex items-center px-2 py-2 text-gray-900">
                <Cloud className="h-6 w-6 mr-2" />
                <span className="font-semibold">JordanCloud</span>
              </Link>
              
              <div className="ml-6 flex space-x-4">
                <Link
                  to="/"
                  className={`inline-flex items-center px-3 py-2 rounded-md text-sm font-medium ${
                    location.pathname === '/' 
                      ? 'bg-gray-100 text-gray-900' 
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  Photos & Videos
                </Link>
                <Link
                  to="/albums"
                  className={`inline-flex items-center px-3 py-2 rounded-md text-sm font-medium ${
                    location.pathname === '/albums'
                      ? 'bg-gray-100 text-gray-900'
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <Album className="h-4 w-4 mr-2" />
                  Albums
                </Link>
                <Link
                  to="/personal"
                  className={`inline-flex items-center px-3 py-2 rounded-md text-sm font-medium ${
                    location.pathname === '/personal'
                      ? 'bg-gray-100 text-gray-900'
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <FolderLock className="h-4 w-4 mr-2" />
                  Personal Folder
                </Link>
                <Link
                  to="/deleted"
                  className={`inline-flex items-center px-3 py-2 rounded-md text-sm font-medium ${
                    location.pathname === '/deleted'
                      ? 'bg-gray-100 text-gray-900'
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Deleted
                </Link>
              </div>
            </div>
            
            <div className="flex items-center">
              <button
                onClick={handleSignOut}
                className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-gray-600 hover:bg-gray-50"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </nav>
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Outlet />
      </main>
    </div>
  );
}