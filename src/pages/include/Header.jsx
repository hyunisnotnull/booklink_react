import React, {useEffect} from 'react';
import { useNavigate } from 'react-router-dom'; 
import { useJwt } from "react-jwt";

import '../../css/include/Header.css';

const Header = (props) => {
  const navigate = useNavigate(); 
  const { decodedToken, isExpired } = useJwt(props.cookie.token);

  useEffect(() => {

    console.log('----- uLoginId  header ----', props.uLoginId);
    console.log('----- cokie  header ----', props.cookie);
  }, [props.uLoginId, props.cookie, props.removeCookie] );

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    const keyword = document.getElementById('keyword').value; // 입력된 검색어 가져오기
    if (keyword) {
      navigate(`/search_book?title=${encodeURIComponent(keyword)}`); // search_book 페이지로 이동하면서 검색어 전달
    }
  };

  const signOutClickHandler = (e) => {
    e.preventDefault();
    // props.setULoginId('');
    props.removeCookie('token');
    navigate('/');
  }

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
    
          {!isExpired ?
          <>
          <a href='/modify'>회원수정</a>
          <a href='#none' onClick={signOutClickHandler} >로그아웃</a>
          </>
          :
          <></>
          }
        </div>
      </div>
    </header>
  );
};

export default Header;
