"use client"
import React , {useState} from 'react'
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import axios, { AxiosError } from "axios";
import Link from "next/link";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { ApiRes } from "@/app/types/ApiRes";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import { signupValidationAdmin } from '@/app/schemas/admin.sch';


const SignUpAdmins = () => {
  const router = useRouter();
  const [formSubmitting, setFormSubmitting] = useState<boolean>(false);
  const [formError , setFormError] = useState<string>("");
  const [showPassword, setShowPassword] = useState<boolean>(false);

   const form = useForm<z.infer<typeof signupValidationAdmin>>({
    resolver: zodResolver(signupValidationAdmin),
    defaultValues: {
      name: "",
      email: "",
      password: "",
    },
  });

  const onSubmit = async(data : z.infer<typeof signupValidationAdmin>)=>{
    try {
      setFormSubmitting(true);
      setFormError("");
      const response = await axios.post<ApiRes>("/api/admins/signupadmin" , data);
      if(response.data.success){
         toast("Account created! Please verify via email." , {
          action : {
            label : "Yeah",
            onClick : ()=> console.log("ok"),
          }
        });
        router.push(`/verifys/adminsv/${response.data._adminId}`);
      } else{
        setFormError(response.data.message);
        toast("Failed to create account. Try again." , {
          action : {
            label : "Yeah",
            onClick : ()=> console.log("ok")
          }
        });
      }
    } catch (error) {
      const e = error as AxiosError<ApiRes>;
      toast(e.response?.data.message ?? "Server error. Try later.", {
        action : {
          label : "Yeah",
          onClick : ()=> console.log("ok"),
        }
      });
      setFormError(e.response?.data.message || "Internal server error")
    } finally {
       setFormSubmitting(false);
    }
  }

  return (
   <div>
      <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input placeholder="Name" {...field} />
              </FormControl>
              <FormDescription>
                This is your public display name.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input placeholder="Email" {...field} />
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
                <Input placeholder="Password" type='password' {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit">
          {
            formSubmitting ? "Creating Account" : "Create Account"
          }
        </Button>
      </form>
    </Form>
   </div>
  )
}

export default SignUpAdmins
