import React from 'react';
import '../css/Footer.css';  

const Footer = () => {
  return (
    <footer id="footer">
    <div classNameName="footer-wrap">
        <div className="business-info">
            <h4 className="business-title">(주)도서링크 사업자 정보</h4>
            <p className="business-text">상호 : (주)도서링크</p>
            <p className="business-text">대표자 : 김남수, 장진언, 김정현</p>
            <p className="business-text">주소 : 경기 의정부시 시민로 80 센트럴타워 6층</p>
            <p className="business-text">대표번호 : 0507-1430-4112</p>
            <p className="business-text">메일 : booklink@booklink.co.kr</p>
        </div>

        <div className="footer-right">
            <h4 className="footer-right-title">도서 링크 &#62;</h4>
            <p className="footer-right-text">전화번호 : 0507-1430-4112</p>
            <p className="footer-right-text">운영시간 : 9시-18시 (주말/공휴일 휴무, 점심시간 12시 - 13시)</p>
            <span className="footer-copyright">© BookLink all rights reserved.</span>
        </div>
    </div>
</footer>
  );
};

export default Footer;
