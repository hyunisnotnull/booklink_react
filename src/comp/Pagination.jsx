import React from 'react';
import '../css/include/Pagination.css';

const Pagination = ({ currentPage, totalCount, onPageChange }) => {
  const handlePrevious = () => {
    if (currentPage > 1) {
      onPageChange(currentPage - 1);
    }
  };

  const handleNext = () => {
    if (currentPage < totalCount) {
      onPageChange(currentPage + 1);
    }
  };

  const handleFirst = () => {
    if (currentPage > 1) {
      onPageChange(1);
    }
  };

  const handleLast = () => {
    if (currentPage < totalCount) {
      onPageChange(totalCount);
    }
  };

  return (
    <div className="pagination">
      <button onClick={handleFirst} disabled={currentPage <= 1}>
        첫 번째
      </button>
      <button onClick={handlePrevious} disabled={currentPage <= 1}>
        이전
      </button>
      <span>{currentPage} / {totalCount}</span>
      <button onClick={handleNext} disabled={currentPage >= totalCount}>
        다음
      </button>
      <button onClick={handleLast} disabled={currentPage >= totalCount}>
        마지막
      </button>
    </div>
  );
};

export default Pagination;
