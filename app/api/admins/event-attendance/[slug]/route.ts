import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import { connectDB } from "@/app/lib/db";
import Event from "@/app/model/Events";
import Registration, { StudentRefInt } from "@/app/model/Registrations";
import { requireAdmin } from "@/app/helps/authSessions";
import { AttendanceRequest, ResultIntForStudentAttendance } from "@/app/types/EventTyp";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{slug : string}>}
): Promise<NextResponse> {
  try {
    await connectDB();
    const admin = await requireAdmin();
    if (!admin?.user?.isVerified || admin.user.role !== "admin") {
      return NextResponse.json(
        { message: "Unauthorized User, please login", success: false },
        { status: 400 }
      );
    }

    const { slug } = await params;
    if (!slug || !mongoose.Types.ObjectId.isValid(slug)) {
      return NextResponse.json(
        { message: "A valid event slug is required", success: false },
        { status: 400 }
      );
    }

    const event = await Event.findOne({ _id: slug, adminId: admin.user.id });
    if (!event) {
      return NextResponse.json(
        { message: "Event not found", success: false },
        { status: 404 }
      );
    }

    if (event.adminId.toString() !== admin.user.id) {
      return NextResponse.json(
        { message: "Access Denied. You can only mark attendance for your events.", success: false },
        { status: 403 }
      );
    }

    if (event.status !== "ongoing" && event.status !== "completed") {
      return NextResponse.json(
        { message: "You can mark attendance for ongoing and completed events only", success: false },
        { status: 400 }
      );
    }

    const body: AttendanceRequest = await request.json();
    const { attendanceData } = body;
    if (!Array.isArray(attendanceData) || attendanceData.length === 0) {
      return NextResponse.json(
        { message: "Attendance data must be a non-empty array", success: false },
        { status: 400 }
      );
    }

    const errors: any[] = [];
    const bulkOps: any[] = [];
    const validStudentIds: string[] = [];

    for (const entry of attendanceData) {
      const { studentId, attended } = entry;
      if (!studentId || typeof attended !== "boolean" || !mongoose.Types.ObjectId.isValid(studentId)) {
        errors.push({
          studentId,
          error: "Invalid studentId or attended flag",
        });
        continue;
      }

      validStudentIds.push(studentId);

      bulkOps.push({
        updateOne: {
          filter: { eventId: slug, studentId },
          update: { $set: { attended } },
        },
      });
    }

    let bulkResult = null;
    if (bulkOps.length > 0) {
      bulkResult = await Registration.bulkWrite(bulkOps, { ordered: false });
    }

    let results: ResultIntForStudentAttendance[] = [];
    if (validStudentIds.length > 0) {
      const updatedRegistrations = await Registration.find({
        eventId: slug,
        studentId: { $in: validStudentIds },
      }).populate<{ studentId: StudentRefInt }>("studentId", "name usn email");

      results = updatedRegistrations.map((reg) => ({
        studentId: reg.studentId?._id.toString(),
        studentName: reg.studentId?.name || "Unknown",
        studentUSN: reg.studentId?.usn || "Unknown",
        attended: reg.attended,
        success: true,
        message: `Attendance marked as ${reg.attended ? "present" : "absent"}`,
      }));
    }

    const totalRegistrations = await Registration.countDocuments({ eventId: slug });
    const totalPresent = await Registration.countDocuments({ eventId: slug, attended: true });
    const attendancePercentage =
      totalRegistrations > 0 ? Math.round((totalPresent / totalRegistrations) * 100) : 0;

    return NextResponse.json(
      {
        message: `Attendance marking completed.`,
        summary: {
          totalProcessed: attendanceData.length,
          successCount: bulkResult?.modifiedCount || 0,
          errorCount: errors.length,
          totalRegistrations,
          totalPresent,
          totalAbsent: totalRegistrations - totalPresent,
          attendancePercentage,
        },
        results,
        errors: errors.length > 0 ? errors : undefined,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Mark attendance error:", error);
    if (error instanceof SyntaxError) {
      return NextResponse.json({ error: "Invalid JSON in request body" }, { status: 400 });
    }
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
