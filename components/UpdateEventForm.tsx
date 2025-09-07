"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import axios, { AxiosError } from "axios";
import { toast } from "sonner";

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
import { ApiRes } from "@/app/types/ApiRes";

const updateEventSchema = z.object({
  title: z.string().optional(),
  description: z.string().optional(),
  type: z.enum(["hackathon", "fest", "talk"]).optional(),
  startDate: z.date().optional(),
  endDate: z.date().optional(),
  venue: z.string().optional(),
  maxParticipants: z.number().min(1).optional(),
  status: z
    .enum(["upcoming", "ongoing", "completed", "cancelled"])
    .optional(),
});

type UpdateEventSchema = z.infer<typeof updateEventSchema>;

export default function UpdateEventForm({ slug }: { slug: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const form = useForm<UpdateEventSchema>({
    resolver: zodResolver(updateEventSchema),
    defaultValues: {},
  });


  useEffect(() => {
    async function fetchEvent() {
      try {
        const res = await axios.get<ApiRes>(`/api/admins/event-details/${slug}`);
        if (res.data.success && res.data.eventDoc) {
          form.reset({
            title: res.data.eventDoc.title,
            description: res.data.eventDoc.description,
            type: res.data.eventDoc.type,
            startDate: new Date(res.data.eventDoc.startDate),
            endDate: new Date(res.data.eventDoc.endDate),
            venue: res.data.eventDoc.venue,
            maxParticipants: res.data.eventDoc.maxParticipants,
            status: res.data.eventDoc.status,
          });
        }
      } catch (err) {
        toast.error("Failed to fetch event details");
      }
    }
    fetchEvent();
  }, [slug, form]);

  const onSubmit = async (values: UpdateEventSchema) => {
    setLoading(true);
    try {
      const res = await axios.patch<ApiRes>(
        `/api/admins/update-events/${slug}`,
        values
      );
      if (res.data.success) {
        toast.success("Event updated successfully!");
        router.push(`/events-c/${slug}`);
      } else {
        toast.error(res.data.message);
      }
    } catch (err) {
      const error = err as AxiosError<ApiRes>;
      toast.error(error.response?.data.message || "Update failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      onSubmit={form.handleSubmit(onSubmit)}
      className="space-y-6 max-w-2xl mx-auto p-6 bg-white rounded-xl shadow-md"
    >
      <h2 className="text-2xl font-semibold">Update Event</h2>


      <Input placeholder="Event Title" {...form.register("title")} />

  
      <Textarea
        placeholder="Event Description"
        rows={4}
        {...form.register("description")}
      />

  
      <Select
        onValueChange={(val) => form.setValue("type", val as any)}
        defaultValue={form.getValues("type")}
      >
        <SelectTrigger>
          <SelectValue placeholder="Select Type" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="hackathon">Hackathon</SelectItem>
          <SelectItem value="fest">Fest</SelectItem>
          <SelectItem value="talk">Talk</SelectItem>
        </SelectContent>
      </Select>

     
      <Input
        type="date"
        {...form.register("startDate", {
          setValueAs: (val) => (val ? new Date(val) : undefined),
        })}
      />
      <Input
        type="date"
        {...form.register("endDate", {
          setValueAs: (val) => (val ? new Date(val) : undefined),
        })}
      />


      <Input placeholder="Venue" {...form.register("venue")} />

      <Input
        type="number"
        placeholder="Max Participants"
        {...form.register("maxParticipants", {
          setValueAs: (val) => (val ? Number(val) : undefined),
        })}
      />
      <Select
        onValueChange={(val) => form.setValue("status", val as any)}
        defaultValue={form.getValues("status")}
      >
        <SelectTrigger>
          <SelectValue placeholder="Select Status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="upcoming">Upcoming</SelectItem>
          <SelectItem value="ongoing">Ongoing</SelectItem>
          <SelectItem value="completed">Completed</SelectItem>
          <SelectItem value="cancelled">Cancelled</SelectItem>
        </SelectContent>
      </Select>

      <Button type="submit" disabled={loading} className="w-full">
        {loading ? "Updating..." : "Update Event"}
      </Button>
    </form>
  );
}
