import './LoginRegister.css';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaUser, FaLock, FaEnvelope } from "react-icons/fa";

const LoginRegister = () => {

  const navigate = useNavigate();

  const [isRegistering, setIsRegistering] = useState(false);

  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  const [registerUsername, setRegisterUsername] = useState('');
  const [registerEmail, setRegisterEmail] = useState('');
  const [registerPassword, setRegisterPassword] = useState('');

  useEffect(() => {
  const onStorageChange = (e) => {
    if (e.key === 'verified' && e.newValue) {
      navigate('/lessons');
    }
  };

  window.addEventListener('storage', onStorageChange);
  return () => window.removeEventListener('storage', onStorageChange);
}, [navigate]);



  const handleLogin = async (e) => {
  e.preventDefault();
  if (!loginEmail || !loginPassword) {
    alert('Please enter both email and password');
    return;
  }

  try {
    const response = await fetch('http://localhost:8080/api/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: loginEmail,
        password: loginPassword
      })
    });

    if (!response.ok) {
      throw new Error('Login failed');
    }

    const data = await response.json();
    const token = data.token;

    localStorage.setItem('authToken', token);

    navigate('/lessons');
  } catch (error) {
    alert(error.message);
    console.error('Login error:', error);
  }
};

  const handleRegister = async (e) => {
    e.preventDefault();

    if (!registerUsername || !registerEmail || !registerPassword) {
      alert('Please fill all fields');
      return;
    }

    try {
      const response = await fetch('http://localhost:8080/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: registerEmail,
          password: registerPassword,
        }),
      });

      if (!response.ok) {
        const text = await response.text();
        throw new Error(text || 'Registration failed');
      }

      const message = await response.text();
      alert(message); // e.g. "verification email sent to ..."

      setIsRegistering(false);
    } catch (error) {
      alert(error.message);
      console.error('Registration error:', error);
    }
  };

  return (
    <div className="wrapper">
      {/* Login Form */}
      <div className="form-box">
        {!isRegistering ? (
          <form onSubmit={handleLogin}>
            <h1>Login</h1>
            <div className="input-box">
              <input
                type="text"
                placeholder="Email"
                value={loginEmail}
                onChange={(e) => setLoginEmail(e.target.value)}
                required
              />
              <FaEnvelope className="icon" />
            </div>
            <div className="input-box">
              <input
                type="password"
                placeholder="Password"
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
                required
              />
              <FaLock className="icon" />
            </div>

            <div className="remember-forgot">
              <label>
                <input type="checkbox" />
                <span>Remember me</span>
              </label>
              <a href="#">Forgot Password?</a>
            </div>
            <button type="submit" className="btn">Login</button>
            <div className="register-link">
              <p>Don't have an account? <a href="#" onClick={(e) => { e.preventDefault(); setIsRegistering(true); }}> Register</a></p>
            </div>
          </form>
        ) : (

          <form onSubmit={handleRegister}>
            <h1>Registration</h1>
            <div className="input-box">
              <input
                type="text"
                placeholder="Username"
                value={registerUsername}
                onChange={(e) => setRegisterUsername(e.target.value)}
                required
              />
              <FaUser className="icon" />
            </div>

            <div className="input-box">
              <input
                type="email"
                placeholder="Email"
                value={registerEmail}
                onChange={(e) => setRegisterEmail(e.target.value)}
                required
              />
              <FaEnvelope className="icon" />
            </div>

            <div className="input-box">
              <input
                type="password"
                placeholder="Password"
                value={registerPassword}
                onChange={(e) => setRegisterPassword(e.target.value)}
                required
              />
              <FaLock className="icon" />
            </div>
            <button type="submit" className="btn">Register</button>

          </form>
        )}
      </div>

    </div>
  );
};

export default LoginRegister;