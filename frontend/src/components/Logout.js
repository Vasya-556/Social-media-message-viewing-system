import { useEffect } from 'react';
import api from '../api';
import { useNavigate } from 'react-router-dom';

function Logout() {
  const navigate = useNavigate();

  useEffect(() => {
    async function doLogout() {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          await api.post('/logout', null, { headers: { Authorization: token } });
        } catch (e) {
          console.error('Logout error:', e);
        }
        localStorage.removeItem('token');
        localStorage.removeItem('telegram_username');
      }
      navigate('/');
      window.location.reload();
    }
    doLogout();
  }, [navigate]);

  return <p>Logging out...</p>;
}

export default Logout;