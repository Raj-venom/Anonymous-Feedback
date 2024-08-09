"use client"

import React from 'react'
import { useSession, signOut } from 'next-auth/react'
import { User } from 'next-auth';
import Link from 'next/link';
import { Button } from './ui/button';


function Navbar() {
    const { data: session } = useSession();
    const user: User = session?.user as User;

    return (
        <nav className="bg-gray-800 text-white shadow-lg">
            <div className="container mx-auto px-6 py-4">
                <div className="flex justify-between items-center">
                    <a href="#" className="text-2xl font-bold tracking-tight hover:text-gray-300 transition duration-300">
                        True Feedback
                    </a>
                    <div className="flex items-center space-x-4">
                        {session ? (
                            <>
                                <span className="text-lg font-medium bg-gray-800 px-3 py-1 rounded-full">
                                  Welcome, {user.username || user.email}
                                </span>
                                <Button onClick={() => signOut()} className="bg-red-600 hover:bg-red-700 text-white transition duration-300" variant='default'>
                                    Logout
                                </Button>
                            </>
                        ) : (
                            <Link href="/sign-in">
                                <Button className="bg-green-600 hover:bg-green-700 text-white transition duration-300" variant={'default'}>Login</Button>
                            </Link>
                        )}
                    </div>
                </div>
            </div>
        </nav>
    );
}


export default Navbar