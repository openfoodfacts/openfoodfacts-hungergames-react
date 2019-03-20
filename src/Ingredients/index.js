import React from 'react';

const Ingredients = () => {
  const isLogged = document.cookie
    .split(';')
    .some(c => c.split('=')[0].trim() === 'session');
  if (!isLogged) {
    return <h1>Please log in !</h1>;
  }

  return <div>Ingredients</div>;
};

export default Ingredients;
