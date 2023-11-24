import { useState } from 'react';
import { auth, googleProvider } from '../config/firebase';
import { signInWithPopup, signInWithEmailAndPassword } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import welcomePic from './welcome.png'
import AdsComponent from '../ads/AdsComponent';

import './Login.css'; // Import the CSS file

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState(null); // State for login errors
    const navigate = useNavigate();
    const [fileUpload, setFileUpload] = useState(null);
    const signIn = async () => {
        try {
            await signInWithEmailAndPassword(auth, email, password);
            localStorage.setItem('userEmail', email);
            navigate('/openingScreen');
        } catch (err) {
            reset();
            setError('Invalid email or password. Please try again.'); // Set the error message
        }
    };
    const reset = () => {
        setEmail('');
        setPassword('');
    };
    const signInWithGoogle = async () => {
        try {
            await signInWithPopup(auth, googleProvider);
            navigate('/openingScreen');
        } catch (err) {
            reset();
            setError('Google Sign-In failed. Please try again.'); // Set the error message
        }
    };
    const handleRegisterClick = () => {
        navigate('/register');
      };
    return (
        <div>
            <AdsComponent dataAdSlot='8146813325679288' />
            <img className="welcome-pic" src={welcomePic} alt="Welcome Picture" />
            <div className="login-container">
            {error && <p className="error-message">{error}</p>} {/* Display error message if error is set */}
            <input placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
            <input placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} type="password" />
            <button onClick={signIn}>Sign In</button>
            {/* <div className="button-container">
                <button onClick={signInWithGoogle} className="google-button">
                    Sign In With Google
                </button>
            </div> */}
            <p>
                Don't have an account? <span
                onClick={handleRegisterClick}
                style={{ color: 'blue', textDecoration: 'underline', cursor: 'pointer' }}
                >
                Register
                </span>.
            </p>
        </div>
        </div>
    );
};

export default Login;
