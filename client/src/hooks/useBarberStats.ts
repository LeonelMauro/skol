import { useEffect, useState } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';


export function useBarberStats(period: 'day' | 'week' | 'month') {
  const { user } = useAuth();
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.access_token) return;

    setLoading(true);

    api
      .get('/stats/barber/me', {
        params: { period },
        headers: {
          Authorization: `Bearer ${user.access_token}`,
        },
      })
      .then(res => setStats(res.data))
      .finally(() => setLoading(false));
  }, [period, user?.access_token]);

  return { stats, loading };
}
