import { connectDB } from "@/app/lib/db";
import Event from "@/app/model/Events";
import { requireStudent } from "@/app/helps/authSessions";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    await connectDB();

    const student = await requireStudent();
    if (
      !student ||
      !student.user.usn ||
      !student.user.isVerified ||
      student.user.role !== "student"
    ) {
      return NextResponse.json(
        {
          message: "Unauthorized User, please login",
          success: false,
        },
        { status: 401 }
      );
    }

    const allEvents = await Event.find({ status: "upcoming" }).lean();

    if (!allEvents || allEvents.length === 0) {
      return NextResponse.json(
        {
          message: "No upcoming events available",
          success: true,
          browsedEvents: [],
        },
        { status: 200 }
      );
    }

    return NextResponse.json(
      {
        message: "Successfully fetched all upcoming events",
        success: true,
        browsedEvents: allEvents,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error browsing all upcoming events:", error);
    return NextResponse.json(
      {
        message: "Error browsing all upcoming events",
        success: false,
      },
      { status: 500 }
    );
  }
}
