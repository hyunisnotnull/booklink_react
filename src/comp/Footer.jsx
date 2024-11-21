import React from 'react';
import '../css/Footer.css';  

const Footer = () => {
  return (
    <footer id="footer">
    <div class="footer-wrap">
        <div class="business-info">
            <h4 class="business-title">(주)도서링크 사업자 정보</h4>
            <p class="business-text">상호 : (주)도서링크</p>
            <p class="business-text">대표자 : 김남수, 장진언, 김정현</p>
            <p class="business-text">주소 : 경기 의정부시 시민로 80 센트럴타워 6층</p>
            <p class="business-text">대표번호 : 0507-1430-4112</p>
            <p class="business-text">메일 : booklink@booklink.co.kr</p>
        </div>

        <div class="footer-right">
            <h4 class="footer-right-title">도서 링크 &#62;</h4>
            <p class="footer-right-text">전화번호 : 0507-1430-4112</p>
            <p class="footer-right-text">운영시간 : 9시-18시 (주말/공휴일 휴무, 점심시간 12시 - 13시)</p>
            <span class="footer-copyright">© BookLink all rights reserved.</span>
        </div>
    </div>
</footer>
  );
};

export default Footer;
