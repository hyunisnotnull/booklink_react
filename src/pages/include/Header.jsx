import React, { useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom'; 
import { useJwt } from "react-jwt";
import { useCookies } from 'react-cookie'; // useCookies import
import '../../css/include/Header.css';
//import { jwtDecode } from "jwt-decode";

const Header = () => {
  const navigate = useNavigate(); 
  const [cookie, setCookie, removeCookie] =  useCookies();
  const { decodedToken, isExpired } = useJwt(cookie.token);
  // const decoded = jwtDecode(token);


  useEffect(() => {
console.log(isExpired)
  }, [isExpired, cookie.token]);
      

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    let keyword = document.getElementById('keyword').value; // 입력된 검색어 가져오기
    const searchType = document.getElementById('searchType').value; // 선택된 검색 유형 가져오기

    keyword = keyword.replace(/\s+/g, '');

    if (keyword) {
      if (searchType === 'book') {
        // 도서 검색
        navigate(`/search_book?title=${encodeURIComponent(keyword)}`);
      } else if (searchType === 'library') {
        // 도서관 검색
        navigate(`/library/search_library_name?title=${encodeURIComponent(keyword)}`);
      }

      document.getElementById('keyword').value = '';
      
    } 

  };

  const signOutClickHandler = (e) => {
    e.preventDefault();
    // props.setULoginId('');
    removeCookie('token');
    navigate('/');
  }

  return (
    <header className="header">
      <div className="header_wrap">
        <div className="logo">
          <Link to='/'>
            <h1>도서링크</h1>
          </Link>
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

    
    
          {!isExpired ?
          <>
          <Link to='/modify'>회원수정</Link>
          <Link to='#none' onClick={signOutClickHandler} >로그아웃</Link>
          </>
          :
          <>
          <Link to='/signin'>로그인</Link>
          <Link to='/signup'>회원가입</Link>
          </>
          }
        </div>
      </div>
    </header>
  );
};

export default Header;
