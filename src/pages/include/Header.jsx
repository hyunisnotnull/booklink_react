import React from 'react';
import { useNavigate } from 'react-router-dom'; 

import '../../css/include/Header.css';

const Header = () => {
  const navigate = useNavigate(); 

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    const keyword = document.getElementById('keyword').value; // 입력된 검색어 가져오기
    const searchType = document.getElementById('searchType').value; // 선택된 검색 유형 가져오기

    if (keyword) {
      if (searchType === 'book') {
        // 도서 검색
        navigate(`/search_book?title=${encodeURIComponent(keyword)}`);
      } else if (searchType === 'library') {
        // 도서관 검색
        navigate(`/library/search_library_name?title=${encodeURIComponent(keyword)}`);
      }
    }
  };

  return (
    <header className="header">
      <div className="header_wrap">
        <div className="logo">
          <a href='/'>
            <h1>도서링크</h1>
          </a>
        </div>
        <form id="searchBook" onSubmit={handleSearchSubmit}>
          <select name="searchType" id="searchType">
            <option value="book">도서 검색</option>
            <option value="library">도서관 검색</option>
          </select>
          <div className="input-container">
            <input type="text" name="keyword" id="keyword" placeholder="검색어 입력" />
            <button type="submit"><span role="img" aria-label="검색">🔍</span></button>
          </div>
        </form>
        <div className="auth">
          <a href='/signin'>로그인</a>
          <a href='/signup'>회원가입</a>
        </div>
      </div>
    </header>
  );
};

export default Header;
