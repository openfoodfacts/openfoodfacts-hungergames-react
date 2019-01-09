import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import axios from 'axios';

import countries from './countries';
import './app.css';

axios.interceptors.response.use(res => {
  console.log(res.data); // TODO: display ok
  return res;
}, console.error); // TODO: display error

const App = () => {
  const [result, setResult] = useState();
  const [country, setCountry] = useState('en:france');
  const [loading, setLoading] = useState(true);
  const [inputFocused, setInputFocused] = useState(false);

  const next = () => {
    setLoading(true);
    axios(
      `https://robotoff.openfoodfacts.org/api/v1/categories/predictions?campaign=matcher&country=${country}`,
    )
      .then(({ data }) => {
        setResult({
          ...data,
          code: data.product && data.product.product_link.split('/').pop(),
        });
      })
      .finally(() => setLoading(false));
  };

  const edit = annotation => {
    setLoading(true);
    axios.post(
      'https://robotoff.openfoodfacts.org/api/v1/categories/annotate',
      new URLSearchParams(
        `task_id=${result.task_id}&annotation=${annotation}&save=0`,
      ),
    ); // To improve prediction API, no need to wait the response
    if (annotation === 1) {
      axios(
        `/cgi/product_jqm2.pl?code=${result.code}&add_categories=${
          result.prediction.id
        }`,
      ).then(next);
    } else {
      next();
    }
  };

  useEffect(() => {
    const countryBox = window.document.querySelector(
      'span[class="select2-selection select2-selection--single"]',
    );
    countryBox.addEventListener('click', () => {
      const countryInput = window.document.querySelector(
        'input[class="select2-search__field"]',
      );
      if (countryInput) {
        countryInput.addEventListener('focus', () => {
          setInputFocused(true);
        });
        countryInput.addEventListener('blur', () => {
          setInputFocused(false);
        });
      }
    });
    const searchInput = window.document.querySelector(
      'input[name="search_terms"]',
    );
    if (searchInput) {
      // available only on large display
      searchInput.addEventListener('focus', () => {
        setInputFocused(true);
      });
      searchInput.addEventListener('blur', () => {
        setInputFocused(false);
      });
    }
  }, []);

  useEffect(
    () => {
      const keyDownHandle = event => {
        if (result && !loading && !inputFocused) {
          if (event.which === 75) edit(-1); // k
          if (event.which === 78) edit(0); // n
          if (event.which === 79) edit(1); // o
        }
      };
      window.document.addEventListener('keydown', keyDownHandle);
      return () => {
        window.document.removeEventListener('keydown', keyDownHandle);
      };
    },
    [loading, inputFocused, result],
  );

  useEffect(() => next(), [country]);

  if (!result) {
    return <h4 className="mt-3 text-center">Loading...</h4>;
  }

  return (
    <div className="mt-3 text-center">
      <select
        className="countrySelect"
        value={country}
        onChange={e => setCountry(e.target.value)}
      >
        {Object.entries(countries).map(([id, label]) => (
          <option key={id} value={id}>
            {label}
          </option>
        ))}
      </select>
      {result.product ? (
        <>
          <h4 className="productName">{result.product.product_name}</h4>
          <h5>
            (
            <a
              rel="noopener noreferrer"
              target="_blank"
              href={result.product.edit_product_link}
            >
              {result.code}
            </a>
            )
          </h5>
          {result.product.image_url ? (
            <img alt="product" src={result.product.image_url} />
          ) : (
            <span>No image available</span>
          )}
          <h4 className="mt-2">Is this category right ?</h4>
          <h5>
            <span className="prediction">{result.prediction.id}</span>
          </h5>
          <div className="mt-3">
            <button
              className="button alert mr-3"
              disabled={loading}
              onClick={() => edit(0)}
            >
              No (n)
            </button>
            <button
              className="button secondary mr-3"
              disabled={loading}
              onClick={() => edit(-1)}
            >
              Not sure (k)
            </button>
            <button
              className="button success"
              disabled={!result || loading}
              onClick={() => edit(1)}
            >
              Yes (o)
            </button>
          </div>
        </>
      ) : (
        <h4>No prediction left</h4>
      )}
    </div>
  );
};

ReactDOM.render(<App />, document.getElementById('root'));
