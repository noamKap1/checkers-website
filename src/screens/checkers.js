import './checkers.css';
import { auth } from '../config/firebase'
import React, { useState, useEffect, useRef } from 'react';
import { signOut } from 'firebase/auth'
import { useNavigate, useLocation } from 'react-router-dom';
import { getStorage, ref, getDownloadURL } from "firebase/storage";
import CheckersGame from './playCheckers/ChekcersGame';

const Checkers = () => {
  const navigate = useNavigate();
  const user = auth?.currentUser;
  const [userEmail, setUserEmail] = useState('');
  const [profilePic, setProfilePic] = useState('');
  const storage = getStorage();
  const location = useLocation();
  const refrence = useRef();

  useEffect(() => {

    const game = new CheckersGame(refrence.current, {
        rows: 8,
        cols: 8,
        fillRows:3,
        nav: navigate,
    });
    game.startGameSnapshot();

    return () => game.clear();
    
  }, []);

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

  return (
<div>
    <div className="page-container">
      <span className="header">
        <div className="user-info">
          <img className="profile-pic" src={profilePic} alt="Profile Picture" />
          <p className="user-email">{userEmail}</p>
        </div>
        <button className="button-logout" onClick={logOut}>Log Out</button>
      </span>
        <div className='checkers-wrapper' ref={refrence}></div>
    </div>
</div>
    
  );
};
export default Checkers;


