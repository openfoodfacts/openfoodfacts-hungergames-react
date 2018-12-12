import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import axios from 'axios';

axios.interceptors.response.use(res => res, console.error); // TODO: display error

const App = () => {
  const [result, setResult] = useState();
  const [loading, setLoading] = useState(true);

  const next = () => {
    setLoading(true);
    axios('http://robotoff.bournhonesque.eu/api/v1/categories/predictions')
      .then(({ data }) => {
        setResult({
          ...data,
          code: data.product.product_link.split('/').pop(),
        });
      })
      .finally(() => setLoading(false));
  };

  const edit = annotation => {
    setLoading(true);
    axios
      .post(
        'http://robotoff.bournhonesque.eu/api/v1/categories/annotate',
        new URLSearchParams(
          `task_id=${result.task_id}&annotation=${annotation}&save=1`,
        ),
      )
      .then(({ data }) => {
        console.log(data); // TODO: display ok
        next();
      });
  };

  useEffect(
    () => {
      const keyDownHandle = event => {
        if (result && !loading) {
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
    [loading, result],
  );

  useEffect(() => next(), []);

  if (!result) {
    return (
      <h4 className="mt-3 text-center">
        <p>For the moment the site is only available in http !</p>
        Loading...
      </h4>
    );
  }

  return (
    <div className="d-flex mt-3 flex-column text-center align-items-center">
      <h4 style={{ minHeight: '3.6rem' }} className="mb-0">
        {result.product.product_name}
      </h4>
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
        <img alt="product" height="180px" src={result.product.image_url} />
      ) : (
        <span className="d-flex align-items-center" style={{ height: '180px' }}>
          No image available
        </span>
      )}
      <h4 className="mt-2">Is this category right ?</h4>
      <h5>
        <span className="badge badge-success">{result.prediction.id}</span>
      </h5>
      <div className="d-flex mt-2">
        <button
          className="btn btn-danger mr-3"
          disabled={loading}
          onClick={() => edit(0)}
        >
          No (n)
        </button>
        <button
          className="btn btn-secondary mr-3"
          disabled={loading}
          onClick={() => edit(-1)}
        >
          Not sure (k)
        </button>
        <button
          className="btn btn-primary"
          disabled={!result || loading}
          onClick={() => edit(1)}
        >
          Yes (o)
        </button>
      </div>
    </div>
  );
};

ReactDOM.render(<App />, document.getElementById('root'));
