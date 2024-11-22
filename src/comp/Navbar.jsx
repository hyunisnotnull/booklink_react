import React from 'react';
import { Link } from 'react-router-dom'; 
import '../css/Navbar.css'; 

const Navbar = () => {
  return (
    <nav className="navbar">
      <ul className="nav-links">
        <li className="nav-item">
          <Link to="/search_book">도서 상세검색</Link>
        </li>
        <li className="nav-item">
          <Link to="/search_library">도서관 찾기</Link>
        </li>
        <li className="nav-item">
          <Link to="/my_library">내 서재</Link>
        </li>
      </ul>
    </nav>
  );
};

export default Navbar;
