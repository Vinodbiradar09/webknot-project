import Student from "@/app/model/Students";
import { connectDB } from "@/app/lib/db";
import { NextResponse , NextRequest } from "next/server";
import { usnValidation } from "@/app/schemas/student.sch";
import { signupValidation } from "@/app/schemas/student.sch";
import { UserSignupTyp } from "@/app/types/UserTyp";
import { sendVerificationEmail } from "@/app/helps/sendEmail";
export async function  POST(request : NextRequest) {
    try {
        await connectDB();
        const body : UserSignupTyp = await request.json();
        const {name , email , usn , branch , password} = body;
        const usnResult = usnValidation.safeParse(usn);
        if(!usnResult.success){
            const errors = usnResult.error.format().usn._errors || [];
            return NextResponse.json(
                {
                    message : errors.length > 0 ? errors.join(", ") : "Usn Error",
                    success : false,
                },{status : 404}
            )
        }
        const result =  signupValidation.safeParse({name , email , usn , branch , password});
        if(!result.success){
            const formattedErrors = result.error.format();
            const signInErrors = [
                ...(formattedErrors.name?._errors || []),
                ...(formattedErrors.email?._errors || []),
                ...(formattedErrors.usn?._errors || []),
                ...(formattedErrors.branch?._errors || []),
                ...(formattedErrors.password?._errors || []),
            ]
            return NextResponse.json(
                {
                    message : signInErrors.length > 0 ? signInErrors.join(", ") : "Invalid details failed to create account",
                    success : false,
                },{status : 400}
            )
        }
        const checkTheEmailISRegisteredForAdminRole = await Student.findOne({email , isVerified : true});
        if(checkTheEmailISRegisteredForAdminRole){
            return NextResponse.json(
                {
                    message : "The email is already exist for Admin role",
                    success : false,
                },{status : 404}
            )
        }
        const existingVerifiedStudentWithUsn = await Student.findOne({usn , isVerified : true});
        if(existingVerifiedStudentWithUsn){
            console.log("user", existingVerifiedStudentWithUsn);
            return NextResponse.json(
                {
                    message : "Usn is already taken",
                    success : false,
                },{status : 400}
            )
        }

        const verifyCode = Math.floor(100000 + Math.random() * 900000).toString();
        const existingStudentWithEmail = await Student.findOne({email});
        if(existingStudentWithEmail){
            if(existingStudentWithEmail.isVerified){
                return NextResponse.json(
                    {
                        message : "Student already exists with email",
                        success : false,
                    },{status : 400}
                )
            }else {
                existingStudentWithEmail.verifyCode = verifyCode;
                existingStudentWithEmail.verifyCodeExpiry = new Date(Date.now() + 3600000);
                await existingStudentWithEmail.save();
            }
        } else {
            const expiryDate = new Date();
            expiryDate.setHours(expiryDate.getHours() + 1);
            const newStudent = await Student.create({
                name,
                email,
                usn,
                branch,
                password,
                verifyCode,
                verifyCodeExpiry : expiryDate,
                isVerified : false,
            });

            if(!newStudent){
                return NextResponse.json(
                    {
                        message : "Failed to create you account",
                        success : false,
                    },{status : 404}
                )
            }
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
            },{status : 200}
        )
    } catch (error) {
        console.error("Error while creating the student account" , error);
        return NextResponse.json(
            {
                message : "Error while creating a student's account",
                success : false,
            },{status : 500}
        )
    }
}