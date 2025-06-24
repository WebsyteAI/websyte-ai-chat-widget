import { useEffect } from 'react';
import { useNavigate } from 'react-router';

export default function DashboardIndex() {
  const navigate = useNavigate();

  useEffect(() => {
    // Redirect to widgets list as the default dashboard view
    navigate('/dashboard/widgets', { replace: true });
  }, [navigate]);

  return null;
}