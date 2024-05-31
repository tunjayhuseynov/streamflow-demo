import { getTimeInSeconds } from "@/lib/utils"
import { getBN } from "@streamflow/stream"
import BigNumber from "bignumber.js"
import { toast } from "react-toastify"
import { BN } from "@streamflow/stream/solana"
import { z } from "zod"
import useStream from "@/hooks/useStream"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"


const recipientSchema = z.object({
    recipient: z.string().min(1, "Recipient is required"),
    amount: z.coerce.number().min(0.00001, "The number must be at least 0.00001"),
});

const formSchema = z.object({
    token: z.string().min(1, {
        message: "You have to select a token",
    }),
    durationPeriod: z.string().min(1, {
        message: "You have to select a period",
    }),
    duration: z.coerce.number().min(1, "The number must be at least 1"),
    unlockSchedule: z.string().min(1, {
        message: "You have to select a period",
    }),
    recipients: z.array(recipientSchema).min(1, "At least 1 recipient is required"),
})

export default function useClientCreateStreamHook(){
    const { createStream, createStreamMultiple, creatingStreamStatus } = useStream()

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            token: "",
            recipients: [{ recipient: "", amount: 0 }],
        },
    })


    // Submit function of the `Create Stream` form
    const onSubmit = async (data: z.infer<typeof formSchema>) => {
        const token = JSON.parse(data.token) as { address: string, decimal: number }
        const deadline = (+data.durationPeriod) * data.duration
        const period = +data.unlockSchedule


        if (data.recipients.length == 1) {
            const recipient = data.recipients[0]

            const amountPerPeriod = BigNumber(recipient.amount).dividedBy(BigNumber(deadline).dividedBy(period)).toNumber()

            const res = await createStream({
                amount: getBN(recipient.amount, token.decimal),
                tokenId: token.address,
                name: "Demo transfer",
                recipient: recipient.recipient,
                cliffAmount: new BN(0),
                cliff: getTimeInSeconds() + 120,
                start: getTimeInSeconds() + 60,
                period,
                amountPerPeriod: getBN(amountPerPeriod, token.decimal),

                automaticWithdrawal: true,
                canTopup: false,
                cancelableBySender: true,
                cancelableByRecipient: false,
                transferableBySender: true,
                transferableByRecipient: false,
            })

            toast.success(`${res?.txId} is successfully created!`)
        } else {
            const recipients = data.recipients.map((rec)=>{
                const amountPerPeriod = BigNumber(rec.amount).dividedBy(BigNumber(deadline).dividedBy(period)).toNumber()
                return {
                    recipient: rec.recipient,
                    amount: getBN(rec.amount, token.decimal),
                    name: "Demo transfer",
                    cliffAmount: new BN(0),
                    amountPerPeriod: getBN(amountPerPeriod, token.decimal)
                }
            })

            const res = await createStreamMultiple({
                recipients,
                tokenId: token.address,
                cliff: getTimeInSeconds() + 120,
                start: getTimeInSeconds() + 60,
                period,
                automaticWithdrawal: true,
                canTopup: false,
                cancelableBySender: true,
                cancelableByRecipient: false,
                transferableBySender: true,
                transferableByRecipient: false,
            })

            toast.success(`${res?.txs.join(", ")} are successfully created!`)
        }
    }

    return {
        onSubmit,
        form,
        creatingStreamStatus
    }
}