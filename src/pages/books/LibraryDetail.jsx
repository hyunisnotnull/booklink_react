import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import Slide from '../../comp/Slide.jsx';
import '../../css/books/LibraryDetail.css';
import '../../css/include/Slide.css';

const LibraryDetail = () => {
  const { libCode } = useParams(); // URL에서 libCode 가져오기
  const [libDetail, setLibDetail] = useState([]);  // 도서관 정보 상태 추가
  const [newArrivalBook, setNewArrivalBook] = useState([]); // 도서관 신착 도서 상태 추가
  const mapRef = useRef(null); // 지도 DOM 참조
  const isMapInitialized = useRef(false); // 지도 초기화 여부 추적
  const [map, setMap] = useState(null); // 지도 객체
  const [markers, setMarkers] = useState([]); // 마커 배열
  const [startMarker, setStartMarker] = useState(null); // 출발지 마커 상태 추가
  const [startAddress, setStartAddress] = useState(''); // 출발지 입력 상태
  const [startCoordinates, setStartCoordinates] = useState(null); // 출발지 좌표
  const [routeLine, setRouteLine] = useState(null); // 경로 라인 상태
  const [routeInfo, setRouteInfo] = useState({ distance: null, time: null }); // 경로 정보 상태 추가

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
    map.setZoom(17);

    console.log("마커 추가 완료:", marker);
  }, [map, libDetail.latitude, libDetail.longitude]);

  const handleGeocodeStartAddress = async () => {
    if (!startAddress) {
      console.error("출발지 주소를 입력하세요.");
      return;
    }
  
    try {
      const headers = { appKey: process.env.REACT_APP_TMAP_API };
  
      const response = await axios.get(
        `https://apis.openapi.sk.com/tmap/pois?version=1&format=json`,
        {
          params: {
            searchKeyword: startAddress,
            resCoordType: "WGS84GEO",
            reqCoordType: "WGS84GEO",
            count: 1, // 가장 첫 번째 결과만 사용
          },
          headers,
        }
      );
  
      const pois = response.data.searchPoiInfo.pois.poi;
      if (pois.length > 0) {
        const { noorLat, noorLon, name } = pois[0];
        const lat = parseFloat(noorLat);
        const lon = parseFloat(noorLon);
  
        setStartCoordinates({ lat, lng: lon });
        console.log(`출발지 설정 완료: ${name} (${lat}, ${lon})`);

        // 이전 마커 제거
        if (startMarker) {
          startMarker.setMap(null);
        }
  
        // 출발지 마커 추가
        const marker = new window.Tmapv2.Marker({
          position: new window.Tmapv2.LatLng(lat, lon),
          map,
          title: name,
        });
        setStartMarker(marker);
      } else {
        console.error("검색 결과가 없습니다. 정확한 주소를 입력하세요.");
      }
    } catch (error) {
      console.error("주소를 검색하는 동안 오류 발생:", error);
    }
  };

  const handleSearchRoute = async () => {
    if (!map || !startCoordinates || !libDetail.latitude || !libDetail.longitude) {
      console.error('지도, 출발지 또는 도착지가 설정되지 않았습니다.');
      return;
    }
    console.log("startCoordinates:", startCoordinates);
    console.log("libDetail.latitude:", libDetail.latitude, "libDetail.longitude:", libDetail.longitude);

    // 기존 경로 초기화
    if (routeLine) {
      routeLine.setMap(null);
    }

    const headers = { appKey: process.env.REACT_APP_TMAP_API };
    const data = {
      startX: startCoordinates.lng,
      startY: startCoordinates.lat,
      endX: libDetail.longitude,
      endY: libDetail.latitude,
      reqCoordType: 'WGS84GEO',
      resCoordType: 'EPSG3857',
      startName: '출발지',
      endName: libDetail.libName,
    };

    try {
      const response = await axios.post(
        'https://apis.openapi.sk.com/tmap/routes/pedestrian?version=1&format=json',
        data,
        { headers }
      );

      const resultData = response.data.features;
      const drawInfoArr = [];
      console.log("API 응답 데이터:", resultData);

      resultData.forEach((item) => {
        if (item.geometry.type === 'LineString') {
          item.geometry.coordinates.forEach(([lng, lat]) => {
            const convertPoint = new window.Tmapv2.Projection.convertEPSG3857ToWGS84GEO(
              new window.Tmapv2.Point(lng, lat)
            );
            drawInfoArr.push(new window.Tmapv2.LatLng(convertPoint._lat, convertPoint._lng));
          });
        }
      });

      // 경로 그리기
      if (drawInfoArr.length > 0) {
        const polyline = new window.Tmapv2.Polyline({
          path: drawInfoArr,
          strokeColor: '#DD0000',
          strokeWeight: 6,
          map: map,
        });

        setRouteLine(polyline);

        const bounds = new window.Tmapv2.LatLngBounds();
        drawInfoArr.forEach((point) => bounds.extend(point));
        map.fitBounds(bounds);
      }

      // 총 거리와 시간 계산
      const totalDistance = resultData[0].properties.totalDistance;
      const totalTime = resultData[0].properties.totalTime;

      setRouteInfo({
        distance: (totalDistance / 1000).toFixed(2) + ' km',
        time: Math.ceil(totalTime / 60) + ' 분',
      });

    } catch (error) {
      console.error('경로 탐색 중 오류 발생:', error);
    }
  };

  return (
    <div className="book-detail-container">
      <div className="book-detail-top">
        <div className="book-image">
          <div className="book-thum">
            <div id="map_div" ref={mapRef}></div>
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
          <input
            type="text"
            placeholder="출발지 주소를 입력하세요"
            value={startAddress}
            onChange={(e) => setStartAddress(e.target.value)}
          />
          <button onClick={handleGeocodeStartAddress}>출발지 설정</button>
          <button onClick={handleSearchRoute}>경로 검색</button>
          {routeInfo.distance && routeInfo.time && (
            <p>
              <strong>총 거리:</strong> {routeInfo.distance} | <strong>총 시간:</strong> {routeInfo.time}
            </p>
          )}
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
