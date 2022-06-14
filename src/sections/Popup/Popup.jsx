import React from 'react';
import './Popup.scss';
import MainLayout from './../../layouts/mainLayout/mainLayout'
import { BrowserRouter as Router } from 'react-router-dom';
import { Provider } from 'react-redux';
import { store } from '../../services/redux/store';

const Popup = () => {
  return (
    <div className="popup">
      <Router>
        <Provider store={store}>
          <MainLayout></MainLayout>
        </Provider>
      </Router>
    </div >
  );
};

export default Popup;
