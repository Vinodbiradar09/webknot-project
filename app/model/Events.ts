import mongoose , {Schema , model , models , Model , Document} from "mongoose";

export interface EventInt extends Document {
    _id : mongoose.Types.ObjectId,
    title : string,
    description : string,
    adminId : mongoose.Types.ObjectId,
    type: 'hackathon' | 'fest' | 'talk'; 
    startDate : Date,
    endDate : Date,
    venue : string,
    maxParticipants? : number,
    status : 'upcoming' | 'ongoing' | 'cancelled' | 'completed',
    createdAt: Date;
    updatedAt: Date;
}

const eventSchema = new Schema<EventInt>(
    {
        title : {
            type: String,
            required: [true, 'Event title is required'],
            trim: true,
            minlength: [3, 'Title must be at least 3 characters'],
            maxlength: [100, 'Title cannot exceed 100 characters']
        },
        description : {
            type: String,
            required: [true, 'Event description is required'],
            trim: true,
            minlength: [10, 'Description must be at least 10 characters'],
            maxlength: [500, 'Description cannot exceed 500 characters']
        },
        type : {
            type : String,
            enum : {
                values: ['hackathon', 'fest', 'talk'],
                message: 'Event type must be one of: hackathon, fest, talk'
            },
            required: true
        },
        startDate : {
            type : Date,
            required: [true, 'Start date is required'],
        },
        endDate: {
            type: Date,
            required: [true, 'End date is required'],
        },
        venue: {
            type: String,
            required: [true, 'Venue is required'],
            trim: true,
            minlength: [3, 'Venue must be at least 3 characters'],
            maxlength: [100, 'Venue cannot exceed 100 characters']
        },
        maxParticipants: {
            type: Number,
            min: [1, 'Maximum participants must be at least 1'],
            max: [1000, 'Maximum participants cannot exceed 1000']
        },
        status: {
            type: String,
            enum: {
                values: ['upcoming', 'ongoing', 'completed', 'cancelled'],
                message: 'Status must be one of: upcoming, ongoing, completed, cancelled'
            },
            default: 'upcoming'
        },
        adminId : {
            type : mongoose.Schema.Types.ObjectId,
            ref: 'Admin',
            required: [true, 'Admin ID is required']
        }
    },
    {
        timestamps : true,
    }
);


eventSchema.methods.isRegistrable = function(): boolean {
    const now = new Date().getTime();
    return this.status === 'upcoming' && this.startDate.getTime() > now;
}

eventSchema.methods.canMarkAttendance = function(): boolean {
  return this.status === 'ongoing' || this.status === 'completed';
};

const Event : Model<EventInt> = models?.Event as mongoose.Model<EventInt> || model("Event" , eventSchema);

export default Event;
