import { useEffect } from 'react';

const PasswordResetSuccess = () => {
  useEffect(() => {
    localStorage.setItem('passwordResetSuccess', 'true');
  }, []);

  return (
    <div className="wrapper">
      <div className="form-box">
        <h1>Password Reset Successful!</h1>
        <p>You can now log in with your new password.</p>
      </div>
    </div>
  );
};

export default PasswordResetSuccess;
