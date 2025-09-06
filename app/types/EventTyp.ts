export interface EventIntTyp {
    title : string,
    description : string,
    type : string,
    startDate : Date,
    endDate : Date,
    venue : string,
    maxParticipants : number,
    status : string,
}

export interface EventUpdateDetails {
    title?: string,
    description?: string,
    type?: string,
    startDate?: Date,
    endDate?: Date,
    venue?: string,
    maxParticipants?: number,
    status?: string,
}

export interface AttendanceEntry {
    studentId : string,
    attended : boolean,
}

export interface AttendanceRequest {
  attendanceData: AttendanceEntry[];
}

export interface ResultIntForStudentAttendance {
    studentId : string,
    studentName?: string,
    studentUSN?: string,
    attended : boolean,
    success : boolean,
    message : string,
}