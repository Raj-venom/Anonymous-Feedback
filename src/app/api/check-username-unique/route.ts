import { usernameValidation } from "@/schemas/signUpSchema";
import { z } from "zod";
import { ApiResponse } from "@/helpers/ApiResponse";
import UserModel from "@/model/user.models";
import dbConnect from "@/lib/dbConnect";


const UsernameQuerySchema = z.object({
    username: usernameValidation
})

export async function GET(request: Request) {
    await dbConnect()
    try {
        const { searchParams } = new URL(request.url)
        const queryParams = {
            username: searchParams.get('username')
        }

        const result = UsernameQuerySchema.safeParse(queryParams)

        if (!result.success) {
            const usernameErrors = result.error.format().username?._errors || []
            return Response.json(
                {
                    success: false,
                    message:
                        usernameErrors?.length > 0
                            ? usernameErrors.join(', ')
                            : 'Invalid query parameters',
                },
                { status: 400 }
            )
        }

        const { username } = result.data

        const existingVerifiedUser = await UserModel.findOne({ username, isVerified: true })

        if (existingVerifiedUser) {
            return Response.json(new ApiResponse(409, {}, "username already taken"), { status: 409 })
        }

        return Response.json(new ApiResponse(200, {}, "username is avilable"), { status: 200 })

    } catch (error) {
        return Response.json(new ApiResponse(500, {}, "Error while checking username"), { status: 500 })
    }
}