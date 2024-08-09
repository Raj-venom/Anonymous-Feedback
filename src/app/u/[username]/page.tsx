"use client"
import axios, { AxiosError } from 'axios'
import { useParams } from 'next/navigation'
import React, { useState } from 'react'
import { messageSchema } from '@/schemas/messageSchema'
import { z } from 'zod'
import { ApiResponse } from '@/types/ApiResponse'
import { toast } from '@/components/ui/use-toast'
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Button } from '@/components/ui/button'
import { Loader2 } from 'lucide-react'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import Link from 'next/link'
import { Textarea } from '@/components/ui/textarea'

function page() {
    const params = useParams<{ username: string }>()
    const { username } = params
    const [isLoading, setIsLoading] = useState(false);
    const [suggestedMessages, setSuggestedMessages] = useState<string[]>(["What's your favorite movie?", 'Do you have any pets?', "What's your dream job?"])

    // 1. Define your form.
    const form = useForm<z.infer<typeof messageSchema>>({
        resolver: zodResolver(messageSchema),
        defaultValues: {
            content: "",
        },
    })
    const messageContent = form.watch('content')

    // 2. Define a submit handler.
    const onSubmit = async (data: z.infer<typeof messageSchema>) => {
        setIsLoading(true)
        try {
            const response = await axios.post(`/api/send-message`, { username, content: data.content })
            toast({
                title: "Message sent",
                description: response.data.message,
            })
            // form.reset({ ...form.getValues(), content: '' });
            form.reset()

        } catch (error) {
            const axiosError = error as AxiosError<ApiResponse>
            toast({
                title: "Error",
                description: axiosError.response?.data.message ?? "Error sending message",
                variant: "destructive"
            })
        } finally {
            setIsLoading(false)
        }
    }

    const fetchSuggestedMessages = async () => {
        const questions = [
            "What's your favorite book?",
            "If you could travel anywhere in the world, where would you go?",
            "Do you have any hidden talents?",
            "What's the most interesting place you've ever visited?",
            "What's your favorite way to relax after a long day?",
            "What's your favorite childhood memory?",
            "If you could have any superpower, what would it be?",
            "What's the best advice you've ever received?",
            "What's your favorite holiday and why?",
            "What's the most unusual food you've ever tried?",
            "If you could meet any historical figure, who would it be?",
            "What's your favorite type of music?",
            "Do you prefer the mountains or the beach?",
            "What's your favorite way to spend a weekend?",
            "If you could live in any era of history, when would it be?",
            "What's the last movie you saw that you really enjoyed?",
            "Do you have any hobbies or interests outside of work?",
            "What's something you've always wanted to learn?",
            "What's your favorite family tradition?",
            "If you could have dinner with any celebrity, who would it be?",
            "What's the most daring thing you've ever done?",
            "What's your favorite season of the year?",
            "What's your favorite thing about your hometown?",
            "If you could master any skill instantly, what would it be?",
            "Do you prefer books or movies?",
            "What's your favorite way to stay active?",
            "What's the best concert you've ever been to?",
            "Do you have a favorite board game?",
            "What's your favorite type of cuisine?",
            "What's your go-to karaoke song?",
            "If you could be any animal for a day, what would you be?",
            "What's your favorite quote or saying?",
            "Do you have any nicknames?",
            "What's your favorite dessert?",
            "What's one thing you'd like to accomplish this year?",
            "What's the best gift you've ever received?",
            "If you could time travel, would you go to the past or the future?",
            "What's your favorite outdoor activity?",
            "Do you have a favorite sports team?",
            "What's the last book you read?",
            "What's your favorite thing to cook or bake?",
            "Do you prefer early mornings or late nights?",
            "What's your favorite ice cream flavor?",
            "What's the most interesting job you've ever had?",
            "If you could switch lives with anyone for a day, who would it be?",
            "What's your favorite way to celebrate your birthday?",
            "Do you prefer cats or dogs?",
            "What's one thing you can't live without?",
            "If you could have any job for a day, what would it be?",
            "What's your favorite TV show?",
            "Do you prefer sweet or savory snacks?",
            "What's the most spontaneous thing you've ever done?",
            "What's your favorite color?",
            "Do you have a favorite superhero?",
            "What's your favorite way to unwind?",
            "If you could live anywhere, where would it be?",
            "What's your favorite thing to do with friends?",
            "What's the most meaningful gift you've ever given?",
            "Do you prefer movies or TV series?",
            "What's your favorite flower?",
            "What's your favorite thing about your job?",
            "Do you have a favorite app on your phone?",
            "What's the best meal you've ever had?",
            "If you could be famous for one thing, what would it be?",
            "What's your favorite place to shop?",
            "What's your favorite animal?",
            "Do you have a favorite workout routine?",
            "What's your favorite way to spend a rainy day?",
            "What's the most memorable trip you've ever taken?",
            "Do you prefer coffee or tea?",
            "What's your favorite song to listen to when you're happy?",
            "If you could have any car, what would it be?",
            "What's your favorite way to stay motivated?",
            "What's the last thing you bought online?",
            "Do you have a favorite type of art?",
            "What's your favorite kind of weather?",
            "What's your favorite thing to do in your free time?",
            "If you could invent something, what would it be?",
            "What's your favorite thing to do in the summer?",
            "Do you have a favorite restaurant?",
            "What's the best compliment you've ever received?",
            "What's your favorite subject in school?",
            "If you could relive any day of your life, what would it be?",
            "What's your favorite way to spend time with family?",
            "Do you prefer city life or country life?",
            "What's your favorite way to express creativity?",
            "If you could have a personal chef, what would you ask them to make?",
            "What's your favorite way to give back to the community?",
            "Do you have a favorite kind of exercise?",
            "What's the most valuable lesson you've learned?",
            "What's your favorite book genre?",
            "Do you have a favorite holiday destination?",
            "What's your favorite thing about weekends?",
            "What's the last song you had stuck in your head?",
            "What's your favorite way to show appreciation to others?",
            "If you could be any fictional character, who would you be?",
            "What's your favorite way to start your day?",
            "Do you have a favorite mode of transportation?",
            "What's the most interesting skill you've learned?",
            "What's your favorite thing about yourself?"
        ];

        const suggestedMessages = [] as string[];

        for (let i = 0; i < 3; i++) {
            const chooseQuestion = Math.floor(Math.random() * questions.length);
            const message = questions[chooseQuestion];
            suggestedMessages.push(message);
        }

        setSuggestedMessages(suggestedMessages)
    }

    const handleMessageClick = (message: string) => {
        form.setValue('content', message)
    }

    return (
        <div className="min-h-screen bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto bg-gray-800 rounded-xl shadow-2xl p-8">
                <h1 className="text-4xl font-bold mb-6 text-center text-white">
                    Public Profile Link
                </h1>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                        <FormField
                            control={form.control}
                            name="content"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-gray-300">Send Anonymous Message to @{username}</FormLabel>
                                    <FormControl>
                                        <Textarea
                                            placeholder="Write your anonymous message here"
                                            className="resize-none bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-green-500"
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage className="text-red-400" />
                                </FormItem>
                            )}
                        />
                        <div className="flex justify-center">
                            {isLoading ? (
                                <Button
                                    type="submit"
                                    disabled
                                    className="bg-gray-600 text-white"
                                >
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Please wait
                                </Button>
                            ) : (
                                <Button
                                    type='submit'
                                    disabled={!messageContent}
                                    className="bg-green-600 hover:bg-green-700 text-white transition duration-300"
                                >Send It</Button>
                            )}
                        </div>
                    </form>
                </Form>
                <div className="space-y-4 my-8">
                    <div className="space-y-2">
                        <Button
                            onClick={fetchSuggestedMessages}
                            className="my-4 bg-green-600 hover:bg-green-700 text-white transition duration-300"
                        >
                            Suggest Messages
                        </Button>
                        <p className="text-gray-300">Click on any message below to select it.</p>
                    </div>
    
                    <Card className="bg-gray-750 border-gray-700">
                        <CardHeader>
                            <h3 className="text-xl font-semibold text-white">Messages</h3>
                        </CardHeader>
                        <CardContent className="flex flex-col space-y-4">
                            {suggestedMessages.map((message, index) => (
                                <Button
                                    key={index}
                                    variant="outline"
                                    className='my-2 bg-gray-700 text-white hover:bg-gray-600 border-gray-600'
                                    onClick={() => handleMessageClick(message)}
                                >
                                    {message}
                                </Button>
                            ))}
                        </CardContent>
                    </Card>
                </div>
                <Separator className="my-6 bg-gray-700" />
                <div className="text-center">
                    <div className="mb-4 text-gray-300">Get Your Message Board</div>
                    <Link href={'/sign-up'}>
                        <Button className="bg-green-600 hover:bg-green-700 text-white transition duration-300">Create Your Account</Button>
                    </Link>
                </div>
            </div>
        </div>
    )
}

export default page