"use client"
import { Button } from '@/components/ui/button'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { toast } from '@/components/ui/use-toast'
import { verifySchema } from '@/schemas/verifySchema'
import { ApiResponse } from '@/types/ApiResponse'
import { zodResolver } from '@hookform/resolvers/zod'
import axios, { AxiosError } from 'axios'
import { useParams, useRouter } from 'next/navigation'
import React from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'

function verifyPage() {
    const { username } = useParams()
    const router = useRouter()

    // 1. Define your form.
    const form = useForm<z.infer<typeof verifySchema>>({
        resolver: zodResolver(verifySchema),

    })

    // 2. Define a submit handler.
    const onSubmit = async (data: z.infer<typeof verifySchema>) => {

        try {

            const respone = await axios.post('/api/verify-code', {
                username,
                code: data.code
            })
            toast({
                title: "Verification successful",
                description: respone.data.message ?? "You have successfully verified your account",
            })

            router.replace('/sign-in')

        } catch (error) {
            const axiosError = error as AxiosError<ApiResponse>
            console.error('Error during sign-up:', axiosError.response?.data.message);

            toast({
                title: "Verification failed",
                description: axiosError.response?.data.message ?? "Verification failed",
                variant: "destructive"
            })
        }

    }

    return (
        <div className="flex justify-center items-center min-h-screen bg-gray-100">
            <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-lg shadow-md">
                <div className="text-center">
                    <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl mb-6">
                        Verify Your Account
                    </h1>
                    <p className="mb-4">Enter the verification code sent to your email</p>
                </div>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                        <FormField
                            control={form.control}
                            name="code"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Verifyication Code </FormLabel>
                                    <FormControl>
                                        <Input {...field} />
                                    </FormControl>

                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <Button type="submit">Submit</Button>
                    </form>
                </Form>
            </div>
        </div>
    )
}

export default verifyPage