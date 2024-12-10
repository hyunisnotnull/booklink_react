import React , { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from "react-router-dom";
import '../../css/user/signin.css';
import Slide from '../../comp/Slide';
import Modal from '../include/modal';
import Swal from 'sweetalert2';

const Signin = () => {
  const [uId, setUId] = useState('');
  const [uPw, setUPw] = useState('');
  const [events, setEvents] = useState([]);


  const [idModalOpen, setIdModalOpen] = useState(false);
  const [pwModalOpen, setPwModalOpen] = useState(false);
  const [uPhone, setUPhone] = useState('');
  const [id, setId] = useState('');
  const [pw, setPw] = useState('');

  const openIdModal = () => {
    setIdModalOpen(true);
  };
  const closeIdModal = () => {
    setId('');
    setUPhone('');
    setIdModalOpen(false);
  };

  const openPwModal = () => {
    setPwModalOpen(true);
  };
  const closePwModal = () => {
    setId('');
    setUPhone('');
    setPw('');
    setPwModalOpen(false);
  };

  // 하이픈 자동 입력
  const hypenPhoneNumber = (value) => {
    const cleaned = value.replace(/\D/g, ''); 
    const match = cleaned.match(/^(\d{3})(\d{3,4})(\d{4})$/);
    if (match) {
        return `${match[1]}-${match[2]}-${match[3]}`;
    }
    return cleaned;
  }

  const idChangeHandler = (e) => {
    setId(e.target.value);
  }
  
  const uPhoneChangeHandler = (e) => {
      const changePhoneNumber = hypenPhoneNumber(e.target.value);
      setUPhone(changePhoneNumber);
  }

  // useEffect
  useEffect(() => {
    axios.get(`${process.env.REACT_APP_SERVER}/event/list`)
    .then(response => {
      const { events } = response.data;
      setEvents(events ? events.filter(event => event.e_active === 3) : []);
    })
    .catch(error => {
      console.error('Error fetching events:', error);
    });
  }, []);

  const navigate = useNavigate(); 

  const uIdChangeHandler = (e) => {
    setUId(e.target.value);
  }

  const uPwChangeHandler = (e) => {
      setUPw(e.target.value);
  }


  const handleSearchId = async(e) => {
    e.preventDefault();

    const data = {
      u_phone : uPhone,
    };
    
    try{
        const url=`${process.env.REACT_APP_SERVER}/user/getid`;
        const res = await axios.post(url, data, { withCredentials: true });

        if (res.data.u_ID) {
          setId(res.data.u_ID);
        } else {
          Swal.fire({
            title: '아이디 찾기 실패',
            text: '일치하는 아이디가 없습니다.',
            icon: 'error',
            confirmButtonText: '확인'
          }).then(() => {
            navigate('/signin');
          });
        }

    } catch(err){
      Swal.fire({
        title: '오류 발생',
        text: '서버와 연결할 수 없습니다. 나중에 다시 시도해 주세요.',
        icon: 'error',
        confirmButtonText: '확인'
      }).then(() => {
        navigate('/signin');
      });
    }

  }

  const handleSearchPw = async(e) => {
    e.preventDefault();

    const data = {
      u_id: id,
      u_phone : uPhone,
    };

    // 로딩 시작
    Swal.fire({
        title: '비밀번호 찾는중...',
        text: '잠시만 기다려 주세요.',
        allowOutsideClick: false,
        didOpen: () => {
            Swal.showLoading();
        }
    });
    
    try{
        const url=`${process.env.REACT_APP_SERVER}/user/getpw`;
        const res = await axios.post(url, data, { withCredentials: true });

        Swal.close();
        
        if (res.data.success) {
          setPw(res.data.message);
        } else {
          Swal.fire({
            title: '비밀번호 찾기 실패',
            text: '아이디 또는 연락처 정보가 일치하지 않습니다.',
            icon: 'error',
            confirmButtonText: '확인'
          }).then(() => {
            navigate('/signin');
          });
        }

    } catch(err){
      
      Swal.close();

      Swal.fire({
        title: '오류 발생',
        text: '서버와 연결할 수 없습니다. 나중에 다시 시도해 주세요.',
        icon: 'error',
        confirmButtonText: '확인'
      }).then(() => {
        navigate('/signin');
      });
    }

  }


  const handleSubmit = async(e) => {
    e.preventDefault();

    const data = {
      u_id: uId,
      u_pw: uPw,
    };
    
    try{
        const url=`${process.env.REACT_APP_SERVER}/signin`;
        const res = await axios.post(url, data, { withCredentials: true });
        if (res.data.userId !== undefined) {
          Swal.fire({
            title: '로그인 성공!',
            text: '환영합니다! 메인 페이지로 이동합니다.',
            icon: 'success',
            confirmButtonText: '확인'
          }).then(() => {
            navigate('/');
          });
        } else {
          Swal.fire({
            title: '로그인 실패',
            text: '올바르지 않은 ID 또는 비밀번호입니다.',
            icon: 'error',
            confirmButtonText: '확인'
          });
        }

    } catch(err){
      Swal.fire({
        title: '오류 발생',
        text: '서버와 연결할 수 없습니다. 나중에 다시 시도해 주세요.',
        icon: 'error',
        confirmButtonText: '확인'
      });
    }

  }

  const googleLogin = (e) => {
    e.preventDefault();
    // 구글 로그인 화면으로 이동시키기
  window.location.href = `https://accounts.google.com/o/oauth2/auth?
redirect_uri=${process.env.REACT_APP_GOOGLE_AUTH_REDIRECT_URI}
&client_id=${process.env.REACT_APP_GOOGLE_AUTH_CLIENT_ID}
&response_type=code
&scope=email profile`;
  };


  return (
    <>
    <div id="sign_in_modal">
      <h2>로그인</h2>
      <div className="sign_in_form" onSubmit={handleSubmit}>
        <input type="text" name="u_id"  className="txt_basic" value={uId} onChange={uIdChangeHandler} placeholder="아이디 입력하세요" /> 
        <br />
        <input name="u_pw" className="txt_basic" type="password" value={uPw} onChange={uPwChangeHandler} placeholder="비밀번호를 입력하세요" />
        <br />
        <button type="submit" className="btn_basic" onClick={handleSubmit} >로그인</button>
      <button name="google" className="btn_basic" onClick={googleLogin} >Google</button>

      <button name="searchid" className="btn_basic" onClick={openIdModal}>ID 찾기</button>
      <Modal open={idModalOpen} close={closeIdModal} header="ID 찾기">
      <input name="phone" type="text" className="txt_basic" value={uPhone} onChange={uPhoneChangeHandler} placeholder="전화번호를 입력하세요" />
      <button className="btn_basic" onClick={handleSearchId}>찾기</button>
      <input type="text" name="id_idsearch" value={id} className="txt_basic" />
      </Modal>
      <button name="searchpw" className="btn_basic" onClick={openPwModal}>PW 찾기</button>
      <Modal open={pwModalOpen} close={closePwModal} header="PW 찾기">
      <input name="id" type="text" className="txt_basic" value={id} onChange={idChangeHandler} placeholder="아이디를 입력하세요" />
      <input name="phone" type="text" className="txt_basic" value={uPhone} onChange={uPhoneChangeHandler} placeholder="전화번호를 입력하세요" />
      <button className="btn_basic" onClick={handleSearchPw}>찾기</button>
      <input type="text" name="pw_pwsearch" value={pw} className="txt_basic" />
      </Modal>

      </div>
      <div className="our-event-section-2">
          <Slide items={events} itemsPerSlide={1} autoSlide={true} /> 
      </div>
    </div>
    </>
  );
};

export default Signin;
