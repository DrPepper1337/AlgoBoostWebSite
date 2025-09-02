import './LoginRegister.css';
import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { FaLock, FaEnvelope } from "react-icons/fa";
const LoginRegister = () => {

  const navigate = useNavigate();
  const { login } = useAuth();

  const [isRegistering, setIsRegistering] = useState(false);

  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  const [registerEmail, setRegisterEmail] = useState('');
  const [registerPassword, setRegisterPassword] = useState('');
  const location = useLocation();

  useEffect(() => {
  const queryParams = new URLSearchParams(location.search);
  const mode = queryParams.get('mode');

  if (mode === 'register') {
    setIsRegistering(true);
  } else {
    setIsRegistering(false);
  }

  const onStorageChange = (e) => {
    if (e.key === "verified" && e.newValue) {
      localStorage.removeItem("verified");
      navigate('/');
    }
  };

  window.addEventListener("storage", onStorageChange);

  return () => {
    window.removeEventListener("storage", onStorageChange);
  };
}, [location.search, navigate]);

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
      const errorData = await response.json();
      throw new Error(errorData.message || 'Login failed');
    }

    const data = await response.json();

    const token = data?.data?.token;
    const userData = {
      id: parseInt(data?.data?.user_id),
      name: data?.data?.name,
      role: data?.data?.role
    };

    if (!token) {
      throw new Error('Login failed: token not found');
    }

    login(token, userData);
    navigate('/memberHub');
  } catch (error) {
    alert(error.message);
    console.error('Login error:', error);
  }
};

  const handleRegister = async (e) => {
    e.preventDefault();

    if (!registerEmail || !registerPassword) {
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

      const data = await response.json();
      alert(data.message);

      setIsRegistering(false);
    } catch (error) {
      alert(error.message);
      console.error('Registration error:', error);
    }
  };

  return (
    <div className="wrapper">
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
              <a href="#" onClick={(e) => {
                e.preventDefault();
                navigate('/reset-password');
              }}>
                Forgot Password?
              </a>
            </div>
            <button type="submit" className="btn">Login</button>
            <div className="register-link">
              <p>Don't have an account? <a href="#" onClick={(e) => { e.preventDefault();  navigate('/login?mode=register'); }}> Register</a></p>
            </div>
          </form>
        ) : (

          <form onSubmit={handleRegister}>
            <h1>Registration</h1>

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