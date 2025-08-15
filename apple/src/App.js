import React from 'react';
import './css/common.css';
import './css/login.css';
import MainHeader from './components/MainPage/mainHeader';
import MainContents from './components/MainPage/mainContents';
import MainFooter from './components/MainPage/mainFooter';

function App() {
  return (
    <>
      <MainHeader/>
      <MainContents/>
      <MainFooter/>
    </>
  );
}

export default App;
