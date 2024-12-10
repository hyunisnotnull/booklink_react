import React , { useState, useEffect } from 'react';
import { useNavigate } from "react-router-dom";
import axios from 'axios';
import Swal from 'sweetalert2';

const Google = () => {
    const params = new URLSearchParams(window.location.search);
    const [code, setCode] = useState(params.get("code"));
    const navigate = useNavigate();
    
    useEffect(() => {
        if (code) {
            handleLoginPost(code);
        } else {
            Swal.fire({
                title: '로그인 오류',
                text: '로그인 재시도하세요.',
                icon: 'error',
                confirmButtonText: '확인'
            }).then(() => {
                navigate('/signin');
            });
        }
    }, [code]);
    
    
    const handleLoginPost = async code => {
      const data = {
        code: code,
      };
      console.log(data)

      // 로딩 시작
      Swal.fire({
          title: '로그인 중...',
          text: '잠시만 기다려 주세요.',
          allowOutsideClick: false,
          didOpen: () => {
              Swal.showLoading();
          }
      });

      try {
        const res = await axios.post(
          `${process.env.REACT_APP_SERVER}/user/google`,
          data,
          {withCredentials: true},
        );

        // 로딩 종료
        Swal.close();

        const { alert_message } = res.data;

        // 첫 회원가입 시에만 메시지 표시
        if (alert_message) {
          Swal.fire({
            title: res.data.alert_message,
            text: '프로필 정보 수정 후 이용 부탁드립니다.',
            icon: 'warning',
            confirmButtonText: '확인'
          });
        }

        navigate("/");

      } catch (error) {
        console.log(error);
        Swal.close();

        Swal.fire({
            title: '로그인 실패',
            text: '문제가 발생했습니다. 나중에 다시 시도해주세요.',
            icon: 'error',
            confirmButtonText: '확인'
        });
      }
    };
    
    return null;
  };

  export default Google;