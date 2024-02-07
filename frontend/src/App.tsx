import React, {useEffect, useState} from 'react';
import Login from "./components/Login";
import {BrowserRouter as Router, Route, Routes} from 'react-router-dom';
import Events from "./components/Events";
import axios from 'axios';

interface AppState {
    isAuthenticated: boolean | null;
    userEmail: string | null;
    isLoading: boolean;
}

function App() {
    const [state, setState] = useState<AppState>({
        isAuthenticated: null,
        userEmail: null,
        isLoading: true,
    });

    const setIsAuthenticated = (value: boolean) => {
        setState(prevState => ({
            ...prevState,
            isAuthenticated: value,
        }));
    };

    useEffect(() => {
        const verifySession = async () => {
            try {
                const response = await axios.get(process.env.REACT_APP_API_URL + '/auth/verify-session', {withCredentials: true});
                const isAuthenticated = response.status === 200;
                let userEmail = null;
                if (isAuthenticated) {
                    const emailResponse = await axios.get(process.env.REACT_APP_API_URL + '/user/get-user-email', {withCredentials: true});
                    userEmail = emailResponse.data.email;
                }
                setState({
                    isAuthenticated,
                    userEmail,
                    isLoading: false,
                });
            } catch (error) {
                setState({
                    isAuthenticated: false,
                    userEmail: null,
                    isLoading: false,
                });
            }
        };

        verifySession();
        const intervalId = setInterval(verifySession, 5 * 60 * 1000);

        return () => clearInterval(intervalId);
    }, []);

    if (state.isLoading) {
        return <div>Loading...</div>;
    }

    return (
        <Router>
            <div style={{display: 'flex', justifyContent: 'flex-end'}}>
                {state.isAuthenticated && <p><strong>Logged-in Email:</strong> {state.userEmail}</p>}
            </div>
            <Routes>
                {state.isAuthenticated ? (
                    <Route path="/" element={<Events setIsAuthenticated={setIsAuthenticated}
                                                     isAuthenticated={state.isAuthenticated}/>}/>
                ) : (
                    <Route path="/" element={<Login isAuthenticated={state.isAuthenticated}/>}/>
                )}
            </Routes>
        </Router>
    );
}

export default App;