import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Slide from '../comp/Slide.jsx';
import '../css/Home.css';
import '../css/include/Loading.css';

const Home = () => {
  const [events, setEvents] = useState([]);
  const [risingBooks, setRisingBooks] = useState([]);
  const [popularBooks, setPopularBooks] = useState([]);
  const [newBooks, setNewBooks] = useState([]);
  const [libraryCode, setLibraryCode] = useState('050001'); // 기본 도서관 코드 설정

  const [isLoading, setIsLoading] = useState(true);

  const itemsPerSlide = 5;  // 한 슬라이드당 표시할 책 개수

  // 처음에만 데이터 가져오기
  useEffect(() => {
    setIsLoading(true);

    axios.get(`${process.env.REACT_APP_SERVER}/event/list`)
      .then(response => {
        const { events } = response.data;
        setEvents(events ? events.filter(event => event.e_active === 1) : []);
        console.log('events:::', events);
      })
      .catch(error => {
        console.error('Error fetching events:', error);
      });

    axios.get(`${process.env.REACT_APP_SERVER}/home`, {
        params: {
          libraryCode: libraryCode,  // 도서관 코드
        }
      })
      .then(response => {
        const { popularBooks, newBooks, risingBooks } = response.data;
        
        // docs 배열의 'doc' 객체만 추출
        setPopularBooks(popularBooks ? popularBooks.map(item => item.doc) : []);
        setNewBooks(newBooks ? newBooks.map(item => item.doc) : []);
        setRisingBooks(risingBooks ? risingBooks.map(item => item.doc).flat() : []);
      })
      .catch(error => {
        console.error('Error:', error);
      })
      .finally(() => {
        setIsLoading(false); // 모든 데이터가 로드된 후 로딩 종료
      });

  }, [libraryCode]);  // libraryCode 변경 시, 신착 도서 다시 요청

  return (
    <article>
      <div className="home">
        <div className="content-container">
          {/* 로딩 중일 때 로딩 바 표시 */}
          {isLoading ? (
            <div className="loading-container">
              <div className="loading-circle"></div>
            </div>
          ) : (
            <>
              {/* 이벤트 섹션 */}
              <div className="event-section">
                <h4>이벤트</h4>
                <Slide items={events} itemsPerSlide={1} autoSlide={true} /> 
              </div>

              {/* 급상승 도서 섹션 */}
              <div className="book-section">
                <h4>급상승 도서</h4>
                <Slide items={risingBooks} itemsPerSlide={1} autoSlide={true} />
              </div>
            </>
          )}
        </div>

        {/* 인기 도서 섹션 */}
        {!isLoading && (
          <div>
            <h3>인기 도서</h3>
            <hr className="home-hr" />
            <Slide items={popularBooks} itemsPerSlide={itemsPerSlide} />
          </div>
        )}

        {/* 신착 도서 섹션 */}
        {!isLoading && (
          <div>
            <h3>신착 도서</h3>
            <hr className="home-hr" />
            <Slide items={newBooks} itemsPerSlide={itemsPerSlide} />
          </div>
        )}
      </div>
    </article>
  );
};

export default Home;
