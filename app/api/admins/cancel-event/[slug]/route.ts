import { connectDB } from "@/app/lib/db";
import Event from "@/app/model/Events";
import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/app/helps/authSessions";
import mongoose from "mongoose";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{slug : string}>}
): Promise<NextResponse> {
  try {
    await connectDB();

    const admin = await requireAdmin();
    if (!admin || !admin.user || !admin.user.isVerified || admin.user.role !== "admin") {
      return NextResponse.json(
        {
          message: "Unauthorized User, please login",
          success: false,
        },
        { status: 401 } 
      );
    }

    const { slug } = await params;
    if (!slug || !mongoose.Types.ObjectId.isValid(slug)) {
      return NextResponse.json(
        {
          message: "Slug is required to cancel the event and must be a valid id",
          success: false,
        },
        { status: 400 }
      );
    }

    const event = await Event.findOne({
      _id: slug,
      adminId: admin.user.id,
    });

    if (!event) {
      return NextResponse.json(
        {
          message: "Event not found or you don't have permission to access it",
          success: false,
        },
        { status: 404 }
      );
    }

    if (event.status === "completed") {
      return NextResponse.json(
        {
          message: "Event is completed, can't cancel the event",
          success: false,
        },
        { status: 400 }
      );
    }

    const cancelled = await Event.findByIdAndUpdate(
      slug,
      { $set: { status: "cancelled" } },
      { new: true, runValidators: true }
    );

    if (!cancelled) {
      return NextResponse.json(
        {
          message: "Event not found",
          success: false,
        },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        message: "Successfully your event has been cancelled",
        success: true,
      },
      { status: 200 }
    );
  } catch (error) {
    console.log("Error while cancelling the event", error);
    return NextResponse.json(
      {
        message: "Error while cancelling the event",
        success: false,
      },
      { status: 500 }
    );
  }
}
