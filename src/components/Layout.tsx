
import React from 'react';
import { Outlet } from 'react-router-dom';
import Header from './Header';

export const Layout = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header />
      <main className="flex-1 overflow-auto">
        <div className="p-6">
          <Outlet />
        </div>
      </main>
    </div>
  );
};
