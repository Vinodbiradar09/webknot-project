"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm, FormProvider, SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import axios, { AxiosError } from "axios";
import { toast } from "sonner";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

// Zod validation schema
export const createEventSchemaFE = z
  .object({
    title: z.string().min(3).max(100).trim(),
    description: z.string().min(10).max(500).trim(),
    type: z.enum(["hackathon", "fest", "talk"]),
    startDate: z.preprocess(
      (val) => (typeof val === "string" ? new Date(val) : val),
      z
        .date()
        .refine((date) => date > new Date(), { message: "Start date must be in the future" })
    ),
    endDate: z.preprocess(
      (val) => (typeof val === "string" ? new Date(val) : val),
      z.date()
    ),
    venue: z.string().min(3).max(100).trim(),
    maxParticipants: z
      .preprocess(
        (val) => (val === "" ? undefined : Number(val)),
        z.number().min(1).max(1000).optional()
      ),
    status: z.enum(["upcoming", "ongoing", "completed", "cancelled"]),
  })
  .refine((data) => data.endDate > data.startDate, {
    message: "End date must be after start date",
    path: ["endDate"],
  });

type CreateEventFormType = z.infer<typeof createEventSchemaFE>;

export default function CreateEventForm() {
  const router = useRouter();
  const formMethods = useForm<CreateEventFormType>({
    resolver: zodResolver(createEventSchemaFE),
    defaultValues: {
      title: "",
      description: "",
      type: "hackathon",
      startDate: "",
      endDate: "",
      venue: "",
      maxParticipants: undefined,
      status: "upcoming",
    },
  });

  const [submitting, setSubmitting] = useState(false);

  const onSubmit: SubmitHandler<CreateEventFormType> = async (values) => {
    setSubmitting(true);
    try {
      const res = await axios.post("/api/admins/createnewevent", values);
      if (res.data.success) {
        toast.success("Event created successfully");
        const newEventId = res.data?.eventDoc?._id;
        if (newEventId) {
          router.push(`/admin/events/${newEventId}`);
        } else {
          router.push("/admin/dashboard");
        }
      } else {
        toast.error(res.data.message);
      }
    } catch (err) {
      const error = err as AxiosError;
      toast.error(error.response?.data?.message || "Failed to create an event");
    } finally {
      setSubmitting(false);
    }
  };

  // Helper to format dates correctly for datetime-local input
  const toDateTimeLocal = (val: any) => {
    if (!val) return "";
    if (typeof val === "string") return val;
    try {
      const date = new Date(val);
      return date.toISOString().slice(0, 16);
    } catch {
      return "";
    }
  };

  return (
    <FormProvider {...formMethods}>
      <form onSubmit={formMethods.handleSubmit(onSubmit)} className="space-y-6" autoComplete="off">
        <FormField
          control={formMethods.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Title</FormLabel>
              <FormControl>
                <Input placeholder="Event title" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={formMethods.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea placeholder="Event description" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={formMethods.control}
            name="type"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Type</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="hackathon">Hackathon</SelectItem>
                    <SelectItem value="fest">Fest</SelectItem>
                    <SelectItem value="talk">Tech Talk</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={formMethods.control}
            name="venue"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Venue</FormLabel>
                <FormControl>
                  <Input placeholder="Main auditorium" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={formMethods.control}
            name="startDate"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Start Date & Time</FormLabel>
                <FormControl>
                  <Input
                    type="datetime-local"
                    value={toDateTimeLocal(field.value)}
                    onChange={(e) => field.onChange(e.target.value)}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={formMethods.control}
            name="endDate"
            render={({ field }) => (
              <FormItem>
                <FormLabel>End Date & Time</FormLabel>
                <FormControl>
                  <Input
                    type="datetime-local"
                    value={toDateTimeLocal(field.value)}
                    onChange={(e) => field.onChange(e.target.value)}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={formMethods.control}
            name="maxParticipants"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Max Participants</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    placeholder="e.g. 200"
                    value={field.value ?? ""}
                    onChange={(e) => field.onChange(e.target.value === "" ? undefined : Number(e.target.value))}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={formMethods.control}
            name="status"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Status</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="upcoming">Upcoming</SelectItem>
                    <SelectItem value="ongoing">Ongoing</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="flex items-center gap-3">
          <Button type="submit" disabled={submitting}>
            {submitting ? "Creating..." : "Create Event"}
          </Button>
          <Button type="button" variant="outline" onClick={() => router.back()}>
            Cancel
          </Button>
        </div>
      </form>
    </FormProvider>
  );
}
