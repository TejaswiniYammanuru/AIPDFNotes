import { Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Signup from './pages/Signup';
import Login from './pages/Login';
import HomePage from './pages/HomePage';

function App() {
  return (
    <Routes>   
      <Route path="/" element={<HomePage />} />  
      <Route path="/signup" element={<Signup />} />
      <Route path="/login" element={<Login />} />          
      <Route path="/*" element={<Home />} />
    </Routes>
  );
}

export default App;
