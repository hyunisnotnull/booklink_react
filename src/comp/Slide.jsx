import React, { useState } from 'react';
import '../css/Slide.css';

const Slide = ({ items = [], itemsPerSlide }) => {  
  const [currentSlide, setCurrentSlide] = useState(0);

  const totalSlides = Math.ceil(items.length / itemsPerSlide);

  const goToPreviousSlide = () => {
    setCurrentSlide((prev) => (prev === 0 ? totalSlides - 1 : prev - 1));
  };

  const goToNextSlide = () => {
    setCurrentSlide((prev) => (prev === totalSlides - 1 ? 0 : prev + 1));
  };

  const currentItems = items.slice(currentSlide * itemsPerSlide, (currentSlide + 1) * itemsPerSlide);

  return (
    <div className="slider">
      <button className="slider-button prev" onClick={goToPreviousSlide}>
        &#60;
      </button>

      <div className="book-list">
        <div className="book-items">
          {currentItems.length > 0 ? (
            currentItems.map((book, index) => (
              <div key={index} className="book-item">
                <img src={book.bookImageURL} alt={book.bookname} className="book-image" />
                <p>{book.bookname}</p>
                <p>{book.authors}</p>
<<<<<<< HEAD
<<<<<<< Updated upstream
                <a href={`${process.env.REACT_APP_SERVER}/book/detail/${book.isbn13}`} 
                   target="_blank"
                   rel="noopener noreferrer">상세 보기</a>
=======
                <a href={`/book/detail/${book.isbn13 || book.set_isbn13}`}>상세 보기</a>
>>>>>>> Stashed changes
=======
                <a href={`${process.env.REACT_APP_SERVER}/book/detail/${book.isbn13}`}>상세 보기</a>
>>>>>>> 0788c412db1178aaeccd1b6a8d850c24bcee2cd8
              </div>
            ))
          ) : (
            <p>책이 없습니다.</p>
          )}
        </div>
      </div>

      <button className="slider-button next" onClick={goToNextSlide}>
        &#62;
      </button>
    </div>
  );
};

export default Slide;