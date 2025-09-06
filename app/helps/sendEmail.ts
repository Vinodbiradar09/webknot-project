import { resend } from "../lib/resend";
import { ApiRes } from "../types/ApiRes";
import VerificationEmail from "@/emails/EmailVer";

export const sendVerificationEmail = async( email : string , name : string , verifyCode : string) : Promise<ApiRes>=>{
     
    try {
        const {data , error} = await resend.emails.send({
            from: 'vinod <vinod@skmayya.me>',
            to : email,
            subject : "WEBKNOT | Verification code",
            react : VerificationEmail({name , otp : verifyCode}),
        })
        if(error){
            console.log("ee" , email);
            console.error("failed to send the verification code to email" , error);
            return {message : "Failed to send verification code to your email address" , success : false}
        }
        console.log("email queued successfully" , data);
        return {message : "Successfully verification code sent to your email" , success : true}

    } catch (emailError) {
        console.error("Unexpected error while sending verification email:", emailError);
        return { success: false, message: "Unexpected error while sending verification email" };
    }
}


