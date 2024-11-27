import React, { useEffect } from 'react';

const TmapComponent = () => {
  useEffect(() => {
    const initTmap = () => {
      const mainScript = document.createElement('script');
      mainScript.src = `https://apis.openapi.sk.com/tmap/jsv2?version=1&appKey=${process.env.REACT_APP_TMAP_API}`;
      mainScript.async = true;

      mainScript.onload = () => {
        console.log('Main Tmap script loaded.');

        // 추가 스크립트 직접 삽입
        const additionalScript = document.createElement('script');
        additionalScript.src = `https://topopentile1.tmap.co.kr/scriptSDKV2/tmapjs2.min.js?version=20231206`;
        additionalScript.async = true;

        additionalScript.onload = () => {
          console.log('Additional Tmap script loaded.');

          if (window.Tmapv2 && typeof window.Tmapv2.LatLng === 'function') {
            // 지도 초기화
            new window.Tmapv2.Map("map_div", {
              center: new window.Tmapv2.LatLng(37.56520450, 126.98702028),
              width: "100%",
              height: "400px",
              zoom: 17,
            });
          } else {
            console.error("Tmapv2 is not loaded properly or LatLng is not a constructor.");
          }
        };

        additionalScript.onerror = () => {
          console.error("Failed to load additional Tmap script.");
        };

        document.body.appendChild(additionalScript);
      };

      mainScript.onerror = () => {
        console.error("Failed to load main Tmap script.");
      };

      document.body.appendChild(mainScript);
    };

    initTmap();
  }, []);

  return <div id="map_div" style={{ width: '100%', height: '400px' }}></div>;
};

export default TmapComponent;