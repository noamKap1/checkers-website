import './App.css';
import Login from "./auth/Login";
import AdsComponent from './ads/AdsComponent';

function App() {
  return (
    <div className="App">
        <AdsComponent dataAdSlot='8146813325679288' />
        <Login></Login>
    </div>
  );
}

export default App;
