'use client'

import type React from "react"
import { createContext } from "react"
import { StreamflowSolana } from "@streamflow/stream";
import * as WalletAdapterReact from '@solana/wallet-adapter-react'
import * as WalletAdapterWallets from '@solana/wallet-adapter-wallets'
import { WalletModalProvider } from "@solana/wallet-adapter-react-ui";
import '@solana/wallet-adapter-react-ui/styles.css'

interface IProps {
    children: React.ReactNode
}

export interface IStreamflowContext {
    streamflowConnection: StreamflowSolana.SolanaStreamClient
}

export const StreamflowContext = createContext<IStreamflowContext>({} as any)

const endpoint = "https://api.devnet.solana.com"

const solanaClient = new StreamflowSolana.SolanaStreamClient(endpoint);

export function Web3ConnectionAdapter({ children }: IProps) {

    const wallets = [
        new WalletAdapterWallets.PhantomWalletAdapter()
    ]

    return <>
        <StreamflowContext.Provider
            value={{
                streamflowConnection: solanaClient
            }}
        >
            <WalletAdapterReact.ConnectionProvider endpoint={endpoint}>
                <WalletAdapterReact.WalletProvider wallets={wallets} autoConnect>
                    <WalletModalProvider>
                        {children}
                    </WalletModalProvider>
                </WalletAdapterReact.WalletProvider>
            </WalletAdapterReact.ConnectionProvider>
        </StreamflowContext.Provider>
    </>
}