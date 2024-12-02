import React, { useState, useEffect, useMemo, useRef } from 'react';
import axios from 'axios';
import Pagination from '../../comp/Pagination';
import '../../css/books/SearchLibrary.css';

const SearchLibrary = () => {
  const mapRef = useRef(null); // 지도 DOM 참조
  const isMapInitialized = useRef(false); // 지도 초기화 여부 추적
  const [title, setTitle] = useState('');
  const [isbn, setIsbn] = useState('');
  const [region, setRegion] = useState('');
  const [searchParams, setSearchParams] = useState({ title: '', isbn: '', region: '' });
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
    ],
    []
  );

  // 검색 조건, 페이지 번호가 변경될 때 데이터 가져오기
  useEffect(() => {
    if (!searchParams.title && !searchParams.isbn && !searchParams.region) return;

    const fetchLibraries = async () => {
      setLoading(true);
      const params = { ...searchParams, pageNo };

      try {
        const response = await axios.get(
          `${process.env.REACT_APP_SERVER}/book/search_library`,
          { params }
        );

        const fetchedLibraries = response.data.libraries
          ? response.data.libraries.map((item) => item.lib)
          : [];
        const total = response.data.totalCount;

        setLibraries(fetchedLibraries);
        setTotalCount(Math.ceil(total / 10));
        setMessage(
          `[총 ${total}건] "${regionOptions.find((opt) => opt.code === searchParams.region)?.name || '지역'}" 지역의 검색 결과입니다.`
        );
      } catch (error) {
        console.error('도서관 검색 오류:', error);
        setErrorMessage('입력한 정보를 다시 확인해주세요.');
      } finally {
        setLoading(false);
      }
    };

    fetchLibraries();
  }, [searchParams, pageNo, regionOptions]);

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
      const position = new window.Tmapv2.LatLng(library.latitude, library.longitude);
      bounds.extend(position); // 각 위치를 경계에 추가

      const marker = new window.Tmapv2.Marker({
        position: position,
        map: map,
        title: library.libName,
      });
      return marker;
    });

    setMarkers(newMarkers);

    // 모든 마커를 포함하도록 지도 경계 설정
    map.fitBounds(bounds);
  }, [map, libraries]);

  const handleSearch = () => {
    setErrorMessage('');
    setMessage('');

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

  // 도서관 리스트 클릭 시 지도 중심 이동
  const handleLibraryClick = (latitude, longitude) => {
    if (map) {
      map.setCenter(new window.Tmapv2.LatLng(latitude, longitude));
    }
  };

  return (
    <div className="library-search-container">
      <h1 className="library-search-title">소장 도서관 검색</h1>
      <div className="library-search-form">
        <label>
          제목&nbsp;:&nbsp;
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
        <label>
          ISBN&nbsp;:&nbsp;
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
        <label>
          지역&nbsp;:&nbsp;
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
        <h2 className="search-results-title">소장 도서관 검색 결과</h2>
        <hr />
        <div className="search-results-content">
          {/* 검색 결과 리스트 */}
          <div className="library-items">
            <ul>
              {libraries.map((library, index) => (
                <li key={index} className="library-item">
                  <h3
                    onClick={() => handleLibraryClick(library.latitude, library.longitude)}
                    style={{ cursor: 'pointer' }}>
                  {library.libName}</h3>
                  <p>주소: {library.address}</p>
                  <p>전화번호: {library.tel}</p>
                  <a href={`/book/library_detail/${library.libCode}`}>상세 보기</a>
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

export default SearchLibrary;
