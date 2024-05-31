"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import useTokens from "@/hooks/useTokens"
import { TimePeriods, TimeUnits } from "@/lib/consts"
import { useFieldArray } from "react-hook-form"
import { Loader2 } from "lucide-react"
import useClientCreateStreamHook from "./clientHook"



export default function CreateStreamClientPage() {
    const { tokens, tokenListStatus, connected, connecting } = useTokens()
    const { form, onSubmit, creatingStreamStatus } = useClientCreateStreamHook()

    const { fields, append, remove } = useFieldArray({
        control: form.control,
        name: "recipients",
    });


    return <div className="flex items-center justify-center min-h-screen">
        {connecting && <>Connecting...</>}

        {connected && <>
            {tokenListStatus == "loading" && <>Loading...</>}
            {tokenListStatus == "error" && <>Something went wrong. Refresh the page</>}
            {
                tokenListStatus == "idle" &&
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                        <FormField
                            control={form.control}
                            name="token"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Token</FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                        <FormControl>
                                            <SelectTrigger className="w-full">
                                                <SelectValue placeholder="Choose a token" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            {tokens?.map((token) => {
                                                return <SelectItem value={JSON.stringify(token)} key={token.address}>
                                                    <div className="flex space-x-4">
                                                        <img src={token.logoURI} className="size-5" />
                                                        <div>
                                                            {token.name} | Amount: {token.amount}
                                                        </div>
                                                    </div>
                                                </SelectItem>
                                            })}
                                        </SelectContent>
                                    </Select>
                                    <FormDescription>
                                        Choose a token to stream
                                    </FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <div className="grid grid-cols-2 gap-x-2">
                            <FormField
                                control={form.control}
                                name="duration"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Duration</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Duration amount" {...field} type="number" max={9999} value={field.value?.toString() ?? ""} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="durationPeriod"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Duration Period</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <FormControl>
                                                <SelectTrigger className="w-full">
                                                    <SelectValue placeholder="Choose a period" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                {TimeUnits.map(period => <SelectItem key={period.name} value={period.periodInSecs.toString()}>{period.name}</SelectItem>)}
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>
                        <div>
                            <FormField
                                control={form.control}
                                name="unlockSchedule"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Unlock Schedule</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <FormControl>
                                                <SelectTrigger className="w-full">
                                                    <SelectValue placeholder="Choose a period" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                {TimePeriods.map(period => <SelectItem key={period.name} value={period.periodInSecs.toString()}>{period.name}</SelectItem>)}
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>
                        <div className="flex flex-col space-y-4">
                            <FormLabel>Recipients</FormLabel>
                            {fields.map((field, index) => (
                                <div key={field.id} className="grid grid-cols-[1fr,30%,20%] gap-x-2">
                                    <FormField
                                        control={form.control}
                                        name={`recipients.${index}.recipient`}
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormControl>
                                                    <Input placeholder="Recipient address" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name={`recipients.${index}.amount`}
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormControl>
                                                    <Input placeholder="Amount" {...field} value={field.value?.toString() ?? ""} type="number" step={5} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <Button type="button" disabled={fields.length < 2} onClick={() => remove(index)}>Remove</Button>
                                </div>
                            ))}
                            <Button type="button" onClick={() => append({ recipient: "", amount: 0 })}>Add Recipient</Button>
                        </div>
                        <Button type="submit" disabled={creatingStreamStatus == "loading"}>
                            {creatingStreamStatus == "loading" && <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Please wait
                            </>}

                            {creatingStreamStatus == "idle" && <>
                                Submit
                            </>}
                            {creatingStreamStatus == "error" && <>
                                Something went wrong
                            </>}
                        </Button>
                    </form>
                </Form>
            }
        </>}
    </div>
}