import axios from "axios"
import { SolanaTokenListEndpoint } from "./consts"


interface ITokenList {
    tokens: {
        address: string,
        chainId: number,
        decimals: number,
        logoURI: string,
        name: string
        symbol: string
    }[]
}

export async function FetchTokenList() {
    const tokens = await axios.get<ITokenList>(SolanaTokenListEndpoint)

    return tokens.data
}