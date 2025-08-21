import React, { useState, useEffect } from 'react';
import { Wallet2, Car, History, Plus, Train as Transfer, X, User, Building2, ArrowRight } from 'lucide-react';
import MintNFTForm from './components/MintNFTForm';
import TransferForm from './components/TransferForm';
import Chatbot from './components/Chatbot';
import LanguageSwitcher from './components/LanguageSwitcher';
import MetaMaskConnect from './components/MetaMaskConnect';
import { useLanguage } from './context/LanguageContext';

function App() {
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showMintModal, setShowMintModal] = useState(false);
  const [showTransferModal, setShowTransferModal] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState<string | null>(null);
  const [transferredTokens, setTransferredTokens] = useState<string[]>([]);
  const [isDealer, setIsDealer] = useState(false);
  const [isSignIn, setIsSignIn] = useState(true);
  const [currentPage, setCurrentPage] = useState('home');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [metaMaskAddress, setMetaMaskAddress] = useState<string>('');
  const [currentUser, setCurrentUser] = useState<{
    name: string;
    email: string;
    wallet: string;
    type: 'user' | 'dealer';
  } | null>(null);

  const { t } = useLanguage();
 
  const vehicles = [
    {
      name: "BMW M2",
      plate: "DL 5C 9012",
      wallet: "0x9gh62er97sd013",
      image: "https://imgd.aeplcdn.com/664x374/n/cw/ec/150125/m2-exterior-right-front-three-quarter-2.jpeg?isig=0&q=80",
      tokenId: "TOKEN_001"
    },
    {
      name: "Toyota Prado 250",
      plate: "MH 02 CD 5678",
      wallet: "0x8765FG556f4321",
      image: "https://stimg.cardekho.com/images/carexteriorimages/930x620/Toyota/Land-Cruiser-250/11001/1737017932790/front-left-side-47.jpg",
      tokenId: "TOKEN_002"
    },
    {
      name: "Land Rover Defender 110X",
      plate: "HR 03 EF 9012",
      wallet: "0x98762er45g0123",
      image: "https://stimg.cardekho.com/images/carexteriorimages/630x420/Land-Rover/Defender/12294/1736235204503/side-view-(left)-90.jpg",
      tokenId: "TOKEN_003"
    },
    {
      name: "McLaren P1",
      plate: "DL 01 AB 1234",
      wallet: "0x1234456e6fg5t5",
      image: "https://i.pinimg.com/736x/f2/f7/26/f2f7264890e2d2bb4d8e7cc648ef1123.jpg",
      tokenId: "TOKEN_004"
    },
    {
      name: "Mercedes-Benz Maybach S-class",
      plate: "UP 16 EF 9012",
      wallet: "0x98ij45j4ke4ert",
      image: "https://files.hodoor.world/main/b00ebddd-3346-43bb-8fd9-936b80bd76de.jpg",
      tokenId: "TOKEN_005"
    }
  ];

  const handleMetaMaskConnect = (address: string) => {
    if (address) {
      setMetaMaskAddress(address);
    }
  };

  const handleSignIn = (e: React.FormEvent) => {
    e.preventDefault();
    const email = (e.target as any).email.value;
    const wallet = metaMaskAddress || (e.target as any).wallet.value;

    if (isDealer && (wallet === "678" || metaMaskAddress)) {
      setCurrentUser({
        name: "Siddhant",
        email: email || "sid@dealer.com",
        wallet: metaMaskAddress || "678",
        type: "dealer"
      });
      setIsAuthenticated(true);
    } else if (!isDealer && (wallet === "123" || wallet === "456" || metaMaskAddress)) {
      setCurrentUser({
        name: metaMaskAddress ? "MetaMask User" : (wallet === "123" ? "Anmol" : "Aditya"),
        email: email || "user@example.com",
        wallet: metaMaskAddress || wallet,
        type: "user"
      });
      setIsAuthenticated(true);
    }
    setShowAuthModal(false);
  };

  const handleSignOut = () => {
    setIsAuthenticated(false);
    setCurrentUser(null);
    setCurrentPage('home');
    setTransferredTokens([]);
    setMetaMaskAddress('');
  };

  const handleTransferComplete = (tokenId: string) => {
    setTransferredTokens(prev => [...prev, tokenId]);
  };

  const availableVehicles = vehicles.filter(vehicle => !transferredTokens.includes(vehicle.tokenId));

  return (
    <div className="min-h-screen bg-primary text-white">
      {/* Header/Navbar */}
      <nav className="bg-primary-light border-b border-metallic/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center cursor-pointer" onClick={() => setCurrentPage('home')}>
              <Car className="w-8 h-8 text-gold" />
              <span className="ml-2 text-xl font-bold">DeVahan</span>
            </div>
            <div className="hidden md:block">
              <div className="flex items-center space-x-4">
                {isAuthenticated && currentUser?.type === 'user' && (
                  <div onClick={() => setCurrentPage('vehicles')} className="cursor-pointer">
                    <NavLink icon={<Car />} text={t('nav.myVehicles')} />
                  </div>
                )}
                {isAuthenticated && currentUser?.type === 'dealer' && (
                  <div onClick={() => setShowMintModal(true)} className="cursor-pointer">
                    <NavLink icon={<Plus />} text={t('nav.mintNFT')} />
                  </div>
                )}
                {isAuthenticated && currentUser?.type === 'user' && (
                  <div onClick={() => setShowTransferModal(true)} className="cursor-pointer">
                    <NavLink icon={<Transfer />} text={t('nav.transfer')} />
                  </div>
                )}
                <NavLink icon={<History />} text={t('nav.history')} />
                {isAuthenticated ? (
                  <div className="flex items-center space-x-4">
                    <span className="text-metallic">
                      {currentUser?.name} ({currentUser?.type})
                    </span>
                    <button 
                      onClick={handleSignOut}
                      className="flex items-center px-4 py-2 rounded-lg bg-gradient-to-r from-warning to-warning-orange text-white font-semibold hover:opacity-90 transition-opacity"
                    >
                      {t('nav.signOut')}
                    </button>
                  </div>
                ) : (
                  <button 
                    onClick={() => setShowAuthModal(true)}
                    className="flex items-center px-4 py-2 rounded-lg bg-gradient-to-r from-gold to-gold-light text-primary font-semibold hover:opacity-90 transition-opacity"
                  >
                    <Wallet2 className="w-4 h-4 mr-2" />
                    {t('nav.signIn')}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Auth Modal */}
      {showAuthModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-primary-light rounded-lg p-6 w-full max-w-md relative">
            <button 
              onClick={() => setShowAuthModal(false)}
              className="absolute top-4 right-4 text-metallic hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
            
            <div className="flex justify-center space-x-4 mb-6">
              <button 
                onClick={() => setIsDealer(false)}
                className={`flex items-center px-4 py-2 rounded-lg transition-colors ${!isDealer ? 'bg-gold text-primary' : 'text-metallic hover:text-white'}`}
              >
                <User className="w-4 h-4 mr-2" />
                {t('auth.user')}
              </button>
              <button 
                onClick={() => setIsDealer(true)}
                className={`flex items-center px-4 py-2 rounded-lg transition-colors ${isDealer ? 'bg-gold text-primary' : 'text-metallic hover:text-white'}`}
              >
                <Building2 className="w-4 h-4 mr-2" />
                {t('auth.dealer')}
              </button>
            </div>

            <div className="flex justify-center space-x-4 mb-6">
              <button 
                onClick={() => setIsSignIn(true)}
                className={`px-4 py-2 rounded-lg transition-colors ${isSignIn ? 'bg-neon-blue text-primary' : 'text-metallic hover:text-white'}`}
              >
                {t('auth.signIn')}
              </button>
              <button 
                onClick={() => setIsSignIn(false)}
                className={`px-4 py-2 rounded-lg transition-colors ${!isSignIn ? 'bg-neon-blue text-primary' : 'text-metallic hover:text-white'}`}
              >
                {t('auth.signUp')}
              </button>
            </div>

            {/* MetaMask Connect */}
            <div className="mb-4">
              <MetaMaskConnect onConnect={handleMetaMaskConnect} />
            </div>

            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-metallic/20"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-primary-light text-metallic">
                  {metaMaskAddress ? t('auth.walletConnected') : 'or continue with credentials'}
                </span>
              </div>
            </div>

            <form onSubmit={handleSignIn} className="space-y-4">
              {!isSignIn && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-metallic mb-1">{t('auth.name')}</label>
                    <input 
                      type="text"   
                      name="name"
                      className="w-full px-3 py-2 bg-primary border border-metallic/20 rounded-lg focus:outline-none focus:border-gold text-white"
                      placeholder={`${t('auth.name')}...`}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-metallic mb-1">{t('auth.phone')}</label>
                    <input 
                      type="tel" 
                      name="phone"
                      className="w-full px-3 py-2 bg-primary border border-metallic/20 rounded-lg focus:outline-none focus:border-gold text-white"
                      placeholder={`${t('auth.phone')}...`}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-metallic mb-1">{t('auth.address')}</label>
                    <textarea 
                      name="address"
                      className="w-full px-3 py-2 bg-primary border border-metallic/20 rounded-lg focus:outline-none focus:border-gold text-white"
                      placeholder={`${t('auth.address')}...`}
                      rows={3}
                    />
                  </div>
                </>
              )}
              <div>
                <label className="block text-sm font-medium text-metallic mb-1">{t('auth.email')}</label>
                <input 
                  type="email" 
                  name="email"
                  className="w-full px-3 py-2 bg-primary border border-metallic/20 rounded-lg focus:outline-none focus:border-gold text-white"
                  placeholder={`${t('auth.email')}...`}
                />
              </div>
              {!metaMaskAddress && (
                <div>
                  <label className="block text-sm font-medium text-metallic mb-1">{t('auth.walletPin')}</label>
                  <input 
                    type="text" 
                    name="wallet"
                    className="w-full px-3 py-2 bg-primary border border-metallic/20 rounded-lg focus:outline-none focus:border-gold text-white"
                    placeholder={`${t('auth.walletPin')}...`}
                  />
                </div>
              )}
              {!isSignIn && isDealer && (
                <div>
                  <label className="block text-sm font-medium text-metallic mb-1">{t('auth.dealerId')}</label>
                  <input 
                    type="text" 
                    name="dealerId"
                    className="w-full px-3 py-2 bg-primary border border-metallic/20 rounded-lg focus:outline-none focus:border-gold text-white"
                    placeholder={`${t('auth.dealerId')}...`}
                  />
                </div>
              )}
              <button 
                type="submit"
                className="w-full py-3 rounded-lg bg-gradient-to-r from-neon-blue to-neon-green text-primary font-bold hover:opacity-90 transition-opacity"
              >
                {isSignIn ? t('auth.signIn') : (isDealer ? t('auth.registerAsDealer') : t('auth.signUp'))}
              </button>
              {isSignIn && !metaMaskAddress && (
                <p className="text-sm text-metallic text-center mt-2">
                  {isDealer ? t('auth.demoDealer') : t('auth.demoUser')}
                </p>
              )}
            </form>
          </div>
        </div>
      )}

      {/* Mint NFT Modal */}
      <MintNFTForm 
        isOpen={showMintModal} 
        onClose={() => setShowMintModal(false)} 
      />

      {/* Transfer Modal */}
      <TransferForm
        isOpen={showTransferModal}
        onClose={() => setShowTransferModal(false)}
        onTransferComplete={handleTransferComplete}
        selectedVehicle={selectedVehicle}
      />

      {currentPage === 'home' ? (
        <>
          {/* Hero Section */}
          <div className="relative overflow-hidden">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
              <div className="text-center">
                <h1 className="text-4xl tracking-tight font-extrabold sm:text-5xl md:text-6xl">
                  <span className="block">{t('home.title1')}</span>
                  <span className="block text-gold">{t('home.title2')}</span>
                </h1>
                <p className="mt-3 max-w-md mx-auto text-base text-metallic sm:text-lg md:mt-5 md:text-xl md:max-w-3xl">
                  {t('home.subtitle')}
                </p>
                <div className="mt-10 flex justify-center gap-4">
                  <button 
                    onClick={() => setShowAuthModal(true)}
                    className="px-8 py-3 rounded-lg bg-gradient-to-r from-neon-blue to-neon-green text-primary font-bold hover:opacity-90 transition-opacity" 
                    style={{ background: 'linear-gradient(to right, #00c6ff, #0072ff)' }}
                  >
                    {t('home.getStarted')}
                  </button>
                  <button className="px-8 py-3 rounded-lg border-2 border-metallic/50 hover:border-metallic transition-colors">
                    {t('home.learnMore')}
                  </button>
                </div>
              </div>
            </div>
            
            {/* Background Effect */}
            <div className="absolute inset-0 -z-10 bg-gradient-radial from-primary-light to-primary" />
            <div className="absolute inset-0 -z-10 opacity-30 bg-[radial-gradient(#FFD700_1px,transparent_1px)] [background-size:16px_16px]" />
          </div>

          {/* Features Grid */}
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <FeatureCard
                title={t('feature.secureOwnership.title')}
                description={t('feature.secureOwnership.desc')}
                icon={<Wallet2 className="w-8 h-8 text-gold" />}
              />
              <FeatureCard
                title={t('feature.instantTransfers.title')}
                description={t('feature.instantTransfers.desc')}
                icon={<Transfer className="w-8 h-8 text-gold" />}
              />
              <FeatureCard
                title={t('feature.completeHistory.title')}
                description={t('feature.completeHistory.desc')}
                icon={<History className="w-8 h-8 text-gold" />}
              />
            </div>
          </div>
        </>
      ) : (
        // Vehicles Page
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <h2 className="text-3xl font-bold mb-8">{t('vehicles.title')}</h2>
          {availableVehicles.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-metallic text-lg">{t('vehicles.noVehicles')}</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {availableVehicles.map((vehicle, index) => (
                <div key={index} className="bg-primary-light rounded-lg overflow-hidden border border-metallic/20 hover:border-metallic/40 transition-all transform hover:scale-[1.02]">
                  <div className="aspect-video w-full overflow-hidden">
                    <img 
                      src={vehicle.image} 
                      alt={vehicle.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="p-6">
                    <div className="flex items-center mb-4">
                      <Car className="w-6 h-6 text-gold mr-3" />
                      <h3 className="text-xl font-semibold">{vehicle.name}</h3>
                    </div>
                    <div className="space-y-2 text-metallic">
                      <p>{t('vehicles.plateNumber')} <span className="text-white">{vehicle.plate}</span></p>
                      <p>{t('vehicles.wallet')} <span className="text-white">{vehicle.wallet}</span></p>
                      <p>{t('vehicles.tokenId')} <span className="text-white">{vehicle.tokenId}</span></p>
                    </div>
                    <button
                      onClick={() => {
                        setSelectedVehicle(vehicle.tokenId);
                        setShowTransferModal(true);
                      }}
                      className="mt-4 w-full py-2 rounded-lg bg-gradient-to-r from-neon-blue to-neon-green text-primary font-semibold hover:opacity-90 transition-opacity flex items-center justify-center"
                    >
                      <span>{t('vehicles.transfer')}</span>
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Chatbot Component */}
      <Chatbot />
      
      {/* Language Switcher */}
      <LanguageSwitcher />
    </div>
  );
}

function NavLink({ icon, text }: { icon: React.ReactNode; text: string }) {
  return (
    <a href="#" className="flex items-center px-3 py-2 rounded-md text-metallic hover:text-white hover:bg-primary-light transition-colors">
      {React.cloneElement(icon as React.ReactElement, { className: 'w-4 h-4 mr-2' })}
      {text}
    </a>
  );
}

function FeatureCard({ title, description, icon }: { title: string; description: string; icon: React.ReactNode }) {
  return (
    <div className="p-6 rounded-lg bg-primary-light border border-metallic/20 hover:border-metallic/40 transition-colors">
      <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center mb-4">
        {icon}
      </div>
      <h3 className="text-xl font-bold mb-2">{title}</h3>
      <p className="text-metallic">{description}</p>
    </div>
  );
}

export default App;