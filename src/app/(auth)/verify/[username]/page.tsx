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
        <div className="min-h-screen bg-gray-900 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8 bg-gray-800 p-10 rounded-xl shadow-2xl">
                <div className="text-center">
                    <h1 className="text-4xl font-extrabold text-white mb-2">
                        Verify Your Account
                    </h1>
                    <p className="text-gray-400 mb-8">Enter the verification code sent to your email</p>
                </div>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                        <FormField
                            control={form.control}
                            name="code"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-gray-300">Verification Code</FormLabel>
                                    <FormControl>
                                        <Input
                                            {...field}
                                            className="bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-green-500"
                                        />
                                    </FormControl>
                                    <FormMessage className="text-red-400" />
                                </FormItem>
                            )}
                        />
                        <Button 
                            type="submit" 
                            className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-lg transition duration-300"
                        >
                            Verify
                        </Button>
                    </form>
                </Form>
            </div>
        </div>
    )
}

export default verifyPage