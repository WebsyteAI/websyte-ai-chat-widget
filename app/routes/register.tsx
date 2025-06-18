import { useEffect } from 'react';
import { useNavigate } from 'react-router';

export default function RegisterPage() {
  const navigate = useNavigate();

  useEffect(() => {
    // Redirect to login page with register mode
    navigate('/login?mode=register');
  }, [navigate]);

  return null;
}