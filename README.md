# 🚗 DeVahan – Decentralized Vehicle Intelligence Network

A decentralized ecosystem for **vehicle identity, data integrity, and AI-powered lifecycle management**, running on **Ethereum Sepolia**.

**Status:** Production Ready ✅ | **Version:** 1.1 (Sepolia)

---

## 🚀 Quick Start

### 1️⃣ Prerequisites

* Node.js v20+
* npm v10+
* MetaMask with Sepolia ETH
* MongoDB URI, Gemini API key, Pinata JWT (for NFT metadata URI)

### 2️⃣ Installation

```bash
git clone https://github.com/chandanjha34/OG-DeVahan.git
cd OG-DeVahan

cd Backend && npm install && cd ..
cd Frontend && npm install && cd ..
cd Contract && npm install && cd ..
```

### 3️⃣ Environment Setup

**Backend** (`Backend/.env`):

```
PORT=3000
MONGO_URI=mongodb+srv://your_MongoDB_URI
JWT_SECRET=JWT_secret
GEMINI_API_KEY=your_gemini_api_key
PINATA_JWT=your_pinata_jwt
NODE_ENV=development
```

**Contract** (`Contract/.env`):

```
PRIVATE_KEY=your_deployer_private_key
SEPOLIA_RPC_URL=https://ethereum-sepolia-rpc.publicnode.com
ETHERSCAN_API_KEY=optional
```

**Frontend** (`Frontend/.env`):

```
VITE_API_URL=http://localhost:3000
VITE_CONTRACT_ADDRESS=0xYourSepoliaDeployment
VITE_SEPOLIA_RPC_URL=https://rpc.sepolia.org
```

### 4️⃣ Deploy NFT contract to Sepolia

```bash
cd Contract
npx hardhat ignition deploy ./ignition/modules/Lock.ts --network sepolia
```

Copy the deployed `SimpleVehicleNFT` address into `Frontend/.env` as `VITE_CONTRACT_ADDRESS`.

### 5️⃣ Start the App

```bash
cd Backend && npm run dev
cd Frontend && npm run dev
```

---

## 🏗️ Architecture

```
Client (React + Vite + MetaMask / Sepolia)
   │
   ▼
Backend (Express + Node.js)
   │
   ├── Vehicle APIs (identity, history, auth)
   ├── Content storage (SHA-256 blobs on disk)
   ├── Gemini AI (service Q&A)
   └── Pinata IPFS (ERC-721 tokenURI)
   │
   ▼
Ethereum Sepolia (SimpleVehicleNFT)
```

### Data Flow

1. Dealer mints an NFT with vehicle details into the buyer’s wallet (metadata blob + IPFS tokenURI, mint on Sepolia).
2. Service centers upload service records (JSON blob hash stored in MongoDB).
3. Owners can view vehicles and service history.
4. Resale estimator and VahanSaarthi AI assistant use stored records + Gemini.

---

## 🧩 Technology Stack

| Layer      | Technology              | Purpose                      |
| ---------- | ----------------------- | ---------------------------- |
| Frontend   | React + Tailwind        | Vehicle dashboard UI         |
| Backend    | Node.js + Express       | REST APIs                    |
| Blockchain | Ethereum Sepolia        | Vehicle NFT ownership        |
| AI         | Google Gemini           | Service Q&A / diagnostics    |
| Storage    | Local content-addressed | Vehicle / service JSON blobs |
| Metadata   | Pinata IPFS             | ERC-721 tokenURI             |
| DB         | MongoDB                 | Auth + service hash index    |

---

## ⚙️ Features

### ✅ Core (Implemented)

* Vehicle NFT minting on Sepolia
* Service record storage (content-addressed + MongoDB)
* AI-based maintenance Q&A (Gemini)
* Dealer & service provider registration
* Basic dashboard for vehicle health

### 🔮 Upcoming

* Smart INFTs
* Predictive repair scheduling
* Vehicle resale verification
* Insurance & finance modules
