import mongoose , {Schema , model , models , Model , Document } from "mongoose";
import bcrypt from "bcrypt";

export interface AdminInt extends Document{
    _id : mongoose.Types.ObjectId,
    name : string,
    email : string,
    verifyCode : string,
    verifyCodeExpiry : Date,
    isVerified : boolean
    password : string,

}

const adminSchema = new Schema<AdminInt>(
    {
        name : {
            type : String,
            required : [true , "Admin Name is required"],
            minLength : [2 , "Name must be at least 2 characters"],
            maxLength : [50 , "Name can't be exceed more than 50 characters"],
            trim : true,
        },
        email: {
            type: String,
            required: [true, 'Email is required'],
            unique: true,
            lowercase: true,
            index : true,
            trim: true,
            match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
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
        timestamps : true,
    }
)

adminSchema.pre("save" , async function (next) {
    if (!this.isModified("password")) return next();

    try {
        this.password = await bcrypt.hash(this.password , 10);
        next();
    } catch (error) {
        next(error as Error);
    }
});


const Admin : Model<AdminInt> = models?.Admin as mongoose.Model<AdminInt> || model("Admin" , adminSchema);

export default Admin;
