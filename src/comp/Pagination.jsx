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

  const pageNumbers = [];
  const pageLimit = 5;  // 한 번에 보여줄 페이지 번호의 수

  // totalCount가 5 미만일 경우, 페이지 번호를 totalCount까지만 표시
  if (totalCount <= pageLimit) {
    for (let i = 1; i <= totalCount; i++) {
      pageNumbers.push(i);
    }
  } else {
    // 중앙을 기준으로 이전/다음 페이지 번호 계산
    const halfLimit = Math.floor(pageLimit / 2);
    let startPage = currentPage - halfLimit;
    let endPage = currentPage + halfLimit;

    // startPage가 1보다 작으면 1로 조정
    if (startPage < 1) {
      startPage = 1;
      endPage = pageLimit;
    }

    // endPage가 totalCount보다 크면 totalCount로 조정
    if (endPage > totalCount) {
      endPage = totalCount;
      startPage = totalCount - pageLimit + 1;
    }

    // 페이지 번호 생성
    for (let i = startPage; i <= endPage; i++) {
      pageNumbers.push(i);
    }
  }

  return (
    <div className="pagination">
      <button onClick={handleFirst} disabled={currentPage <= 1}>
        &#60;&#60;
      </button>
      <button onClick={handlePrevious} disabled={currentPage <= 1}>
        &#60;
      </button>

      {/* 페이지 번호 */}
      {pageNumbers.map(page => (
        <button 
          key={page} 
          onClick={() => onPageChange(page)} 
          className={page === currentPage ? 'active' : ''}
        >
          {page}
        </button>
      ))}

      <button onClick={handleNext} disabled={currentPage >= totalCount}>
        &#62;
      </button>
      <button onClick={handleLast} disabled={currentPage >= totalCount}>
        &#62;&#62;
      </button>
    </div>
  );
};

export default Pagination;
