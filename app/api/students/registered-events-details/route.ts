
import mongoose from "mongoose";
import { connectDB } from "@/app/lib/db";
import { requireStudent } from "@/app/helps/authSessions";
import Registration from "@/app/model/Registrations";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest): Promise<NextResponse> {
    try {
        await connectDB();
        const session = await requireStudent();
        if(!session || !session.user || !session.user.isVerified || session.user.role !=="student"){
            return NextResponse.json(
                {
                    message : "Unauthorized User , Please login",
                    success : false
                },{status : 401}
            )
        }
        const registrations = await Registration.aggregate([
            {
                $match: {
                    studentId: new mongoose.Types.ObjectId(session.user.id)
                }
            },
            {
                $lookup: {
                    from: "events",
                    localField: "eventId",
                    foreignField: "_id",
                    as: "eventDetails",
                    pipeline: [
                        {
                            $lookup: {
                                from: "admins",
                                localField: "adminId",
                                foreignField: "_id",
                                as: "adminDetails",
                                pipeline: [
                                    {
                                        $project: {
                                            name: 1,
                                            email: 1
                                        }
                                    }
                                ]
                            }
                        },
                        {
                            $addFields: {
                                admin: { $arrayElemAt: ["$adminDetails", 0] }
                            }
                        },
                        {
                            $project: {
                                title: 1,
                                description: 1,
                                type: 1,
                                startDate: 1,
                                endDate: 1,
                                venue: 1,
                                maxParticipants: 1,
                                status: 1,
                                admin: 1
                            }
                        }
                    ]
                }
            },
            {
                $addFields: {
                    event: { $arrayElemAt: ["$eventDetails", 0] }
                }
            },
            {
                $addFields: {
                    eventStatus: {
                        $cond: {
                            if: { $eq: ["$event.status", "cancelled"] },
                            then: "cancelled",
                            else: {
                                $cond: {
                                    if: { $eq: ["$event.status", "completed"] },
                                    then: "completed",
                                    else: {
                                        $cond: {
                                            if: { $eq: ["$event.status", "ongoing"] },
                                            then: "ongoing",
                                            else: "upcoming"
                                        }
                                    }
                                }
                            }
                        }
                    },
                    attendanceStatus: {
                        $cond: {
                            if: { $eq: ["$event.status", "upcoming"] },
                            then: "not_marked",
                            else: {
                                $cond: {
                                    if: { $eq: ["$attended", true] },
                                    then: "present",
                                    else: "absent"
                                }
                            }
                        }
                    }
                }
            },
            {
                $project: {
                    _id: 1,
                    eventId: 1,
                    attended: 1,
                    registeredAt: "$createdAt",
                    feedback: 1,
                    event: {
                        id: "$event._id",
                        title: "$event.title",
                        description: "$event.description",
                        type: "$event.type",
                        startDate: "$event.startDate",
                        endDate: "$event.endDate",
                        venue: "$event.venue",
                        maxParticipants: "$event.maxParticipants",
                        status: "$event.status",
                        admin: "$event.admin"
                    },
                    eventStatus: 1,
                    attendanceStatus: 1
                }
            },
            {
                $sort: { registeredAt: -1 } 
            }
        ]);

        const totalRegistrations = registrations.length;
        const completedEvents = registrations.filter(reg => reg.eventStatus === "completed").length;
        const upcomingEvents = registrations.filter(reg => reg.eventStatus === "upcoming").length;
        const cancelledEvents = registrations.filter(reg => reg.eventStatus === "cancelled").length;
        const attendedEvents = registrations.filter(reg => reg.attended === true).length;
        
        const attendanceRate = completedEvents > 0 
            ? Math.round((attendedEvents / completedEvents) * 100) 
            : 0;

        return NextResponse.json({
            message: "Registered events fetched successfully",
            success: true,
            summary: {
                totalRegistrations,
                upcomingEvents,
                completedEvents,
                cancelledEvents,
                attendedEvents,
                attendanceRate
            },
            registrations: registrations.map(reg => ({
                registrationId: reg._id,
                eventId: reg.eventId,
                registeredAt: reg.registeredAt,
                attended: reg.attended,
                attendanceStatus: reg.attendanceStatus, 
                feedback: reg.feedback || null,
                event: {
                    id: reg.event.id,
                    title: reg.event.title,
                    description: reg.event.description,
                    type: reg.event.type,
                    startDate: reg.event.startDate,
                    endDate: reg.event.endDate,
                    venue: reg.event.venue,
                    maxParticipants: reg.event.maxParticipants,
                    status: reg.event.status,
                    eventStatus: reg.eventStatus, 
                    admin: reg.event.admin
                }
            }))
        }, { status: 200 });

    } catch (error) {
        console.error("Error while fetching student registrations:", error)
        return NextResponse.json({
            message: "Error while fetching registered events",
            success: false,
        }, { status: 500 });
    }
}