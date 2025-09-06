import { z } from "zod";

export const signupValidationAdmin = z.object({
    name : z.string().min(2 , "Name must be atleast 2 chars").max(20 , "Name cannot exceed more than 20 chars").trim().toLowerCase(),
    email : z.string().email({message : "Invalid email address"}),
    password : z.string().min(6 , {message : "Password must be atleast six chars"}),
});


