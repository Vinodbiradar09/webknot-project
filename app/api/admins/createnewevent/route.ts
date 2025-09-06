import { connectDB } from "@/app/lib/db";
import Event from "@/app/model/Events";
import Admin from "@/app/model/Admins";
import { createEventSchema } from "@/app/schemas/event.sch";
import { requireAdmin } from "@/app/helps/authSessions";
import { NextRequest, NextResponse } from "next/server";
import { EventIntTyp } from "@/app/types/EventTyp";

export async function POST(request : NextRequest) : Promise<NextResponse>{
    try {
        await connectDB();
        const admin =  await requireAdmin();
        if(!admin.user || !admin.user.isVerified || admin.user.role !== "admin" || !admin.user.id){
            return NextResponse.json(
                {
                    message : "Unauthorized User , please login only admins can create events",
                    success : false
                },{status : 400}
            )
        }
        const body : EventIntTyp = await request.json();
        const {title , description , type , startDate , endDate , venue , maxParticipants , status} = body;
        const eventResults = createEventSchema.safeParse({title , description , type , startDate , endDate , venue , maxParticipants , status});
        if(!eventResults.success){
            const errors = eventResults.error.format();
            const eventErrors = [
                ...(errors.title?._errors || []),
                ...(errors.description?._errors || []),
                ...(errors.type?._errors || []),
                ...(errors.startDate?._errors || []),
                ...(errors.endDate?._errors || []),
                ...(errors.venue?._errors || []),
                ...(errors.maxParticipants?._errors || []),
                ...(errors.status?._errors || []),
            ]

            return NextResponse.json(
                {
                    message : eventErrors.length > 0 ? eventErrors.join(", ") : "All the fields are required to create Event",
                    success : false
                },{status : 400}
            )
        }
        const realAdmin = await Admin.findById(admin.user.id);
        if(realAdmin){
            if(admin.user.id !== realAdmin._id.toString()){
                return NextResponse.json(
                    {
                        message : "Access denied",
                        success : false,
                    },{status : 400}
                )
            }
        }else {
            return NextResponse.json(
                {
                    message : "Admin not found , Access Denied",
                    success : false
                },{status : 404}
            )
        }

        const event = await Event.create({
            title,
            description,
            type : type,
            startDate : startDate,
            endDate : endDate,
            venue : venue,
            maxParticipants : maxParticipants,
            status : status,
            // adminId : "68bc24151aecb3f32ae82d72",
            adminId : realAdmin._id || admin.user.id,
        })
        if(!event){
            return NextResponse.json(
                {
                    message : "Failed to create event",
                    success : false
                },{status : 404}
            )
        }
        return NextResponse.json(
            {
                message : "Event created successfully",
                success : true,
                eventDoc : event,
            },{status : 200}
        )
    } catch (error) {
        console.error("Error while creating the event" , error);
        return NextResponse.json(
            {
                message : "Error while creating the event",
                success : false
            },{status : 500}
        )
    }
}