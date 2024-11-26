import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import Pagination from '../../comp/Pagination';
import '../../css/books/SearchLibrary.css';

const SearchLibrary = () => {

  const {Tmapv2} = window;

  // 입력 필드 상태
  const [title, setTitle] = useState('');
  const [isbn, setIsbn] = useState('');
  const [region, setRegion] = useState('');

  // 검색 버튼 클릭 시 업데이트)
  const [searchParams, setSearchParams] = useState({
    title: title,
    isbn: '',
    region: '',
  });

  // 검색 결과 상태
  const [libraries, setLibraries] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [pageNo, setPageNo] = useState(1);
  const [totalCount, setTotalCount] = useState(1);

  const regionOptions = useMemo(() => [
    { name: '지역', code: '' },
    { name: '서울', code: '11' },
    { name: '부산', code: '21' },
    { name: '대구', code: '22' },
    { name: '인천', code: '23' },
    { name: '광주', code: '24' },
    { name: '대전', code: '25' },
    { name: '울산', code: '26' },
    { name: '세종', code: '29' },
    { name: '경기', code: '31' },
    { name: '강원', code: '32' },
    { name: '충북', code: '33' },
    { name: '충남', code: '34' },
    { name: '전북', code: '35' },
    { name: '경북', code: '37' },
    { name: '경남', code: '38' },
    { name: '제주', code: '39' },
  ], []);

  // 검색 조건, 페이지 번호가 변경되면 데이터를 가져옴
  useEffect(() => {
    if (!searchParams.title && !searchParams.isbn && !searchParams.region) return;

    const fetchLibraries = async () => {
      setLoading(true);
      const params = { ...searchParams, pageNo };

      try {
        const response = await axios.get(`${process.env.REACT_APP_SERVER}/book/search_library`, { params });

        const fetchLibraries = response.data.libraries ? response.data.libraries.map(item => item.lib) : [];
        const total = response.data.totalCount;

        setLibraries(fetchLibraries);
        setTotalCount(Math.ceil(total / 10));
        setMessage(`[총 ${total}건] "${regionOptions.find(opt => opt.code === searchParams.region)?.name || '지역'}" 지역의 검색 결과입니다.`);
      
      } catch (error) {
        console.error('도서관 검색 오류:', error);
        setErrorMessage('입력한 정보를 다시 확인해주세요.');
      
      } finally {
        setLoading(false);
      }
    };

    fetchLibraries();
  }, [searchParams, pageNo, regionOptions]);  

  const handleSearch = () => {
    setErrorMessage('');
    setMessage('');

    // 입력 검증: title 또는 isbn 중 하나만 입력 가능
    if (!region) {
      setErrorMessage('지역을 선택해야 합니다.');
      return;
    }
    if ((title && isbn) || (!title && !isbn)) {
      setErrorMessage('도서 제목 또는 ISBN 중 하나만 입력해야 합니다.');
      return;
    }

    setSearchParams({ title, isbn, region });
    setPageNo(1);
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalCount) {
      setPageNo(newPage);
    }
  };

  return (
    <div className="library-search-container">
      <h1 className="library-search-title">도서관 검색</h1>
      <div className="library-search-form">
        <label>제목&nbsp;:&nbsp;
          <input
            type="text"
            value={title}
            placeholder="도서 제목을 입력하세요"
            onChange={(e) => setTitle(e.target.value)}
            disabled={isbn !== ''} // ISBN 입력 시 비활성화
          />
        </label>
      </div>
      <div className="library-search-form">
        <label>ISBN&nbsp;:&nbsp;
          <input
            type="text"
            value={isbn}
            placeholder="ISBN을 입력하세요"
            onChange={(e) => setIsbn(e.target.value)}
            disabled={title !== ''} // 제목 입력 시 비활성화
          />
        </label>
      </div>
      <div className="library-search-form">
        <label>지역&nbsp;:&nbsp;
          <select value={region} onChange={(e) => setRegion(e.target.value)}>
            {regionOptions.map((option) => (
              <option key={option.code} value={option.code}>
                {option.name}
              </option>
            ))}
          </select>
        </label>
      </div>

      <button className="library-search-button" onClick={handleSearch} disabled={loading}>
        {loading ? '검색 중...' : '검색'}
      </button>

      {/* 메시지 출력 */}
      {message && <p className="library-message">{message}</p>}
      {errorMessage && <p className="library-error-message">{errorMessage}</p>}

      {/* 검색 결과 */}
      <div className="search-results-container">
        <hr />
        <br />
        <h2 className="search-results-title">도서관 검색 결과</h2>
        <hr />
        <ul className="library-items">
          {libraries.map((library, index) => (
            <li key={index} className="library-item">
              <h3>{library.libName}</h3>
              <p>주소: {library.address}</p>
              <p>전화번호: {library.tel}</p>
              <p>상세보기: {library.homepage}</p>
            </li>
          ))}
        </ul>
      </div>

      <Pagination
        currentPage={pageNo}
        totalCount={totalCount}
        onPageChange={handlePageChange}
      />
    </div>
  );
};

export default SearchLibrary;
