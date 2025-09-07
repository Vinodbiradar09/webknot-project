import { connectDB } from "@/app/lib/db";
import { NextResponse , NextRequest } from "next/server";
import { signupValidationAdmin } from "@/app/schemas/admin.sch";
import { AdminSignupTyp } from "@/app/types/AdminTyp";
import Admin from "@/app/model/Admins";
import { sendVerificationEmail } from "@/app/helps/sendEmail";
export async function  POST(request : NextRequest) : Promise<NextResponse> {
    let user;
    try {
        await connectDB();
        const body : AdminSignupTyp = await request.json();
        const {name , email , password} = body;

        const result =  signupValidationAdmin.safeParse({name , email ,password});
        if(!result.success){
            const formattedErrors = result.error.format();
            const signInErrors = [
                ...(formattedErrors.name?._errors || []),
                ...(formattedErrors.email?._errors || []),
                ...(formattedErrors.password?._errors || []),
            ]
            return NextResponse.json(
                {
                    message : signInErrors.length > 0 ? signInErrors.join(", ") : "Invalid details failed to create account",
                    success : false,
                },{status : 400}
            )
        }

        const verifyCode = Math.floor(100000 + Math.random() * 900000).toString();
        const existingAdminWithEmail = await Admin.findOne({email});
        if(existingAdminWithEmail){
            if(existingAdminWithEmail.isVerified){
                user = await Admin.findOne({email});
                return NextResponse.json(
                    {
                        message : "Admin already exists with email",
                        success : false,
                    },{status : 400}
                )
            }else {
                user = await Admin.findOne({email});
                existingAdminWithEmail.verifyCode = verifyCode;
                existingAdminWithEmail.verifyCodeExpiry = new Date(Date.now() + 3600000);
                await existingAdminWithEmail.save();
            }
        } else {
            const expiryDate = new Date();
            expiryDate.setHours(expiryDate.getHours() + 1);
            const newAdmin = await Admin.create({
                name,
                email,
                password,
                verifyCode,
                verifyCodeExpiry : expiryDate,
                isVerified : false,
            });

            if(!newAdmin){
                return NextResponse.json(
                    {
                        message : "Failed to create you account",
                        success : false,
                    },{status : 404}
                )
            }
            user = newAdmin;
        }
         const emailResponse = await sendVerificationEmail(email , name , verifyCode);
            if(!emailResponse.success){
                return NextResponse.json(
                {
                    message : "Failed to send verification code to your email address",
                    success : false,
                }, {status : 400},
            )
        }
        return NextResponse.json(
            {
                message : "successfully created your account",
                success : true,
                _adminId : user?._id,
            },{status : 200}
        )
    } catch (error) {
        console.error("Error while creating the Admin account" , error);
        return NextResponse.json(
            {
                message : "Error while creating a Admin's account",
                success : false,
            },{status : 500}
        )
    }
}
