import { Address, createPublicClient, createWalletClient, http } from "viem";
import {privateKeyToAccount} from "viem/accounts"
import { base, baseSepolia } from "viem/chains";
import { createCoin, CreateCoinArgs } from "@zoralabs/coins-sdk";
import { uploadFileToR2 } from "./file";

interface Metadata {
    name: string;
    description: string;
    symbol: string;
    image: string;
    properties: {
        category: string;
    };
}
export const coinIt = async (metadata : Metadata, creatorAddress: Address ) => {
    const PlatformReferrer = (process.env.PROJECT_WALLET_ADDRESS?.startsWith('0x')
            ? process.env.PROJECT_WALLET_ADDRESS
            : "0xEbaEbc9baB52157936975D7bF121e3A8a2c09a7f") as `0x${string}`;
    if(!process.env.PRIVATE_KEY){
        console.log("no Private Key present")
        throw new Error("no Keys present")
    }

    try{
        const serverAccount = privateKeyToAccount(`0x${process.env.PRIVATE_KEY.replace('0x', '')}`);
    
        const publicClient = createPublicClient({
            chain: base,
            transport: http(`${process.env.RPC_URL}`), // Replace with your RPC URL
        });
    
         // Create a wallet client
         const walletClient = createWalletClient({
            account: serverAccount, // Replace with a valid Ethereum address
            chain: base,
            transport: http(`${process.env.RPC_URL}`), // Replace with your RPC URL
        });
    
        const metadataBlob = new Blob([JSON.stringify(metadata)], {
            type: 'application/json'
        });
    
        const metadataFile = new File([metadataBlob], 'metadata.json', {
            type: 'application/json'
        })
    
    
        const metaDataIPFS = await uploadFileToR2(metadataFile);
    
        console.log(metaDataIPFS, "metaDataIPFS")
    
        const coinParams = {
            name: "plant",
            symbol: "plant",
            uri: metaDataIPFS,
            payoutRecipient:creatorAddress,
            platformReferrer: process.env.PROJECT_WALLET_ADDRESS
        } as CreateCoinArgs;
    
        const result = await createCoin(coinParams, walletClient, publicClient);
        console.log(result, "result")


            const coinAddress = result?.deployment?.coin;
            const coinPage = `https://zora.co/coin/base:${coinAddress?.toLowerCase()}?referrer=${PlatformReferrer?.toLowerCase()}`; 
            return coinPage;
    }
    catch(error){
        console.log(error, "error")
        throw new Error()
    }






}