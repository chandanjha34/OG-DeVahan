# DeVahan contracts (Ethereum Sepolia)

Deploy `SimpleVehicleNFT` to Sepolia:

```bash
cp .env.example .env   # fill PRIVATE_KEY + SEPOLIA_RPC_URL
npm install
npx hardhat ignition deploy ./ignition/modules/Lock.ts --network sepolia
```

Then set the deployed address as `VITE_CONTRACT_ADDRESS` in `Frontend/.env`.
