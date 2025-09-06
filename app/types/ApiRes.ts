import { EventInt } from "../model/Events";
import { ResultIntForStudentAttendance } from "./EventTyp";

export interface StudentDetails {
  id: string;
  name: string;
  email: string;
  usn: string;
  branch: string;
}

export interface RegistrationWithStudent {
  registrationId: string;
  student: StudentDetails;
  attended: boolean;
  registeredAt: string;
  feedback: {
    rating?: number;
    comment?: string;
    submittedAt?: string;
  } | null;
}

export interface EventStatistics {
  totalRegistrations: number;
  totalPresent: number;
  totalAbsent: number;
  attendancePercentage: number;
  availableSpots: number | null;
}

export interface EventDetails {
  _id: string;
  title: string;
  description: string;
  type: "hackathon" | "fest" | "talk";
  startDate: string;
  endDate: string;
  venue: string;
  maxParticipants?: number;
  status: "upcoming" | "ongoing" | "completed" | "cancelled";
}

export interface AttendanceSummary {
  totalProcessed: number;
  successCount: number;
  errorCount: number;
  totalRegistrations: number;
  totalPresent: number;
  totalAbsent: number;
  attendancePercentage: number;
}

export interface ApiRes {
    success : boolean,
    message : string,
    eventDoc?: EventInt,
    allEvents?: EventInt[],
    updatedEventDoc? : EventInt,
    eventD?: EventDetails;
    registrations?: RegistrationWithStudent[];
    statistics?: EventStatistics;
    summary? : AttendanceSummary;
    results? : ResultIntForStudentAttendance[],
    errors? : { studentId: string; error: string }[];
    browsedEvents? : EventInt[],
}
