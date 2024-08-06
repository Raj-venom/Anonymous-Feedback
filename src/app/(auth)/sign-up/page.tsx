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
        <div className="flex justify-center items-center min-h-screen bg-gray-800">
            <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-lg shadow-md">
                <div className="text-center">
                    <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl mb-6">
                        Join True Feedback
                    </h1>
                    <p className="mb-4">Sign up to start your anonymous adventure</p>
                </div>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                        <FormField
                            name="username"
                            control={form.control}
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Username</FormLabel>
                                    <Input
                                        placeholder="username"
                                        {...field}
                                        onChange={e => {
                                            field.onChange(e);
                                            debouncedUsername(e.target.value)
                                        }}

                                    />
                                    {isCheckingUsername && <Loader2 className="animate-spin" />}
                                    {!isCheckingUsername && usernameMessage && (
                                        <p
                                            className={`text-sm ${usernameMessage.includes("Username is unique") ? "text-blue-500" : "text-red-500"}`}
                                        >
                                            {usernameMessage}
                                        </p>
                                    )}
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            name="email"
                            control={form.control}
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Email</FormLabel>
                                    <Input
                                        placeholder="email"
                                        {...field}
                                    />
                                    <p className='text-muted text-gray-400 text-sm'>We will send you a verification code</p>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            name="password"
                            control={form.control}
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Password</FormLabel>
                                    <Input
                                        placeholder="password"
                                        {...field}
                                    />
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <Button type="submit" className="w-full" disabled={isSubmitting}>
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
                <div>
                    <p>
                        Already have an account?{" "}
                        <Link href="/sign-in" className="text-blue-600 hover:text-blue-800">
                            Sign in
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    )

}

export default page
