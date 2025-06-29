import {useState} from 'react'
import api from '../api'

function TelegramConnection() {
    const [username, setUsername] = useState('')
    const [phone, setPhone] = useState('')
    const [code, setCode] = useState('')
    const [username2, setUsername2] = useState('')
    const [password, setPassword] = useState('')
    const [phoneCodeHash, setPhoneCodeHash] = useState('')
    const [message, setMessage] = useState('')
    
    const handleReceiveCode = async (e) => {
        e.preventDefault();
        try {
        const response = await api.post('/receive_code', {
            telegram_username: username,
            telegram_phone: phone
        });
        setPhoneCodeHash(response.data.phone_code_hash);
        setMessage('Code sent! Check your Telegram app.');
        } catch (err) {
        setMessage(err.response?.data?.detail || 'Error sending code');
        }
    };

    const handleEnterCode = async (e) => {
        e.preventDefault();
        try {
        const response = await api.post('/enter_code', {
            telegram_username: username,
            telegram_phone: phone,
            code,
            phone_code_hash: phoneCodeHash
        });
        setMessage(response.data.message);
        localStorage.setItem('telegram_username', username);
        } catch (err) {
        setMessage(err.response?.data?.detail || 'Error entering code');
        }
    };

    const handleEnterPassword = async (e) => {
        e.preventDefault();
        try {
        const response = await api.post('/enter_password', {
            telegram_username: username2,
            password
        });
        setMessage(response.data.message);
        } catch (err) {
        setMessage(err.response?.data?.detail || 'Error logging in with password');
        }
    };

    return (
    <div className='telegram-connection'>
        <h2>Connect Telegram Account</h2>
        <form onSubmit={handleReceiveCode}>
            <input
            placeholder='Telegram username'
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            />
            <input
            placeholder='Telegram phone'
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            required
            />
            <button type='submit'>Receive Code</button>
        </form>

        <form onSubmit={handleEnterCode}>
            <input
            placeholder='Code'
            value={code}
            onChange={(e) => setCode(e.target.value)}
            required
            />
            <button type='submit'>Connect to Account</button>
        </form>

        <h2>Two-Factor Authentication</h2>
        <form onSubmit={handleEnterPassword}>
            <input
            placeholder='Telegram username'
            value={username2}
            onChange={(e) => setUsername2(e.target.value)}
            required
            />
            <input
            placeholder='Telegram password'
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            type='password'
            required
            />
            <button type='submit'>Log in</button>
        </form>
        {message && <p>{message}</p>}
    </div>
  )
}

export default TelegramConnection