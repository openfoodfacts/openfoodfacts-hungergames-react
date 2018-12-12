import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import axios from 'axios';

axios.interceptors.response.use(res => res, console.error); // TODO: display error

const options = categories.map(c => c.category).filter(c => c.startsWith('en'));

const App = () => {
  const [login, setLogin] = useState('');
  const [password, setPassword] = useState('');
  const [result, setResult] = useState();
  const [loading, setLoading] = useState(false);
  const [option, setOption] = useState('');
  const [focused, setFocused] = useState(false);

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

  const useAppCredentials = () => {
    setLogin('hungergames');
    setPassword('happyhungergames');
    next();
  };

  const edit = annotation => {
    setLoading(true);
    setOption('');
    axios.post('http://robotoff.bournhonesque.eu/api/v1/categories/annotate',
      new URLSearchParams(`task_id=${result.task_id}&annotation=${annotation}&save=1`)
    ).then(() => {
      // TODO: display ok
      next();
    });
  };

  useEffect(
    () => {
      const keyDownHandle = event => {
        if (result && !loading && !focused) {
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
    [loading, result, focused],
  );

  if (!result) {
    return (
      <div className="mt-5 d-flex align-items-center justify-content-center">
        <div style={{ width: '300px' }} className="text-center">
          <h4>Please enter your credentials to enable edits</h4>
          <input
            className="mt-2 form-control"
            value={login}
            placeholder="Login"
            onChange={e => setLogin(e.target.value)}
          />
          <input
            className="my-2 form-control"
            placeholder="Password"
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
          />
          <button
            disabled={!login || !password || loading}
            className="btn btn-success btn-block"
            onClick={next}
          >
            Start
          </button>
          <button
            className="btn btn-secondary btn-block"
            disabled={loading}
            onClick={useAppCredentials}
          >
            Use app credentials
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="d-flex pt-3 flex-column text-center align-items-center">
      <h4 style={{minHeight: '3.6rem'}} className="mb-0">{result.product.product_name}</h4>
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
        <img
          alt="product"
          height="180px"
          src={result.product.image_url}
        />
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
      <div className="d-flex flex-column mt-2" style={{ width: '300px' }}>
        <input
          placeholder="Search a category"
          className="form-control"
          value={option}
          onChange={e => setOption(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
        />
        {options.includes(option) ? (
          <button
            disabled
            className="btn btn-primary mt-1"
          >
            Select (available soon)
          </button>
        ) : (
          <div className="list-group">
            {option.length > 1 &&
              options
                .filter(o => o.includes(option))
                .slice(0, 5)
                .map(o => (
                  <span
                    key={o}
                    className="list-group-item list-group-item-action"
                    onClick={() => setOption(o)}
                  >
                    {o}
                  </span>
                ))}
          </div>
        )}
      </div>
    </div>
  );
};

ReactDOM.render(<App />, document.getElementById('root'));
