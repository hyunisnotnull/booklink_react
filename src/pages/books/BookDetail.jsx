import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';

const BookDetail = () => {
  const { bookID } = useParams(); // URL에서 bookID 가져오기
  const [bookDetail, setBookDetail] = useState(null);

  // 처음에만 데이터 가져오기
  useEffect(() => {
    // bookID로 API 요청
    axios
      .get(`${process.env.REACT_APP_SERVER}/book/detail/${bookID}`)
      .then((response) => {
        const { detail } = response.data.bookDetail;

        if (detail && detail.length > 0) {
          setBookDetail(detail[0]);
        }
      })
      .catch((error) => {
        console.error('Error fetching book details:', error);
      });
  }, [bookID]);

  if (!bookDetail) {
    return <p>Loading...</p>;
  }

  return (
    <div>
      <h2>{bookDetail.bookname}</h2>
      <img src={bookDetail.bookImageURL} alt={bookDetail.bookname} />
      <p>저자: {bookDetail.authors}</p>
      <p>출판사: {bookDetail.publisher}</p>
      <p>설명: {bookDetail.description}</p>
    </div>
  );
};

export default BookDetail;