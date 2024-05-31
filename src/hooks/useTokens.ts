import { IStreamflowContext, StreamflowContext } from "@/providers/ConnectionAdapter";
import { useCallback, useContext, useState } from "react";
import { useWallet } from '@solana/wallet-adapter-react'
import { TOKEN_PROGRAM_ID } from "@solana/spl-token";
import { FetchTokenList } from "@/lib/tokens";
import BigNumber from "bignumber.js";
import { LAMPORTS_PER_SOL } from "@solana/web3.js";
import { Unknown_Token } from "@/lib/consts";
import useAsyncEffect from "./useAsyncEffect";



export default function useTokens() {
    const context = useContext<IStreamflowContext>(StreamflowContext)
    const { publicKey, connecting, connected } = useWallet()

    const pkString = publicKey?.toBase58()

    const [tokenListStatus, setTokenListStatus] = useState<"loading" | "idle" | "error">("idle")

    const [tokens, setTokens] = useState<Awaited<ReturnType<typeof getTokens>>>()

    useAsyncEffect(async () => {
        if (connected) {
            const tokens = await getTokens()
            setTokens(tokens)
        }
    }, [connected])

    const getTokens = useCallback(async () => {
        if (publicKey) {
            try {
                setTokenListStatus("loading")

                const connection = context.streamflowConnection.getConnection()
                const tokens = await FetchTokenList()

                const responses = await connection.getParsedTokenAccountsByOwner(publicKey, { programId: TOKEN_PROGRAM_ID })

                const balanceLamports = await connection.getBalance(publicKey)
                const balance = BigNumber(balanceLamports).dividedBy(LAMPORTS_PER_SOL).toNumber()


                let list = responses.value.filter(parsedToken => parsedToken.account.data.parsed.info.tokenAmount.uiAmount != 0).map(parsedToken => {
                    const token = tokens.tokens.find(token => token.address == parsedToken.account.data.parsed.info.mint) ?? Unknown_Token
                    return {
                        ...token,
                        amount: parsedToken.account.data.parsed.info.tokenAmount.uiAmount
                    }
                })

                const solana = tokens.tokens.find((token) => token.address == "So11111111111111111111111111111111111111112")

                if (solana) {
                    list.unshift({
                        ...solana,
                        name: "Solana",
                        amount: balance
                    })
                }


                setTokenListStatus("idle")
                return list
            } catch (error) {
                setTokenListStatus("error")
            }
        }
        return []
    }, [pkString])


    return {
        getTokens,
        tokenListStatus,
        publicKey,
        connecting,
        connected,
        tokens
    }
}