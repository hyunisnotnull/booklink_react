import React from 'react';
import ReactDOM from 'react-dom/client';
import './css/common.css';
import App from './App';
import { CookiesProvider } from 'react-cookie';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
    <CookiesProvider>

            <App /> 

    </CookiesProvider>
);
