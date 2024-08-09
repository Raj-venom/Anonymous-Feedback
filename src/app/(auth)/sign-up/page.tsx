"use client"

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react"
import { useForm } from "react-hook-form";
import { useDebounceCallback } from "usehooks-ts"
import { zodResolver } from '@hookform/resolvers/zod';
import { signUpSchema } from "@/schemas/signUpSchema";
import { z } from "zod";
import axios, { AxiosError } from "axios";
import { ApiResponse } from "@/types/ApiResponse";
import { useToast } from "@/components/ui/use-toast"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import Link from "next/link";


function page() {

    const [username, setUsername] = useState("");
    const [usernameMessage, setUsernameMessage] = useState("")
    const [isCheckingUsername, setIsCheckingUsername] = useState(false)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const debouncedUsername = useDebounceCallback(setUsername, 500)

    const router = useRouter()
    const { toast } = useToast()

    // 1. Define your form. // register as (form)
    const form = useForm({
        resolver: zodResolver(signUpSchema),
        defaultValues: {
            username: "",
            email: "",
            password: ""
        }
    })


    useEffect(() => {
        const checkUsernameUnique = async () => {
            setUsernameMessage("")
            
            if (username) {
                setIsCheckingUsername(true)
                try {
                    const respone = await axios.get(`/api/check-username-unique?username=${username}`)

                    if (respone.status === 200) {
                        setUsernameMessage(respone.data.message)
                    } else {
                        setUsernameMessage("Username is not available")
                    }

                } catch (error) {
                    const asxiosError = error as AxiosError<ApiResponse>
                    console.error('Error during username check:', asxiosError.response?.data.message);

                    setUsernameMessage(asxiosError.response?.data.message ?? "Error checking username")
                } finally {
                    setIsCheckingUsername(false)
                }
            }
        }

        checkUsernameUnique()
    }, [username])

    // 2. Define a submit handler.
    const onSubmit = async (data: z.infer<typeof signUpSchema>) => {
        setIsSubmitting(true)
        try {

            const response = await axios.post("/api/sign-up", data)

            if (response.status === 200) {
                toast({
                    title: "Sign-up successful",
                    description: "You have successfully signed up"
                })

                router.replace(`verify/${username}`)
            }


        } catch (error) {
            const axiosError = error as AxiosError<ApiResponse>
            console.error('Error during sign-up:', axiosError.response?.data.message);

            toast({
                title: "Sign-up failed",
                description: axiosError.response?.data.message ?? "Error signing up",
                variant: "destructive"
            })
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <div className="min-h-screen bg-gray-900 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8 bg-gray-800 p-10 rounded-xl shadow-2xl">
                <div className="text-center">
                    <h1 className="text-4xl font-extrabold text-white mb-2">
                        Join True Feedback
                    </h1>
                    <p className="text-gray-400 mb-8">Sign up to start your anonymous adventure</p>
                </div>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                        <FormField
                            name="username"
                            control={form.control}
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-gray-300">Username</FormLabel>
                                    <Input
                                        className="bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-green-500"
                                        placeholder="username"
                                        {...field}
                                        onChange={e => {
                                            field.onChange(e);
                                            debouncedUsername(e.target.value)
                                        }}
                                    />
                                    {isCheckingUsername && <Loader2 className="animate-spin text-green-500" />}
                                    {!isCheckingUsername && usernameMessage && (
                                        <p className={`text-sm ${usernameMessage.includes("Username is unique") ? "text-green-400" : "text-red-400"}`}>
                                            {usernameMessage}
                                        </p>
                                    )}
                                    <FormMessage className="text-red-400" />
                                </FormItem>
                            )}
                        />
    
                        <FormField
                            name="email"
                            control={form.control}
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-gray-300">Email</FormLabel>
                                    <Input
                                        className="bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-green-500"
                                        placeholder="email"
                                        {...field}
                                    />
                                    <p className='text-gray-400 text-sm'>We'll send you a verification code</p>
                                    <FormMessage className="text-red-400" />
                                </FormItem>
                            )}
                        />
    
                        <FormField
                            name="password"
                            control={form.control}
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-gray-300">Password</FormLabel>
                                    <Input
                                        className="bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-green-500"
                                        placeholder="password"
                                        type="password"
                                        {...field}
                                    />
                                    <FormMessage className="text-red-400" />
                                </FormItem>
                            )}
                        />
    
                        <Button type="submit" className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-lg transition duration-300" disabled={isSubmitting}>
                            {isSubmitting ? (
                                <>
                                    <Loader2 className="animate-spin mr-2 h-4 w-4" />
                                    Please wait
                                </>
                            ) : (
                                "Sign up"
                            )}
                        </Button>
                    </form>
                </Form>
                <div className="text-center mt-4">
                    <p className="text-gray-400">
                        Already have an account?{" "}
                        <Link href="/sign-in" className="text-green-400 hover:text-green-300 font-medium">
                            Sign in
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );

}

export default page
