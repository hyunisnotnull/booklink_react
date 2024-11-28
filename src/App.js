import React , { useState, useEffect }  from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Header from './pages/include/Header';
import Navbar from './pages/include/Navbar';
import Footer from './pages/include/Footer';
import Home from './pages/Home';
import Signin from './pages/user/Signin';
import Signup from './pages/user/Signup';
import Modify from './pages/user/Modify';
import BookDetail from './pages/books/BookDetail';
import SearchBook from './pages/books/SearchBook';
import SearchLibrary from './pages/books/SearchLibrary';
import LibraryDetail from './pages/books/LibraryDetail';
import { useCookies } from 'react-cookie'; // useCookies import


const App = () => {

  const [uLoginId, setULoginId] = useState('');
  const [cookie, setCookie, removeCookie] =  useCookies(['token']);

  useEffect(() => {

    console.log('----- uLoginId ----', uLoginId);
    console.log('----- cokie ----', cookie);
  }, [uLoginId, cookie]);


  return (
    <Router>
      <Header cookie={cookie} removeCookie={removeCookie}/>
      <Navbar />

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/signin" element={<Signin uLoginId={uLoginId} setULoginId={setULoginId} cookie={cookie} />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/Modify" element={<Modify />} />
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