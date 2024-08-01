import { ApiResponse } from "@/helpers/ApiResponse";
import dbConnect from "@/lib/dbConnect";
import UserModel from "@/model/user.models";

export async function POST(request: Request) {
    dbConnect()
    try {

        const { username, code } = await request.json()

        // const decodedUsername = decodeURIComponent(username); // handling url encoding error

        const user = await UserModel.findOne({ username })

        if (!user) {
            return Response.json(new ApiResponse(400, {}, "User not found"), { status: 400 })
        }

        if (user.isVerified) {
            return Response.json(new ApiResponse(409, {}, "Username already taken"), { status: 409 })
        }

        const isValidCode = user.verifyCode === code
        const isCodeNotExpired = new Date(user.verifyCodeExpiry) > new Date()

        if (isValidCode && isCodeNotExpired) {
            user.isVerified = true
            await user.save()
            user.password = ""
            return Response.json(new ApiResponse(200, user, "User verified sucessfully"))
        } else if (!isValidCode) {
            return Response.json(new ApiResponse(400, {}, "Invalid verification Code"), { status: 400 })
        } else {
            return Response.json(new ApiResponse(400, {}, "Verification code has expired. Please sign up again to get a new code."), { status: 400 })
        }



    } catch (error) {
        return Response.json(new ApiResponse(500, {}, "Error while Verifying user failed "), { status: 500 })
    }
}