export interface Attendee {
    email: string;
}

export interface Organizer {
    email: string;
}

export interface Event {
    summary: string;
    start: {
        dateTime: string;
    };
    attendees: Attendee[];
    location: string;
    description: string;
    organizer: Organizer;
    created: string;
    updated: string;
}