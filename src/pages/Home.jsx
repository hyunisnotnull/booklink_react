import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Slide from '../comp/Slide.jsx';
import '../css/Home.css';

const Home = () => {
  const [popularBooks, setPopularBooks] = useState([]);
  const [newBooks, setNewBooks] = useState([]);
  const [libraryCode, setLibraryCode] = useState('050001'); // 기본 도서관 코드 설정

  const itemsPerSlide = 4;  // 한 슬라이드당 표시할 책 개수

  // 처음에만 데이터 가져오기
  useEffect(() => {
    axios.get(`${process.env.REACT_APP_SERVER}/home`, {
        params: {
          libraryCode: libraryCode,  // 도서관 코드
        }
      })
      .then(response => {
        const { popularBooks, newBooks } = response.data;
        
        // 인기 도서와 신착 도서에서 docs 배열의 'doc' 객체만 추출
        setPopularBooks(popularBooks ? popularBooks.map(item => item.doc) : []);
        setNewBooks(newBooks ? newBooks.map(item => item.doc) : []);
      })
      .catch(error => {
        console.error('Error fetching popular books:', error);
      });

  }, [libraryCode]);  // libraryCode 변경 시, 신착 도서 다시 요청

  return (
    <article>
        <div className="home">
            <div>
                이벤트 & 키워드, 급상승 자리
            </div>

            <div>
                <h4>인기 도서</h4>
                <Slide items={popularBooks} itemsPerSlide={itemsPerSlide} />
            </div>

            <div>
                <h4>신착 도서</h4>
                <Slide items={newBooks} itemsPerSlide={itemsPerSlide} />
            </div>
        </div>
    </article>
  );
};

export default Home;
