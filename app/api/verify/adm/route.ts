import { connectDB } from "@/app/lib/db";
import Admin from "@/app/model/Admins";
import { NextRequest , NextResponse } from "next/server";
import { verifyCodeValidation } from "@/app/schemas/verify.sch";
import { OTPCodeForAdmin } from "@/app/types/UserTyp";

export async function POST(request : NextRequest) {
    try {
        await connectDB();
        const body : OTPCodeForAdmin = await request.json();
        const { admin_id ,verifyCode} = body;
        const decodedAdmin = decodeURIComponent(admin_id);
        const codeResult = verifyCodeValidation.safeParse({verifyCode});
        if(!codeResult.success){
            const errors = codeResult.error.format().verifyCode?._errors || [];
            return NextResponse.json(
                {
                    message : errors?.length > 0 ? errors?.join(", ") : "Invalid code",
                    success : false,
                },{status : 404}
            )
        }
        const admin = await Admin.findById(decodedAdmin);
        if(!admin){
            return NextResponse.json(
                {
                    message : "Admin not found",
                    success : false,
                },{status : 400}
            )
        }
        const isValidCode = admin.verifyCode === verifyCode;
        const isCodeNotExpired = new Date(admin.verifyCodeExpiry) > new Date();

        if(isValidCode && isCodeNotExpired){
            await Admin.findByIdAndUpdate(admin._id , {
                verifyCode : verifyCode,
                isVerified : true,
            },{new : true , runValidators : true})

            return NextResponse.json(
                {
                    message : "Your account has been verified",
                    success : true
                },{status : 200}
            )
        } else if(!isCodeNotExpired){
            return NextResponse.json(
            {
                success: false,
                message: "Verification code has expired. Please sign up again to get a new code.",
            },
            { status: 400 }
        );
    } else {
        return NextResponse.json(
            {
                success : false,
                message : "Invalid verification code",
            } , {status : 404}
        )
    }

    } catch (error) {
        console.error("Error occured verifying the code" , error);
        return NextResponse.json(
            {
                success : false,
                message : "Error verifying user",
            }, {status : 500}
        )
    }
}