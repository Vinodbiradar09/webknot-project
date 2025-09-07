"use client"
import React, { useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { ApiRes } from '@/app/types/ApiRes'
import { verifyCodeValidation } from '@/app/schemas/verify.sch'
import * as z from 'zod'
import axios, { AxiosError } from 'axios'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { motion } from "framer-motion"

const VerifyAccount = () => {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const form = useForm<z.infer<typeof verifyCodeValidation>>({
    resolver: zodResolver(verifyCodeValidation),
    defaultValues: { verifyCode: "" }
  });

  const onSubmit = async (data: z.infer<typeof verifyCodeValidation>) => {
    setIsLoading(true);
    try {
      const res = await axios.post<ApiRes>("/api/verify/adm", {
        admin_id: params.id,
        verifyCode: data.verifyCode,
      });
      if (res.data.success === true) {
        toast("Verification successful", {
          action: { label: "Yeah", onClick: () => console.log("Undo happened") }
        });
      } else {
        toast(res.data.message);
      }
      router.replace("/sign-in");
    } catch (error) {
      const axiosError = error as AxiosError<ApiRes>;
      toast(
        axiosError.response?.data.message ??
        "An error occurred. Please try again.",
        {
          description : "Try Again , After Sometime",
          action : { label: "Yeah", onClick : ()=> console.log("Undo happened") }
        }
      );
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="relative min-h-screen flex items-center justify-center bg-black px-4">
    
      <motion.div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
        <motion.div
          className="absolute top-0 left-[-50%] w-[200%] h-full bg-gradient-to-tr from-transparent via-white/10 to-transparent"
          animate={{ x: ["-50%", "30%", "120%"] }}
          transition={{
            duration: 8,
            repeat: Infinity,
            repeatType: "reverse",
            ease: "easeInOut",
          }}
        />
      </motion.div>

    
      <motion.div
        initial={{ opacity: 0, y: 40, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="relative z-10 w-full max-w-md p-10 rounded-3xl
                   bg-black bg-opacity-80 border border-gray-700
                   shadow-[0_0_30px_5px_rgba(255,255,255,0.1)] backdrop-blur-xl"
      >
    
        <div className="text-center mb-10">
          <motion.h1
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.7 }}
            className="text-3xl sm:text-4xl font-extrabold text-transparent bg-clip-text
                       bg-gradient-to-r from-gray-200 via-white to-gray-400"
          >
            Verify Your EventsMan Account
          </motion.h1>

          <motion.div
            initial={{ scaleX: 0, opacity: 0 }}
            animate={{ scaleX: [0, 1.05, 1], opacity: [0, 1, 1] }}
            transition={{
              duration: 2,
              repeat: Infinity,
              repeatDelay: 6,
              ease: "easeInOut",
            }}
            className="h-[2px] mt-2 rounded-full bg-gradient-to-r from-gray-200 via-white to-gray-400 mx-auto w-1/2 origin-left"
          />
        </div>

      
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              name="verifyCode"
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-gray-300 font-semibold">Verification Code</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Enter verification code"
                      className="bg-black bg-opacity-50 border border-gray-700 text-white 
                                 placeholder-gray-400 rounded-md px-4 py-3 
                                 focus:ring-2 focus:ring-gray-400 transition"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage className="text-red-500 text-sm" />
                </FormItem>
              )}
            />

            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 rounded-md bg-[#111111] border border-gray-700
                           text-white text-lg font-semibold shadow-md
                           hover:shadow-[0_0_15px_rgba(255,255,255,0.25)]
                           transition disabled:opacity-50"
              >
                {isLoading ? "Verifying Code..." : "Verify"}
              </Button>
            </motion.div>
          </form>
        </Form>
      </motion.div>
    </div>
  )
}

export default VerifyAccount