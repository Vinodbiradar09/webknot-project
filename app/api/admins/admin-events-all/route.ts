import { connectDB } from "@/app/lib/db";
import { NextRequest , NextResponse } from "next/server";
import Event from "@/app/model/Events";
import Admin from "@/app/model/Admins";
import { requireAdmin } from "@/app/helps/authSessions";

export async function GET(request : NextRequest) : Promise<NextResponse> {
    try {
        await connectDB();
        const admin = await requireAdmin();
        if(!admin || !admin.user || admin.user.role !== "admin" || !admin.user.id || !admin.user.isVerified ){
            return NextResponse.json(
                {
                    message : "Unauthorized User , Please login",
                    success : false,
                },{status : 400}
            )
        }
        const realAdmin = await Admin.findById(admin.user.id);
        if(realAdmin){
            if(admin.user.id !== realAdmin._id.toString()){
                return NextResponse.json(
                    {
                        message : "Access Denied",
                        success : false,
                    },{status : 400}
                )
            }
        } else {
            return NextResponse.json(
                {
                    message : "Admin Not found, Access denied",
                    success : false,
                },{status : 400}
            )
        }
        const allEvents = await Event.find(
            {
                adminId : admin.user.id || realAdmin._id,
                // adminId : "68bc24151aecb3f32ae82d72",
            }
        )
        if(!allEvents || allEvents.length === 0){
            return NextResponse.json(
                {
                    message : "You have zero events created",
                    success : true,
                },{status : 201}
            )
        }

        return NextResponse.json(
            {
                message : `All the events created by ${admin.user.name}`,
                success : true,
                allEvents : allEvents,
            },{status : 200}
        )
    } catch (error) {
        console.error("Error while accessing all the events" , error);
        return NextResponse.json(
            {
                message : `Error Fetching all the events created by admin`,
                success : false,
            },{status : 500}
        )
    }
}