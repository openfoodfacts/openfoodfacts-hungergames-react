import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import nutriments from './nutriments';
import './nutriments.css';

const useNumberOfPages = () => {
  const [nbOfPages, setNbOfPages] = useState(-1);
  useEffect(() => {
    const getData = async () => {
      const {
        data: { count, page_size },
      } = await axios(
        `${
          process.env.REACT_APP_OFF_BASE
        }state/photos-validated/state/nutrition-facts-to-be-completed/1.json?fields=null`,
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
        let {
          data: { products },
        } = await axios(
          `${
            process.env.REACT_APP_OFF_BASE
          }/state/photos-validated/state/nutrition-facts-to-be-completed/${randomPage}.json?fields=code,lang,image_nutrition_url`,
        );
        setLoading(false);
        products = products.map(product => {
          return {
            code: product.code,
            imageUrl: product.image_nutrition_url,
            lang: product.lang,
          };
        });
        setProductsBacklog([...productsBacklog, ...products]);
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

  useEffect(() => {
    const newNutritionValues = {};
    const newNutritionVisible = {};
    Object.keys(nutriments).forEach(nutrimentName => {
      newNutritionValues[nutrimentName] = '';
      newNutritionVisible[nutrimentName] = true;
    });

    setNutritionValues(newNutritionValues);
    setNutritionVisible(newNutritionVisible);
  }, [products[0]]);

  const toogleVisibility = useCallback(
    nutrimentName => () => {
      nutritionValues[nutrimentName] = '';
      setNutritionValues({ ...nutritionValues, [nutrimentName]: '' });
      setNutritionVisible({
        ...nutritionVisible,
        [nutrimentName]: !nutritionVisible[nutrimentName],
      });
    },
    [nutritionValues, nutritionVisible],
  );

  if (nbOfPages < 0) {
    return <p>Connextion to the API</p>;
  }
  if (loadingProducts) {
    return <p>Loading Products</p>;
  }
  if (products.length === 0) {
    return <p>No Product found</p>;
  }

  return (
    <div className="root">
      <img src={products[0].imageUrl} alt="product" />
      <ul className="fields">
        {Object.keys(nutriments).map(nutrimentName => (
          <li
            key={nutrimentName}
            className={nutritionVisible[nutrimentName] ? 'shadow' : ''}
          >
            <p className="nutrition-label">{nutrimentName}</p>
            <input
              type="number"
              value={nutritionValues[nutrimentName]}
              className="nutrition-input"
              onChange={e => {
                setNutritionValues({
                  ...nutritionValues,
                  [nutrimentName]: e.target.value,
                });
              }}
            />
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
        onClick={() => {
          setProducts(products.slice(1));
        }}
      >
        skip
      </button>
    </div>
  );
};

export default NutritionValues;
