import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

function LogoutTelegram() {
    const navigate = useNavigate();
    localStorage.removeItem('telegram_username');
    window.location.reload();
    navigate('/');

    useEffect(() => {
    async function doLogout() {
        localStorage.removeItem('telegram_username');
        window.location.reload();
        navigate('/');
    }
    doLogout();
  }, [navigate]);
    return (
    <div>
        
    </div>
  )
}

export default LogoutTelegram