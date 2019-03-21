import React, { useEffect, useState } from 'react';
import axios from 'axios';

const Ingredients = () => {
  const isLogged = document.cookie
    .split(';')
    .some(c => c.split('=')[0].trim() === 'session');
  if (!isLogged) {
    return <h1 className="mt-3 text-center">Please log in !</h1>;
  }

  const [validateInput, setValidateInput] = useState('');
  const [ingredients, setIngredients] = useState('');
  const [loading, setLoading] = useState(false);
  const [products, setProducts] = useState([]);

  const getIngredients = async code => {
    const {
      data: { ingredients_text_from_image },
    } = await axios(
      `/off/cgi/ingredients.pl?code=${code}&id=ingredients_fr&process_image=1&ocr_engine=google_cloud_vision`,
    );
    const {
      data: { text, corrected },
    } = await axios.post(
      '/robotoff/api/v1/predict/ingredients/spellcheck',
      new URLSearchParams(`text=${ingredients_text_from_image}`),
    );
    return corrected || text;
  };

  const getProducts = async () => {
    setLoading(true);
    const {
      data: { count, page_size },
    } = await axios(
      '/off/state/photos-validated/state/ingredients-to-be-completed.json?fields=null',
    ); // TODO: should be done only one times
    const randomPage = Math.floor((Math.random() * count) / page_size);
    const {
      data: { products: newProducts },
    } = await axios(
      `/off/state/photos-validated/state/ingredients-to-be-completed/${randomPage}.json`,
    );
    const ingredientsResults = await axios.all(
      // 20 parallels request will be to much
      newProducts.slice(0, 5).map(p => getIngredients(p.code)),
    );
    if (!products.length) {
      setIngredients(ingredientsResults[0]);
    }
    setProducts(
      products.concat(
        newProducts
          .slice(0, 5)
          .map((p, i) => ({ ...p, ingredients: ingredientsResults[i] })),
      ),
    );
    setLoading(false);
  };

  useEffect(() => {
    if (!loading && products.length <= 2) {
      getProducts();
    }
  }, [loading, products]);

  const edit = skip => {
    if (!skip) {
      axios.post(
        `/off/cgi/product_jqm2.pl?`,
        new URLSearchParams(`ingredients_fr_text=${ingredients}`),
      ); // The status of the response is not displayed so no need to wait the response
    }
    setValidateInput('');
    const newProducts = products.filter((_, i) => i); // remove first product
    setProducts(newProducts);
    setIngredients(newProducts[0].ingredients);
  };

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
        <button className="button secondary mr-3" onClick={() => edit(true)}>
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
          onClick={() => edit(false)}
          disabled={validateInput !== 'ok'}
        >
          Edit
        </button>
      </div>
    </div>
  );
};

export default Ingredients;
