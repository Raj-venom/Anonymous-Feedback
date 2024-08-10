import dbConnect from "@/lib/dbConnect";
import { sendVerificationEmail } from "@/helpers/sendVerificationEmail";
import UserModel from "@/model/user.models";
import bcrypt from "bcryptjs"


export async function POST(request: Request) {
    await dbConnect()
    try {
        // get data from frontend
        // validtate data

        // check if user exisit in db - do this for both email and username
        // if not exit create new user

        // if user exit but not verifyed - update field
        // if user verifyed return false

        // send email and return res

        const { email, password, username } = await request.json()

        if (!email || !password || !username) {
            return Response.json({ message: "All field required ", sucess: false }, { status: 400 })
        }

        const existingVerifiedUserByUsername = await UserModel.findOne({ username, isVerified: true })

        if (existingVerifiedUserByUsername) {
            return Response.json({ message: "Username is already taken ", sucess: false }, { status: 400 })
        }

        const existingVerifiedUserByEmail = await UserModel.findOne({ email, isVerified: true })

        if (existingVerifiedUserByEmail) {
            return Response.json({ message: "User already exists with this email", sucess: false }, { status: 400 })
        }

        const hashPassword = await bcrypt.hash(password, 10)

        const verifyCode = Math.floor(100000 + Math.random() * 900000).toString();
        const verifyCodeExpiry = new Date(Date.now() + 3600000)

        const user = await UserModel.findOneAndUpdate(
            {
                email
            },
            {
                email,
                password:hashPassword,
                username,
                verifyCode,
                verifyCodeExpiry
            },
            {
                upsert: true,
                new: true
            })

        if (!user) {
            return Response.json({ message: "User Registation failed", sucess: false }, { status: 500 })
        }

        const emailResponse = await sendVerificationEmail(email, username, verifyCode)

        if (!emailResponse.success) {
            // console.log("not email")
            return Response.json({ message: emailResponse.message, sucess: false }, { status: 400 })
        }
        // console.log("email",emailResponse.success)

        return Response.json({ message: "User Register sucessfully. Please verify your account", sucess: true }, { status: 200 })


    } catch (error) {
        return Response.json({ message: "User Registation failed", sucess: false }, { status: 500 })
    }
}