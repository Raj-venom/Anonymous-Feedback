"use client"

import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from "zod";
import { useToast } from "@/components/ui/use-toast"
import { Form, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { signInSchema } from "@/schemas/signInSchema";
import { signIn } from "next-auth/react";


function page() {


  const router = useRouter()
  const { toast } = useToast()

  // 1. Define your form. // register as (form)
  const form = useForm({
    resolver: zodResolver(signInSchema),
    defaultValues: {
      identifier: "",
      password: ""
    }
  })


  // 2. Define a submit handler.
  const onSubmit = async (data: z.infer<typeof signInSchema>) => {


    const result = await signIn("credentials", {
      redirect: false,
      identifier: data.identifier,
      password: data.password
    })

    // console.log(result, "result")

    if (result?.error) {
      toast({
        title: 'Login Failed',
        description: result.error,
        variant: "destructive"
      })
    }

    if (result?.url) {
    //   console.log(result.ok, "result.ok")
      router.replace("/dashboard")
    }

  }

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8 bg-gray-800 p-10 rounded-xl shadow-2xl">
            <div className="text-center">
                <h1 className="text-4xl font-extrabold text-white mb-2">
                    Welcome Back to True Feedback
                </h1>
                <p className="text-gray-400 mb-8">Sign in to continue your secret conversations</p>
            </div>
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    <FormField
                        name="identifier"
                        control={form.control}
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel className="text-gray-300">Email</FormLabel>
                                <Input
                                    className="bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-green-500"
                                    {...field}
                                />
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
                                    type="password"
                                    placeholder="password"
                                    {...field}
                                />
                                <FormMessage className="text-red-400" />
                            </FormItem>
                        )}
                    />

                    <Button type="submit" className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-lg transition duration-300">
                        Sign In
                    </Button>
                </form>
            </Form>
            <div className="text-center mt-4">
                <p className="text-gray-400">
                    Not a member yet?{' '}
                    <Link href="/sign-up" className="text-green-400 hover:text-green-300 font-medium">
                        Sign Up
                    </Link>
                </p>
            </div>
        </div>
    </div>
);

}

export default page
