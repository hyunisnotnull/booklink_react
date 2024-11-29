import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import Slide from '../../comp/Slide.jsx';
import { cleanHTMLText, extractAuthors, extractTranslator } from '../../js/Textfilter.js';
import '../../css/books/BookDetail.css';
import '../../css/include/Loading.css';

const BookDetail = () => {
  const { bookID } = useParams(); // URL에서 bookID 가져오기
  const [bookDetail, setBookDetail] = useState([]);  // 도서 정보 상태 추가
  const [bookRelated, setBookRelated] = useState([]); // 주제 연관 도서 상태 추가
  const [libraries, setLibraries] = useState([]); // 주변 도서 소장 도서관 
  const [isLoggedIn, setIsLoggedIn] = useState(false); 
  const [isFavorited, setIsFavorited] = useState(false);
  const [isRead, setIsRead] = useState(false);

  const [isLoading, setIsLoading] = useState(true);
  const [isLibraryLoading, setIsLibraryLoading] = useState(true);

  // 위치 정보를 저장할 상태
  const [location, setLocation] = useState({
    latitude: null,
    longitude: null,
  });

  const itemsPerSlide = 4; // 슬라이더당 표시할 아이템 수

  useEffect(() => {
      if (location.latitude === null || location.longitude === null) {

        getLocation();
      }
      console.log('location:::', location);

      setIsLibraryLoading(true);
      setIsLoading(true);

      // 대출 가능한 도서관 정보 가져오기
      if (location.latitude !== null && location.longitude !== null) {
        axios
          .get(`${process.env.REACT_APP_SERVER}/library/loanAvailable`, {
            params: {
              bookID: bookID,
              latitude: location.latitude,
              longitude: location.longitude,
            }
          })
          .then((response) => {
            const { libraries } = response.data;
            setLibraries(libraries || []); // 대출 가능한 도서관 리스트 설정
            console.log('도서관쓰', libraries);
          })
          .catch((error) => {
            console.error('Error fetching available libraries:', error);
          })
          .finally(() => {
            setIsLibraryLoading(false); // 도서관 로딩 완료
          });
      } else {
        // 위치 정보가 없으면 도서관 정보는 빈 배열로 설정
        setLibraries([]);
        setIsLibraryLoading(false);
      }

      // 도서 상세 정보 가져오기
      axios
        .get(`${process.env.REACT_APP_SERVER}/book/detail/${bookID}`)
        .then((response) => {
          const { bookDetail, bookRelated } = response.data;
          if (bookDetail && bookDetail.detail.length > 0) {
            setBookDetail(bookDetail.detail[0].book);
          }

          setBookRelated(bookRelated ? bookRelated.map(item => item.book) : []);
        })
        .catch((error) => {
          console.error('Error fetching book details:', error);
        })
        .finally(() => {
          setIsLoading(false);
        });

  }, [bookID, location]);

  const handleFavoriteClick = () => {
    setIsFavorited(!isFavorited); // 찜하기 상태 토글
  };

  const handleReadClick = () => {
    setIsRead(!isRead); // 읽음 상태 토글
  };

  // 위치 정보 함수
  const getLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          });
        },
        (error) => {
          console.error("위치 정보 가져오기 실패", error);
        }
      );
    } else {
      console.error("Geolocation을 지원하지 않는 브라우저입니다.");
    }
  };

  return (
    <div className="book-detail-container">
      {isLoading || isLibraryLoading ? (
        <div className="loading-container">
          <div className="loading-circle"></div>
        </div>
      ) : (
        <>
          <div className="book-detail-top">
            <div className="book-image">
              <div className="book-thum">
                <img src={bookDetail.bookImageURL || "/img/defaultBook.png"} alt={bookDetail.bookname} />
              </div>
              <div className="book-actions">
                <button
                  className={`favorite-button ${isFavorited ? 'active' : ''}`}
                  onClick={handleFavoriteClick}
                >
                  {isFavorited ? '찜 취소' : '찜하기'}
                </button>
                {isLoggedIn && (
                  <button
                    className={`read-button ${isRead ? 'active' : ''}`}
                    onClick={handleReadClick}
                  >
                    {isRead ? '읽음 취소' : '읽음 표시'}
                  </button>
                )}
              </div>
            </div>
            <div className="book-info">
              <h1>{bookDetail.bookname}</h1>
              <br />
              <p>
                <strong>저자 :</strong> {extractAuthors(bookDetail.authors)}
              </p>
              {extractTranslator(bookDetail.authors) && (
                <p>
                  <strong>옮긴이 :</strong> {extractTranslator(bookDetail.authors)}
                </p>
              )}
              <p><strong>출판사 :</strong> {bookDetail.publisher}</p>
              <p><strong>출판년도 :</strong> {bookDetail.publication_year}</p>
              <p>
                <strong>주제분류 :</strong> 
                {bookDetail.class_nm && bookDetail.class_nm.includes(' >  > ') 
                  ? ' -' 
                  : ` ${bookDetail.class_nm}`}
              </p>
              <p><strong>ISBN :</strong> {bookDetail.isbn13}</p>
              <hr className="book-detail-hr" />
              <p><strong>[주변 도서 소장 도서관]</strong> </p>
              <ul>
                {libraries.length > 0 ? (
                  libraries.slice(0, 5).map((library) => (
                    <li key={library.libCode} className="loan-library">
                      <h4>{library.libName} : 
                        <span 
                          className={library.loanAvailable === 'Y' ? 'loan-available' : 'loan-unavailable'}>
                          {library.loanAvailable === 'Y' ? ' 대출 가능' : ' 대출 불가능'}
                        </span>
                      </h4>
                    </li>
                  ))
                ) : (
                  <p>대출 가능한 도서관이 없습니다.</p>
                )}
              </ul>
            </div>
          </div>
          <hr className="book-detail-bottom-hr" />
          <div className="book-description-wrap">
            <div className="book-description">
              <h2>책 소개</h2>
              <br />
              <p>{bookDetail.description ? cleanHTMLText(bookDetail.description) : '책 소개가 존재하지 않습니다.'}</p>
            </div>
          </div>
          <hr className="book-detail-bottom-hr" />
          <div className="book-related">
            <h2>연관 도서</h2>
            <br />
            <Slide items={bookRelated} itemsPerSlide={itemsPerSlide} />
          </div>
        </>
      )}
    </div>
  );
};

export default BookDetail;
