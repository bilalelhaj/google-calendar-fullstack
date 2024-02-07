import axios from "axios";
import {db} from "./db";

export async function fetchAndStoreEvents(userId: string, accessToken: string) {
    const response = await axios.get(
        `https://www.googleapis.com/calendar/v3/calendars/primary/events`,
        {
            params: {
                timeMin: new Date().toISOString(),
                maxResults: 10,
                singleEvents: true,
                orderBy: "startTime",
            },
            headers: {
                Authorization: `Bearer ${accessToken}`,
            },
            withCredentials: true,
        },
    );

    const events = response.data.items;
    const userEventsCollection = db.collection('userEvents').doc(userId).collection('events');

    const existingEvents = await userEventsCollection.get();
    const deletePromises = existingEvents.docs.map(doc => doc.ref.delete());
    await Promise.all(deletePromises);

    for (const event of events) {
        await userEventsCollection.doc(event.id).set(event);
    }

    return events;
}