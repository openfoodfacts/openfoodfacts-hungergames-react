import React, { useEffect, useState } from 'react';
import axios from 'axios';

const Ingredients = () => {
  const isLogged = document.cookie
    .split(';')
    .some(c => c.split('=')[0].trim() === 'session');
  if (!isLogged) {
    return <h1>Please log in !</h1>;
  }

  const [validateInput, setValidateInput] = useState('');
  const [ingredients, setIngredients] = useState('');
  const [products, setProducts] = useState([]);

  const getData = async () => {
    const {
      data: { count, page_size },
    } = await axios(
      '/off/state/photos-validated/state/ingredients-to-be-completed.json?fields=null',
    );
    const randomPage = Math.floor((Math.random() * count) / page_size);
    const {
      data: { products },
    } = await axios(
      `/off/state/photos-validated/state/ingredients-to-be-completed/${randomPage}.json`,
    );
    setProducts(products);
    const {
      data: { ingredients_text_from_image },
    } = await axios(
      `/off/cgi/ingredients.pl?code=${
        products[0].code
      }&id=ingredients_fr&process_image=1&ocr_engine=google_cloud_vision`,
    );
    const {
      data: { text, corrected },
    } = await axios.post(
      `/robotoff/api/v1/predict/ingredients/spellcheck?text=${ingredients_text_from_image}`,
    );
    setIngredients(corrected || text);
  };

  useEffect(() => {
    getData();
  }, []);

  if (!products.length) {
    return <h4 className="mt-3 text-center">Loading...</h4>;
  }

  return (
    <div className="mt-3 text-center">
      <img src={products[0].image_ingredients_url} alt="ingredients" />
      <div className="mt-3 d-flex-center">
        <textarea
          value={ingredients}
          onChange={e => setIngredients(e.target.value)}
          style={{ width: '80%' }}
          rows={4}
        />
      </div>
      <div className="mt-3 d-flex-center">
        <button className="button secondary mr-3" onClick={() => {}}>
          Skip
        </button>
        <input
          value={validateInput}
          style={{ width: '200px' }}
          onChange={e => setValidateInput(e.target.value)}
          placeholder="Type 'ok' to enable edit"
        />
        <button
          className="button success ml-3"
          onClick={() => {}}
          disabled={validateInput !== 'ok'}
        >
          Edit
        </button>
      </div>
    </div>
  );
};

export default Ingredients;
