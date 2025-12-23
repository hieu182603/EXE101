
import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';

const MainLayout: React.FC = () => {
  return (
    <div className="flex min-h-screen w-full flex-col bg-background-dark font-display text-text-main transition-colors duration-300">
      <Navbar />
      <main className="flex-grow pt-6 md:pt-8 pb-10 md:pb-12">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};

export default MainLayout;
