import React, { useState, useEffect  } from 'react';
import { cleanBookName, extractAuthors } from '../js/Textfilter.js';
import '../css/Slide.css';

const Slide = ({ items = [], itemsPerSlide, autoSlide = false }) => {  
  const [currentSlide, setCurrentSlide] = useState(0);

  const totalSlides = Math.ceil(items.length / itemsPerSlide);

  // useEffect
  useEffect(() => {
    if (autoSlide) {
      const interval = setInterval(() => {
        goToNextSlide();
      }, 5000); 

      return () => clearInterval(interval);
    }
  }, [currentSlide, autoSlide]);

  // Function
  const goToPreviousSlide = () => {
    setCurrentSlide((prev) => (prev === 0 ? totalSlides - 1 : prev - 1));
  };

  const goToNextSlide = () => {
    setCurrentSlide((prev) => (prev === totalSlides - 1 ? 0 : prev + 1));
  };

  const currentItems = items.slice(currentSlide * itemsPerSlide, (currentSlide + 1) * itemsPerSlide);

  const formatUrl = (url) => {
    if (url && !url.startsWith('http://') && !url.startsWith('https://')) {
      return 'http://' + url;  
    }
    return url;
  };

  // HTML
  return (
    <div className="slider">

      <div className="book-list">
      <button className="slider-button prev" onClick={goToPreviousSlide}>
        &#60;
      </button>
        <div className="book-items">
          {currentItems.length > 0 ? (
            currentItems.map((item, index) => (
              <div key={index} className="book-item">
                {/* 이벤트 이미지일 경우 */}
                {item.e_image ? (
                  <a 
                    href={formatUrl(item.e_url)}  
                    target="_blank" 
                    rel="noopener noreferrer"  
                    className="event-item"
                  >
                    <img 
                      src={`${process.env.REACT_APP_IMAGE_SERVER}/${item.e_title}/${item.e_image}`}
                      className="event-image"
                    />
                  </a>
                ) : (
                  <div>
                    <a href={`/book/detail/${item.isbn13}`}>
                      <img 
                      src={item.bookImageURL} 
                      alt={item.bookname} 
                      className="book-image" 
                      />
                    </a>
                    <p><strong>{cleanBookName(item.bookname)}</strong></p>
                    <p>{extractAuthors(item.authors)}</p>
                    <a href={`/book/detail/${item.isbn13}`}>상세 보기</a>
                  </div>
                )}
              </div>
            ))
          ) : (
            <p>항목이 없습니다.</p>
          )}
        </div>
      <button className="slider-button next" onClick={goToNextSlide}>
        &#62;
      </button>
      </div>

    </div>
  );
};

export default Slide;
