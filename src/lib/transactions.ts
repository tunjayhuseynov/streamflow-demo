import { AddressLookupTableAccount, Connection, Signer, TransactionInstruction, TransactionMessage, VersionedTransaction } from "@solana/web3.js";

export function createTransaction(instructions: TransactionInstruction[], signer: Signer, blockhash: string, addressLookupTableAccounts?: AddressLookupTableAccount[]) {
    const messageV0 = new TransactionMessage({
        payerKey: signer.publicKey,
        recentBlockhash: blockhash,
        instructions,
    }).compileToV0Message(addressLookupTableAccounts);
    const transaction = new VersionedTransaction(messageV0);

    transaction.sign([signer])

    return transaction
}

export async function sendAndConfirmTransaction(connection: Connection, v0TX: VersionedTransaction, blockhash: string, lastValidBlockHeight: number) {
    let signature = await connection.sendTransaction(v0TX, { maxRetries: 5 })

    await connection.confirmTransaction({
        signature,
        lastValidBlockHeight,
        blockhash
    })
}