import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Slide from '../comp/Slide.jsx';
import '../css/Home.css';
import '../css/include/Loading.css';
import { useJwt } from "react-jwt";
import { useCookies } from 'react-cookie';

const Home = () => {
  const [events, setEvents] = useState([]);
  const [risingBooks, setRisingBooks] = useState([]);
  const [popularBooks, setPopularBooks] = useState([]);
  const [newBooks, setNewBooks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [wishLibraryList, setWishLibraryList] = useState([]);
  const [libraryCode, setLibraryCode] = useState('');

  const [cookie] =  useCookies();
  const { decodedToken, isExpired } = useJwt(cookie.token);

  const itemsPerSlide = 5;  // 한 슬라이드당 표시할 책 개수

  // 처음에만 데이터 가져오기
  useEffect(() => {
    setIsLoading(true);

    // 로그인 신착 도서
    if (decodedToken && !isExpired) {
      axios.post(`${process.env.REACT_APP_SERVER}/user/wishLibrarys`, {
        userId: decodedToken.userId
      })
      .then(response => {
        setWishLibraryList(response.data.wishlistLibs || []);
        
        const libraryCodes = response.data.wishlistLibs.map(library => library.l_CODE);
        console.log('찜 도서관 코드 ::', libraryCodes);

        let newBooksList = [];
        let fetchedAllBooks = false;

        const fetchNewBooksForLibrary = async () => {
          for (let i = 0; i < libraryCodes.length; i++) {
            if (fetchedAllBooks) break;

            const libraryCode = libraryCodes[i];
            try {
              const response = await axios.get(`${process.env.REACT_APP_SERVER}/book/newBooks`, {
                params: { libraryCode }
              });
              const { newBooks } = response.data;

              if (newBooks && newBooks.length > 0) {
                newBooksList = [...newBooksList, ...newBooks.map(item => item.doc)];
                if (newBooksList.length >= 10) {
                  fetchedAllBooks = true;
                }
              }
            } catch (error) {
              console.error('Error fetching new books for library code:', libraryCode, error);
            }
          }

          setNewBooks(newBooksList.slice(0, 10)); 
        };

        fetchNewBooksForLibrary();
      })
      .catch(error => {
        console.error('찜한 도서관 조회 실패:', error);
      });
    } 
    // 비로그인 신착 도서
    else {
      axios.get(`${process.env.REACT_APP_SERVER}/book/newBooks`, {
        params: { libraryCode }
      })
      .then(response => {
        const { newBooks } = response.data;
        setNewBooks(newBooks ? newBooks.map(item => item.doc) : []);
      })
      .catch(error => {
        console.error('Error fetching new books for default library:', error);
      });
    }

    // 이벤트 데이터 요청
    axios.get(`${process.env.REACT_APP_SERVER}/event/list`)
      .then(response => {
        const { events } = response.data;
        setEvents(events ? events.filter(event => event.e_active === 1) : []);
      })
      .catch(error => {
        console.error('Error fetching events:', error);
      });

    // 인기 도서 요청
    axios.get(`${process.env.REACT_APP_SERVER}/book/popularBooks`)
      .then(response => {
        const { popularBooks } = response.data;
        setPopularBooks(popularBooks ? popularBooks.map(item => item.doc) : []);
      })
      .catch(error => {
        console.error('Error fetching popular books:', error);
      });

    // 급상승 도서 요청
    axios.get(`${process.env.REACT_APP_SERVER}/book/risingBooks`)
      .then(response => {
        const { risingBooks } = response.data;
        setRisingBooks(risingBooks ? risingBooks.map(item => item.doc).flat() : []);
      })
      .catch(error => {
        console.error('Error fetching rising books:', error);
      })
      .finally(() => {
        setIsLoading(false); // 모든 데이터가 로드된 후 로딩 종료
      });

  }, [libraryCode, decodedToken, isExpired]);

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
                <Slide items={events} itemsPerSlide={1} autoSlide={true} /> 
              </div>

              {/* 급상승 도서 섹션 */}
              <div className="book-section">
                <h3 className="hot-book" >급상승 도서</h3>
                <Slide items={risingBooks} itemsPerSlide={1} autoSlide={true} />
              </div>
            </>
          )}
        </div>

        {/* 인기 도서 섹션 */}
        {!isLoading && (
          <div className='popular-book-section'>
            <h2 className='popular-book'>올해의 도서</h2>
            <hr className="home-hr" />
            <Slide items={popularBooks} itemsPerSlide={itemsPerSlide} />
          </div>
        )}

        {/* 신착 도서 섹션 */}
        {!isLoading && (
          <div className='new-book-section'>
            <h2 className='new-book'>신착 도서</h2>
            <hr className="home-hr" />
            <Slide items={newBooks} itemsPerSlide={itemsPerSlide} />
          </div>
        )}
      </div>
    </article>
  );
};

export default Home;

