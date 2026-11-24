/** Ethereum Sepolia */
export const SEPOLIA_CHAIN_ID = 11155111;
export const SEPOLIA_CHAIN_ID_HEX = "0xaa36a7";

export const SEPOLIA_PARAMS = {
  chainId: SEPOLIA_CHAIN_ID_HEX,
  chainName: "Sepolia",
  nativeCurrency: { name: "Sepolia ETH", symbol: "ETH", decimals: 18 },
  rpcUrls: [
    import.meta.env.VITE_SEPOLIA_RPC_URL || "https://rpc.sepolia.org",
  ],
  blockExplorerUrls: ["https://sepolia.etherscan.io"],
};

export async function ensureSepolia(ethereum: any): Promise<void> {
  if (!ethereum) throw new Error("No wallet detected");

  const current: string = await ethereum.request({ method: "eth_chainId" });
  if (current === SEPOLIA_CHAIN_ID_HEX) return;

  try {
    await ethereum.request({
      method: "wallet_switchEthereumChain",
      params: [{ chainId: SEPOLIA_CHAIN_ID_HEX }],
    });
  } catch (err: any) {
    // 4902 = chain not added to wallet
    if (err?.code === 4902) {
      await ethereum.request({
        method: "wallet_addEthereumChain",
        params: [SEPOLIA_PARAMS],
      });
      return;
    }
    throw err;
  }
}
