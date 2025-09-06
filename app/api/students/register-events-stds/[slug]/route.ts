import { connectDB } from "@/app/lib/db";
import Registration from "@/app/model/Registrations";
import Event from "@/app/model/Events";
import { requireStudent } from "@/app/helps/authSessions";
import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";

export async function POST(
  request: NextRequest,
  { params }: { params : Promise<{slug : string}>} 
) {
  try {
    await connectDB();

    const student = await requireStudent();
    if (
      !student ||
      !student.user ||
      !student.user.isVerified ||
      student.user.role !== "student"
    ) {
      return NextResponse.json(
        {
          message: "Unauthorized User, Please login",
          success: false,
        },
        { status: 401 }
      );
    }

    const { slug } = await params;
    if (!slug || !mongoose.Types.ObjectId.isValid(slug)) {
      return NextResponse.json(
        {
          message: "A valid event slug is required to register",
          success: false,
        },
        { status: 400 }
      );
    }

    const event = await Event.findOne({
      _id: slug,
      status: "upcoming",
    });
    if (!event) {
      return NextResponse.json(
        {
          message: "Event not found or not open for registration",
          success: false,
        },
        { status: 404 }
      );
    }

    const registeredEvent = await Registration.findOne({
      eventId: slug,
      studentId: student.user.id,
    });

    if (registeredEvent) {
      return NextResponse.json(
        {
          message: "You have already registered for this event",
          success: false,
        },
        { status: 409 }
      );
    }

    const registerNow = await Registration.create({
      eventId: slug,
      studentId: student.user.id,
    });

    if (!registerNow) {
      return NextResponse.json(
        {
          message: "Failed to register for the event",
          success: false,
        },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        message: "Successfully registered for the event",
        success: true,
        registration: registerNow,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error while registering the event", error);
    return NextResponse.json(
      {
        message: "Error registering the event, please try again",
        success: false,
      },
      { status: 500 }
    );
  }
}
