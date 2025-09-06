import { connectDB } from "@/app/lib/db";
import Event from "@/app/model/Events";
import { requireAdmin } from "@/app/helps/authSessions";
import { NextRequest , NextResponse } from "next/server";
import mongoose from "mongoose";

export async function GET(request : NextRequest , {params} : {params : Promise<{slug : string}>}) : Promise<NextResponse> {
    try {
        await connectDB();
        const admin = await requireAdmin();
        if(!admin || !admin.user || !admin.user.id || !admin.user.isVerified || admin.user.role !== "admin"){
            return NextResponse.json(
                {
                    message : "Unauthorized Access , please login",
                    success : false,
                },{status : 401}
            )
        }
        const {slug} = await params;
        if(!slug){
            return NextResponse.json(
                {
                    message : "Slug is required to get the details of the event",
                    success : false,
                },{status : 400}
            )
        }
        if (!mongoose.Types.ObjectId.isValid(slug)) {
            return NextResponse.json(
            {
                message: "Invalid event ID format",
                    success: false,
            },
            { status: 400 }
      );
    }

    const event = await Event.findOne({
        _id : slug,
        adminId : admin.user.id,
    })
     if (!event) {
      return NextResponse.json(
        {
          message: "Event not found or you don't have permission to access it",
          success: false,
        },
        { status: 404 }
      );
    }
       
        const eventDetails = await Event.aggregate([
            {
                $match : {
                    _id : new mongoose.Types.ObjectId(slug),
                    adminId : new mongoose.Types.ObjectId(admin.user.id),
                }
            },
            {
                $lookup : {
                    from : "registrations",
                    localField : "_id",
                    foreignField : "eventId",
                    as : "registrations",
                    pipeline : [
                        {
                            $lookup : {
                                from : "students",
                                localField : "studentId",
                                foreignField : "_id",
                                as : "student",
                                pipeline : [
                                    {
                                        $project : {
                                            name : 1,
                                            email : 1,
                                            usn : 1,
                                            branch : 1,
                                        }
                                    }
                                ]
                            }
                        },
                        {
                            $addFields : {
                                student : {$arrayElemAt : ["$student" , 0]},
                            }
                        },
                        {
                            $project : {
                                _id: 1,
                                student: 1,
                                attended: 1,
                                createdAt: 1,
                                feedback: 1
                            }
                        },
                        {
                            $sort: { createdAt: 1 } 
                        }
                    ]
                }
            },
            {
                $addFields : {
                    totalRegistrations : {$size : "$registrations"},
                    totalPresent: {
                        $size: {
                        $filter: {
                        input: "$registrations",
                        cond: { $eq: ["$$this.attended", true] }
                        }
                    },
                },
                totalAbsent : {
                    $size : {
                        $filter : {
                            input : "$registrations",
                            cond: { $eq: ["$$this.attended", false] }
                        }
                    }
                }
            }
            },
            {
                $addFields : {
                   attendancePercentage : {
                    $cond : {
                        if: { $gt: ["$totalRegistrations", 0] },
                        then : {
                            $round : [
                                {
                                    $multiply: [
                                    { $divide: ["$totalPresent", "$totalRegistrations"] },
                                        100
                                    ]
                                }
                            ]
                        },
                        else : 0
                    }
                   },
                   availableSpots : {
                     $cond : {
                        if: { $ne: ["$maxParticipants", null] },
                        then: { $subtract: ["$maxParticipants", "$totalRegistrations"] },
                        else: null
                     }
                   }
                }
            },
            {
                $project : {
                    _id: 1,
                    title : 1,
                    description : 1,
                    type : 1,
                    startDate : 1,
                    endDate : 1,
                    venue : 1,
                    maxParticipants : 1,
                    status : 1,
                    registrations: 1,
                    statistics : {
                        totalRegistrations: "$totalRegistrations",
                        totalPresent: "$totalPresent", 
                        totalAbsent: "$totalAbsent",
                        attendancePercentage: "$attendancePercentage",
                        availableSpots: "$availableSpots"
                    }
                }
            }
        ]);

    if (!eventDetails || eventDetails.length === 0) {
      return NextResponse.json(
        {
          message: "Event not found",
          success: false,
        },
        { status: 404 }
      );
    }
    const eventData = eventDetails[0];
    return NextResponse.json(
        {
            message : "Event Details Fetched Successfully",
            success : true,
            eventD : {
                _id : eventData._id,
                title : eventData.title,
                description: eventData.description,
                type: eventData.type,
                startDate: eventData.startDate,
                endDate: eventData.endDate,
                venue: eventData.venue,
                maxParticipants: eventData.maxParticipants,
                status: eventData.status,
            },
            registrations : eventData.registration.map((reg : any)=>({
                registrationId: reg._id,
                student: {
                    id: reg.student._id,
                    name: reg.student.name,
                    email: reg.student.email,
                    usn: reg.student.usn,
                    branch: reg.student.branch
                },
                attended: reg.attended,
                registeredAt: reg.createdAt,
                feedback: reg.feedback || null
            })),
             statistics: eventData.statistics
        },{status : 200}
    )
    } catch (error : any) {
        console.error("Get event details error:", error);
        if (error.message === "Authentication required") {
        return NextResponse.json(
            {
                message: "Please login to access this resource",
                success: false,
            },
            { status: 401 }
        );
    }

    if (error.message.includes("Access denied")) {
      return NextResponse.json(
        {
          message: "Only admins can access this resource",
          success: false,
        },
        { status: 403 }
      );
    }

    if (error.name === "CastError") {
      return NextResponse.json(
        {
          message: "Invalid event ID format",
          success: false,
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        message: "Internal server error While fetching the event details",
        success: false,
      },
      { status: 500 }
    );

    }
}