import React from 'react';
import ReactDOM from 'react-dom';
import {message} from 'antd';
import 'normalize.css';
import 'antd/dist/antd.css';
import './index.scss';
import App from './App';
import { StateProvider } from './store';
// import reportWebVitals from './reportWebVitals';

message.config({ duration: 3, top: 20 });

ReactDOM.render(
  <StateProvider>
    <App />
  </StateProvider>,
  document.getElementById('app')
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
// reportWebVitals();
