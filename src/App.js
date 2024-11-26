import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Header from './comp/Header';
import Navbar from './comp/Navbar';
import Footer from './comp/Footer';
import Home from './pages/Home';
import Signin from './comp/Signin';

const App = () => {
  return (
    <Router>
      <Header />
      <Navbar />

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/signin" element={<Signin />} />
        {/* 다른 페이지를 추가하려면 여기에 Route를 추가 */}
      </Routes>

      <Footer />
    </Router>
  );
};

export default App;
