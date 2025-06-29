import api from '../api';

export async function IsLoggedIn() {
  const token = localStorage.getItem('token');
  if (!token) return false;

  try {
    await api.get('/token_check', { headers: { Authorization: token } });
    return true;
  } catch {
    return false;
  }
}