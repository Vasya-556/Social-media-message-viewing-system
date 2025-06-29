import {useState} from 'react'
import api from "../api";
import { useNavigate } from 'react-router-dom'; 

function SignIn() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [message, setMessage] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault(); 
        try {
        const response = await api.post('/signin', {
            username,
            password,
        });
        const { token, telegram_username } = response.data;

        localStorage.setItem('token', token);
        if (telegram_username) {
            localStorage.setItem('telegram_username', telegram_username);
        }
        navigate('/'); 
        window.location.reload();
        } catch (error) {
        if (error.response) {
            setMessage(`Error: ${error.response.data.detail}`);
        } else {
            setMessage('Error signing in');
        }
        }
    };
    
    return (
    <div className='sign-in'>
        <form onSubmit={handleSubmit}>
            <input 
            placeholder='Username'
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required></input>
            <input 
            placeholder='Password'
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required></input>
            <button type='submit'>Sign in</button>
        </form>
        {message && <p>{message}</p>}
    </div>
  )
}

export default SignIn