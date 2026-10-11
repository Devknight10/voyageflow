import React, { useState, useEffect } from 'react';
import {
  X, CreditCard, ShieldCheck, QrCode, Building, Lock,
  CheckCircle2, AlertTriangle, ArrowRight, Sparkles
} from 'lucide-react';
import { useBooking } from '../../context/BookingContext';
import { api } from '../../services/api';
import { PaymentOrder } from '../../services/types';

export const PaymentGatewayModal: React.FC = () => {
  const { isPaymentModalOpen, closePaymentModal, currentBooking, showConfirmation } = useBooking();
  const [method, setMethod] = useState<'CARD' | 'UPI' | 'NETBANKING'>('CARD');
  const [order, setOrder] = useState<PaymentOrder | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form mock values
  const [cardNumber, setCardNumber] = useState('4242 •••• •••• 4242');
  const [expiry, setExpiry] = useState('12/28');
  const [cvv, setCvv] = useState('888');
  const [upiId, setUpiId] = useState('traveler@okhdfcbank');

  useEffect(() => {
    if (isPaymentModalOpen && currentBooking) {
      setLoading(true);
      setError(null);
      api.createPaymentOrder(currentBooking.id, 'STRIPE_TEST', method)
        .then((orderRes) => {
          setOrder(orderRes);
          setLoading(false);
        })
        .catch((err) => {
          setError(err.message || 'Failed to initialize payment gateway order.');
          setLoading(false);
        });
    }
  }, [isPaymentModalOpen, currentBooking, method]);

  if (!isPaymentModalOpen || !currentBooking) return null;

  const handleProcessPayment = async (simulateFail: boolean = false) => {
    if (!order) return;
    setLoading(true);
    setError(null);

    try {
      const res = await api.verifyPayment({
        order_id: order.order_id,
        payment_id: `pay_${Date.now()}_test`,
        signature: 'SANDBOX_VERIFIED_SIGNATURE',
        simulate_fail: simulateFail,
      });

      if (res.success) {
        // Fetch refreshed booking
        const updatedBooking = await api.getBookingById(currentBooking.id);
        showConfirmation(updatedBooking);
      } else {
        setError(res.message || 'Payment simulation failed.');
      }
    } catch (err: any) {
      setError(err.message || 'Payment processing error.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-md animate-in fade-in duration-200 overflow-y-auto">
      <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden my-8">
        
        {/* Sandbox Indicator Banner */}
        <div className="bg-gradient-to-r from-emerald-600 to-teal-600 px-6 py-2.5 text-white flex items-center justify-between text-xs font-bold shadow-inner">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4" />
            <span>SANDBOX PAYMENT GATEWAY · TEST ENVIRONMENT</span>
          </div>
          <span className="bg-white/20 px-2 py-0.5 rounded text-[10px] font-black uppercase">
            PCI-DSS 256-BIT
          </span>
        </div>

        {/* Modal Header */}
        <div className="p-6 pb-4 border-b border-slate-100 flex items-center justify-between">
          <div>
            <div className="text-[10px] font-black uppercase tracking-wider text-slate-400">
              VoyageFlow Secure Checkout
            </div>
            <h3 className="text-xl font-black text-slate-900 mt-0.5">
              Pay ${currentBooking.total_amount.toFixed(2)}
            </h3>
            <p className="text-xs text-slate-500 font-semibold">
              Ref: <span className="font-mono text-blue-600">{currentBooking.reference_code}</span>
            </p>
          </div>
          <button
            onClick={closePaymentModal}
            className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-full transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Payment Method Tabs */}
        <div className="px-6 pt-4">
          <div className="grid grid-cols-3 gap-2 p-1 bg-slate-100 rounded-2xl">
            <button
              type="button"
              onClick={() => setMethod('CARD')}
              className={`py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                method === 'CARD'
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <CreditCard className="w-3.5 h-3.5" />
              <span>Card</span>
            </button>
            <button
              type="button"
              onClick={() => setMethod('UPI')}
              className={`py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                method === 'UPI'
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <QrCode className="w-3.5 h-3.5" />
              <span>UPI / QR</span>
            </button>
            <button
              type="button"
              onClick={() => setMethod('NETBANKING')}
              className={`py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                method === 'NETBANKING'
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Building className="w-3.5 h-3.5" />
              <span>NetBanking</span>
            </button>
          </div>
        </div>

        {/* Form Body */}
        <div className="p-6 space-y-4">
          {error && (
            <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-2xl flex items-center gap-2 text-rose-700 text-xs font-semibold">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {method === 'CARD' && (
            <div className="space-y-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-500 mb-1">
                  Card Number (Pre-filled Sandbox Test Card)
                </label>
                <div className="relative">
                  <CreditCard className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                  <input
                    type="text"
                    value={cardNumber}
                    onChange={(e) => setCardNumber(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-mono font-bold text-slate-900 focus:bg-white focus:outline-none focus:border-blue-600"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 mb-1">
                    Expires
                  </label>
                  <input
                    type="text"
                    value={expiry}
                    onChange={(e) => setExpiry(e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-mono font-bold text-slate-900 focus:bg-white focus:outline-none focus:border-blue-600"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 mb-1">
                    Security CVV
                  </label>
                  <div className="relative">
                    <Lock className="w-3.5 h-3.5 text-slate-400 absolute left-3.5 top-3.5" />
                    <input
                      type="password"
                      value={cvv}
                      onChange={(e) => setCvv(e.target.value)}
                      className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-mono font-bold text-slate-900 focus:bg-white focus:outline-none focus:border-blue-600"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {method === 'UPI' && (
            <div className="space-y-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-500 mb-1">
                  Virtual Payment Address (UPI ID)
                </label>
                <input
                  type="text"
                  value={upiId}
                  onChange={(e) => setUpiId(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-900 focus:bg-white focus:outline-none focus:border-blue-600"
                />
              </div>
              <div className="p-4 bg-blue-50/60 border border-blue-200/80 rounded-2xl flex items-center gap-3">
                <QrCode className="w-10 h-10 text-blue-600 shrink-0" />
                <div className="text-xs">
                  <div className="font-black text-slate-900">Dynamic Sandbox QR Enabled</div>
                  <div className="text-slate-500">Instant UPI verification signature via simulated gateway.</div>
                </div>
              </div>
            </div>
          )}

          {method === 'NETBANKING' && (
            <div className="space-y-3">
              <label className="block text-[11px] font-bold text-slate-500 mb-1">
                Select Test Bank
              </label>
              <select className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-900 focus:bg-white focus:outline-none">
                <option>HDFC Bank (Sandbox Instant)</option>
                <option>State Bank of India (Sandbox)</option>
                <option>ICICI Bank (Sandbox)</option>
                <option>Chase / Citibank Global (Sandbox)</option>
              </select>
            </div>
          )}

          {/* Action Buttons */}
          <div className="pt-2 space-y-2">
            <button
              type="button"
              disabled={loading}
              onClick={() => handleProcessPayment(false)}
              className="w-full py-4 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white rounded-2xl font-black text-sm shadow-xl shadow-emerald-600/20 transition-all flex items-center justify-center gap-2"
            >
              {loading ? (
                <span>Verifying Cryptographic Signature...</span>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Confirm & Pay ${currentBooking.total_amount.toFixed(2)}</span>
                </>
              )}
            </button>

            <button
              type="button"
              disabled={loading}
              onClick={() => handleProcessPayment(true)}
              className="w-full py-2.5 bg-slate-100 hover:bg-rose-50 hover:text-rose-600 text-slate-500 rounded-2xl font-bold text-xs transition"
            >
              Simulate Failure (Test QA Error Handling)
            </button>
          </div>

          <p className="text-[10px] text-center text-slate-400">
            Encrypted with 256-bit SSL. No real financial cards are billed in Sandbox mode.
          </p>
        </div>

      </div>
    </div>
  );
};
