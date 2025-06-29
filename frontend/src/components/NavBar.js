import {useState, useEffect} from 'react'
import { IsLoggedIn } from './IsLoggedIn'
import { Link } from 'react-router-dom';

function NavBar() {
    const [loggedIn, setLoggedIn] = useState(null);

    useEffect(() => {
        IsLoggedIn().then(setLoggedIn);
    }, []);

    return (
    <div className='navbar'>
        <li><Link to="/">Home</Link></li>
        {loggedIn ? (
            <>
                <li><Link to="/logout">Log out</Link></li>
                <li><Link to="/telegram_connection">Connect to your telegram account</Link></li>
                <li><Link to="/logout_telegram">Dissconect from your telegram account</Link></li>
            </>
        ) : (
            <>
                <li><Link to="/signin">Sign in</Link></li>
                <li><Link to="/signup">Sign up</Link></li>
            </>
        )}
    </div>
  )
}

export default NavBar