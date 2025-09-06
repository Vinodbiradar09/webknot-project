import mongoose, { model, Schema, Model, models, Document } from "mongoose";
import bcrypt from "bcrypt";

export interface StudentInt extends Document {
    _id: mongoose.Types.ObjectId;
    name: string;
    email: string;
    usn: string;
    branch: string;
    verifyCode : string,
    verifyCodeExpiry : Date,
    isVerified : boolean
    password: string;
    createdAt: Date;
    updatedAt: Date;
}

const studentsSchema = new Schema<StudentInt>(
    {
        name: {
            type: String,
            required: [true, 'Name is required'],
            trim: true,
            minlength: [2, 'Name must be at least 2 characters'],
            maxlength: [50, 'Name cannot exceed 50 characters']
        },
        email: {
            type: String,
            required: [true, 'Email is required'],
            unique: true,
            lowercase: true,
            trim: true,
            match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
        },
        usn: {
            type: String,
            required: [true, 'USN is required'],
            unique: true,
            uppercase: true,
            trim: true,
            match: [/^[A-Za-z0-9]{10}$/, "Invalid USN, please enter valid USN"], 
        },
        branch: {
            type: String,
            required: [true, 'Branch is required'],
            trim: true,
            enum: {
                values: ['CSE', 'ISE', 'ECE', 'EEE', 'MECH', 'CIVIL', 'CHEM', 'AERO', 'BT', 'IT'],
                message: 'Please select a valid branch'
            }
        },
        verifyCode : {
            type : String,
            required : [true , "Verify code is required"],
        },
        verifyCodeExpiry : {
            type : Date,
            required : [true , "Verify code expiry is required"],
        },
        isVerified : {
            type : Boolean,
            default : false 
        },
        password: {
            type: String,
            required: [true, 'Password is required'],
            minlength: [6, 'Password must be at least 6 characters']
        }
    },
    {
        timestamps: true,
    }
);

studentsSchema.index({ email: 1 }, { unique: true });
studentsSchema.index({ usn: 1 }, { unique: true });
studentsSchema.index({ branch: 1 });

studentsSchema.pre("save", async function (next) {
    if (!this.isModified("password")) return next();
    
    try {
        this.password = await bcrypt.hash(this.password, 12);
        next();
    } catch (error) {
        next(error as Error);
    }
});

const Student: Model<StudentInt> = models?.Student as mongoose.Model<StudentInt> || model("Student", studentsSchema);

export default Student;
