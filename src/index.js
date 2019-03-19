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
  const [questions, setQuestions] = useState([]);
  const [country, setCountry] = useState('en:france');
  const [loading, setLoading] = useState(false);
  const [inputFocused, setInputFocused] = useState(false);

  const lang = (() => {
    const matches = /(\w+).openfoodfacts.org/.exec(window.location.href);
    if (!matches) {
      return 'en';
    }
    const subDomain = matches[1];
    return subDomain === 'world' ? 'en' : subDomain;
  })();

  const loadQuestions = () => {
    setLoading(true);
    let questionsResults;
    axios(
      `https://robotoff.openfoodfacts.org/api/v1/questions/random?country=${country}&lang=${lang}&count=5`,
    )
      .then(({ data }) => {
        questionsResults = data.questions.map(q => ({
          ...q,
          productLink: `https://world.openfoodfacts.org/product/${q.barcode}`,
        }));
        return axios.all(
          questionsResults.map(q =>
            axios(
              `https://world.openfoodfacts.org/api/v0/product/${
                q.barcode
              }.json?fields=product_name`,
            ),
          ),
        );
      })
      .then(results => {
        setQuestions(
          questions.concat(
            questionsResults.map((q, i) => ({
              ...q,
              productName: results[i].data.product.product_name,
            })),
          ),
        );
      })
      .finally(() => setLoading(false));
  };

  const edit = annotation => {
    axios.post(
      'https://robotoff.openfoodfacts.org/api/v1/insights/annotate',
      new URLSearchParams(
        `insight_id=${
          questions[0].insight_id
        }&annotation=${annotation}&update=1`,
      ),
    ); // The status of the response is not displayed so no need to wait the response
    setQuestions(questions.filter((_, i) => i)); // remove first question
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

  useEffect(() => {
    const keyDownHandle = event => {
      if (questions.length && !inputFocused) {
        if (event.which === 75) edit(-1); // k
        if (event.which === 78) edit(0); // n
        if (event.which === 79) edit(1); // o
      }
    };
    window.document.addEventListener('keydown', keyDownHandle);
    return () => {
      window.document.removeEventListener('keydown', keyDownHandle);
    };
  }, [inputFocused, questions]);

  useEffect(() => {
    setQuestions([]);
  }, [country]);

  useEffect(() => {
    if (!loading && questions.length <= 2) {
      loadQuestions();
    }
  }, [loading, questions]);

  if (!questions.length) {
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
      {questions[0] ? (
        <>
          <h4 className="productName">{questions[0].productName}</h4>
          <h5>
            (
            <a
              rel="noopener noreferrer"
              target="_blank"
              href={questions[0].productLink}
            >
              {questions[0].barcode}
            </a>
            )
          </h5>
          {questions[0].source_image_url ? (
            <img alt="product" src={questions[0].source_image_url} />
          ) : (
            <span>No image available</span>
          )}
          <h4 className="mt-2">{questions[0].question}</h4>
          <h5>
            <span className="prediction">{questions[0].value}</span>
          </h5>
          <div className="mt-3">
            <button className="button alert mr-3" onClick={() => edit(0)}>
              No (n)
            </button>
            <button className="button secondary mr-3" onClick={() => edit(-1)}>
              Not sure, skip (k)
            </button>
            <button className="button success" onClick={() => edit(1)}>
              Yes (o)
            </button>
          </div>
        </>
      ) : (
        <h4>No questions left</h4>
      )}
    </div>
  );
};

ReactDOM.render(<App />, document.getElementById('root'));
