import React from 'react';
import ReactDOM from 'react-dom';
import axios from 'axios';

import Ingredients from './Ingredients';
import Questions from './Questions';
import './app.css';

axios.interceptors.response.use(res => {
  console.log(res.data); // TODO: display ok
  return res;
}, console.error); // TODO: display error

const App = window.location.search.includes('type=ingredients')
  ? Ingredients
  : Questions;

ReactDOM.render(<App />, document.getElementById('root'));
