import dbConnect from "@/lib/dbConnect";
import { ApiResponse } from "@/helpers/ApiResponse";
import UserModel, { Message } from "@/model/user.models";


export async function POST(request: Request) {
    await dbConnect()
    const { username, content } = await request.json();

    if (!username || !content) {
        return Response.json(
            new ApiResponse(400, {}, "All field required"),
            { status: 400 }
        )
    }

    try {
        const user = await UserModel.findOne({ username })

        if (!user) {
            return Response.json(
                new ApiResponse(404, {}, "User not found"),
                { status: 404 }
            )
        }

        if (!user.isAcceptingMessages) {
            return Response.json(
                new ApiResponse(400, {}, "User is not accepting messages"),
                { status: 400 }
            )
        }


        const newMessge = { content, createdAt: new Date() }

        user.messages.push(newMessge as Message)
        const savedUser = await user.save()

        if (!savedUser) {
            return Response.json(
                new ApiResponse(500, {}, "Failed to send user message"),
                { status: 500 }
            )
        }

        return Response.json(
            new ApiResponse(200, {}, "Message send sucessfully"),
            { status: 200 }
        )


    } catch (error) {
        console.error('Error adding message:', error);
        return Response.json(
            { message: 'Internal server error', success: false },
            { status: 500 }
        );
    }
}