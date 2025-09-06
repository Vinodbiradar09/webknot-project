import { z } from "zod";

export const usnValidation = z.string().
length(10 , "USN must be 10 characters only").
regex(/^[A-Za-z0-9]{10}$/ , "Invalid usn please enter you university seat number correctly")


export const signupValidation = z.object({
    name : z.string().min(2 , "Name must be atleast 2 chars").max(20 , "Name cannot exceed more than 20 chars").trim().toLowerCase(),
    email : z.string().email({message : "Invalid email address"}),
    usn : usnValidation,
    branch : z.string(),
    password : z.string().min(6 , {message : "Password must be atleast six chars"}),
})

