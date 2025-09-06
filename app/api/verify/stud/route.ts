import { connectDB } from "@/app/lib/db";
import Student from "@/app/model/Students";
import { NextRequest , NextResponse } from "next/server";
import { verifyCodeValidation } from "@/app/schemas/verify.sch";
import { OTPCodeForStudent } from "@/app/types/UserTyp";

export async function POST(request : NextRequest) {
    try {
        await connectDB();
        const body : OTPCodeForStudent = await request.json();
        const { usn ,verifyCode} = body;
        const decodedStudentUsn = decodeURIComponent(usn);
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
        const student = await Student.findOne({usn : decodedStudentUsn});
        if(!student){
            return NextResponse.json(
                {
                    message : "Student not found",
                    success : false,
                },{status : 400}
            )
        }
        const isValidCode = student.verifyCode === verifyCode;
        const isCodeNotExpired = new Date(student.verifyCodeExpiry) > new Date();

        if(isValidCode && isCodeNotExpired){
            await Student.findByIdAndUpdate(student._id , {
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
        console.error("Error occured verifying the code for Student" , error);
        return NextResponse.json(
            {
                success : false,
                message : "Error verifying user",
            }, {status : 500}
        )
    }
}