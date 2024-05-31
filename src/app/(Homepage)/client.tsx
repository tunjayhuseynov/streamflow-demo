'use client'

import useAsyncEffect from "@/hooks/useAsyncEffect";
import useStream from "@/hooks/useStream";
import { TimePeriods } from "@/lib/consts";
import { useWallet } from "@solana/wallet-adapter-react";
import { getNumberFromBN } from "@streamflow/stream";
import dynamic from "next/dynamic";
import { useState } from "react";

//Adapter UI is not optimized for SSR
let WalletMultiButton = dynamic(() => import("@solana/wallet-adapter-react-ui").then(s => s.WalletMultiButton), { ssr: false })

export default function HomeClientPage() {
    const { publicKey, connecting } = useWallet()
    const pkString = publicKey?.toBase58()

    return (
        <main className="flex items-center justify-center min-h-screen">
            {connecting && <>Loading...</>}
            {!connecting && <div>
                {
                    !!pkString ? <Connected publicKey={pkString} /> : <NotConnectedYet />
                }
            </div>}
        </main>
    );
}


interface IConnected {
    publicKey: string
}

function Connected({ publicKey }: IConnected) {
    const { getStreams, streamStatus } = useStream()
    const [streams, setStreams] = useState<Awaited<ReturnType<typeof getStreams>>>()

    useAsyncEffect(async () => {
        const streams = await getStreams()
        setStreams(streams)
    }, [])

    return <div className="flex flex-col space-y-4">
        <div>
            {publicKey} is connected.
        </div>
        <div className="flex flex-col space-y-4">
            <div>Streams:</div>
            <div>
                {streamStatus == "loading" && "Loading..."}
                {streamStatus == "error" && "Oops.. Something went wrong"}
                {streamStatus == "idle" && !streams?.length && "No stream"}
                {streamStatus == "idle" && !!streams?.length &&
                    <div className="overflow-hidden">
                        <div className="h-96  overflow-auto">
                            {
                                streams.map((val, index) => {
                                    const [id, stream] = val
                                    return <div key={id}>
                                        ------
                                        <div className="flex space-x-2">
                                            <div>
                                                #{index + 1}
                                            </div>
                                            <div>
                                                <div>
                                                    Id: {id}
                                                </div>
                                                <div>
                                                    Token: {stream.token?.name ?? "N/A"}
                                                </div>
                                                <div>
                                                    Deposited amount: {stream.token?.decimals ? getNumberFromBN(stream.depositedAmount, stream.token.decimals) : "N/A"}
                                                </div>
                                                <div>
                                                    Amount per period: {stream.token?.decimals ? getNumberFromBN(stream.amountPerPeriod, stream.token.decimals) : "N/A"}
                                                </div>
                                                <div>
                                                    Withdrawn amount: {stream.token?.decimals ? getNumberFromBN(stream.withdrawnAmount, stream.token.decimals) : "N/A"}
                                                </div>
                                                <div>
                                                    Period: {TimePeriods.find(s => s.periodInSecs == stream.period)?.name || "N/A"}
                                                </div>
                                                <div>
                                                    Due to: {new Date(stream.end * 1e3).toLocaleString()}
                                                </div>
                                                <div>
                                                    Recipient: {stream.recipient}
                                                </div>
                                            </div>
                                        </div>
                                        ------
                                    </div>
                                })
                            }
                        </div>
                    </div>
                }
            </div>
        </div>
    </div>
}

function NotConnectedYet() {
    return <div className="flex flex-col items-center space-y-4">
        <div>Please, connect your wallet in order to create a stream.</div>
        <WalletMultiButton />
    </div>
}