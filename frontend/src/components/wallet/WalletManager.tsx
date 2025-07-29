import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useMessagesV3 } from '../../contexts/MessageContextV3';
import { useWallet } from '../../contexts/WalletContext';
import { ComicText } from '../magicui/comic-text';

interface WalletManagerProps {
  onClose: () => void;
}

export function WalletManager({ onClose }: WalletManagerProps) {
  const { user } = useWallet();
  const { messageService } = useMessagesV3();
  const [balance, setBalance] = useState('0.0');
  const [depositAmount, setDepositAmount] = useState('');
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [isDepositing, setIsDepositing] = useState(false);
  const [isWithdrawing, setIsWithdrawing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Load wallet balance
  const loadBalance = async () => {
    if (!messageService || !user?.address) return;
    
    setIsLoading(true);
    try {
      const balance = await messageService.getBalance(user.address);
      setBalance(balance);
    } catch (error) {
      console.error('Failed to load balance:', error);
      setError('Failed to load wallet balance');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadBalance();
  }, [messageService, user?.address]);

  const handleDeposit = async () => {
    if (!depositAmount || !messageService) return;
    
    setIsDepositing(true);
    setError(null);
    setSuccess(null);
    
    try {
      const txHash = await messageService.deposit(depositAmount);
      setSuccess(`Deposit successful! Tx: ${txHash.slice(0, 10)}...`);
      setDepositAmount('');
      // Reload balance after successful deposit
      setTimeout(loadBalance, 2000);
    } catch (error: any) {
      setError(error.message || 'Deposit failed');
    } finally {
      setIsDepositing(false);
    }
  };

  const handleWithdraw = async () => {
    if (!withdrawAmount || !messageService) return;
    
    setIsWithdrawing(true);
    setError(null);
    setSuccess(null);
    
    try {
      const txHash = await messageService.withdraw(withdrawAmount);
      setSuccess(`Withdrawal successful! Tx: ${txHash.slice(0, 10)}...`);
      setWithdrawAmount('');
      // Reload balance after successful withdrawal
      setTimeout(loadBalance, 2000);
    } catch (error: any) {
      setError(error.message || 'Withdrawal failed');
    } finally {
      setIsWithdrawing(false);
    }
  };

  const clearMessages = () => {
    setError(null);
    setSuccess(null);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.8, opacity: 0 }}
        className="bg-white rounded-3xl border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] w-full max-w-md p-6"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <ComicText fontSize={1.5} className="text-black">
            WALLET MANAGER
          </ComicText>
          <button
            onClick={onClose}
            className="p-2 bg-red-300 text-red-800 rounded-lg border-2 border-black font-bold hover:bg-red-400 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] transform hover:-translate-y-0.5 transition-all"
          >
            ✕
          </button>
        </div>

        {/* Balance Display */}
        <div className="mb-6 p-4 bg-gradient-to-r from-green-200 to-emerald-300 rounded-2xl border-3 border-black transform -skew-x-2 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
          <div className="transform skew-x-2 text-center">
            <div className="text-sm font-bold text-green-800 mb-1">💰 WALLET BALANCE</div>
            <div className="text-2xl font-black text-green-900">
              {isLoading ? (
                <div className="flex items-center justify-center space-x-2">
                  <div className="animate-spin w-5 h-5 border-2 border-green-800 border-t-transparent rounded-full"></div>
                  <span>Loading...</span>
                </div>
              ) : (
                `${parseFloat(balance).toFixed(4)} ETH`
              )}
            </div>
          </div>
        </div>

        {/* Messages */}
        <AnimatePresence>
          {(error || success) && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className={`mb-4 p-3 rounded-xl border-2 transform -skew-x-1 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] ${
                error 
                  ? 'bg-red-200 border-red-600 text-red-800' 
                  : 'bg-green-200 border-green-600 text-green-800'
              }`}
            >
              <div className="transform skew-x-1 flex justify-between items-start">
                <div className="font-bold text-sm">
                  {error ? '⚠️ ERROR' : '✅ SUCCESS'}
                </div>
                <button
                  onClick={clearMessages}
                  className="text-xs font-bold opacity-70 hover:opacity-100"
                >
                  ✕
                </button>
              </div>
              <div className="text-xs mt-1 transform skew-x-1">
                {error || success}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Deposit Section */}
        <div className="mb-6 p-4 bg-blue-100 rounded-2xl border-2 border-blue-600">
          <div className="font-bold text-blue-800 mb-3 flex items-center space-x-2">
            <span>📥</span>
            <span>DEPOSIT ETH</span>
          </div>
          <div className="space-y-3">
            <input
              type="number"
              step="0.001"
              min="0.01"
              placeholder="Amount in ETH (min 0.01)"
              value={depositAmount}
              onChange={(e) => setDepositAmount(e.target.value)}
              className="w-full px-3 py-2 border-2 border-black rounded-lg font-bold bg-white/90 focus:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] placeholder-gray-500"
              disabled={isDepositing}
            />
            <button
              onClick={handleDeposit}
              disabled={isDepositing || !depositAmount || parseFloat(depositAmount) < 0.01}
              className="w-full py-3 bg-gradient-to-r from-blue-400 to-cyan-500 text-white rounded-xl font-bold border-2 border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transform hover:-translate-y-0.5 transition-all disabled:from-gray-400 disabled:to-gray-500 disabled:transform-none"
            >
              {isDepositing ? (
                <span className="flex items-center justify-center space-x-2">
                  <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full"></div>
                  <span>DEPOSITING...</span>
                </span>
              ) : (
                '🚀 DEPOSIT NOW!'
              )}
            </button>
            <div className="text-xs text-blue-700 font-bold">
              💡 Minimum deposit: 0.01 ETH
            </div>
          </div>
        </div>

        {/* Withdraw Section */}
        <div className="p-4 bg-red-100 rounded-2xl border-2 border-red-600">
          <div className="font-bold text-red-800 mb-3 flex items-center space-x-2">
            <span>📤</span>
            <span>WITHDRAW ETH</span>
          </div>
          <div className="space-y-3">
            <input
              type="number"
              step="0.001"
              min="0"
              placeholder="Amount in ETH"
              value={withdrawAmount}
              onChange={(e) => setWithdrawAmount(e.target.value)}
              className="w-full px-3 py-2 border-2 border-black rounded-lg font-bold bg-white/90 focus:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] placeholder-gray-500"
              disabled={isWithdrawing}
            />
            <button
              onClick={handleWithdraw}
              disabled={isWithdrawing || !withdrawAmount || parseFloat(withdrawAmount) <= 0 || parseFloat(withdrawAmount) > parseFloat(balance)}
              className="w-full py-3 bg-gradient-to-r from-red-400 to-pink-500 text-white rounded-xl font-bold border-2 border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transform hover:-translate-y-0.5 transition-all disabled:from-gray-400 disabled:to-gray-500 disabled:transform-none"
            >
              {isWithdrawing ? (
                <span className="flex items-center justify-center space-x-2">
                  <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full"></div>
                  <span>WITHDRAWING...</span>
                </span>
              ) : (
                '💸 WITHDRAW NOW!'
              )}
            </button>
            <div className="text-xs text-red-700 font-bold">
              ⚠️ Available: {parseFloat(balance).toFixed(4)} ETH
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-6 flex gap-2">
          <button
            onClick={loadBalance}
            disabled={isLoading}
            className="flex-1 py-2 bg-gray-200 text-gray-800 rounded-lg border-2 border-black font-bold hover:bg-gray-300 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] transform hover:-translate-y-0.5 transition-all disabled:transform-none"
          >
            {isLoading ? '🔄' : '🔄 REFRESH'}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}
