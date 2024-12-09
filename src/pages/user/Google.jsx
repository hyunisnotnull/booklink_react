import React , { useState, useEffect } from 'react';
import { useNavigate } from "react-router-dom";
import axios from 'axios';

const Google = () => {
    const params = new URLSearchParams(window.location.search);
    const [code, setCode] = useState(params.get("code"));
    const navigate = useNavigate();
  
    // // 이미 가입한 유저일 시 : 메인 페이지로 이동
    // const handleHome = () => {
    //   navigate("/home");
    //   window.location.reload();
    // };
  
    // // 처음 가입한 유저일 시 : 닉네임 설정 페이지로 이동
    // const handleNickName = () => {
    //   navigate("/nickname");
    //   window.location.reload();
    // };
  
    // 현재 url에서 code 부분 추출
    // const params = new URLSearchParams(window.location.search);
    
    useEffect(() => {
        if (code) {
            handleLoginPost(code);
        } else {
            alert("로그인 재시도하세요.");
        }
    }, [code]);
    
    
      const handleLoginPost = async code => {
        const data = {
          code: code,
        };
        console.log(data)
        try {
          const res = await axios.post(
            `${process.env.REACT_APP_SERVER}/user/google`,
            data,
            {withCredentials: true},
          );
           // 토큰 localstorage에 저장
           console.log('res--->', res.data);
          navigate("/");
          
           // 신규/기존 회원 여부에 따라 페이지 이동
          //  res.data.isExistingMember ? handleHome() : handleNickName();
        } catch (error) {
          console.log(error);
        }
      };
    
    return (
      <>
        {/* <LoadingIcon src={loading} /> */}
        <h2>로그인중입니다...</h2>
      </>
    );
  };

  export default Google;