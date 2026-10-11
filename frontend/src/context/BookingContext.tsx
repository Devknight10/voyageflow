import React, { createContext, useContext, useState } from 'react';
import { Destination, TransportService, Booking } from '../services/types';

interface BookingDraft {
  item: Destination | TransportService | null;
  type: 'destination' | 'transport';
  pickupLocation?: string;
  dropoffLocation?: string;
  pickupCoords?: [number, number];
  dropoffCoords?: [number, number];
  initialDate?: string;
  tripDistanceKm?: number;
}

interface BookingContextType {
  draft: BookingDraft | null;
  isBookingModalOpen: boolean;
  isPaymentModalOpen: boolean;
  isConfirmationModalOpen: boolean;
  currentBooking: Booking | null;
  startBooking: (
    item: Destination | TransportService,
    type: 'destination' | 'transport',
    pickupLocation?: string,
    dropoffLocation?: string,
    pickupCoords?: [number, number],
    dropoffCoords?: [number, number],
    tripDistanceKm?: number
  ) => void;
  closeBookingModal: () => void;
  proceedToPayment: (booking: Booking) => void;
  closePaymentModal: () => void;
  showConfirmation: (booking: Booking) => void;
  closeConfirmationModal: () => void;
}

const BookingContext = createContext<BookingContextType | undefined>(undefined);

export const BookingProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [draft, setDraft] = useState<BookingDraft | null>(null);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [isConfirmationModalOpen, setIsConfirmationModalOpen] = useState(false);
  const [currentBooking, setCurrentBooking] = useState<Booking | null>(null);

  const startBooking = (
    item: Destination | TransportService,
    type: 'destination' | 'transport',
    pickupLocation?: string,
    dropoffLocation?: string,
    pickupCoords?: [number, number],
    dropoffCoords?: [number, number],
    tripDistanceKm?: number
  ) => {
    setDraft({
      item,
      type,
      pickupLocation: pickupLocation || (type === 'destination' ? 'Current City Location' : 'Airport / Pickup Point'),
      dropoffLocation: dropoffLocation || (type === 'destination' ? item.name : 'Destination'),
      pickupCoords,
      dropoffCoords,
      initialDate: new Date().toISOString().split('T')[0],
      tripDistanceKm,
    });
    setIsBookingModalOpen(true);
  };

  const closeBookingModal = () => {
    setIsBookingModalOpen(false);
  };

  const proceedToPayment = (booking: Booking) => {
    setCurrentBooking(booking);
    setIsBookingModalOpen(false);
    setIsPaymentModalOpen(true);
  };

  const closePaymentModal = () => {
    setIsPaymentModalOpen(false);
  };

  const showConfirmation = (booking: Booking) => {
    setCurrentBooking(booking);
    setIsPaymentModalOpen(false);
    setIsConfirmationModalOpen(true);
  };

  const closeConfirmationModal = () => {
    setIsConfirmationModalOpen(false);
    setCurrentBooking(null);
    setDraft(null);
  };

  return (
    <BookingContext.Provider
      value={{
        draft,
        isBookingModalOpen,
        isPaymentModalOpen,
        isConfirmationModalOpen,
        currentBooking,
        startBooking,
        closeBookingModal,
        proceedToPayment,
        closePaymentModal,
        showConfirmation,
        closeConfirmationModal,
      }}
    >
      {children}
    </BookingContext.Provider>
  );
};

export const useBooking = () => {
  const context = useContext(BookingContext);
  if (!context) throw new Error('useBooking must be used within BookingProvider');
  return context;
};
