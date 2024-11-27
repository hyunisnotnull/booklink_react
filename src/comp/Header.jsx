import React from 'react';
import '../css/Header.css';

const Header = () => {
  return (
    <header className="header">
      <div className="logo">
        <a href='/'>
          <h1>도서링크</h1> 
        </a>
      </div>
      <div className="search">
        <input type="text" placeholder="검색어를 입력하세요." />
      </div>
      <div className="auth">
        <a href='/signin'>로그인</a>
        <a href='/signup'>회원가입</a>
      </div>
    </header>
  );
};

export default Header;
