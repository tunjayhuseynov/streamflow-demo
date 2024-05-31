import { IStreamflowContext, StreamflowContext } from "@/providers/ConnectionAdapter";
import { useCallback, useContext, useState } from "react";
import { useWallet } from '@solana/wallet-adapter-react'
import { ICreateMultipleStreamData, ICreateStreamData } from "@streamflow/stream";
import { FetchTokenList } from "@/lib/tokens";



export default function useStream() {
    const context = useContext<IStreamflowContext>(StreamflowContext)
    const { publicKey, connecting, connected, wallet } = useWallet()

    const pkString = publicKey?.toBase58()

    const [streamStatus, setStreamStatus] = useState<"loading" | "idle" | "error">("idle")
    const [creatingStreamStatus, setCreatingStreamStatus] = useState<"loading" | "idle" | "error">("idle")

    const createStream = useCallback(async (createStreamParams: ICreateStreamData, isNative: boolean = true) => {
        if (wallet) {
            try {
                setCreatingStreamStatus("loading")
                let stream = await context.streamflowConnection.create(createStreamParams, { sender: wallet.adapter as any, isNative })
                
                setCreatingStreamStatus("idle")
                return stream
            } catch (error) {
                console.log(error)
                setCreatingStreamStatus("error")
                throw error
            }
        }
    }, [pkString])

    const createStreamMultiple = useCallback(async (createStreamParams: ICreateMultipleStreamData, isNative: boolean = true) => {
        if (wallet) {
            try {
                setCreatingStreamStatus("loading")
                let stream = await context.streamflowConnection.createMultiple(createStreamParams, { sender: wallet.adapter as any, isNative })

                setCreatingStreamStatus("idle")
                return stream
            } catch (error) {
                setCreatingStreamStatus("error")
            }
        }
    }, [pkString])


    const getStreams = useCallback(async () => {
        if (pkString) {
            try {
                setStreamStatus("loading")

                let result = await context.streamflowConnection.get({ address: pkString })
                const tokens = await FetchTokenList()

                let parsedResult = result.map(res=>{
                    let [id, stream] = res

                    const token = tokens.tokens.find(token => token.address == stream.mint)

                    return [id, {...stream, token}] as const
                })
                
                setStreamStatus("idle")

                return parsedResult
            } catch (err) {
                setStreamStatus("error")
            }
        }
        return []
    }, [pkString])

    return {
        getStreams,
        createStream,
        createStreamMultiple,
        streamStatus,
        creatingStreamStatus,
        publicKey,
        connecting,
        connected
    }
}