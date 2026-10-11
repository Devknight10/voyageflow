import React, { useState, useEffect } from 'react';
import { AuthProvider } from './context/AuthContext';
import { WishlistProvider } from './context/WishlistContext';
import { BookingProvider } from './context/BookingContext';
import { Navbar } from './components/common/Navbar';
import { Footer } from './components/common/Footer';
import { AuthModal } from './components/auth/AuthModal';
import { BookingModal } from './components/booking/BookingModal';
import { PaymentGatewayModal } from './components/booking/PaymentGatewayModal';
import { BookingConfirmation } from './components/booking/BookingConfirmation';
import { HomePage } from './pages/HomePage';
import { TransportPage } from './pages/TransportPage';
import { MapPage } from './pages/MapPage';
import { UserDashboardPage } from './pages/UserDashboardPage';
import { AdminDashboardPage } from './pages/AdminDashboardPage';

export const AppContent: React.FC = () => {
  const [currentTab, setCurrentTab] = useState<string>('home');
  const [userCoords, setUserCoords] = useState<[number, number] | null>(null);
  const [isLocating, setIsLocating] = useState<boolean>(false);

  // Auto-detect browser location on mount
  useEffect(() => {
    detectLocation();
  }, []);

  const detectLocation = () => {
    if ('geolocation' in navigator) {
      setIsLocating(true);
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserCoords([position.coords.latitude, position.coords.longitude]);
          setIsLocating(false);
        },
        (error) => {
          console.warn('Geolocation permission not granted, using regional default:', error.message);
          // Fallback to Chennai Metro Hub coordinates
          setUserCoords([13.0674, 80.2376]);
          setIsLocating(false);
        },
        { timeout: 7000 }
      );
    } else {
      setUserCoords([13.0674, 80.2376]);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#fafbfe] text-slate-900 selection:bg-blue-600 selection:text-white">
      {/* Sticky Navigation Bar */}
      <Navbar
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        userCoords={userCoords}
        onDetectLocation={detectLocation}
        isLocating={isLocating}
      />

      {/* Main Page Body */}
      <main className="flex-1">
        {currentTab === 'home' && (
          <HomePage
            onNavigateToTab={setCurrentTab}
            userCoords={userCoords}
            onDetectLocation={detectLocation}
            isLocating={isLocating}
          />
        )}

        {currentTab === 'transport' && (
          <TransportPage userCoords={userCoords} />
        )}

        {currentTab === 'map' && (
          <MapPage
            userCoords={userCoords}
            onDetectLocation={detectLocation}
            isLocating={isLocating}
          />
        )}

        {currentTab === 'trips' && (
          <UserDashboardPage onNavigateToTab={setCurrentTab} />
        )}

        {currentTab === 'admin' && (
          <AdminDashboardPage />
        )}
      </main>

      {/* Global Interactive Modals */}
      <AuthModal />
      <BookingModal />
      <PaymentGatewayModal />
      <BookingConfirmation onGoToDashboard={() => setCurrentTab('trips')} />

      {/* Modern Responsive Footer */}
      <Footer />
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <WishlistProvider>
        <BookingProvider>
          <AppContent />
        </BookingProvider>
      </WishlistProvider>
    </AuthProvider>
  );
}
