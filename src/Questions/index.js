import React, { useState, useEffect } from 'react';
import axios from 'axios';

import countries from './countries';
import insightTypes from './insightTypes';
import './questions.css';

const tooggleSelection = (selectedInsights, insightType) =>
  selectedInsights.includes(insightType)
    ? selectedInsights.filter(insight => insight !== insightType)
    : [...selectedInsights, insightType];

const NO_QUESTION_REMAINING = 'NO_QUESTION_REMAINING';

const Questions = () => {
  const [questions, setQuestions] = useState([]);
  const [country, setCountry] = useState('en:france');
  const [loading, setLoading] = useState(false);
  const [inputFocused, setInputFocused] = useState(false);
  const [selectedInsights, setSelectedInsights] = useState(
    Object.keys(insightTypes),
  );

  const lang = (() => {
    const matches = /(\w+).openfoodfacts.org/.exec(window.location.href);
    if (!matches) {
      return 'en';
    }
    const subDomain = matches[1];
    return subDomain === 'world' ? 'en' : subDomain;
  })();

  const brands = new URL(window.location.href).searchParams.get('brands');

  const loadQuestions = () => {
    setLoading(true);
    let questionsResults;
    axios(
      `https://robotoff.openfoodfacts.org/api/v1/questions/random?country=${country}&lang=${lang}&count=5${
        brands ? `&brands=${brands}` : ''
      }${
        ![0, 4].includes(selectedInsights.length)
          ? `&insight_types=${selectedInsights.join(',')}`
          : ''
      }`,
    )
      .then(({ data }) => {
        questionsResults = data.questions
          .filter(
            ({ insight_id }) =>
              !questions.some(q => q.insight_id === insight_id),
          )
          .map(q => ({
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
            results.length
              ? questionsResults.map((q, i) => ({
                  ...q,
                  productName: results[i].data.product.product_name,
                }))
              : NO_QUESTION_REMAINING,
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

  // Disable keys shortcut when one of two other inputs (in OFF main header) is focused
  const countryBox = window.document.querySelector(
    'span[class="select2-selection select2-selection--single"]',
  );
  const searchInput = window.document.querySelector(
    'input[name="search_terms"]',
  );
  useEffect(() => {
    const setInputFocusedFalse = () => setInputFocused(false);
    const setInputFocusedTrue = () => setInputFocused(true);
    if (countryBox) {
      countryBox.addEventListener('click', () => {
        const countryInput = window.document.querySelector(
          'input[class="select2-search__field"]',
        );
        if (countryInput) {
          countryInput.addEventListener('focus', setInputFocusedTrue);
          countryInput.addEventListener('blur', setInputFocusedFalse);
        }
      });
    }
    if (searchInput) {
      searchInput.addEventListener('focus', setInputFocusedTrue);
      searchInput.addEventListener('blur', setInputFocusedFalse);
    }
  }, [searchInput, countryBox]);

  useEffect(() => {
    const keyDownHandle = event => {
      if (
        questions.length &&
        questions[0] !== NO_QUESTION_REMAINING &&
        !inputFocused
      ) {
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
    if (
      !loading &&
      questions.length <= 2 &&
      !questions.includes(NO_QUESTION_REMAINING)
    ) {
      loadQuestions();
    }
  }, [loading, questions]);

  if (!questions.length) {
    return <h4 className="mt-3 text-center">Loading...</h4>;
  }

  if (questions[0] === NO_QUESTION_REMAINING) {
    return <h4 className="mt-3 text-center">No questions remaining</h4>;
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

      <div className="selectQuestion">
        {Object.keys(insightTypes).map(insightType => (
          <button
            className={
              selectedInsights.includes(insightType) ? 'selected' : 'unselected'
            }
            onClick={() => {
              setSelectedInsights(
                tooggleSelection(selectedInsights, insightType),
              );
            }}
          >
            {insightTypes[insightType]}
          </button>
        ))}
      </div>

      {questions[0] ? (
        <>
          <h4 className="productName">
            <a
              rel="noopener noreferrer"
              target="_blank"
              href={questions[0].productLink}
            >
              {questions[0].productName}
            </a>
          </h4>
          {questions[0].source_image_url ? (
            <img alt="product" src={questions[0].source_image_url} />
          ) : (
            <div className="noImageAvailable">No image available</div>
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
              Skip (k)
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

export default Questions;
