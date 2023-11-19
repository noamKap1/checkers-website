import { auth } from '../config/firebase'
import React, { useState, useEffect } from 'react';
import { signOut } from 'firebase/auth'
import { useNavigate, useLocation } from 'react-router-dom';
import checkers from './checkers.jpg'
import backgammon from './backgammon.jpg'
import './openingScreen.css'; 
import { getStorage, ref, getDownloadURL } from "firebase/storage";

const OpeningScreen = () => {
  const navigate = useNavigate();
  const user = auth?.currentUser;
  const [userEmail, setUserEmail] = useState('');
  const [profilePic, setProfilePic] = useState('');
  const storage = getStorage();
  const location = useLocation();

  useEffect(() => {
    const userEmailY = new URLSearchParams(location.search).get('userEmail');
    const storedUserEmail = localStorage.getItem('userEmail');
    console.log("user:" + userEmailY + ", game:" + storedUserEmail);
    if (userEmailY !== storedUserEmail) {
      navigate('/');
    }
  }, [location, navigate]);

  useEffect(() => {
    const userEmailParam = new URLSearchParams(location.search).get('userEmail');
    if (userEmailParam) {
      setUserEmail(userEmailParam);
    } else if (user) {
      setUserEmail(user.email);
      navigate(`?userEmail=${user.email}`);
    }
  }, [user, location.search]);
  
  useEffect(() => {
  }, [navigate]);

  useEffect(() => {
    console.log(userEmail);
    console.log('here')
    getDownloadURL(ref(storage, 'image/user/' + userEmail))
    .then((url) => {
    setProfilePic(url);
    console.log(url);
    })
    .catch((error) => {
    }); 
  });
  console.log(userEmail);

  const logOut = async () => {
    try {
        await signOut(auth);
        navigate('/');
    } catch (err) {
        console.error(err);
    }
};
const playCheckers = () => {
  navigate('/send');
};

  return (
    <div className="page-container">
      <span className="header">
        <div className="user-info">
          <img className="profile-pic" src={profilePic} alt="Profile Picture" />
          <p className="user-email">{userEmail}</p>
        </div>
        <button className="button-logout" onClick={logOut}>Log Out</button>
      </span>
      <div className="game-instructions">
        Please pick a game to play
      </div>
      <div className="game-buttons">
        {/* <div className="game-button-container">
          <button className="game-button">
            <p>Backgammon</p>
            <img src={backgammon} alt="Backgammon" />
          </button>
        </div> */}
        <div className="game-button-container">
          <button className="game-button" onClick={playCheckers}>
            <p>Checkers</p>
            <img src={checkers} alt="Checkers" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default OpeningScreen;