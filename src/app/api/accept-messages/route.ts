import dbConnect from "@/lib/dbConnect";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/option";
import { User } from "next-auth"
import { ApiResponse } from "@/helpers/ApiResponse";
import UserModel from "@/model/user.models";

export async function POST(request: Request) {
    dbConnect()

    const session = await getServerSession(authOptions)
    // const 
    const user: User = session?.user as User

    if (!session || !session.user) {
        return Response.json(
            new ApiResponse(401, {}, "NOt authenticated"),
            { status: 401 }
        )
    }
    const userId = user._id
    const { acceptMessages } = await request.json();

    try {

        const updatedUser = await UserModel.findByIdAndUpdate(userId, {
            isAcceptingMessages: acceptMessages
        }, { new: true })

        if (!updatedUser) {
            return Response.json(
                new ApiResponse(401, {}, "User not found failed to update status"),
                { status: 404 }
            )
        }

        return Response.json(
            new ApiResponse(200, updatedUser, "Message acceptance status updated successfully"),
            { status: 200 }
        )

    } catch (error) {
        return Response.json(
            { success: false, message: 'Error updating message acceptance status' },
            { status: 500 }
        );
    }
}

export async function GET(request: Request) {
    dbConnect()
    const session = await getServerSession(authOptions)
    const user = session?.user

    if (!session || !user) {
        return Response.json(
            { success: false, message: 'Not authenticated' },
            { status: 401 }
        );
    }

    const userId = user?._id

    try {
        const resUser = await UserModel.findById(userId)

        if (!resUser) {
            return Response.json(
                new ApiResponse(404, {}, "User not found"),
                { status: 404 }
            )
        }

        return Response.json(
            {
                success: true,
                isAcceptingMessages: resUser.isAcceptingMessages,
            },
            { status: 200 }
        );


    } catch (error) {
        return Response.json(
            { success: false, message: 'Error retrieving message acceptance status' },
            { status: 500 }
        )
    }
}