"use client"
import React, { useState } from 'react'
import { signinValidation } from '@/app/schemas/verify.sch'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import z from 'zod'
import { signIn } from 'next-auth/react'
import { toast } from 'sonner'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

const SignInForm = () => {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState<boolean>(false);

    const form = useForm<z.infer<typeof signinValidation>>({
        resolver: zodResolver(signinValidation),
        defaultValues: {
            email: "",
            password: "",
            role: undefined, 
        }
    });

    const onSubmit = async (data: z.infer<typeof signinValidation>) => {
        setIsLoading(true);
        
        try {
            const result = await signIn("credentials", {
                redirect: false,
                email: data.email,
                password: data.password,
                role: data.role,
            });

            if (result?.error) {
                toast.error("Login failed", {
                    description: "Invalid credentials. Please check your email and password."
                });
                setIsLoading(false);
                return;
            }

            if (result?.ok) {
                toast("Successfully Signed In", {
                    description: "Redirecting you to the dashboard...",
                    action : {
                        label : "Yeah",
                        onClick : ()=> console.log("ok"),
                    }
                });
                
                if (data.role === "admin") {
                    router.push("/admdashboard");
                } else if (data.role === "student") {
                    router.push("/dashboard"); 
                } else {
                    router.push("/");
                }
            }
        } catch (error) {
            console.error("Sign in error:", error);
            toast.error("An error occurred during sign in");
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <div>
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                    <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Email</FormLabel>
                                <FormControl>
                                    <Input 
                                        placeholder="Enter your email" 
                                        type="email"
                                        {...field} 
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    
                    <FormField
                        control={form.control}
                        name="password"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Password</FormLabel>
                                <FormControl>
                                    <Input 
                                        placeholder="Enter your password" 
                                        type="password" 
                                        {...field} 
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    
                    <FormField
                        control={form.control}
                        name="role"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>I am a</FormLabel>
                                <FormControl>
                                    <Select onValueChange={field.onChange} value={field.value}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select your role" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="student">Student</SelectItem>
                                            <SelectItem value="admin">Admin</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    
                    <Button type="submit" disabled={isLoading} className="w-full">
                        {isLoading ? "Signing in..." : "Sign In"}
                    </Button>
                </form>
            </Form>
        </div>
    )
}

export default SignInForm