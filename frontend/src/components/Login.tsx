import React from 'react';
import {Button} from "../@/components/ui/button";

interface LoginProps {
    isAuthenticated: boolean | null;
}

const Login: React.FC<LoginProps> = ({isAuthenticated}) => {
    const handleLogin = () => {
        window.location.href = process.env.REACT_APP_API_URL + '/auth';
    }

    return (
        <div>
            {!isAuthenticated && <Button onClick={handleLogin}>Connect Google Calendar</Button>}
        </div>
    );
}

export default Login;