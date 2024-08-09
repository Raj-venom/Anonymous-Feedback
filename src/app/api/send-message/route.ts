import dbConnect from "@/lib/dbConnect";
import { ApiResponse } from "@/helpers/ApiResponse";
import UserModel, { Message } from "@/model/user.models";


export async function POST(request: Request) {
    await dbConnect()
    const { username, content } = await request.json();
    console.log('username:', username)

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
                { message: 'User not found', success: false },
                { status: 404 }
            )
        }

        if (!user.isAcceptingMessages) {
            return Response.json(
                { message: 'User is not accepting messages', success: false },
                { status: 400 }
            )
        }


        const newMessge = { content, createdAt: new Date() }

        user.messages.push(newMessge as Message)
        const savedUser = await user.save()

        if (!savedUser) {
            return Response.json(
                { message: 'Failed to send user message', success: true },
                { status: 500 }
            )
        }

        return Response.json(
            { message: 'Message sent successfully', success: true },
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