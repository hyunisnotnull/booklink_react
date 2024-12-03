import React, { useState, useEffect } from 'react';
import { FaHeart, FaBook, FaBookOpen } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useJwt } from "react-jwt";
import { jwtDecode } from "jwt-decode";
import { useCookies } from 'react-cookie';
import '../../css/user/MyLibrary.css';
import Pagination from '../../comp/Pagination';

const MyLibrary = () => {
  const [wishList, setWishList] = useState([]); 
  const [currentPage, setCurrentPage] = useState(1); 
  const [itemsPerPage] = useState(5);   

  const [cookie] =  useCookies();
  const { decodedToken, isExpired } = useJwt(cookie.token);
  const navigate = useNavigate();

  // useEffect
  useEffect(() => {
    console.log('cookie.token:', cookie.token);
    console.log('decodedToken:', decodedToken);
    console.log('isExpired:', isExpired);

    if (isExpired || !cookie.token) {
      alert('로그인 후 내 서재를 확인할 수 있습니다.');
      return navigate('/signin');
    }

    const parseJWT = jwtDecode(cookie.token);
    console.log('jwtDecode:', parseJWT);

    axios.post(`${process.env.REACT_APP_SERVER}/user/wishBooks`, {
      userId: parseJWT.userId
    })
      .then(response => {
        setWishList(response.data.wishlistBooks || []);
      })
      .catch(error => {
        console.error('찜목록 조회 실패:', error);
        alert('찜목록을 불러오는 데 실패했습니다.');
      });

  }, [isExpired, cookie.token]);

  // 찜목록에서 특정 책을 취소하는 함수
  const handleCancelFavorite = (isbn13) => {
    axios.delete(`${process.env.REACT_APP_SERVER}/user/cancleWishBook`, {
      data: { W_U_ID: decodedToken.userId, W_ISBN13: isbn13 }
    })
      .then(response => {
        alert(response.data.message);
        setWishList(prevState => prevState.filter(book => book.W_ISBN13 !== isbn13)); // 상태에서 해당 도서 삭제
      })
      .catch(error => {
        alert('찜 취소 실패');
        console.error(error);
      });
  };

  // 찜목록에서 특정 책 읽음/읽지 않음 처리
  const handleReadBook = (isbn13, currentStatus) => {
    const newStatus = currentStatus === 0 ? 1 : 0; // 읽지 않음은 0, 읽음은 1

    console.log('read?::', newStatus)

    axios.put(`${process.env.REACT_APP_SERVER}/user/readWishBook`, {
      W_U_ID: decodedToken.userId,
      W_ISBN13: isbn13,
      W_B_READ: newStatus
    })
      .then(response => {
        alert(response.data.message);
        setWishList(prevState =>
          prevState.map(book =>
            book.W_ISBN13 === isbn13 ? { ...book, W_B_READ: newStatus } : book
          )
        );
      })
      .catch(error => {
        alert('읽음 처리 실패');
        console.error(error);
      });
  };

  // 페이지 변경 시 호출되는 함수
  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  // 현재 페이지에 해당하는 책만 필터링
  const indexOfLastBook = currentPage * itemsPerPage;
  const indexOfFirstBook = indexOfLastBook - itemsPerPage;
  const currentBooks = wishList.slice(indexOfFirstBook, indexOfLastBook);

  return (
      <div className="wishlist-container">
        <div className="wishlist">
          <h1 className="wishlist-title">내 서재</h1>
          {wishList.length > 0 ? (
            <>
            <table className="wishlist-table">
              <thead>
                <tr>
                  <th>이미지</th>
                  <th>제목</th>
                  <th>저자</th>
                  <th>출판사</th>
                  <th>독서</th>
                  <th>찜 취소</th>
                </tr>
              </thead>
              <tbody>
                {currentBooks.map((book) => (
                  <tr key={book.W_ISBN13}>
                    <td>
                    <a href={`/book/detail/${book.W_ISBN13}`}>
                      <img 
                          src={book.W_BOOKIMAGEURL || "/img/defaultBook.png"} 
                          alt={book.W_NAME} 
                          className="wish-book-image"
                          />
                    </a>
                    </td>
                    <td>
                      <a href={`/book/detail/${book.W_ISBN13}`}>
                        {book.W_NAME}
                      </a>
                    </td>
                    <td>{book.W_AUTHORS}</td>
                    <td>{book.W_PUBLISHER}</td>
                    <td>
                      <button 
                        className="read-button" 
                        onClick={() => handleReadBook(book.W_ISBN13, book.W_B_READ)}
                      >
                        {book.W_B_READ === 0 ? <FaBook /> : <FaBookOpen />}
                      </button>
                    </td>
                    <td>
                      <button 
                        className="cancel-button" 
                        onClick={() => handleCancelFavorite(book.W_ISBN13)}
                      >
                        <FaHeart />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <Pagination 
                currentPage={currentPage} 
                totalCount={Math.ceil(wishList.length / itemsPerPage)} 
                onPageChange={handlePageChange}
              />
            </>
          ) : (
            <p className="no-items">찜한 도서가 없습니다.</p>
          )}
        </div>
    </div>
  );
};

export default MyLibrary;
