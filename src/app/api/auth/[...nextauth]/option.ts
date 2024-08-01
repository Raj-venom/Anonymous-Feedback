import CredentialsProvider from "next-auth/providers/credentials";
import { NextAuthOptions } from "next-auth";
import dbConnect from "@/lib/dbConnect";
import UserModel from "@/model/user.models";
import bcrypt from 'bcryptjs'



export const authOptions: NextAuthOptions = {
    providers: [
        CredentialsProvider({
            // The name to display on the sign in form (e.g. "Sign in with...")
            id: "Credentials",
            name: "Credentials",

            // `credentials` is used to generate a form on the sign in page.
            credentials: {
                email: { label: 'Email', type: 'text' },
                password: { label: 'Password', type: 'password' },
            },

            async authorize(credentials: any): Promise<any> {
                dbConnect()
                // Add logic here to look up the user from the credentials supplied
                try {
                    const user = await UserModel.findOne({
                        $or: [
                            { email: credentials.identifier }, // => credentials.identifier.email 
                            { username: credentials.identifier }, // => credentials.identifier.username 
                        ]
                    })

                    if (!user) {
                        throw new Error('Invalid user identifier');
                    }

                    if (!user.isVerified) {
                        throw new Error('Please verify your account before logging in');
                    }

                    const isPasswordCorrect = await bcrypt.compare(credentials.password, user.password)

                    if (!isPasswordCorrect) {
                        throw new Error('Invalid Crediancial');
                    }
                    return user

                } catch (error: any) {
                    throw new Error(error);
                }
            }
        })
    ],

    callbacks: {
        async jwt({ token, user }) {

            if (user) {
                token._id = user._id?.toString();
                token.isVerified = user.isVerified;
                token.isAcceptingMessages = user.isAcceptingMessages;
                token.username = user.username;
            }

            return token
        },
        async session({ session, token }) {
            if (token) {
                session.user._id = token._id;
                session.user.isVerified = token.isVerified;
                session.user.isAcceptingMessages = token.isAcceptingMessages;
                session.user.username = token.username;
            }
            return session
        },
    },

    session: {
        strategy: 'jwt'
    },

    secret: process.env.NEXTAUTH_SECRET,
    pages: {
        signIn: '/sign-in'
    }

}