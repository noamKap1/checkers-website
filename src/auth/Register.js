import React, { useState } from 'react';
import './Register.css'; // Import the CSS file
import { db, auth, storage } from '../config/firebase';
import { useNavigate } from 'react-router-dom';
import { createUserWithEmailAndPassword, AuthErrorCodes } from 'firebase/auth';
import { uploadBytes, uploadString } from 'firebase/storage';
import profilePic from './profile.jpg'
import { collection, addDoc } from "firebase/firestore"; 
import { getStorage, ref } from "firebase/storage";




export default function Register() {
    const navigate = useNavigate();

    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [profilePicFile, setProfilePicFile] = useState(null); // To store the selected image file
    const [submitted, setSubmitted] = useState(false);
    const [error, setError] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');

    const handleName = (e) => {
        setName(e.target.value);
        setSubmitted(false);
    };

    const handleEmail = (e) => {
        setEmail(e.target.value);
        setSubmitted(false);
    };

    const handlePassword = (e) => {
        setPassword(e.target.value);
        setSubmitted(false);
    };
    
    const handleProfilePicChange = (e) => {
        const file = e.target.files[0]; // Get the selected file
        if (file) {
            setProfilePicFile(file); // Set the selected file to state
        }
    };

    const isEmailValid = (email) => {
        // Use a simple email validation regular expression
        const emailPattern = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i;
        return emailPattern.test(email);
    };

    const isUsernameValid = (username) => {
        // Check if username is at least 6 characters long
        return username.length >= 6;
    };

    const isPasswordValid = (password) => {
        // Use a regular expression to check for password criteria
        const passwordPattern = /^(?=.*[A-Z])(?=.*[a-zA-Z0-9]).{6,}$/;
        return passwordPattern.test(password);
    };
    const uploadFile = async () => {
        try {
            const docRef = await addDoc(collection(db, "users/data/" + email), {
              email: email,
              name: name
            });
            console.log("Document written with ID: ", docRef.id);
          } catch (e) {
            console.error("Error adding document: ", e);
          }
      };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!isEmailValid(email) || !isUsernameValid(name) || !isPasswordValid(password)) {
            setError(true);
        } else {
            try {
                await createUserWithEmailAndPassword(auth, email, password);
                await uploadFile();
                const storage = getStorage();

                const mountainsRef = ref(storage, 'image/user/' + email);
                
                // const mountainImagesRef = ref(storage, 'images/' + profilePicFile);
                uploadBytes(mountainsRef, profilePicFile).then((snapshot) => {
                    console.log('Uploaded a blob or file!');
                  });
                navigate('/');
            } catch (err) {
                setError(true);
                handleAuthError(err.code);
            }
        }
    };

    const handleAuthError = (errorCode) => {
        switch (errorCode) {
            case AuthErrorCodes.EMAIL_EXISTS:
                setErrorMessage('The email address is already in use.');
                break;
            default:
                setErrorMessage('An error occurred during registration.');
        }
    };

    const successMessage = () => {
        return (
            <div className="success" style={{ display: submitted ? '' : 'none' }}>
                <h1>User {name} successfully registered!!</h1>
            </div>
        );
    };

    const errorMessageContent = () => {
        return (
            <div className="error" style={{ display: error ? '' : 'none' }}>
                <h1>Please enter valid information:</h1>
                <ul>
                    {!isEmailValid(email) && <li>Valid email is required</li>}
                    {!isUsernameValid(name) && <li>Username must be at least 6 characters</li>}
                    {!isPasswordValid(password) && (
                        <li>Password must contain at least 1 capital letter, 6 characters, and alphanumeric characters.</li>
                    )}
                </ul>
                <p>{errorMessage}</p>
            </div>
        );
    };

    return (
        <div>
        <div className="form">
            <div>
                <h1>User Registration</h1>
            </div>

            <div className="messages">
                {errorMessageContent()}
                {successMessage()}
            </div>

            <form>
                <label className="label">Name</label>
                <input onChange={handleName} className="input" value={name} type="text" />

                <label className="label">Email</label>
                <input onChange={handleEmail} className="input" value={email} type="email" />

                <label className="label">Password</label>
                <input onChange={handlePassword} className="input" value={password} type="password" />

                <label className="label">Profile Picture</label>
                <input
                    type="file"
                    accept=".jpg, .jpeg, .png"
                    onChange={handleProfilePicChange}
                    className="input"
                />

                <button onClick={handleSubmit} className="btn" type="submit">
                    Submit
                </button>
            </form>
        </div>
        </div>
    );
}
