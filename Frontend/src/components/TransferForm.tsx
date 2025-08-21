import React, { useState, useEffect } from 'react';
import { X, Check, ArrowRight } from 'lucide-react';
import { LoadingState } from './LoadingState';

interface TransferFormProps {
  isOpen: boolean;
  onClose: () => void;
  onTransferComplete: (tokenId: string) => void;
  selectedVehicle: string | null;
}

const TransferForm: React.FC<TransferFormProps> = ({ isOpen, onClose, onTransferComplete, selectedVehicle }) => {
  const [formState, setFormState] = useState<'idle' | 'loading' | 'success'>('idle');
  const [formData, setFormData] = useState({
    receiverWallet: '',
    tokenId: ''
  });

  useEffect(() => {
    if (selectedVehicle) {
      setFormData(prev => ({ ...prev, tokenId: selectedVehicle }));
    }
  }, [selectedVehicle]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormState('loading');
    
    setTimeout(() => {
      setFormState('success');
      onTransferComplete(formData.tokenId);
      setTimeout(() => {
        setFormState('idle');
        setFormData({ receiverWallet: '', tokenId: '' });
        onClose();
      }, 2000);
    }, 2000);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 animate-fadeIn">
      <div className="bg-primary-light rounded-lg p-6 w-full max-w-md relative border border-metallic/30 shadow-[0_0_15px_rgba(255,215,0,0.1)]">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-metallic hover:text-white disabled:opacity-50"
          disabled={formState === 'loading'}
        >
          <X className="w-5 h-5" />
        </button>
        
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-gold">Transfer Vehicle</h2>
          <p className="text-metallic">Transfer vehicle ownership to another wallet</p>
        </div>

        {formState === 'idle' && (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-metallic mb-1">Receiver's Wallet Address</label>
              <input 
                type="text"
                name="receiverWallet"
                required
                value={formData.receiverWallet}
                onChange={handleChange}
                className="w-full px-3 py-2 bg-primary border border-metallic/20 rounded-lg focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold/30 text-white transition-colors"
                placeholder="Enter receiver's wallet address"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-metallic mb-1">Vehicle Token ID</label>
              <input 
                type="text"
                name="tokenId"
                required
                value={formData.tokenId}
                onChange={handleChange}
                className="w-full px-3 py-2 bg-primary border border-metallic/20 rounded-lg focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold/30 text-white transition-colors"
                placeholder="Enter vehicle token ID"
              />
            </div>
            
            <button 
              type="submit"
              className="w-full py-3 mt-2 rounded-lg bg-gradient-to-r from-neon-blue to-neon-green text-primary font-bold hover:opacity-90 transition-all transform hover:scale-[1.01] active:scale-[0.99] flex items-center justify-center"
            >
              <span>Transfer Ownership</span>
              <ArrowRight className="w-4 h-4 ml-2" />
            </button>
          </form>
        )}
        
        {formState === 'loading' && (
          <LoadingState message="Transferring ownership... Please wait" />
        )}
        
        {formState === 'success' && (
          <div className="flex flex-col items-center justify-center py-8 space-y-4 animate-fadeIn">
            <div className="w-16 h-16 rounded-full bg-success flex items-center justify-center mb-4 animate-scaleIn">
              <Check className="w-8 h-8 text-primary" />
            </div>
            <h3 className="text-xl font-bold text-white">Transfer Successful!</h3>
            <p className="text-metallic text-center">
              The vehicle ownership has been successfully transferred to the new wallet.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default TransferForm;