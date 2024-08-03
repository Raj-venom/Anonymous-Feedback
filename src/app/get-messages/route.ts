import dbConnect from "@/lib/dbConnect";
import { authOptions } from "../api/auth/[...nextauth]/option";
import { getServerSession } from "next-auth/next";
import { User } from "next-auth";
import { ApiResponse } from "@/helpers/ApiResponse";
import mongoose from "mongoose";
import UserModel from "@/model/user.models";


export async function GET(request: Request) {
    dbConnect()

    const session = await getServerSession(authOptions)
    const user: User = session?.user as User

    if (!session || !session.user) {
        return Response.json(
            new ApiResponse(401, {}, "Not authenticated"),
            { status: 401 }
        )
    }
    const userId = new mongoose.Types.ObjectId(user._id)

    try {
        const user = await UserModel.aggregate([
            {
                $match: {
                    _id: userId
                },
            },
            {
                $unwind: "$messages"
            },
            {
                $sort: { "messages.createdAt": -1 }
            },
            {
                $group: { _id: "$_id", messages: { $push: "$messages" } }
            }
        ])

        if (!user || user.length === 0) {
            return Response.json(
                new ApiResponse(404, {}, 'User not found'),
                { status: 404 }
            )
        }

        return Response.json(
            new ApiResponse(200, { message: user[0].messages }, 'Message fetched sucessfully'),
            { status: 200 }
        )

    } catch (error) {
        console.error('An unexpected error occurred:', error);
        return Response.json(
            { message: 'Internal server error', success: false },
            { status: 500 }
        )
    }
}