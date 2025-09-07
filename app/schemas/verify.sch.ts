import {z} from "zod";
export const verifyCodeValidation = z.object({
    verifyCode : z.string().length(6 , "Verify code must be of six digits"),
});

export const signinValidation = z.object({
    email : z.string().email({message : "Invalid email address"}),
    password : z.string(),
    role : z.enum(["student" ,"admin"])
})