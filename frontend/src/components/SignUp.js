import {useState} from 'react'
import api from "../api";
import { useNavigate } from 'react-router-dom'; 

function SignUp() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [message, setMessage] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
    e.preventDefault(); 
    try {
      // eslint-disable-next-line
      const response = await api.post('/signup', {
        username,
        password,
      });
      navigate('/signin'); 
      window.location.reload();
    } catch (error) {
      if (error.response) {
        setMessage(`Error: ${error.response.data.detail}`);
      } else {
        setMessage('Error signing up');
      }
    }
  };

  return (
    <div className='sign-up'>
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
            <button type='submit'>Sign up</button>
        </form>
        {message && <p>{message}</p>}
    </div>
  )
}

export default SignUp