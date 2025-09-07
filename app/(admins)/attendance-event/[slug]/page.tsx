"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm, Controller } from "react-hook-form";
import axios from "axios";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";

interface Student {
  _id: string;
  name: string;
  usn: string;
  email: string;
  attended?: boolean;
}

interface AttendanceFormValues {
  attendanceData: { studentId: string; attended: boolean }[];
}

interface Props {
  slug: string;
}

export default function EventAttendance({ slug }: Props) {
  const router = useRouter();
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const form = useForm<AttendanceFormValues>({
    defaultValues: { attendanceData: [] },
  });


  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const res = await axios.get<{ students: Student[] }>(
          `/api/admins/event-details/${slug}`
        );
        setStudents(res.data.students);

        form.reset({
          attendanceData: res.data.students.map((s) => ({
            studentId: s._id,
            attended: s.attended || false,
          })),
        });
      } catch (err: any) {
        console.error(err);
        toast.error("Failed to fetch students");
      } finally {
        setLoading(false);
      }
    };

    fetchStudents();
  }, [slug]);

  const onSubmit = async (values: AttendanceFormValues) => {
    setSubmitting(true);
    try {
      const res = await axios.put(`/api/admins/event-attendance/${slug}`, values);

      if (res.data.success) {
        toast.success(res.data.message || "Attendance updated successfully");
        router.refresh(); 
      } else {
        toast.error(res.data.message || "Failed to update attendance");
      }
    } catch (err: any) {
      console.error(err);
      toast.error("Server error while updating attendance");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <p>Loading students...</p>;

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {students.map((student, index) => (
          <FormField
            key={student._id}
            control={form.control}
            name={`attendanceData.${index}.attended` as const}
            render={({ field }) => (
              <FormItem className="flex items-center justify-between gap-4">
                <div>
                  <FormLabel>{student.name} ({student.usn})</FormLabel>
                  <FormMessage />
                </div>
                <FormControl>
                  <Checkbox {...field} checked={field.value} />
                </FormControl>
              </FormItem>
            )}
          />
        ))}

        <Button type="submit" disabled={submitting}>
          {submitting ? "Marking..." : "Mark Attendance"}
        </Button>
      </form>
    </Form>
  );
}
