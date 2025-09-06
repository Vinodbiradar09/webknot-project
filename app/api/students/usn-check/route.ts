import { connectDB } from "@/app/lib/db";
import Student from "@/app/model/Students";
import { NextRequest , NextResponse } from "next/server";
import { usnValidation } from "@/app/schemas/student.sch";
import { z } from "zod";

const UsnQuerySchema = z.object({
    usn : usnValidation,
});

export async function GET(request : NextRequest) : Promise<NextResponse> {
    try {
        await connectDB();
        const {searchParams} = new URL(request.url);
        const queryParams = {
            usn : searchParams.get("usn"),
        }
        const usnResult = UsnQuerySchema.safeParse(queryParams);
        if(!usnResult.success){
            const usnErrors = usnResult.error.format().usn?._errors || [];
            return NextResponse.json(
                {
                    message : usnErrors.length > 0 ? usnErrors.join(", ") : "Usn Must be 10 Chars",
                    success : false,
                },{status : 400}
            )
        }
        const {usn} = usnResult.data;
        const existedStudentWithUsn = await Student.findOne({usn , isVerified : true});
        if(existedStudentWithUsn){
            return NextResponse.json(
                {
                    message : "Usn is already taken",
                    success : false
                },{status : 400}
            )
        }

        return NextResponse.json(
            {
                message : "Usn is unique",
                success : true,
            },{status : 200}
        )

    } catch (error) {
        console.error("Error while checking the usn", error);
        return NextResponse.json({
            success: false,
            message: "Error checking Usn",
        }, { status: 500 });
    }
}