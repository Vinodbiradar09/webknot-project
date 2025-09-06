import mongoose, { Schema, model, models, Document, Model } from "mongoose";

export interface RegistrationInt extends Document {
  _id: mongoose.Types.ObjectId;
  eventId: mongoose.Types.ObjectId;
  studentId: mongoose.Types.ObjectId;
  attended: boolean;
  feedback?: {
    rating?: number;
    comment?: string;
    submittedAt?: Date;
  };
  createdAt: Date;
  updatedAt: Date;
  markAttendance(attended: boolean): void;
  submitFeedback(rating: number, comment?: string): void;
}

export interface RegistrationModel extends Model<RegistrationInt> {
  isAlreadyRegistered(
    eventId: mongoose.Types.ObjectId,
    studentId: mongoose.Types.ObjectId
  ): Promise<boolean>;
  getEventRegistrationCount(eventId: mongoose.Types.ObjectId): Promise<number>;
  getEventAttendanceCount(eventId: mongoose.Types.ObjectId): Promise<number>;
}

 export interface StudentRefInt {
  _id: mongoose.Types.ObjectId;
  name: string;
  usn: string;
  email: string;
}

const registrationSchema = new Schema<RegistrationInt>(
  {
    eventId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Event",
      required: [true, "Event ID is required to register for the event"],
    },
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Student",
      required: [true, "Student ID is required to register for the event"],
    },
    attended: {
      type: Boolean,
      default: false,
    },
    feedback: {
      rating: {
        type: Number,
        min: [1, "Rating must be at least 1"],
        max: [5, "Rating cannot exceed 5"],
      },
      comment: {
        type: String,
        trim: true,
        maxlength: [500, "Comment cannot exceed 500 characters"], 
      },
      submittedAt: {
        type: Date,
        default: Date.now,
      },
    },
  },
  {
    timestamps: true,
  }
);

registrationSchema.statics.isAlreadyRegistered = async function (
  eventId: mongoose.Types.ObjectId,
  studentId: mongoose.Types.ObjectId
): Promise<boolean> {
  const registration = await this.findOne({ eventId, studentId });
  return !!registration;
};

registrationSchema.statics.getEventRegistrationCount = async function (
  eventId: mongoose.Types.ObjectId
): Promise<number> {
  return await this.countDocuments({ eventId });
};

registrationSchema.statics.getEventAttendanceCount = async function (
  eventId: mongoose.Types.ObjectId
): Promise<number> {
  return await this.countDocuments({ eventId, attended: true });
};

registrationSchema.methods.markAttendance = function (attended: boolean): void {
  this.attended = attended;
};

registrationSchema.methods.submitFeedback = function (rating: number, comment?: string): void {
  this.feedback = {
    rating,
    comment,
    submittedAt: new Date(),
  };
};

registrationSchema.pre("save", function (next) {
  if (this.feedback?.rating && !this.attended) {
    return next(new Error("Feedback can only be submitted for attended events"));
  }
  next();
});

const Registration =
  (models?.Registration as RegistrationModel) ||
  model<RegistrationInt, RegistrationModel>("Registration", registrationSchema);

export default Registration;