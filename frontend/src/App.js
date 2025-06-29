import './App.css';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import SignUp from './components/SignUp';
import SignIn from "./components/SignIn";
import Home from './components/Home';
import NavBar from './components/NavBar';
import Logout from './components/Logout';
import TelegramConnection from './components/TelegramConnection';
import LogoutTelegram from './components/LogoutTelegram';

function App() {
  return (
    <Router>
      <NavBar/>
      <Routes>
        <Route path="/signup" element={<SignUp />} />
        <Route path="/signin" element={<SignIn />} />
        <Route path="/logout" element={<Logout/>} />
        <Route path="/telegram_connection" element={<TelegramConnection/>} />
        <Route path="/logout_telegram" element={<LogoutTelegram/>} />
        <Route path="/" element={<Home />} />
      </Routes>
    </Router>
  );
}

export default App;
