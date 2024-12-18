import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useLocation, Link } from 'react-router-dom';
import axios from 'axios';
import Pagination from '../../comp/Pagination';
import '../../css/books/SearchLibrary.css';

const SearchLibraryByName = () => {
  const mapRef = useRef(null); // 지도 DOM 참조
  const isMapInitialized = useRef(false); // 지도 초기화 여부 추적
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const initialTitle = queryParams.get('title') || '';

  const [title, setTitle] = useState(initialTitle);
  const [region, setRegion] = useState('');
  const [searchParams, setSearchParams] = useState({
    title: initialTitle, 
    region: '' 
  });

  const [libraries, setLibraries] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [pageNo, setPageNo] = useState(1);
  const [totalCount, setTotalCount] = useState(1);
  const [map, setMap] = useState(null); // 지도 객체
  const [markers, setMarkers] = useState([]); // 마커 배열

  const regionOptions = useMemo(
    () => [
      { name: '지역', code: '' },
      { name: '서울', code: '서울특별시' },
      { name: '부산', code: '부산광역시' },
      { name: '대구', code: '대구광역시' },
      { name: '인천', code: '인천광역시' },
      { name: '광주', code: '광주광역시' },
      { name: '대전', code: '대전광역시' },
      { name: '울산', code: '울산광역시' },
      { name: '세종', code: '세종특별자치시' },
      { name: '경기', code: '경기도' },
      { name: '강원', code: '강원특별자치도' },
      { name: '충북', code: '충청북도' },
      { name: '충남', code: '충청남도' },
      { name: '전북', code: '전라북도' },
      { name: '전남', code: '전라남도' },
      { name: '경북', code: '경상북도' },
      { name: '경남', code: '경상남도' },
      { name: '제주', code: '제주특별자치도' },
    ],
    []
  );

  useEffect(() => {
    const titleFromQuery = queryParams.get('title');
    if (titleFromQuery && titleFromQuery !== title) {
      setTitle(titleFromQuery);
      setSearchParams({ title: titleFromQuery, region: '' });
      setPageNo(1);
    }
  }, [queryParams.get('title')]);

  // 검색 조건, 페이지 번호가 변경될 때 데이터 가져오기
  useEffect(() => {
    if (!searchParams.title) return;
    

    const fetchLibraries = async () => {
      setLoading(true);
      const params = { ...searchParams, pageNo };

      try {
        const response = await axios.get(
          `${process.env.REACT_APP_SERVER}/library/search_library_name`,
          { params }
        );

        const { libs, totalPages } = response.data;

        setLibraries(libs);
        setTotalCount(totalPages);
        setMessage(
          `[총 ${response.data.totalItems}건] "${searchParams.title}"에 대한 검색 결과입니다.`
        );
      } catch (error) {
        console.error('도서관 검색 오류:', error);
        setErrorMessage('입력한 정보를 다시 확인해주세요.');
      } finally {
        setLoading(false);
      }
    };

    fetchLibraries();
  }, [searchParams, pageNo]);

  // 지도 초기화
  useEffect(() => {
    if (isMapInitialized.current || !mapRef.current) return;
    console.log('지도 초기화 진행');

    const newMap = new window.Tmapv2.Map('map_div', {
      center: new window.Tmapv2.LatLng(37.5665, 126.978),
      width: '100%',
      height: '500px',
      zoom: 13,
    });
    
    isMapInitialized.current = true; // 초기화 완료 상태로 설정
    setMap(newMap);
  }, [mapRef]);

  // 지도에 마커 추가
  useEffect(() => {
    if (!map || libraries.length === 0) return;

    // 기존 마커 제거
    markers.forEach((marker) => marker.setMap(null));
    setMarkers([]);

    // 새로운 마커 추가
    const bounds = new window.Tmapv2.LatLngBounds(); // 지도 경계를 계산할 객체
    const newMarkers = libraries.map((library) => {
      const position = new window.Tmapv2.LatLng(library.l_LATITUDE, library.l_LONGITUDE);
      bounds.extend(position); // 각 위치를 경계에 추가

      const marker = new window.Tmapv2.Marker({
        position: position,
        map: map,
        title: library.l_NAME,
      });
      return marker;
    });

    setMarkers(newMarkers);

    // 모든 마커를 포함하도록 지도 경계 설정
    map.fitBounds(bounds);
  }, [map, libraries]);

  const handleSearch = async () => {
    setErrorMessage('');
    setMessage('');

    if (!title) {
      setErrorMessage('제목은 필수 입력 사항입니다.');
      return;
    }

    // 새로운 검색 파라미터 설정
    const newSearchParams = { title, region, pageNo: 1 };
    setSearchParams(newSearchParams);
    
    try {
      setLoading(true);

      const response = await axios.get(
        `${process.env.REACT_APP_SERVER}/library/search_library_name`,
        { params: newSearchParams }
      );

      const { libs, totalPages } = response.data;
      setLibraries(libs);
      setTotalCount(totalPages);
      setMessage(
        `[총 ${response.data.totalItems}건] "${searchParams.title}"에 대한 검색 결과입니다.`
      );
    } catch (error) {
      console.error('도서관 검색 오류:', error);
      setErrorMessage('입력한 정보를 다시 확인해주세요.');
    } finally {
      setLoading(false);
    }

    setTitle('');
    setRegion('');
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalCount) {
      setPageNo(newPage);
    }
  };

  // 도서관 리스트 클릭 시 지도 중심 이동
  const handleLibraryClick = (latitude, longitude) => {
    if (map) {
      map.setCenter(new window.Tmapv2.LatLng(latitude, longitude));
    }
  };

  return (
    <div className="library-search-container">
      <h1 className="library-search-title">도서관 검색</h1>
      <div className="library-search-form">
        <label>
          도서관명&nbsp;:&nbsp;
          <input
            type="text"
            value={title}
            placeholder="도서관 이름을 입력하세요"
            onChange={(e) => setTitle(e.target.value)}
          />
        </label>
      </div>
      <div className="library-search-form">
        <label>
          지역&nbsp;&nbsp;&nbsp;&nbsp;:&nbsp;
          <select value={region} onChange={(e) => setRegion(e.target.value)}>
            {regionOptions.map((option) => (
              <option key={option.code} value={option.code}>
                {option.name}
              </option>
            ))}
          </select>
        </label>
      </div>

      <button
        className="library-search-button"
        onClick={handleSearch}
        disabled={loading}
      >
        {loading ? '검색 중...' : '검색'}
      </button>

      {message && <p className="library-message">{message}</p>}
      {errorMessage && <p className="library-error-message">{errorMessage}</p>}

      <div className="search-results-container">
        {/* 검색 결과 제목 */}
        <hr />
        <br />
        <h2 className="search-results-title">도서관 검색 결과</h2>
        <hr />
        <div className="search-results-content">
          {/* 검색 결과 리스트 */}
          <div className="library-items">
            <ul>
              {libraries.map((library, index) => (
                <li key={index} className="library-item">
                  <h3
                    onClick={() => handleLibraryClick(library.l_LATITUDE, library.l_LONGITUDE)}
                    style={{ cursor: 'pointer' }}>
                  {library.l_NAME}</h3>
                  <p>주소: {library.l_ADDRESS}</p>
                  <p>전화번호: {library.l_TEL}</p>
                  <Link to={`/book/library_detail/${library.l_CODE}`}>상세 보기</Link>
                </li>
              ))}
            </ul>
          </div>

          {/* 지도 표시 */}
          <div id="map_div" ref={mapRef}></div>
        </div>
      </div>

      {/* 페이지네이션 */}
      <Pagination
        currentPage={pageNo}
        totalCount={totalCount}
        onPageChange={handlePageChange}
      />
    </div>
  );
};

export default SearchLibraryByName;
