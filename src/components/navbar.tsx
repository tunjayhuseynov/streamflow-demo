'use client'
import { useWallet } from "@solana/wallet-adapter-react";
import Link from "next/link";
import dynamic from "next/dynamic";

//Adapter UI is not optimized for SSR
let WalletMultiButton = dynamic(() => import("@solana/wallet-adapter-react-ui").then(s => s.WalletMultiButton), { ssr: false })


export default function Navbar() {
    const { publicKey } = useWallet()

    return <nav className="h-20 w-full container mx-auto absolute left-0 top-0">
        <div className="grid grid-cols-2 h-full">
            <div></div>
            <div className="flex items-center justify-end space-x-4">
                {!!publicKey &&
                    <Link href={"create-stream"}>
                        <div className="px-2 py-3 bg-purple-600 hover:bg-purple-600/60 transition-colors duration-300 rounded">
                            Create a new stream
                        </div>
                    </Link>
                }
                <WalletMultiButton />
            </div>
        </div>
    </nav>
}