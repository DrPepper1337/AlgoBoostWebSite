import './LoginRegister.css';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaUser, FaLock, FaEnvelope } from "react-icons/fa";

const PasswordReset = () => {
  const [email, setEmail] = useState('');
  const [newPassword, setRegisterPassword] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
  const handleStorageChange = (event) => {
    if (event.key === 'passwordResetSuccess' && event.newValue === 'true') {
      localStorage.removeItem('passwordResetSuccess');
      navigate('/login');
    }
  };

  window.addEventListener('storage', handleStorageChange);
  return () => window.removeEventListener('storage', handleStorageChange);
}, [navigate]);


  const handleReset = async (e) => {
    e.preventDefault();

    if (!email) {
      alert('Please enter your email');
      return;
    }

    try {
      const response = await fetch('http://localhost:8080/api/request-reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: email,
          password: newPassword,
        }),
      });


      if (!response.ok) {
        const text = await response.text();
        throw new Error(text || 'Registration failed');
      }

      const message = await response.text();
      alert(message); // e.g. "verification email sent to ..."
    } catch (error) {
      alert(error.message);
      console.error('Registration error:', error);
    }
  };


  return (
    <div className="wrapper">
      <div className="form-box">
        <form onSubmit={handleReset}>
          <h1>Reset Password</h1>
          <div className="input-box">
            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <FaEnvelope className="icon" />
          </div>

            <div className="input-box">
              <input
                type="password"
                placeholder="New Password"
                value={newPassword}
                onChange={(e) => setRegisterPassword(e.target.value)}
                required
              />
              <FaLock className="icon" />
            </div>
          <button type="submit" className="btn">Reset</button>
        </form>
      </div>
    </div>
  );
};
export default PasswordReset;