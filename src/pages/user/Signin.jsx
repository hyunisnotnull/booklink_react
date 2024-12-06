import React , { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from "react-router-dom";
import '../../css/user/signin.css';
import Slide from '../../comp/Slide';

const Signin = () => {
  const [uId, setUId] = useState('');
  const [uPw, setUPw] = useState('');
  const [events, setEvents] = useState([]);

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
          navigate('/');
        } else {

          alert('올바르지 않은 ID 또는 PW 입니다.')
          navigate('/signin');
        }

    } catch(err){
      navigate('/signin');
    }

  }

  const googleLogin = (e) => {
    e.preventDefault();
    // 구글 로그인 화면으로 이동시키기
  window.location.href = `https://accounts.google.com/o/oauth2/auth?
  client_id=${process.env.REACT_APP_GOOGLE_AUTH_CLIENT_ID}
  &redirect_uri=${process.env.REACT_APP_GOOGLE_AUTH_REDIRECT_URI}
  &response_type=code
  &scope=email profile`;
  };


  return (
    <>
    <div id="sign_in_modal">
      <h2>로그인</h2>
      <form className="sign_in_form" onSubmit={handleSubmit}>
        <input type="text" name="u_id"  className="txt_basic" value={uId} onChange={uIdChangeHandler} placeholder="아이디 입력하세요" /> 
        <br />
        <input name="u_pw" className="txt_basic" type="password" value={uPw} onChange={uPwChangeHandler} placeholder="비밀번호를 입력하세요" />
        <br />
        <button type="submit" className="btn_basic" >로그인</button>
      <button className="btn_basic" onClick={googleLogin} >Google</button>
      </form>
      <div className="our-event-section-2">
          <Slide items={events} itemsPerSlide={1} autoSlide={true} /> 
      </div>
    </div>
    </>
  );
};

export default Signin;
