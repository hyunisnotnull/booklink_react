import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
<<<<<<< Updated upstream:src/pages/BookDetail.jsx
import '../css/Home.css';
=======
import Slide from '../../comp/Slide.jsx';
import '../../css/BookDetail.css';
import '../../css/Home.css';
>>>>>>> Stashed changes:src/pages/books/BookDetail.jsx

const BookDetail = () => {
  const { bookID } = useParams(); // URL에서 bookID 가져오기
  const [bookDetail, setBookDetail] = useState([]);  // 도서 정보 상태 추가
  const [bookRelated, setBookRelated] = useState([]); // 주제 연관 도서 상태 추가
  const [isLoggedIn, setIsLoggedIn] = useState(false); 
  const [isFavorited, setIsFavorited] = useState(false);
  const [isRead, setIsRead] = useState(false);

  const itemsPerSlide = 4; // 슬라이더당 표시할 아이템 수

  useEffect(() => {
    // 도서 정보 가져오기
    axios
      .get(`${process.env.REACT_APP_SERVER}/book/detail/${bookID}`)
      .then((response) => {
        const { bookDetail, bookRelated } = response.data;
        console.log('1',bookDetail.detail.length);

        console.log('2',bookRelated);

        if (bookDetail && bookDetail.detail.length > 0) {
          console.log('hi');
          setBookDetail(bookDetail.detail[0].book);
        }
        console.log('222',bookDetail);

        setBookRelated(bookRelated ? bookRelated.map(item => item.book) : []);

        console.log('3',bookRelated);
      })
      .catch((error) => {
        console.error('Error fetching book details:', error);
      });

    // 로그인 여부 확인 (예: 토큰 존재 여부로 확인)
    const token = localStorage.getItem('token');
    if (token) {
      setIsLoggedIn(true);
    }
  }, [bookID]);

  const handleFavoriteClick = () => {
    
    setIsFavorited(!isFavorited); // 찜하기 상태 토글
  };

  const handleReadClick = () => {
    
    setIsRead(!isRead); // 읽음 상태 토글
  };

  // if (!bookDetail || Object.keys(bookDetail).length === 0) {
  //   return <p>Loading...</p>;
  // }

  return (
    <div className="book-detail-container">
      <div className="book-detail-top">
        <div className="book-image">
          <img src={bookDetail.bookImageURL} alt={bookDetail.bookname} />
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
          <h2>{bookDetail.bookname}</h2>
          <p>
            <strong>저자:</strong>{' '}
            {bookDetail.authors?.replace(/^(저자:|지은이:)\s*/, '')}
          </p>
          <p><strong>출판사:</strong> {bookDetail.publisher}</p>
          <p><strong>출판년도:</strong> {bookDetail.publication_year}</p>
          <p><strong>주제분류:</strong> {bookDetail.class_nm}</p>
          <p><strong>ISBN:</strong> {bookDetail.isbn13}</p>
          <hr />
          <p><strong>도서관:</strong> </p>
        </div>
      </div>
      <hr />
      <div className="book-description">
        <h3>책 설명</h3>
        <p>{bookDetail.description}</p>
      </div>
      <hr />
      <div className="nonon">
        <h3>주제 연관 도서</h3>
        <Slide items={bookRelated} itemsPerSlide={itemsPerSlide} />
      </div>
    </div>
  );
};

export default BookDetail;
