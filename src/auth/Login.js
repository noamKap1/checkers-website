import { useState } from 'react';
import { auth, googleProvider } from '../config/firebase';
import { signInWithPopup, signInWithEmailAndPassword } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
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

    return (
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
            <p>Don't have an account? <a href="/register">Register</a>.</p>
        </div>
    );
};

export default Login;