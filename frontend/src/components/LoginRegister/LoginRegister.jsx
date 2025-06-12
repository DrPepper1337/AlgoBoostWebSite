import './LoginRegister.css';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaUser, FaLock, FaEnvelope } from "react-icons/fa";

const LoginRegister = () => {

  const navigate = useNavigate();

    const [isRegistering, setIsRegistering] = useState(false);

  const [loginUsername, setLoginUsername] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  const [registerUsername, setRegisterUsername] = useState('');
  const [registerEmail, setRegisterEmail] = useState('');
  const [registerPassword, setRegisterPassword] = useState('');

  const handleLogin = (e) => {
  e.preventDefault();
  if (loginUsername && loginPassword) {
    navigate('/lessons');
  } else {
    alert('Please enter both username and password');
  }
};

  const handleRegister = (e) => {
    e.preventDefault();
    if (registerUsername && registerEmail && registerPassword) {
      alert('Registered successfully!');
      setIsRegistering(false);
      navigate('/lessons');
    } else {
      alert('Please fill all fields');
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
              placeholder="Username"
              value={loginUsername}
              onChange={(e) => setLoginUsername(e.target.value)}
              required
            />
            <FaUser className="icon" />
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
              Remember me
            </label>
            <a href="#">Forgot Password?</a>
          </div>
          <button type="submit" className="btn">Login</button>
        <div className="register-link">
        <p>Don't hava an account? <a href="#" onClick={(e) => { e.preventDefault(); setIsRegistering(true); }}> Register</a></p>
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