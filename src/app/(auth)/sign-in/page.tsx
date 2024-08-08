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

    console.log(result, "result")

    if (result?.error) {
      toast({
        title: 'Login Failed',
        description: result.error,
        variant: "destructive"
      })
    }

    if (result?.url) {
      console.log(result.ok, "result.ok")
      router.replace("/dashboard")
    }

  }

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-800">
      <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-lg shadow-md">
        <div className="text-center">
          <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl mb-6">
            Welcome Back to True Feedback
          </h1>
          <p className="mb-4">Sign in to continue your secret conversations</p>
        </div>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">

            <FormField
              name="identifier"
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <Input
                    {...field}
                  />
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

            <Button type="submit" className="w-full" >
              Sign In
            </Button>
          </form>
        </Form>
        <div>
          <p>
            Not a member yet?{' '}
            <Link href="/sign-up" className="text-blue-600 hover:text-blue-800">
              Sign Up
            </Link>
          </p>
        </div>
      </div>
    </div>
  )

}

export default page
