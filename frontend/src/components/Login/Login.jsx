// import './Login.css';
// import { FaUser, FaLock } from "react-icons/fa";


// const Login = () => {
//   return (
//     <div className="login-page">
//       <div className="login-container">
//         <form>
//           <h1>Login</h1>
//           <div className="input-box">
//             <input type="text" placeholder="Username" required />
//             <FaUser className="icon" />
//           </div>
//           <div className="input-box">
//             <input type="password" placeholder="Password" required />
//             <FaLock className="icon" />
//           </div>

//           <div className="remember-forgot">
//             <label>
//               <input type="checkbox" />
//               Remember me
//             </label>
//             <a href="#">Forgot Password?</a>
//           </div>
//           <button type="submit" className="btn">Login</button>
//         </form>
//       </div>
//     </div>
//   );
// }

// export default Login;

import './Login.css';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaUser, FaLock } from "react-icons/fa";

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();

    if (username && password) {
      navigate('/lessons');
    } else {
      alert('Please enter both username and password.');
    }
  };

  return (
    <div className="login-page">
      <div className="login-container">
        <form onSubmit={handleSubmit}>
          <h1>Login</h1>
          <div className="input-box">
            <input
              type="text"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
            <FaUser className="icon" />
          </div>
          <div className="input-box">
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
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
        </form>
      </div>
    </div>
  );
};

export default Login;