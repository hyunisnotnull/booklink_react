import React, { useState, useEffect } from 'react';
import { FaHeart, FaBook, FaBookOpen } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useJwt } from "react-jwt";
import { jwtDecode } from "jwt-decode";
import { useCookies } from 'react-cookie';
import { cleanBookName, extractAuthors } from '../../js/Textfilter.js';
import '../../css/user/MyLibrary.css';
import Pagination from '../../comp/Pagination';

const MyLibrary = () => {
  const [wishList, setWishList] = useState([]);
  const [wishLibraryList, setWishLibraryList] = useState([]);
  const [newBooksForLibraries, setNewBooksForLibraries] = useState({});
  const [availableLibraries, setAvailableLibraries] = useState({});
  const [selectedTab, setSelectedTab] = useState('books');
  const [currentPage, setCurrentPage] = useState(1); 
  const [itemsPerPage] = useState(5);   

  const [cookie] =  useCookies();
  const { decodedToken, isExpired } = useJwt(cookie.token);
  const navigate = useNavigate();

  // useEffect
  useEffect(() => {

    if (isExpired || !cookie.token) {
      alert('로그인 후 내 서재를 확인할 수 있습니다.');
      return navigate('/signin');
    }

    const parseJWT = jwtDecode(cookie.token);

    const fetchWishList = axios.post(`${process.env.REACT_APP_SERVER}/user/wishBooks`, {
      userId: parseJWT.userId
    });

    const fetchWishLibraryList = axios.post(`${process.env.REACT_APP_SERVER}/user/wishLibrarys`, {
      userId: parseJWT.userId
    });

    // 비동기 요청을 동시에 처리
    Promise.all([fetchWishList, fetchWishLibraryList])
      .then(([wishBooksResponse, wishLibrariesResponse]) => {
        setWishList(wishBooksResponse.data.wishlistBooks || []);
        setWishLibraryList(wishLibrariesResponse.data.wishlistLibs || []);

        // 모든 찜 도서관에 대해 신착 도서 요청
        const newBooksRequests = wishLibrariesResponse.data.wishlistLibs.map(async library => {
          const response = await axios.get(`${process.env.REACT_APP_SERVER}/book/newBooks`, {
            params: { libraryCode: library.l_CODE }
          });
          const { newBooks } = response.data;
          return {
            libraryCode: library.l_CODE,
            newBooks: newBooks ? newBooks.map(item => item.doc) : []
          };
        });

        // 신착 도서가 모두 완료된 후에 상태 업데이트
        Promise.all(newBooksRequests)
          .then(newBooksData => {
            const newBooksForLibrariesObj = newBooksData.reduce((acc, { libraryCode, newBooks }) => {
              acc[libraryCode] = newBooks;
              return acc;
            }, {});
            setNewBooksForLibraries(newBooksForLibrariesObj);
          })
          .catch(error => {
            console.error('Error fetching new books for libraries:', error);
          });
      })
      .catch(error => {
        console.error('찜목록 조회 실패:', error);
        alert('찜목록을 불러오는 데 실패했습니다.');
      });

  }, [isExpired, cookie.token]);

  // 대출 가능한 도서관 확인
  const fetchAvailableLibraries = async (isbn13) => {
    if (availableLibraries[isbn13]) return; // 이미 해당 isbn13에 대한 도서관 정보가 있으면 중복 요청 방지
  
    try {
      const libraries = await Promise.all(
        wishLibraryList.map(async (library) => {
          const response = await axios.get(`${process.env.REACT_APP_SERVER}/library/loanAvailable`, {
            params: { bookID: isbn13, libraryCode: library.l_CODE, libraryName: library.l_NAME }
          });
  
          const { libCode, libName } = response.data; // 서버에서 반환한 도서관 정보
  
          if (libCode && libName) {
            return { libCode, libName };
          } else {
            return null; // 대출 가능한 도서관이 아니면 null 반환
          }
        })
      );
  
      // null 제외한 도서관들만 필터링하여 상태 업데이트
      const availableLibrariesForBook = libraries.filter(library => library !== null);
      setAvailableLibraries(prevState => ({
        ...prevState,
        [isbn13]: availableLibrariesForBook
      }));
    } catch (error) {
      alert('대출 가능한 도서관 조회에 실패 했습니다.');
      console.log(error)
    }
  };

  // 대출 가능 도서관 옵션 선택시 이동 함수
  const handleLibrarySelection = (event) => {
    const selectedLibraryCode = event.target.value; // 선택한 도서관의 libCode
    if (selectedLibraryCode) {
      window.location.href = `/book/library_detail/${selectedLibraryCode}`;
    }
  };


  // 찜목록에서 특정 책을 취소하는 함수
  const handleCancelFavorite = (isbn13) => {
    const confirmCancel = window.confirm("정말 도서를 삭제 하시겠습니까?");

    if (confirmCancel) {
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
    } else {
      alert("내 도서 삭제를 취소했습니다.");
    }
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

  // 찜목록에서 특정 도서관을 취소하는 함수
  const handleCancelLibrary = (l_CODE) => {
    const confirmCancel = window.confirm("정말 도서관을 삭제 하시겠습니까?");
    if(confirmCancel) {

      axios.delete(`${process.env.REACT_APP_SERVER}/user/cancleWishLib`, {
        data: { ML_U_ID: decodedToken.userId, ML_L_CODE: l_CODE }
      })
      .then(response => {
        alert(response.data.message);
        setWishLibraryList(prevState => prevState.filter(library => library.l_CODE !== l_CODE));
      })
      .catch(error => {
        alert('내 도서관 삭제에 실패했습니다.');
        console.error(error);
      });
    } else {
      alert("내 도서관 삭제를 취소했습니다.");
    }
  };

  // 페이지 변경 시 호출되는 함수
  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  // 현재 페이지에 해당하는 책만 필터링
  const indexOfLastBook = currentPage * itemsPerPage;
  const indexOfFirstBook = indexOfLastBook - itemsPerPage;
  const currentBooks = wishList.slice(indexOfFirstBook, indexOfLastBook);

  // 현재 페이지에 해당하는 도서관만 필터링
  const indexOfLastLibrary = currentPage * itemsPerPage;
  const indexOfFirstLibrary = indexOfLastLibrary - itemsPerPage;
  const currentLibraries = wishLibraryList.slice(indexOfFirstLibrary, indexOfLastLibrary);

  return (
    <div className="wishlist-container">
    <div className="wishlist">
      <h1 className="wishlist-title">내 서재</h1>
      <hr className='MyLib-hr'/>
      
      <div className="tab-buttons">
      {/* 탭 버튼 */}
        <button 
          className={`tab-button ${selectedTab === 'books' ? 'active' : ''}`}
          onClick={() => setSelectedTab('books')}
        >
          도서
        </button>
        <button 
          className={`tab-button ${selectedTab === 'libraries' ? 'active' : ''}`}
          onClick={() => setSelectedTab('libraries')}
        >
          도서관
        </button>
      </div>

      {/* 탭 내용 */}
      {selectedTab === 'books' ? (
        <div>
          {wishList.length > 0 ? (
            <>
              <table className="wishlist-table">
                <thead>
                  <tr>
                    <th>이미지</th>
                    <th>제목</th>
                    <th>저자</th>
                    <th>출판사</th>
                    <th>대출 가능 도서관</th>
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
                          {cleanBookName(book.W_NAME)}
                        </a>
                      </td>
                      <td>{extractAuthors(book.W_AUTHORS)}</td>
                      <td>{book.W_PUBLISHER}</td>
                      <td>
                        <select className="loan-select" onClick={() => fetchAvailableLibraries(book.W_ISBN13)} onChange={(e) => handleLibrarySelection(e)}>
                          <option value="">대출 가능 도서관</option>
                          {availableLibraries[book.W_ISBN13] && availableLibraries[book.W_ISBN13].length > 0 ? (
                            availableLibraries[book.W_ISBN13].map(library => (
                              <option key={library.libCode} value={library.libCode}>
                                {library.libName}
                              </option>
                            ))
                          ) : (
                            <option value="">없음</option>
                          )}
                        </select>
                      </td>
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
      ) : (
        <div>
          {wishLibraryList.length > 0 ? (
            <>
              <table className="wishlist-table">
                <thead>
                  <tr>
                    <th>도서관명</th>
                    <th>위치</th>
                    <th>전화번호</th>
                    <th>신착 도서</th>
                    <th>찜 취소</th>
                  </tr>
                </thead>
                <tbody>
                  {currentLibraries.map((library) => (
                    <tr key={library.l_CODE}>
                      <td>
                        <a href={`/book/library_detail/${library.l_CODE}`}>
                          {library.l_NAME}
                        </a>
                      </td>
                      <td>{library.l_ADDRESS}</td>
                      <td>{library.l_TEL}</td>
                      <td>
                        <a href={`/book/library_detail/${library.l_CODE}`}>
                          {newBooksForLibraries[library.l_CODE] && newBooksForLibraries[library.l_CODE].length > 0 ? (
                              <FaBookOpen className="new-books-icon" />
                            ) : (
                              <FaBook className="new-books-icon-no" />
                            )}
                        </a>
                      </td>
                      <td>
                        <button 
                          className="cancel-button" 
                          onClick={() => handleCancelLibrary(library.l_CODE)}
                        >
                          <FaHeart />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {/* <Pagination 
                currentPage={currentPage} 
                totalCount={Math.ceil(wishLibraryList.length / itemsPerPage)} 
                onPageChange={handlePageChange}
              /> */}
            </>
          ) : (
            <p className="no-items">찜한 도서관이 없습니다.</p>
          )}
        </div>
      )}
    </div>
  </div>
  );
};

export default MyLibrary;
