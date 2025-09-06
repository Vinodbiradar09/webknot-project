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