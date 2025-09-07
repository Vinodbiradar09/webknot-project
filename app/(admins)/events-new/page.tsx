"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import CreateEventForm from "@/components/CreateEventForm";
import { Spinner } from "@/components/LoadingSpinner";

export default function CreateEventPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "unauthenticated") {
      router.replace("/sign-in");
    }
    if (status === "authenticated") {
      const user = session?.user
      if (!user?.isVerified) {
        if (user?.role === "admin") {
          router.replace(`/verifys/adminsv/${user.id}`);
        } else {
          router.replace("/sign-in");
        }
      } else if (user?.role !== "admin") {
        router.replace("/sign-in");
      }
    }
  }, [status, session, router]);

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Spinner />
      </div>
    );
  }

  if (status === "authenticated" && session.user?.role === "admin") {
    return (
      <main className="max-w-3xl mx-auto p-6">
        <h1 className="text-2xl font-semibold mb-4">Create New Event</h1>
        <CreateEventForm />
      </main>
    );
  }


  return null;
}
