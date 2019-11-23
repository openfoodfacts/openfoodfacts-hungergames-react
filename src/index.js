import React from 'react';
import ReactDOM from 'react-dom';
import axios from 'axios';

import Ingredients from './Ingredients';
import Questions from './Questions';
import Nutritions from './NutritionValues';

import './app.css';

axios.interceptors.response.use(res => {
  console.log(res.data); // TODO: display ok
  return res;
}, console.error); // TODO: display error

if (process.env.NODE_ENV === 'development') {
  // simulate login in dev
  document.cookie = 'session=ok';
}
let App;
if (window.location.search.includes('type=ingredients')) {
  App = Ingredients;
} else if (window.location.search.includes('type=nutrition')) {
  App = Nutritions;
} else {
  App = Questions;
}
ReactDOM.render(<App />, document.getElementById('root'));
