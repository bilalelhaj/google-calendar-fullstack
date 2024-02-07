import React, {useEffect, useState} from 'react';
import axios from 'axios';
import {useNavigate} from 'react-router-dom';
import {EventTable} from "./EventTable";
import {Button} from "../@/components/ui/button";

interface EventsProps {
    setIsAuthenticated: (value: boolean) => void;
    isAuthenticated: boolean | null;
}

const Events: React.FC<EventsProps> = ({setIsAuthenticated, isAuthenticated}) => {
    const [events, setEvents] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        if (!isAuthenticated) {
            navigate('/');
        }
    }, [isAuthenticated, navigate]);

    useEffect(() => {
        axios.get(process.env.REACT_APP_API_URL + '/user/get-db-events', {withCredentials: true})
            .then(response => {
                const sortedEvents = response.data.sort((a: any, b: any) => {
                    const dateA = new Date(a.start.dateTime).getTime();
                    const dateB = new Date(b.start.dateTime).getTime();
                    return dateA - dateB;
                });
                setEvents(sortedEvents);
                setIsLoading(false);
            })
            .catch(error => {
                console.error('Error fetching events', error);
                setIsLoading(false);
                if (error.response && error.response.status === 401) {
                    navigate('/'); // Redirect to login page
                }
            });
    }, [navigate]);

    const handleDisconnect = () => {
        axios.post(process.env.REACT_APP_API_URL + '/auth/disconnect', {}, {withCredentials: true})
            .then(() => {
                setIsAuthenticated(false); // Set isAuthenticated to false
                navigate('/'); // Redirect to login page immediately
            })
            .catch(error => {
                console.error('Error during disconnect', error);
            });
    };

    if (isLoading) {
        return <div>Loading...</div>;
    }

    return (
        <div>
            <EventTable data={events}/>
            <Button onClick={handleDisconnect}>Disconnect</Button>
        </div>
    );
}

export default Events;