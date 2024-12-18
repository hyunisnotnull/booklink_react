import React, { useState, useEffect } from 'react';
import { useLocation, Link } from 'react-router-dom';
import axios from 'axios';
import Pagination from '../../comp/Pagination';
import '../../css/books/SearchBook.css';

const SearchBook = () => {
    const location = useLocation();
    const queryParams = new URLSearchParams(location.search);
    const initialTitle = queryParams.get('title') || '';

    // 입력 필드의 값들
    const [title, setTitle] = useState(initialTitle);
    const [author, setAuthor] = useState('');
    const [publisher, setPublisher] = useState('');
    const [isbn13, setIsbn13] = useState('');
    const [sortOption, setSortOption] = useState('loanCount');
    const [setOrder, setOrderOption] = useState('desc');
    
    // 검색 버튼 클릭 시 저장되는 값들
    const [searchParams, setSearchParams] = useState({
        title: initialTitle,
        author: '',
        publisher: '',
        isbn13: ''
    });

    const [books, setBooks] = useState([]);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const [pageNo, setPageNo] = useState(1);
    const [totalCount, setTotalCount] = useState(1);

    // useEffect
    useEffect(() => {
        const titleFromQuery = queryParams.get('title');
        if (titleFromQuery && titleFromQuery !== title) {
            setTitle(titleFromQuery);
            setSearchParams({ ...searchParams, title: titleFromQuery });
            setPageNo(1); 
        }

        const fetchResults = async () => {
            setLoading(true);

            const params = { 
                ...searchParams,
                pageNo,
                sort: sortOption,
                order: setOrder,
            };

            try {
                const response = await axios.get(`${process.env.REACT_APP_SERVER}/book/search_book`, { params });
                const searchResults = response.data.books ? response.data.books.map(item => item.doc) : [];
                const total = response.data.totalCount;

                if (searchResults.length === 0) {
                    setErrorMessage(`${title || author || publisher || isbn13}에 대한 정보가 없습니다.`);
                }

                setBooks(searchResults);
                setTotalCount(Math.ceil(total / 10));
                setMessage(`[총 ${parseInt(total)}건] "${searchParams.title || searchParams.author || searchParams.publisher || searchParams.isbn13 || '전체'}"에 대한 결과입니다.`);
            } catch (error) {
                console.error('검색 오류:', error);
                setErrorMessage('올바르지 않은 검색어입니다. 다시 시도해주세요.');
            }

            setLoading(false);
        };

        fetchResults();
    }, [location.search, searchParams, pageNo, sortOption, setOrder]);

    // 검색 함수
    const handleSearch = async () => {
        setLoading(true);
        setErrorMessage('');

        const noSpaceTitle = title.replace(/\s+/g, '');
        const noSpaceAuthor = author.replace(/\s+/g, '');
        const noSpacePublisher = publisher.replace(/\s+/g, '');
        const noSpaceIsbn13 = isbn13.replace(/\s+/g, '');

        // 검색할 때만 searchParams 갱신
        setSearchParams({
            title: noSpaceTitle,
            author: noSpaceAuthor,
            publisher: noSpacePublisher,
            isbn13: noSpaceIsbn13,
        });

        setPageNo(1); // 검색 시 첫 번째 페이지로 리셋

        const params = {
            title: noSpaceTitle,
            author: noSpaceAuthor,
            publisher: noSpacePublisher,
            isbn13: noSpaceIsbn13,
            pageNo: 1 // 페이지 번호도 1로 초기화
        };

        try {
        const response = await axios.get(`${process.env.REACT_APP_SERVER}/book/search_book`, { params });

        const searchResults = response.data.books ? response.data.books.map(item => item.doc) : [];

        if (searchResults.length === 0) {
            setErrorMessage(`${title || author || publisher || isbn13}에 대한 정보가 없습니다.`);
        }

        const total = response.data.totalCount;
        setBooks(searchResults);
        setTotalCount(Math.ceil(total / 10));

        setMessage(`[총 "${parseInt(total)}"건] "${title || author || publisher || isbn13 || '전체'}"에 대한 결과입니다.`);
        } catch (error) {
        console.error('검색 오류:', error);
        setErrorMessage('올바르지 않은 검색어입니다. 다시 시도해주세요.');
        }

        setLoading(false);

        // 검색 후 입력값 초기화
        setTitle('');
        setAuthor('');
        setPublisher('');
        setIsbn13('');
    };

    // 페이지 변경 함수
    const handlePageChange = (newPage) => {
        if (newPage >= 1 && newPage <= totalCount) {
        setPageNo(newPage);
        }
    };

    // 정렬 함수
    const handleSortChange = (sortType) => {
        setSortOption(sortType);
        setPageNo(1);
    };

    const handleOrderChange = () => {
        if (setOrder === 'asc') {
            setOrderOption('desc');  
        } else {
            setOrderOption('asc');  
        }
        setPageNo(1);
    };

    return (
        <div className="book-search-container">
        <h1 className="book-search-title">도서 상세검색</h1>
        {/* <hr /> */}
        <div className="book-search-form">
            <label>도서명 &nbsp;:&nbsp;
            <input 
                type="text" 
                value={title} 
                placeholder='도서 제목을 입력해주세요.'
                onChange={(e) => setTitle(e.target.value)} // 타이핑할 때만 입력값 업데이트
            />
            </label>
        </div>
        <div className="book-search-form">
            <label>저자 &nbsp;&nbsp;&nbsp;&nbsp;:&nbsp;
            <input 
                type="text" 
                value={author} 
                placeholder='도서 저자를 입력해주세요.'
                onChange={(e) => setAuthor(e.target.value)} // 타이핑할 때만 입력값 업데이트
            />
            </label>
        </div>
        <div className="book-search-form">
            <label>출판사 &nbsp;:&nbsp;
            <input 
                type="text" 
                value={publisher} 
                placeholder='출판사를 입력해주세요.'
                onChange={(e) => setPublisher(e.target.value)} // 타이핑할 때만 입력값 업데이트
            />
            </label>
        </div>
        <div className="book-search-form">
            <label>ISBN &nbsp;&nbsp;&nbsp;:&nbsp;
            <input 
                type="text" 
                value={isbn13} 
                placeholder='13자리의 ISBN을 모두 입력해주세요.'
                onChange={(e) => setIsbn13(e.target.value)} // 타이핑할 때만 입력값 업데이트
            />
            </label>
        </div>

        <button className="book-search-button" onClick={handleSearch} disabled={loading}>
            {loading ? '검색 중...' : '검색'}
        </button>

        {/* 검색 결과 또는 에러 메시지 출력 */}
        {errorMessage && <p className="book-error-message">{errorMessage}</p>}
        {message && <p className="book-message">{message}</p>}

        <div className="search-results-container">
            <hr />
            <br />
            <h2 className="search-results-title">도서 리스트</h2>
                <div className="sort-options">
                    <a href="#" onClick={(e) => { e.preventDefault(); handleOrderChange(); }} className='order-option'>
                        {setOrder === 'asc' ? '[ 오름차순 ]' : '[ 내림차순 ]'}
                    </a>|
                    <a href="#" onClick={(e) => { e.preventDefault(); handleSortChange('isbn'); }} className={sortOption === 'isbn' ? 'active' : ''}>ISBN순</a>|
                    <a href="#" onClick={(e) => { e.preventDefault(); handleSortChange('pubYear'); }} className={sortOption === 'pubYear' ? 'active' : ''}>출판년도순</a>|
                    <a href="#" onClick={(e) => { e.preventDefault(); handleSortChange('loanCount'); }} className={sortOption === 'loanCount' ? 'active' : ''}>대출건수순</a>
                </div>
            <ul className="search-book-items">
            {books.map((book, index) => (
                <li key={index} className="search-book-item">
                <Link to={`/book/detail/${book.isbn13 || book.set_isbn13}`}>
                    <img 
                        className="search-book-image" 
                        src={book.bookImageURL || "/img/defaultBook.png"} 
                        alt={book.bookname} 
                    />
                </Link>
                <div className="search-book-details">
                    <h3 className="search-book-name">{book.bookname}</h3>
                    <p className="search-book-authors">{book.authors}</p>
                    <p className="search-book-publisher">출판사 : {book.publisher}</p>
                    <p className="search-book-publication_year">출판년도 : {book.publication_year}</p>
                    <p className="search-book-loan_count">대출건수 : {book.loan_count}</p>
                    <p className="search-book-isbn">ISBN : {book.isbn13}</p>
                    <Link to={`/book/detail/${book.isbn13 || book.set_isbn13}`} className="search-book-detail-link">상세정보</Link>
                </div>
                </li>
            ))}
            </ul>
        </div>

        <Pagination 
            currentPage={pageNo}
            totalCount={totalCount}
            onPageChange={handlePageChange}
        />
        </div>
    );
};

export default SearchBook;
