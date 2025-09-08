import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { buildApiUrl } from "../../config/api";

const PasswordResetSuccess = () => {
  const location = useLocation();
  const [message, setMessage] = useState('Verifying your password reset token...');

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const token = params.get('token');

    if (!token) {
      setMessage('No reset token provided.');
      return;
    }

    fetch(buildApiUrl(`verify?token=${token}`))
      .then(res => {
        if (!res.ok) throw new Error('Verification failed');
        return res.json();
      })
      .then(data => {
        if (data.success) {
          setMessage(data.message || 'Password reset verified!');
          localStorage.setItem('passwordResetSuccess', Date.now().toString());
        } else {
          setMessage(data.message || 'Verification failed.');
        }
      })
      .catch(err => {
        setMessage('Error verifying token.');
        console.error(err);
      });
  }, [location.search]);

  return (
    <div style={{ padding: "2rem", textAlign: "center" }}>
      <h3>{message}</h3>
    </div>
  );
};

export default PasswordResetSuccess;
