import React from 'react';
import {Button} from "../@/components/ui/button";
import axios from "axios";

interface LoginProps {
    isAuthenticated: boolean | null;
}

const Login: React.FC<LoginProps> = ({isAuthenticated}) => {
    const handleLogin = async () => {
        try {
            const response = await axios.get(process.env.REACT_APP_API_URL + '/auth');
            console.log(response);
        } catch (error) {
            console.error('Error:', error);
        }
    }

    return (
        <div>
            {!isAuthenticated && <Button onClick={handleLogin}>Connect Google Calendar</Button>}
        </div>
    );
}

export default Login;