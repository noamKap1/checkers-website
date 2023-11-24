import { auth, db } from '../config/firebase'
import React, { useState, useEffect, useRef } from 'react';
import { signOut, getAuth, get } from 'firebase/auth'
import { useNavigate, useLocation } from 'react-router-dom';
import './sendMessage.css'; // Import the CSS file
import { getStorage, ref, getDownloadURL } from "firebase/storage";
import { collection, addDoc, deleteDoc, doc, getDocs, query, where, onSnapshot } from 'firebase/firestore';
import AdsComponent from '../ads/AdsComponent';

const SendMessage = () => {
  const navigate = useNavigate();
  const [message, setMessage] = useState('');
  const [recEmail, setRecEmail] = useState('');
  const [isButtonDisabled, setButtonDisabled] = useState(false);
  const user = auth?.currentUser;
  const [userEmail, setUserEmail] = useState('');
  const [profilePic, setProfilePic] = useState('');
  const [id, setId] = useState('');
  const storage = getStorage();
  const location = useLocation();

  useEffect(() => {
    const userEmailY = new URLSearchParams(location.search).get('userEmail');
    const storedUserEmail = localStorage.getItem('userEmail');
    if (userEmailY !== storedUserEmail) {
      navigate('/');
    }
    deleteDocument();
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
    getDownloadURL(ref(storage, 'image/user/' + userEmail))
    .then((url) => {
    setProfilePic(url);
    })
    .catch((error) => {
    }); 
  });
  
  function showEmailNotification() {
    console.log("here");
    if (Notification.permission !== "granted") {
        Notification.requestPermission().then(function (permission) {
            if (permission === "granted") {
                new Notification("Invalid Email", {
                    body: "You entered a non-existent or wrong email."
                });
            }
        });
    } else {
        new Notification("Invalid Email", {
            body: "You entered a non-existent or wrong email."
        });
    }
};
const reset = () => {
    setMessage('');
    setRecEmail('');
};
  const uploadMessage = async () => {
    console.log(recEmail);
    if (!isEmailValid(recEmail)) {
        console.log("from here");
        showEmailNotification();
    } else {
        console.log("came");
        try {
            const docRef = await addDoc(collection(db, "messages"), {
                sender: userEmail,
                reciever: recEmail,
                text: message,
                timestamp: new Date().toISOString(),
            });
            setId(docRef.id);
            console.log(docRef.id);
            localStorage.setItem('docId', docRef.id);
        } catch (err) {
            console.error("Error adding document: ", err);
        }
        setButtonDisabled(true);
        moveToGame();
        // setTimeout(function () {
        //     console.log('This message will be shown after 1 second.');
        //     checkNotify(id);
        // }, 10000);
        //add clock or something so after 10 second cancel ready
    }
  };
  const colRef = collection(db, "notify");
  onSnapshot(colRef, (snapshot) => {
    snapshot.docs.forEach(async (docR) => {
        console.log("data mail" + docR.data().email + "my email" + userEmail);
        if(docR.data().email == userEmail){
            let idForGame = docR.id;
            const docRef = doc(db, 'notify', docR.id);
            await deleteDoc(docRef);
            localStorage.setItem('gameId', idForGame);
            localStorage.setItem('colorOfPlayer', 'LIGHT');
            localStorage.setItem('colorOfEnemy', 'DARK');
            navigate('\Checkers');        
        }
    });
  });
//   const checkNotify = async () => {
//     const q = query(collection(db, "notify"), where("email", "==", userEmail));
//     const querySnapshot = await getDocs(q);
//     var num1 = '';
//     var num2 = '';
//     let number =0;
//     querySnapshot.forEach((doc) => {
//         number++;
//         if(number==1){
//             num1=doc.id;
//             console.log("num1: " + num1 + "doc.id1" + doc.id);
//         }
//     });
//     console.log("number"+number);
//     if(number>0){
//         const docRef = doc(db, 'notify', num1);
//         await deleteDoc(docRef);
//         localStorage.setItem('colorOfPlayer', 'LIGHT');
//         localStorage.setItem('colorOfEnemy', 'DARK');

//         navigate('\Checkers');
//     }
//   }

  const moveToGame = async () => {
    const q = query(collection(db, "messages"), where("reciever", "==", userEmail));
    const querySnapshot = await getDocs(q);
    let num = 0;
    let newId = '';
    querySnapshot.forEach((doc) => {
      // doc.data() is never undefined for query doc snapshots
      console.log("doc data" + doc.data().sender + "and his room id" + doc.data().text);
      console.log("from here" + recEmail + "and his room id" + message);
      if(doc.data().sender === recEmail){
        if(message === doc.data().text){
            num=1;
            newId=doc.id;
        }
      }
    });
    console.log("my num:" + num);
    if(num==1){
        const docRef = await addDoc(collection(db, "notify"), {
            email: recEmail,
            timestamp: new Date().toISOString(),
        });
        localStorage.setItem('gameId', docRef.id);
        localStorage.setItem('colorOfPlayer', 'DARK');
        localStorage.setItem('colorOfEnemy', 'LIGHT');
        const docRefrence = await addDoc(collection(db, "game"), {
            firstPlayer: userEmail,
            secondPlayer: recEmail,
            numOfGame: docRef.id,
            timestamp: new Date().toISOString(),
        });
        navigate('\Checkers');
    }
  }

  const deleteDocument = async () => {
    try {
    const docId = localStorage.getItem('docId');
      const docRef = doc(db, 'messages', docId);
      await deleteDoc(docRef);
      console.log(`Document ${docId} successfully deleted!`);
    } catch (error) {
      console.error('Error deleting document:', error);
    }
  };
//   useEffect(async () => {
//     console.log("got to here");
//     const docId = localStorage.getItem('docId');
//     console.log(docId);
//     if (docId != '') {
//         console.log("hereeee")
//         await deleteDocument();
//     }
//   }, []);

  const logOut = async () => {
    try {
        await signOut(auth);
        navigate('/');
    } catch (err) {
        console.error(err);
    }
};
const isEmailValid = (email) => {
    // Use a simple email validation regular expression
    const emailPattern = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i;
    return emailPattern.test(email);
};
const handleRoomId = async (e) => {
    setMessage(e.target.value);
    if(isButtonDisabled){
        try {
            const docRef = doc(db, "messages", id);
            await deleteDoc(docRef);
            console.log("Document successfully deleted!");
          } catch (error) {
            console.error("Error removing document: ", error);
          }
        setButtonDisabled(false);
    }
};

const handleEmail = async (e) => {
    setRecEmail(e.target.value);
    if(isButtonDisabled){
        try {
            const docRef = doc(db, "messages", id);
            await deleteDoc(docRef);
            console.log("Document successfully deleted!");
          } catch (error) {
            console.error("Error removing document: ", error);
          }
        setButtonDisabled(false);
    }
};

  return (
    <div>
          <AdsComponent dataAdSlot='8146813325679288' />

<div className="page-container">
<span className="header">
    <div className="user-info">
        <img className="profile-pic" src={profilePic} alt="Profile Picture" />
        <p className="user-email">{userEmail}</p>
    </div>
    <button className="button-logout" onClick={logOut}>Log Out</button>
</span>
  <div className="white">Enter the same room id as your friend and his correct email to begin the match.</div>
<span>
    <input placeholder='Room id' value={message} onChange={handleRoomId}></input>
</span>
<span>
    <input placeholder='Reciever email' value={recEmail} onChange={handleEmail} type="email"></input>
</span>
<span>
    <button onClick={uploadMessage} disabled={isButtonDisabled} id="custom-button">        {isButtonDisabled ? 'You are ready' : 'You are not ready'}
</button>
</span>
</div>
    </div>
  );
};

export default SendMessage;