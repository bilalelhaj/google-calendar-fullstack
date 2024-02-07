import {
    Table,
    TableBody,
    TableCaption,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "../@/components/ui/table"

import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "../@/components/ui/popover"
import {Event} from '../types/event';

interface EventTableProps {
    data: Event[];
}

export function EventTable({data: events}: EventTableProps) {
    return (
        <Table>
            <TableCaption>A list of your 10 next events of your Google Calendar</TableCaption>
            <TableHeader>
                <TableRow>
                    <TableHead className="w-[100px]">Name</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Attendees</TableHead>
                    <TableHead>Location</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {events.slice(0, 10).map((event: any) => {

                    const date = new Date(event.start.dateTime);

                    const formattedDate = `${date.getDate()}.${date.getMonth() + 1}.${date.getFullYear()} (${date.getHours()}:${String(date.getMinutes()).padStart(2, '0')})`;

                    const attendeeEmails = event.attendees
                        ? event.attendees
                            .filter((attendee: any) => attendee.email !== event.creator.email)
                            .map((attendee: any) => attendee.email)
                            .join(', ')
                        : 'No attendees given';

                    const location = event.location ? event.location : 'No location given';

                    const description = event.description ? event.description : 'No description given';

                    const createdDate = new Date(event.created);

                    const formattedCreatedDate = `${createdDate.getDate()}.${createdDate.getMonth() + 1}.${createdDate.getFullYear()} (${createdDate.getHours()}:${String(createdDate.getMinutes()).padStart(2, '0')})`;

                    const updatedDate = new Date(event.updated);

                    const formattedUpdatedDate = `${updatedDate.getDate()}.${updatedDate.getMonth() + 1}.${updatedDate.getFullYear()} (${updatedDate.getHours()}:${String(updatedDate.getMinutes()).padStart(2, '0')})`;

                    return (
                        <Popover>
                            <PopoverTrigger className="contents">
                                <TableRow>
                                    <TableCell className="font-medium text-left">{event.summary}</TableCell>
                                    <TableCell className="font-medium text-left">{formattedDate}</TableCell>
                                    <TableCell className="font-medium text-left">{attendeeEmails}</TableCell>
                                    <TableCell className="font-medium text-left">{location}</TableCell>
                                </TableRow>
                            </PopoverTrigger>
                            <div style={{
                                position: 'fixed',
                                top: '50%',
                                left: '50%',
                                transform: 'translate(-50%, -50%)'
                            }}>
                                <PopoverContent>
                                    <strong>Name:</strong> {event.summary}<br/>
                                    <strong>Date:</strong> {formattedDate}<br/>
                                    <strong>Attendees:</strong> {attendeeEmails}<br/>
                                    <strong>Location:</strong> {location}<br/>
                                    <strong>Description:</strong> {description}<br/>
                                    <strong>Organizer:</strong> {event.organizer.email}<br/>
                                    <strong>Created:</strong> {formattedCreatedDate}<br/>
                                    <strong>Updated:</strong> {formattedUpdatedDate}<br/>
                                </PopoverContent>
                            </div>
                        </Popover>
                    )
                })}
            </TableBody>
        </Table>
    )
}
