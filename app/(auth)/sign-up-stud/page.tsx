"use client"
import React , {useState , useEffect} from 'react'
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
import { useDebounceCallback } from "usehooks-ts";
import { signupValidation } from '@/app/schemas/student.sch'

const SignUpStudents = () => {
  const router = useRouter();
  const [usn, setUsn] = useState("");
  const [usnMessage, setUsnMessage] = useState("");
  const [usnChecking, setUsnChecking] = useState(false);
  const [formSubmitting, setFormSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const debounced = useDebounceCallback(setUsn, 500);
   const form = useForm<z.infer<typeof signupValidation>>({
    resolver: zodResolver(signupValidation),
    defaultValues: {
      name: "",
      email: "",
      usn: "",
      branch: "",
      password: "",
    },
  });
   useEffect(() => {
    if (!usn) {
      setUsnMessage("");
      return;
    }

    const checkUnique = async () => {
      setUsnChecking(true);
      try {
        const res = await axios.get<ApiRes>(`/api/students/usn-check?usn=${usn}`);
        setUsnMessage(res.data.message);
      } catch (error) {
        const e = error as AxiosError<ApiRes>;
        setUsnMessage(e.response?.data.message ?? "Error checking USN");
      } finally {
        setUsnChecking(false);
      }
    };

    checkUnique();
  }, [usn]);

   const onSubmit = async (data: z.infer<typeof signupValidation>) => {
    setFormSubmitting(true);
    try {
      const res = await axios.post<ApiRes>("/api/students/signupstudent", data);
      if (res.data.success) {
        toast("Account created! Please verify via email." , {
          action : {
            label : "Yeah",
            onClick : ()=> console.log("ok"),
          }
        });
        router.push(`/verifys/${data.usn}`);
      } else {
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
    } finally {
      setFormSubmitting(false);
    }
  };

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
          name="usn"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Usn</FormLabel>
              <FormControl>
                <Input placeholder="Usn" id="username"
              type="text" {...field} autoComplete="off" onChange={(e)=> { field.onChange(e); debounced(e.target.value)}}/>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
         <FormField
          control={form.control}
          name="branch"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Branch</FormLabel>
              <FormControl>
                <Input placeholder="Branch" {...field} />
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

export default SignUpStudents
