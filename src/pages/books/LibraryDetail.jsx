import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Slide from '../../comp/Slide.jsx';
import '../../css/books/LibraryDetail.css';
import '../../css/include/Slide.css';
import { FaHeart, FaRegHeart } from 'react-icons/fa';
import { useJwt } from "react-jwt";
import { useCookies } from 'react-cookie';

const LibraryDetail = () => {
  const { libCode } = useParams(); // URL에서 libCode 가져오기
  const [libDetail, setLibDetail] = useState([]);  // 도서관 정보 상태 추가
  const [newBooks, setNewBooks] = useState([]); // 도서관 신착 도서 상태 추가
  const mapRef = useRef(null); // 지도 DOM 참조
  const isMapInitialized = useRef(false); // 지도 초기화 여부 추적
  const [map, setMap] = useState(null); // 지도 객체
  const [markers, setMarkers] = useState([]); // 마커 배열
  const [startMarker, setStartMarker] = useState(null); // 출발지 마커 상태 추가
  const [startAddress, setStartAddress] = useState(''); // 출발지 입력 상태
  const [searchResults, setSearchResults] = useState([]); // 실시간 검색 결과 상태
  const [startCoordinates, setStartCoordinates] = useState(null); // 출발지 좌표
  const [routeLine, setRouteLine] = useState(null); // 경로 라인 상태
  const [routeInfo, setRouteInfo] = useState({ distance: null, time: null }); // 경로 정보 상태 추가
  const [travelMode, setTravelMode] = useState('pedestrian');

  // 도서관 찜 하기
  const [isLibraryFavorited, setIsLibraryFavorited] = useState(false);
  const [cookie] =  useCookies();
  const { decodedToken, isExpired } = useJwt(cookie.token);

  const navigate = useNavigate();

  const itemsPerSlide = 4; // 슬라이더당 표시할 아이템 수

  useEffect(() => {

    if (decodedToken && !isExpired) {
      axios.post(`${process.env.REACT_APP_SERVER}/user/wishLibrarys`, {
        userId: decodedToken.userId
      })
      .then(response => {
        const wishLibrarylist = response.data.wishlistLibs;
        console.log('HI', wishLibrarylist);
        const isLibraryFavorited = wishLibrarylist.some(lib => String(lib.l_CODE) === String(libCode));
        console.log('libCode:', libCode);
        setIsLibraryFavorited(isLibraryFavorited);
        wishLibrarylist.forEach(lib => {
          console.log('찜한 도서관 L_CODE:', lib.l_CODE);
        });
      })
      .catch(error => {
        console.error('찜한 도서관 조회 실패:', error);
      });
    }

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

        setNewBooks(newArrivalBook ? newArrivalBook.map(item => item.doc) : []);

        console.log('3',newArrivalBook);
      })
      .catch((error) => {
        console.error('Error fetching library details:', error);
      });

  }, [libCode, decodedToken, isExpired]);

  // 지도 초기화
  useEffect(() => {
    if (isMapInitialized.current || !mapRef.current) return;
    console.log('지도 초기화 진행');

    const newMap = new window.Tmapv2.Map('map_div', {
      center: new window.Tmapv2.LatLng(37.5665, 126.978),
      width: '100%',
      height: '500px',
      zoom: 15,
    });
    
    isMapInitialized.current = true; // 초기화 완료 상태로 설정
    setMap(newMap);

    console.log("지도 초기화 완료");
  }, []);
    
  // 지도에 마커 추가
  useEffect(() => {
    if (!map || !libDetail.latitude || !libDetail.longitude) {
      console.log("지도 또는 좌표가 초기화되지 않았습니다.");
      return; // 지도와 좌표가 준비된 경우에만 실행
    }

    // 기존 마커 제거
    markers.forEach((marker) => marker.setMap(null));
    setMarkers([]);

    // 새로운 마커 추가
    const position = new window.Tmapv2.LatLng(libDetail.latitude, libDetail.longitude);
    const marker = new window.Tmapv2.Marker({
      position: position,
      map: map,
      title: libDetail.libName,
    });
    setMarkers([marker]); // 새로운 마커를 배열로 저장

    // 지도 중심과 줌 설정
    map.setCenter(position);
    map.setZoom(18);

  }, [map, libDetail.latitude, libDetail.longitude]);

  // 실시간 검색 API 호출
  const handleSearchInput = async (e) => {
    const input = e.target.value.trim();
    setStartAddress(input);

    if (!input) {
      setSearchResults([]);
      return;
    }

    try {
      const headers = { appKey: process.env.REACT_APP_TMAP_API };
      const response = await axios.get('https://apis.openapi.sk.com/tmap/pois?version=1&format=json', {
        params: {
          searchKeyword: input,
          resCoordType: 'WGS84GEO',
          reqCoordType: 'WGS84GEO',
          count: 10,
        },
        headers,
      });

      const pois = response.data.searchPoiInfo.pois.poi;
      setSearchResults(pois.map(poi => ({
        name: poi.name,
        address: poi.upperAddrName + ' ' + poi.middleAddrName + ' ' + poi.lowerAddrName,
        lat: parseFloat(poi.noorLat),
        lng: parseFloat(poi.noorLon),
      })));
    } catch (error) {
      console.error('Error during search:', error);
    }
  };

  // 검색 결과 선택 처리
  const handleSelectSearchResult = (result) => {
    setStartCoordinates({ lat: result.lat, lng: result.lng });
    setStartAddress(result.name);
    setSearchResults([]);

    if (startMarker) startMarker.setMap(null);
    const marker = new window.Tmapv2.Marker({
      position: new window.Tmapv2.LatLng(result.lat, result.lng),
      map,
      title: result.name,
    });
    setStartMarker(marker);
    map.setCenter(new window.Tmapv2.LatLng(result.lat, result.lng));
  };

  // 탭 선택
  const handleSearchRoute = () => {
    if (travelMode === 'pedestrian') {
      handleSearchPedestrianRoute();
    } else if (travelMode === 'car') {
      handleSearchCarRoute();
    }
  };

  // 보행자
  const handleSearchPedestrianRoute = async () => {
    if (!map || !startCoordinates || !libDetail.latitude || !libDetail.longitude) {
      console.error('보행자 지도, 출발지 또는 도착지가 설정되지 않았습니다.');
      return;
    }

    const headers = { appKey: process.env.REACT_APP_TMAP_API };
    const data = {
      startX: parseFloat(startCoordinates.lng),
      startY: parseFloat(startCoordinates.lat),
      endX: parseFloat(libDetail.longitude),
      endY: parseFloat(libDetail.latitude),
      reqCoordType: 'WGS84GEO',
      resCoordType: 'EPSG3857',
      startName: '출발지',
      endName: libDetail.libName,
    };

    console.log('보행자 경로 요청 데이터:', data);

    try {
      const response = await axios.post(
        'https://apis.openapi.sk.com/tmap/routes/pedestrian?version=1&format=json',
        data,
        { headers }
      );

      console.log('API 응답 데이터:', response.data);

      drawRoute(response.data.features);
    } catch (error) {
      console.error('Error fetching pedestrian route:', error);
    }
  };

  // 자동차
  const handleSearchCarRoute = async () => {
    if (!map || !startCoordinates || !libDetail.latitude || !libDetail.longitude) {
      console.error('자동차 지도, 출발지 또는 도착지가 설정되지 않았습니다.');
      return;
    }

    const headers = { appKey: process.env.REACT_APP_TMAP_API };
    const data = {
      startX: startCoordinates.lng,
      startY: startCoordinates.lat,
      endX: libDetail.longitude,
      endY: libDetail.latitude,
      reqCoordType: 'WGS84GEO',
      resCoordType: 'EPSG3857',
      searchOption: '0', // 기본 교통 옵션
    };

    try {
      const response = await axios.post(
        'https://apis.openapi.sk.com/tmap/routes?version=1&format=json',
        data,
        { headers }
      );
      console.log('99999', response.data.features);
      drawRoute(response.data.features);

    } catch (error) {
      console.error('Error fetching car route:', error);
    }
  };

  // 경로 그리기
  const drawRoute = (features) => {
    const drawInfoArr = [];
    let totalDistance = 0; // 총 거리
    let totalTime = 0; // 총 시간
    let totalFare = 0; // 총 요금 (자동차 전용)
    let taxiFare = 0; // 택시 요금 (자동차 전용)

    features.forEach((item) => {
      if (item.geometry.type === 'LineString') {
        item.geometry.coordinates.forEach(([lng, lat]) => {
          const convertPoint = new window.Tmapv2.Projection.convertEPSG3857ToWGS84GEO(
            new window.Tmapv2.Point(lng, lat)
          );
          drawInfoArr.push(new window.Tmapv2.LatLng(convertPoint._lat, convertPoint._lng));
        });
      } else if (item.properties) {
        // 경로 정보를 추출
        totalDistance = item.properties.totalDistance || totalDistance;
        totalTime = item.properties.totalTime || totalTime;
        if (travelMode === 'car') { 
          totalFare = item.properties.totalFare || totalFare; // 자동차 요금 정보 추가
          taxiFare = item.properties.taxiFare || taxiFare; // 택시 요금 정보 추가
        }
      }
    });

    if (drawInfoArr.length > 0) {
      if (routeLine && typeof routeLine.setMap === 'function') {
        routeLine.setMap(null); // 기존 경로 삭제
      }

      const polyline = new window.Tmapv2.Polyline({
        path: drawInfoArr,
        strokeColor: '#DD0000',
        strokeWeight: 6,
        map,
      });
      setRouteLine(polyline);

      // 지도 정렬
      const bounds = new window.Tmapv2.LatLngBounds();
      if (startCoordinates) {
        bounds.extend(new window.Tmapv2.LatLng(startCoordinates.lat, startCoordinates.lng));
      }
      if (libDetail.latitude && libDetail.longitude) {
        bounds.extend(new window.Tmapv2.LatLng(libDetail.latitude, libDetail.longitude));
      }

      // 경계 확장 (여유 공간 추가)
      const ne = bounds.getNorthEast(); // 북동쪽 좌표
      const sw = bounds.getSouthWest(); // 남서쪽 좌표
      const expandFactor = 0.15; // 여유 공간 비율 (15%)
      const latDiff = (ne._lat - sw._lat) * expandFactor;
      const lngDiff = (ne._lng - sw._lng) * expandFactor;

      const expandedBounds = new window.Tmapv2.LatLngBounds(
        new window.Tmapv2.LatLng(sw._lat - latDiff, sw._lng - lngDiff),
        new window.Tmapv2.LatLng(ne._lat + latDiff, ne._lng + lngDiff)
      );

      map.fitBounds(expandedBounds);

      // 경로 정보 업데이트
      setRouteInfo({ 
        distance: (totalDistance / 1000).toFixed(2) + ' km',
        time: Math.ceil(totalTime / 60) + ' 분',
        ...(travelMode === 'car' && {
          fare: totalFare ? totalFare.toLocaleString() + ' 원' : null,
          taxiFare: taxiFare ? taxiFare.toLocaleString() + ' 원' : null,
        }),
      });
    } else {
      console.error('경로 데이터가 유효하지 않습니다.');
    }
  };

  // 도서관 찜하기 버튼 클릭 핸들러
  const handleFavoriteClick = () => {
    if (isExpired || !decodedToken) {
      alert('로그인 후 찜할 수 있습니다.');
      return navigate('/signin');
    }

    if (!isLibraryFavorited && decodedToken && !isExpired) {  // 로그인 되어 있고 찜하지 않은 경우
      const favoriteLibraryData = {
        ML_U_ID: decodedToken.userId, 
        ML_L_CODE: libDetail.libCode,
        // ML_L_NAME : libDetail.libName,
        // ML_L_ADDRESS: libDetail.address,
      };

      axios.post(`${process.env.REACT_APP_SERVER}/user/addWishLib`, favoriteLibraryData)
        .then(response => {
          alert(response.data.message);
          setIsLibraryFavorited(true);
        })
        .catch(error => {
          alert(error.response ? error.response.data.message : '서버 오류 발생. 잠시후 다시 시도해주세요.');
        });

    } else if (isLibraryFavorited && decodedToken) {
      axios.delete(`${process.env.REACT_APP_SERVER}/user/cancleWishLib`, {
        data: { ML_U_ID: decodedToken.userId, ML_L_CODE: libDetail.libCode }
      })
      .then(response => {
        alert(response.data.message);
        setIsLibraryFavorited(false);
      })
      .catch(error => {
        alert(error.response ? error.response.data.message : '서버 오류 발생. 잠시후 다시 시도해주세요.');
      });
    }

  };

  return (
    <div className="info-page-container">
      <div className="info-page-top">
        <div className="info-map">
          <div className="info-map-container">
            <div id="map_div" ref={mapRef}></div>
          </div>
          <div className="book-actions">
            <button
              className={`favorite-button ${isLibraryFavorited ? 'active' : ''}`}
              onClick={handleFavoriteClick}
            >
              {isLibraryFavorited ? <FaHeart /> : <FaRegHeart />}
            </button>
          </div>
        </div>
        <div className="library-info">
          <h1>{libDetail.libName}</h1>
          <br />
          <p><strong>주소:</strong> {libDetail.address}</p>
          <p><strong>전화번호:</strong> {libDetail.tel}</p>
          <p><strong>홈페이지 URL:</strong> 
          <a href={libDetail.homepage} target="_blank" rel="noopener noreferrer">
          {libDetail.homepage}
          </a>
          </p>
          <p><strong>휴관일:</strong> {libDetail.closed}</p>
          <p><strong>운영시간:</strong> {libDetail.operatingTime}</p>
          <p><strong>소장한 도서의 권수:</strong> {libDetail.BookCount}권</p>
        </div>
      </div>

      <hr className="info-page-divider" />

      <div className="find-path-wrap">
        <br />
        <h2>길찾기</h2>
        <div className="find-path">
          <div className='find-path-menu'>
            <button
              className={`route-tab ${travelMode === 'pedestrian' ? 'active' : ''}`}
              onClick={() => setTravelMode('pedestrian')}
            >
              도보
            </button>
            <button
              className={`route-tab ${travelMode === 'car' ? 'active' : ''}`}
              onClick={() => setTravelMode('car')}
            >
              자동차
            </button>
          </div>
          <div className="route-selector">
            <input
              type="text"
              className="route-input"
              placeholder="출발지 입력"
              value={startAddress}
              onChange={handleSearchInput}
            />
            <br />
            <button className="route-button" onClick={handleSearchRoute}>
              길찾기
            </button>
          </div>

          {searchResults && searchResults.length > 0 && (
            <ul className="search-results">
              {searchResults.map((result, index) => (
                <li key={index} onClick={() => handleSelectSearchResult(result)}>
                  <strong>{result.name}</strong>
                  <p>{result.address}</p>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
      <hr className="info-page-divider" />

      <div className="new-books-section">
        <h2>신착 도서</h2>
        <Slide items={newBooks} itemsPerSlide={itemsPerSlide} />
      </div>
    </div>
  );
};

export default LibraryDetail;