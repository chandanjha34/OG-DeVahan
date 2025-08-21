import React, { useState } from 'react';
import { X, Check, Loader2 } from 'lucide-react';
import { LoadingState } from './LoadingState';

interface MintNFTFormProps {
  isOpen: boolean;
  onClose: () => void;
}

const MintNFTForm: React.FC<MintNFTFormProps> = ({ isOpen, onClose }) => {
  const [formState, setFormState] = useState<'idle' | 'loading' | 'success'>('idle');
  const [formData, setFormData] = useState({
    customerName: '',
    carName: '',
    ipfsDetails: '',
    walletId: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Start loading state
    setFormState('loading');
    
    // Simulate minting process (3 minutes)
    setTimeout(() => {
      setFormState('success');
      
      // Reset form after 3 seconds of showing success
      setTimeout(() => {
        setFormState('idle');
        onClose();
      }, 3000);
    }, 3000); // This would normally be 180000 (3 min) but shortened for demo
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
          <h2 className="text-2xl font-bold text-gold">Mint Vehicle NFT</h2>
          <p className="text-metallic">Create a new digital ownership certificate</p>
        </div>

        {formState === 'idle' && (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-metallic mb-1">Customer Name</label>
              <input 
                type="text"
                name="customerName"
                required
                value={formData.customerName}
                onChange={handleChange}
                className="w-full px-3 py-2 bg-primary border border-metallic/20 rounded-lg focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold/30 text-white transition-colors"
                placeholder="Enter customer's full name"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-metallic mb-1">Vehicle Name</label>
              <input 
                type="text"
                name="carName"
                required
                value={formData.carName}
                onChange={handleChange}
                className="w-full px-3 py-2 bg-primary border border-metallic/20 rounded-lg focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold/30 text-white transition-colors"
                placeholder="Enter vehicle model name"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-metallic mb-1">IPFS Details</label>
              <input 
                type="text"
                name="ipfsDetails"
                required
                value={formData.ipfsDetails}
                onChange={handleChange}
                className="w-full px-3 py-2 bg-primary border border-metallic/20 rounded-lg focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold/30 text-white transition-colors"
                placeholder="Enter IPFS hash or URI"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-metallic mb-1">Wallet Address</label>
              <input 
                type="text"
                name="walletId"
                required
                value={formData.walletId}
                onChange={handleChange}
                className="w-full px-3 py-2 bg-primary border border-metallic/20 rounded-lg focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold/30 text-white transition-colors"
                placeholder="Enter customer's wallet address"
              />
            </div>
            
            <button 
              type="submit"
              className="w-full py-3 mt-2 rounded-lg bg-gradient-to-r from-neon-blue to-neon-green text-primary font-bold hover:opacity-90 transition-all transform hover:scale-[1.01] active:scale-[0.99]"
            >
              Mint Now
            </button>
          </form>
        )}
        
        {formState === 'loading' && (
          <LoadingState message="Minting vehicle NFT... Please wait" />
        )}
        
        {formState === 'success' && (
          <div className="flex flex-col items-center justify-center py-8 space-y-4 animate-fadeIn">
            <div className="w-16 h-16 rounded-full bg-success flex items-center justify-center mb-4 animate-scaleIn">
              <Check className="w-8 h-8 text-primary" />
            </div>
            <h3 className="text-xl font-bold text-white">Minted Successfully!</h3>
            <p className="text-metallic text-center">
              The vehicle NFT has been successfully minted and ownership has been transferred.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default MintNFTForm;