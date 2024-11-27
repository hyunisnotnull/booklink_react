import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import Slide from '../../comp/Slide.jsx';
import { cleanHTMLText, cleanBookName, extractAuthors, extractTranslator } from '../../js/Textfilter.js';
import '../../css/books/BookDetail.css';
import '../../css/Slide.css';

const LibraryDetail = () => {
  const { libCode } = useParams(); // URL에서 libCode 가져오기
  const [libDetail, setLibDetail] = useState([]);  // 도서관 정보 상태 추가
  const [newArrivalBook, setNewArrivalBook] = useState([]); // 도서관 신착 도서 상태 추가

  const itemsPerSlide = 4; // 슬라이더당 표시할 아이템 수

  useEffect(() => {
    // 도서관 정보 가져오기
    axios
      .get(`${process.env.REACT_APP_SERVER}/book/library_detail/${libCode}`)
      .then((response) => {
        const { libDetail, newArrivalBook } = response.data;
        console.log('1',libDetail.libs.length);

        console.log('2',newArrivalBook);

        if (libDetail && libDetail.libs.length > 0) {
          console.log('hi');
          setLibDetail(libDetail.libs[0].lib);
        }
        console.log('222',libDetail);

        setNewArrivalBook(newArrivalBook ? newArrivalBook.map(item => item.doc) : []);

        console.log('3',newArrivalBook);
      })
      .catch((error) => {
        console.error('Error fetching libs details:', error);
      });

  }, [libCode]);

  if (!libDetail || Object.keys(libDetail).length === 0) {
    return <p>Loading...</p>;
  }

  return (
    <div className="book-detail-container">
      <div className="book-detail-top">
        <div className="book-image">
          <div className="book-thum">
            <img src={libDetail.bookImageURL} alt={libDetail.bookname} />
          </div>
        </div>
        <div className="book-info">
          <h1>{libDetail.libName}</h1>
          <br />
          <p><strong>주소:</strong> {libDetail.address}</p>
          <p><strong>전화번호:</strong> {libDetail.tel}</p>
          <p><strong>홈페이지 URL:</strong> {libDetail.homepage}</p>
          <p><strong>휴관일:</strong> {libDetail.closed}</p>
          <p><strong>운영시간:</strong> {libDetail.operatingTime}</p>
          <hr />
          <p><strong>소장한 도서의 권수:</strong> {libDetail.BookCount}권</p>
        </div>
      </div>
      <hr />
      <div className="book-description-wrap">
        <div className="book-description">
          <h2>길찾기</h2>
          <br />
          <p></p>
        </div>
      </div>
      <hr />
      <div className="book-related">
        <h2>신착 도서</h2>
        <br />
        <Slide items={newArrivalBook} itemsPerSlide={itemsPerSlide} />
      </div>
    </div>
  );
};

export default LibraryDetail;
