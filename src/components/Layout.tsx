
import React from 'react';
import { Outlet } from 'react-router-dom';
import Header from './Header';

export const Layout = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="p-6">
        <Outlet />
      </main>
    </div>
  );
};
