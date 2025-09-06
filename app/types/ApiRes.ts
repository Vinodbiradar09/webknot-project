import { EventInt } from "../model/Events";
export interface ApiRes {
    success : boolean,
    message : string,
    eventDoc?: EventInt,
    allEvents : EventInt[],
}