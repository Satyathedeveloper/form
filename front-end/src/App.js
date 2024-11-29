import React from 'react';
import AuthPage from './components/loginPage/login';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Bridge from './bridge';
const App = () => {

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={< AuthPage/>} />
        <Route path="/form/:uniquekey" element={<Bridge/>}/>
      </Routes>
    </BrowserRouter>
  );
};

export default App;


