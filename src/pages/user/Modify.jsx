import React , { useState, useEffect, useRef } from "react";
import axios from 'axios';
import { useNavigate } from "react-router-dom";
import DaumPostcode from 'react-daum-postcode';
import { useJwt } from "react-jwt";
import { useCookies } from 'react-cookie'; // useCookies import
import { jwtDecode } from "jwt-decode";
import '../../css/user/modify.css';
import Swal from 'sweetalert2';

const Modify = () => {
    
    const [cookie, removeCookie] =  useCookies();
    const decoded = jwtDecode(cookie.token);
    const { decodedToken, isExpired } = useJwt(cookie.token);

    const [uZipcode, setUZipcode] = useState(""); // 우편번호
    const [uAddress, setUAddress] = useState(""); // //api상의 주소
    const [uDetailAddress, setUDetailAddress] = useState(""); //상세 주소
    const [openPostcode, setOpenPostcode] = useState(false); //카카오api

    const clickButton =() =>{
        setOpenPostcode(current => !current);
    }

    const selectAddress = (data) => {
        console.log(`
                주소: ${data.address},
                우편번호: ${data.zonecode}
            `)
            setUZipcode(data.zonecode);
            setUAddress(data.address)
            setOpenPostcode(false);
    }

    // Hook
    const [uId, setUId] = useState('');
    const [uPw, setUPw] = useState('');
    const [uGender, setUGender] = useState(0);
    const [uAge, setUAge] = useState(0);
    const [uPhone, setUPhone] = useState('');
    const [errors, setErrors] = useState({});
    const passwordRef = useRef(null);
    const [isPwVisible, setIsPwVisible] = useState(false);  // 비밀번호 입력폼 숨기기
    const navigate = useNavigate();

    // // 유효성 검사
    const validateInputs = () => {
        const newErrors = {};

        // 이메일 형식 검사 (ID)
        const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        if (!emailRegex.test(uId)) {
            newErrors.uId = "올바른 이메일 주소를 입력하세요.";
        }

        // 비밀번호 형식 검사 (특수문자 포함 6자리 이상)
        const pwRegex = /^(?=.*[!@#$%^&*])[A-Za-z0-9!@#$%^&*]{6,}$/;
        if (isPwVisible && uPw && !pwRegex.test(uPw)) {
            newErrors.uPw = "비밀번호는 특수문자를 포함하여 6자리 이상이어야 합니다.";
        }

        // 전화번호 형식 검사
        const phoneRegex = /^\d{3}-\d{4}-\d{4}$/;
        if (!phoneRegex.test(uPhone)) {
            newErrors.uPhone = "전화번호는 '000-0000-0000' 형식이어야 합니다.";
        }

        // 성별 및 나이 선택 검사
        if (!uGender) {
            newErrors.uGender = "성별을 선택하세요.";
        }
        if (!uAge) {
            newErrors.uAge = "나이를 선택하세요.";
        }

        // 주소 입력 검사
        if (!uZipcode || !uAddress || !uDetailAddress) {
            newErrors.uAddress = "우편번호, 주소, 상세 주소를 모두 입력해야 합니다.";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    }

    useEffect(() => {

        if (!cookie.token || isExpired) {
            Swal.fire({
                title: '로그인 필요',
                text: '로그인 후 내 정보를 확인할 수 있습니다.',
                icon: 'warning',
                confirmButtonText: '확인'
            });
            navigate('/signin');
            return;
        }

        const fetchUserData = async () => {

            console.log(`${process.env.REACT_APP_SERVER}/user/getuser/${decoded.userId}`)
            try {
              const response = await axios.get(`${process.env.REACT_APP_SERVER}/user/getuser/${decoded.userId}`);
              const data = response.data;
              setUId(data.u_ID);
              setUPw();
              setUGender(data.u_SEX);
              setUAge(data.u_AGE);
              setUPhone(data.u_PHONE);
              setUZipcode(data.u_ZIPCODE);
              setUAddress(data.u_POST_ADDRESS); // //api상의 주소
              setUDetailAddress(data.u_DETAIL_ADDRESS); //상세 주소

            } catch (error) {
                Swal.fire({
                    title: '오류 발생',
                    text: '유저 데이터를 가져오는 데 실패했습니다.',
                    icon: 'error',
                    confirmButtonText: '확인'
                });
              navigate('/')  
            } finally {

            }
          };
          if ( !isExpired ){

            console.log(decodedToken)
            fetchUserData();
          } else {
            navigate('/')
          }

    }, [cookie.token, isExpired, decoded.userId]);

    const uDetailAddressHandler = (e) => {
        setUDetailAddress(e.target.value);
    }

    const uIdChangeHandler = (e) => {
        setUId(e.target.value);
    }

    const uPwChangeHandler = (e) => {
        setUPw(e.target.value);
        console.log(e.target.value)
    }

    const uGenderChangeHandler = (e) => {
        setUGender(e.target.value);
    }

    const uAgeChangeHandler = (e) => {
        setUAge(e.target.value);
    }

    // 하이픈 자동 입력
    const hypenPhoneNumber = (value) => {
        const cleaned = value.replace(/\D/g, ''); 
        const match = cleaned.match(/^(\d{3})(\d{3,4})(\d{4})$/);
        if (match) {
            return `${match[1]}-${match[2]}-${match[3]}`;
        }
        return cleaned;
    }

    const uPhoneChangeHandler = (e) => {
        const changePhoneNumber = hypenPhoneNumber(e.target.value);
        setUPhone(changePhoneNumber);
    }


    const handleSubmit = async(e) => {
        e.preventDefault();

        if (!validateInputs()) {
            return;
        }

        const password = isPwVisible ? uPw : (passwordRef.current ? passwordRef.current.value : "");

        const data = {
            u_id: uId,
            u_sex: uGender,
            u_age: uAge,
            u_zipcode: uZipcode,
            u_phone: uPhone,
            u_post_address: uAddress,
            u_detail_address: uDetailAddress,
        };

        if (password) {
            data.u_pw = password;
        }

        try{
            const url=`${process.env.REACT_APP_SERVER}/user/modify`;
            const res = await axios.post(url, data);
            console.log('data---> ', res.data)
            if (res.data.u_ID !== null) {
                Swal.fire({
                    title: '회원 정보 수정 성공',
                    text: '회원 정보가 성공적으로 수정되었습니다.',
                    icon: 'success',
                    confirmButtonText: '확인'
                }).then(() => {
                    removeCookie('token');
                    navigate('/signin');
                });
            } else {
                Swal.fire({
                    title: 'ID 중복',
                    text: '이미 사용중인 ID입니다.',
                    icon: 'error',
                    confirmButtonText: '확인'
                });
                navigate('/signup');
            }
   
        } catch(err){
            console.log('err---> ', err);
            Swal.fire({
                title: '서버 오류',
                text: '서버와의 연결에 실패했습니다.',
                icon: 'error',
                confirmButtonText: '확인'
            });
        }

    }

    const deleteBtnClickHandler = (e) => {
        e.preventDefault();

        console.log('deleteBtnClickHandler()');
        
        Swal.fire({
            title: '계정 탈퇴',
            text: '정말로 탈퇴하시겠습니까?',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: '확인',
            cancelButtonText: '취소',
        }).then((result) => {
            if (result.isConfirmed) {
                // 탈퇴 확인을 눌렀을 경우
                axios.get(`${process.env.REACT_APP_SERVER}/user/delete/${uId}`)
                    .then(response => {
                        const data = response.data;
                        console.log(data);
                        Swal.fire({
                            title: '계정 탈퇴 완료',
                            text: '계정이 성공적으로 탈퇴되었습니다.',
                            icon: 'success',
                            confirmButtonText: '확인'
                        }).then(() => {
                            removeCookie('token'); // 쿠키 삭제
                            navigate('/'); // 홈으로 리디렉션
                        });
                    })
                    .catch(error => {
                        console.error('Error deleting user:', error);
                        Swal.fire({
                            title: '탈퇴 실패',
                            text: '탈퇴 처리 중 오류가 발생했습니다.',
                            icon: 'error',
                            confirmButtonText: '확인'
                        });
                    });
            } else {
                // 취소 버튼을 눌렀을 경우
                Swal.fire({
                    title: '탈퇴 취소',
                    text: '계정 탈퇴가 취소되었습니다.',
                    icon: 'info',
                    confirmButtonText: '확인'
                });
            }
        });
    };    

    const togglePwField = () => {
        setIsPwVisible(!isPwVisible);
    }

    const style = {
        background : "rgba(0,0,0,0.25)",
        position : "fixed",
        left:"68%",
        top:"230px",
        height:"450px",
        width:"400px",
        border: "1px solid #ccc",
    }

    return (
        <div id="sign_up_modal">
            <div className="sign_up_modal_content">
            <form onSubmit={handleSubmit}>
                <h2>회원 수정</h2>
                <input name="u_id" className="txt_basic" type="text" value={uId} onChange={uIdChangeHandler} readonly />
                <br />
                {errors.uId && <span className="sign-error-msg">{errors.uId}</span>}
                <button type="button" className="btn_pw" onClick={togglePwField}>비밀번호 변경</button>
                {isPwVisible && (
                    <input name="u_pw" className="input_pw" type="password" ref={passwordRef} onChange={uPwChangeHandler} placeholder="비밀번호를 입력하세요" />
                )}
                <br />
                {errors.uPw && <span className="sign-error-msg">{errors.uPw}</span>}
                <input name="u_phone" className="txt_basic" type="text" value={uPhone} onChange={uPhoneChangeHandler} placeholder="휴대전화번호" />
                <select name="u_sex" className="gen" id="gen" value={uGender} onChange={uGenderChangeHandler}>
                    <option value="">성별</option>
                    <option value="M">남성</option>
                    <option value="W">여성</option>
                </select>
                <select name="u_age" id="age" value={uAge} onChange={uAgeChangeHandler}>
                    <option value="">나이</option>
                    <option value="10">10대</option>
                    <option value="20">20대</option>
                    <option value="30">30대</option>
                    <option value="40">40대</option>
                    <option value="50">50대</option>
                    <option value="60">60대 이상</option>
                </select>
                {errors.uPhone && <span className="sign-error-msg">{errors.uPhone}</span>}
                {errors.uGender && <span className="sign-error-msg">{errors.uGender}</span>}
                {errors.uAge && <span className="sign-error-msg">{errors.uAge}</span>}
                <br />
                <input type="hidden" id="user_post_address" name="u_post_address" />
                <div class="address-group">
                    <input type="text" id="user_zipcode" name="u_zipcode"  value={uZipcode} placeholder="우편번호" readonly required />
                    <input type="button" class="address-btn" onClick={clickButton} value="우편번호 찾기" /> {openPostcode &&
                        <DaumPostcode
                            style={style}
                            onComplete={selectAddress}  // 값을 선택할 경우 실행되는 이벤트
                            autoClose={false} // 값을 선택할 경우 사용되는 DOM을 제거하여 자동 닫힘 설정
                            defaultQuery='의정부 센트럴타워' // 팝업을 열때 기본적으로 입력되는 검색어
                            />
                }
                </div>
                <input className="txt_basic" type="text" id="user_address" name="u_address"  value={uAddress} placeholder="주소" required />
                <br />
                <input className="txt_basic" type="text" id="user_detailAddress" name="u_detail_address"  value={uDetailAddress} onChange={uDetailAddressHandler} placeholder="상세주소" required />
                <br />
                {errors.uAddress && <span className="sign-error-msg">{errors.uAddress}</span>}
                <br />
                <button type="submit" className="btn_basic" >수정</button>
                <button onClick={deleteBtnClickHandler} className="btn_basic" >탈퇴</button>
                </form>
            </div>
        </div>
    );
}

export default Modify;


