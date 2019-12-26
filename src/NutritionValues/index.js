import React, { useState, useEffect, useCallback } from 'react';
import CheckEntries from './checkEntries';
import ImageZoom from 'react-medium-image-zoom';
import PortionSetter from './PortionSetter';
import axios from 'axios';
import nutriments from './nutriments';
import { getSubDomain } from '../utils';
import './nutriments.css';

const NUTRIMENT_UNITS = nutrimentName => {
  switch (nutrimentName) {
    case 'Energy (kCal)':
      return ['kcal'];
    case 'Energy (kJ)':
      return ['kJ'];
    default:
      return ['g', 'mg'];
  }
};
const useNumberOfPages = () => {
  const [nbOfPages, setNbOfPages] = useState(-1);
  useEffect(() => {
    const getData = async () => {
      const {
        data: { count, page_size },
      } = await axios(
        `${
          process.env.REACT_APP_OFF_BASE
        }/state/photos-validated/state/nutrition-facts-to-be-completed/1.json?fields=null`,
      );

      setNbOfPages(Math.ceil(count / page_size));
    };
    getData();
  }, []);

  return nbOfPages;
};

const useGetProduct = nbOfPages => {
  const [productsBacklog, setProductsBacklog] = useState([]);
  const [loading, setLoading] = useState(false);
  useEffect(() => {
    if (nbOfPages >= 0 && productsBacklog.length < 6) {
      const AddProducts = async () => {
        setLoading(true);
        const randomPage = Math.floor(Math.random() * nbOfPages);
        const {
          data: { products },
        } = await axios(
          `${
            process.env.REACT_APP_OFF_BASE
          }/state/photos-validated/state/nutrition-facts-to-be-completed/${randomPage}.json?fields=code,lang,image_nutrition_url,product_name`,
        );
        setLoading(false);
        setProductsBacklog(
          productsBacklog.concat(
            products.map(
              ({ code, lang, image_nutrition_url, product_name }) => {
                return {
                  code,
                  imageUrl: image_nutrition_url,
                  lang,
                  productLink: `https://${getSubDomain()}.openfoodfacts.org/product/${code}`,
                  productName: product_name,
                };
              },
            ),
          ),
        );
      };
      AddProducts();
    }
  }, [nbOfPages, productsBacklog]);

  return [loading, productsBacklog, setProductsBacklog];
};

const NutritionValues = () => {
  const nbOfPages = useNumberOfPages();
  const [loadingProducts, products, setProducts] = useGetProduct(nbOfPages);
  const [nutritionValues, setNutritionValues] = useState({});
  const [nutritionVisible, setNutritionVisible] = useState({});
  const [isLastCheckOpen, setIsLastCheckOpen] = useState(false);
  const [portionValues, setPortionValues] = useState({});

  useEffect(() => {
    const newNutritionValues = {};
    const newNutritionVisible = {};
    Object.keys(nutriments).forEach(nutrimentName => {
      newNutritionValues[nutrimentName] = { quantity: '', value: '' };
      newNutritionVisible[nutrimentName] = true;
    });
    setNutritionValues(newNutritionValues);
    setNutritionVisible(newNutritionVisible);
  }, [products[0]]);

  const toogleVisibility = useCallback(
    nutrimentName => () => {
      setNutritionValues({ ...nutritionValues, [nutrimentName]: {} });
      setNutritionVisible({
        ...nutritionVisible,
        [nutrimentName]: !nutritionVisible[nutrimentName],
      });
    },
    [nutritionValues, nutritionVisible],
  );

  const setNutritionQuantity = useCallback(
    nutrimentName => event => {
      setNutritionValues({
        ...nutritionValues,
        [nutrimentName]: {
          ...nutritionValues[nutrimentName],
          quantity: event.target.value,
        },
      });
    },
    [nutritionValues],
  );
  const setNutritionUnit = useCallback(
    nutrimentName => event => {
      setNutritionValues({
        ...nutritionValues,
        [nutrimentName]: {
          ...nutritionValues[nutrimentName],
          unit: event.target.value,
        },
      });
    },
    [nutritionValues],
  );

  if (nbOfPages < 0) {
    return <p>Connecting to Open Food Facts…</p>;
  }
  if (loadingProducts) {
    return <p>Loading products</p>;
  }
  if (products.length === 0) {
    return <p>No product found</p>;
  }

  return (
    <div className="root">
      <h4 className="productName">
        <a
          rel="noopener noreferrer"
          target="_blank"
          href={products[0].productLink}
        >
          {products[0].productName || 'Product Page'}
        </a>
      </h4>
      <ImageZoom
        image={{
          src: products[0].imageUrl,
          alt: 'small product picture',
        }}
        zoomImage={{
          src: products[0].imageUrl.match(/\/\d+\.400\.jpg$/i)
            ? products[0].imageUrl.replace('.400.jpg', '.jpg')
            : products[0].imageUrl.replace('.400.jpg', '.full.jpg'),
          alt: 'full product picture',
        }}
        shouldReplaceImage={false}
      />
      {isLastCheckOpen ? (
        <CheckEntries
          nutriments={nutriments}
          nutritionValues={nutritionValues}
          nutritionVisible={nutritionVisible}
          portionValues={portionValues}
          close={() => {
            setIsLastCheckOpen(false);
          }}
          nextProduct={() => {
            setProducts(products.slice(1));
          }}
          code={products[0].code}
        />
      ) : (
        <>
          <PortionSetter values={portionValues} setValues={setPortionValues} />
          <ul className="fields">
            {Object.keys(nutriments).map(nutrimentName => (
              <li
                key={nutrimentName}
                className={nutritionVisible[nutrimentName] ? '' : 'shadow'}
              >
                <p className="nutrition-label">{nutrimentName}</p>
                <input
                  type="number"
                  value={nutritionValues[nutrimentName].quantity}
                  className="nutrition-input"
                  onChange={setNutritionQuantity(nutrimentName)}
                />
                {NUTRIMENT_UNITS(nutrimentName).length > 1 ? (
                  <select
                    value={nutritionValues[nutrimentName].unit}
                    onChange={setNutritionUnit(nutrimentName)}
                    className="portion_unit"
                  >
                    <option disabled value="">
                      unit
                    </option>
                    {NUTRIMENT_UNITS(nutrimentName).map(unit => (
                      <option key={unit} value={unit}>
                        {unit}
                      </option>
                    ))}
                  </select>
                ) : (
                  <span className="portion_unit">
                    {NUTRIMENT_UNITS(nutrimentName)[0]}
                  </span>
                )}

                <button
                  className="nutrition-deletion"
                  onClick={toogleVisibility(nutrimentName)}
                >
                  {nutritionVisible[nutrimentName] ? 'delete' : 'restore'}
                </button>
              </li>
            ))}
          </ul>
          <button
            className="skip button"
            onClick={() => {
              setProducts(products.slice(1));
            }}
          >
            skip
          </button>
          <button
            className="validate button"
            onClick={() => {
              setIsLastCheckOpen(true);
            }}
          >
            Validate
          </button>
        </>
      )}
    </div>
  );
};

export default NutritionValues;
