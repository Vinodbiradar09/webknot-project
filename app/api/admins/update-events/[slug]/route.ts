import { connectDB } from "@/app/lib/db";
import Event from "@/app/model/Events";
import Admin from "@/app/model/Admins";
import { NextRequest , NextResponse } from "next/server";
import { requireAdmin } from "@/app/helps/authSessions";
import { EventUpdateDetails } from "@/app/types/EventTyp";

export async function PATCH(request : NextRequest , {params} : {params : Promise<{slug : string}>}) : Promise<NextResponse> {
    try {
        await connectDB();
        const admin = await requireAdmin();
        if(!admin || !admin.user || !admin.user.id || !admin.user.isVerified  || admin.user.role !== "admin"){
            return NextResponse.json(
                {
                    message : "Unauthorized User, please login",
                    success : false,
                },{status : 404}
            )
        }
        const {slug} = await params;
        if(!slug){
            return NextResponse.json(
                {
                    message : "Slug is required to update the event details",
                    success : false,
                },{status : 404}
            )
        }
        const body : EventUpdateDetails = await request.json();
        const {title , description , type , startDate , endDate , venue , maxParticipants , status} = body;
        const updatingEventDetails : EventUpdateDetails = {};
        if(title) updatingEventDetails.title = title;
        if(description) updatingEventDetails.description = description;
        if(type) updatingEventDetails.type = type;
        if(startDate) updatingEventDetails.startDate = new Date(startDate);
        if(endDate) updatingEventDetails.endDate =  new Date(endDate);
        if(venue) updatingEventDetails.venue = venue;
        if(maxParticipants)updatingEventDetails.maxParticipants = maxParticipants;
        if(status) updatingEventDetails.status = status;

        if(Object.keys(updatingEventDetails).length === 0){
            return NextResponse.json(
                {
                    message : "Atleast one field is required to update the event details",
                    success : false
                },{status : 404}
            )
        }
        const realAdmin = await Admin.findById(admin.user.id);
        if(realAdmin){
            if(admin.user.id !== realAdmin._id.toString()){
                return NextResponse.json(
                    {
                        message : "Access Denied",
                        success : false,
                    },{status : 404}
                )
            }
        } else {
            return NextResponse.json(
                {
                    message : "Admin not found",
                    success : false,
                },{status : 404}
            )
        }
        const eventUpdated = await Event.findByIdAndUpdate(slug , 
            {
                $set : updatingEventDetails,
            },
            {
                new : true,
                runValidators : true,
            }
        );
        if(!eventUpdated){
            return NextResponse.json(
                {
                    message : "Failed to update the event details",
                    success : false
                },{status : 404}
            )
        }
        return NextResponse.json(
            {
                message : "Event has been updated successfully",
                success : true,
                eventDoc : eventUpdated,
            },{status : 200}
        )
    } catch (error) {
        console.error("Error while updating the event details" , error);
        return NextResponse.json(
            {
                message : "Error while updating the event details",
                success : false,
            },{status : 500}
        )
    }
}