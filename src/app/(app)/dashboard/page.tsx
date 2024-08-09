"use client"

import MessageCard from '@/components/MessageCard';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/components/ui/use-toast';
import { Message } from '@/model/user.models';
import { AcceptMessageSchema } from '@/schemas/acceptMessageSchema';
import { ApiResponse } from '@/types/ApiResponse';
import { zodResolver } from '@hookform/resolvers/zod';
import axios, { AxiosError } from 'axios';
import { Loader2, RefreshCcw } from 'lucide-react';
import { User } from 'next-auth';
import { useSession } from 'next-auth/react';
import React, { useCallback, useEffect, useState } from 'react'
import { useForm } from 'react-hook-form';

function page() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSwitchLoading, setIsSwitchLoading] = useState(false);

  const { toast } = useToast();

  const handleDeleteMessage = (messageId: string) => {
    // delete message
    setMessages(messages.filter((message) => message._id !== messageId));
  }

  const { data: session } = useSession();

  const form = useForm({
    resolver: zodResolver(AcceptMessageSchema)
  })

  const { watch, setValue, register } = form;
  const acceptMessages = watch('acceptMessages');

  const fetchAcceptMessages = useCallback(async () => {
    setIsSwitchLoading(true);

    try {
      const response = await axios.get<ApiResponse>('/api/accept-messages')
      console.log(response.data.isAcceptingMessages, "value dashboard")
      //  it will initially set when use effect runs
      setValue("acceptMessages", response.data.isAcceptingMessages)

    } catch (error) {
      const axiosError = error as AxiosError<ApiResponse>;
      toast({
        title: 'Error',
        description:
          axiosError.response?.data.message ??
          'Failed to fetch message settings',
        variant: 'destructive',
      });
    } finally {
      setIsSwitchLoading(false);
    }
  }, [setValue, toast]);


  const fetchMessages = useCallback(
    async (refresh: boolean = false) => {
      setIsLoading(true)
      setIsSwitchLoading(true)
      try {
        const response = await axios.get<ApiResponse>('/api/get-messages')
        console.log(response.data.messages, "messages")
        setMessages(response.data.messages || [])

        if (refresh) {
          toast({
            title: 'Success',
            description: 'Messages refreshed',

          });
        }

      } catch (error) {
        const axiosError = error as AxiosError<ApiResponse>;
        toast({
          title: 'Error',
          description:
            axiosError.response?.data.message ?? 'Failed to fetch messages',
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
        setIsSwitchLoading(false);
      }

    }, [setIsLoading, setMessages, toast]);



  useEffect(() => {
    if (!session || !session.user) return;

    fetchMessages();
    fetchAcceptMessages();

  }, [session, setValue, fetchMessages, fetchAcceptMessages, toast])

  const handleSwitchChange = async () => {
    try {
      const response = await axios.post<ApiResponse>('/api/accept-messages', {
        acceptMessages: !acceptMessages
      })

      setValue("acceptMessages", !acceptMessages)
      toast({
        title: response.data.message,
        variant: 'default'
      });

    } catch (error) {
      const axiosError = error as AxiosError<ApiResponse>;
      toast({
        title: 'Error',
        description:
          axiosError.response?.data.message ??
          'Failed to update message settings',
        variant: 'destructive',
      });
    }
  }

  if (!session || !session.user) {
    return <div></div>
  }

  const { username } = session.user as User

  const baseUrl = `${window.location.protocol}//${window.location.host}`
  const profileUrl = `${baseUrl}/u/${username}`

  const copyToClipboard = () => {
    navigator.clipboard.writeText(profileUrl)
    toast({
      title: 'URL Copied',
      description: 'Profile URL copied to clipboard',
    });
  }

  return (
    <div className="min-h-screen bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto bg-gray-800 rounded-xl shadow-xl p-8">
            <h1 className="text-4xl font-bold mb-2 text-white">User Dashboard</h1>

            <div className=" bg-gray-750 py-2 rounded-lg shadow">
                <h2 className="text-2xl font-semibold mb-4 text-green-400">Copy Your Unique Link</h2>
                <div className="flex items-center space-x-4">
                    <input
                        type='text'
                        value={profileUrl}
                        disabled
                        className="flex-grow p-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
                    />
                    <Button onClick={copyToClipboard} className="bg-green-600 hover:bg-green-700 text-white transition duration-300">Copy</Button>
                </div>
            </div>

            <div className=' flex items-center space-x-4 bg-gray-750 py-4  rounded-lg shadow'>
                <Switch
                    {...register('acceptMessages')}
                    checked={acceptMessages}
                    onCheckedChange={handleSwitchChange}
                    disabled={isSwitchLoading}
                />
                <span className="text-lg font-medium text-gray-300">
                    Accept Messages: {acceptMessages ? 'On' : 'Off'}
                </span>
            </div>

            <Separator className="my-4 bg-gray-700" />

            <Button
                className="mb-4 bg-green-600 hover:bg-green-700 text-white transition duration-300"
                variant="outline"
                onClick={(e) => {
                    e.preventDefault();
                    fetchMessages(true);
                }}
            >
                {isLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                    <RefreshCcw className="h-4 w-4" />
                )}
            </Button>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {messages.length > 0 ? (
                    messages.map((message, index) => (
                        <MessageCard
                            key={index}
                            message={message}
                            onMessageDelete={handleDeleteMessage}
                        />
                    ))
                ) : (
                    <p className="text-gray-400 text-center col-span-2">No messages to display.</p>
                )}
            </div>
        </div>
    </div>
);
}

export default page