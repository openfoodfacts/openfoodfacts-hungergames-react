import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import axios from 'axios';
import Fuse from 'fuse.js';
import categories from './categories';
import keys from './keys';

axios.interceptors.response.use(res => res, console.error); // TODO: display error

const options = categories.map(c => c.category).filter(c => c.startsWith('en'));

const App = () => {
  const [login, setLogin] = useState('');
  const [password, setPassword] = useState('');
  const [step, setStep] = useState(0);
  const [product, setProduct] = useState();
  const [codes, setCodes] = useState();
  const [result, setResult] = useState();
  const [loading, setLoading] = useState(false);
  const [option, setOption] = useState('');

  const fuse = new Fuse(categories, {
    id: 'category',
    keys,
    threshold: 0.1,
    shouldSort: true,
    includeMatches: true,
  });

  const next = () => {
    setLoading(true);
    setOption('');
    axios(
      `https://world.openfoodfacts.org/api/v0/product/${
        codes[step]
      }.json?fields=product_name,code,categories,states_tags,image_front_url`,
    )
      .then(({ data }) => {
        setStep((step + 1) % 20);
        setProduct(data.product);
        setResult(fuse.search(data.product.product_name)[0]);
        // TODO: next if not result (and log for debug)
        if (
          !data.product.states_tags.includes('en:categories-to-be-completed')
        ) {
          // TODO: Already completed, call next
        }
      })
      .finally(() => setLoading(false));
  };

  const useAppCredentials = () => {
    setLogin('HungerGameApp');
    setPassword('HungerGameAppPassword');
    next();
  };

  const edit = category => {
    setOption('');
    axios(
      `https://world.openfoodfacts.org/cgi/product_jqm2.pl?code=${
        codes[step - 1] // TODO: not use - 1
      }&user_id=${login}&password=${password}&add_categories=${category}`,
    ).then(() => {
      // TODO: display ok
      next();
    });
  };

  useEffect(() => {
    if (step !== 0) {
      return;
    }
    const page = Math.floor(Math.random() * 20000);
    axios(
      `https://world.openfoodfacts.org/state/categories-to-be-completed/product-name-completed/${page}.json&fields=code`,
    ).then(({ data }) => {
      setCodes(data.products.map(({ code }) => code));
    });
  }, [step]);



  if (!codes) {
    return 'Loading...';
  }

  if (!product) {
    return (
      <div className="h-100 d-flex align-items-center justify-content-center">
        <div style={{ width: '350px' }} className="text-center">
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
    <div className="h-100 d-flex flex-column align-items-center justify-content-center">
      <h4>
        {product.product_name || <i>No name</i>}{' '}
        <small>
          (
          <a
            rel="noopener noreferrer"
            target="_blank"
            href={`https://world.openfoodfacts.org/product/${product.code}`}
          >
            {product.code}
          </a>
          )
        </small>
      </h4>
      {product.image_front_url ? (
        <img
          alt="product"
          className="mb-2"
          height="200px"
          src={product.image_front_url}
        />
      ) : (
        <span className="d-flex align-items-center" style={{ height: '200px' }}>
          No image available
        </span>
      )}
      {result ? (
        <>
          <div>Match: {result.matches[0].value}</div>
          <h5>
            <span className="badge badge-success">{result.item}</span>
          </h5>
        </>
      ) : (
        <div>Sorry, no result found</div>
      )}
      <div className="d-flex mt-2">
        <button
          className="btn btn-secondary mr-3"
          disabled={loading}
          onClick={next}
        >
          Next
        </button>
        <button
          className="btn btn-primary"
          disabled={!result || loading}
          onClick={() => edit(result.item)}
        >
          OK
        </button>
      </div>
      <div className="d-flex flex-column mt-2" style={{ width: '350px' }}>
        <input
          placeholder="Search a category"
          className="form-control"
          value={option}
          onChange={e => setOption(e.target.value)}
        />
        {options.includes(option) ? (
          <button
            disabled={loading || !options.includes(option)}
            onClick={() => edit(option)}
            className="btn btn-primary mt-1"
          >
            Select
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
