import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Header from './pages/include/Header';
import Navbar from './pages/include/Navbar';
import Footer from './pages/include/Footer';
import Home from './pages/Home';
import Signin from './pages/user/Signin';
import Signup from './pages/user/Signup';
import BookDetail from './pages/books/BookDetail';
import SearchBook from './pages/books/SearchBook';
import SearchLibrary from './pages/books/SearchLibrary';
import LibraryDetail from './pages/books/LibraryDetail';


const App = () => {
  return (
    <Router>
      <Header />
      <Navbar />

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/signin" element={<Signin />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/search_book" element={<SearchBook />} />
        <Route path="/search_library" element={<SearchLibrary />} />
        <Route path="/book/detail/:bookID" element={<BookDetail />} />
        <Route path="/book/library_detail/:libCode" element={<LibraryDetail />} />
        {/* 다른 페이지를 추가하려면 여기에 Route를 추가 */}
      </Routes>

      <Footer />
    </Router>
  );
};

export default App;