import React, { useState, useEffect } from 'react';
import axios from 'axios';

const getIngredientImageUrlFromCode = (code, language, rev, size) => {
  console.log({ code, language, rev, size });
  let url = 'https://static.openfoodfacts.org/images/products/';
  url =
    url +
    code.substring(0, 3) +
    '/' +
    code.substring(3, 6) +
    '/' +
    code.substring(6, 9) +
    '/' +
    code.substring(9, 13);
  url = url + '/nutrition_' + language + '.' + rev + '.' + size + '.jpg';
  return url;
};

const useNumberOfPages = () => {
  const [nbOfPages, setNbOfPages] = useState();
  useEffect(() => {
    const getData = async () => {
      const {
        data: { count, page_size },
      } = await axios(
        `${
          process.env.REACT_APP_OFF_BASE
        }state/photos-validated/state/nutrition-facts-to-be-completed/1.json?fields=null`,
      );

      setNbOfPages(Math.floor(count / page_size));
    };
    getData();
  }, []);

  return nbOfPages;
};

const useGetProduct = nbOfPages => {
  const [productsBacklog, setProductsBacklog] = useState([]);

  useEffect(() => {
    console.log(nbOfPages);
    if (nbOfPages && productsBacklog.length < 6) {
      const AddProducts = async () => {
        const randomPage = Math.floor(Math.random() * nbOfPages);
        let {
          data: { products },
        } = await axios(
          `${
            process.env.REACT_APP_OFF_BASE
          }/state/photos-validated/state/nutrition-facts-to-be-completed/${randomPage}.json?fields=code,images,lang`,
        );
        products = products
          .filter(product => {
            console.log(product);
            return Object.keys(product.images).includes(
              `nutrition_${product.lang}`,
            );
          })
          .map(product => {
            console.log({
              rev: product.images[`nutrition_${product.lang}`].rev,
            });
            return {
              code: product.code,
              rev: product.images[`nutrition_${product.lang}`].rev,
              lang: product.lang,
            };
          });
        console.log('end : ', [...productsBacklog, ...products]);
        setProductsBacklog([...productsBacklog, ...products]);
      };
      AddProducts();
    }
  }, [nbOfPages, productsBacklog]);

  return [productsBacklog, setProductsBacklog];
};

const NutritionValues = () => {
  const nbOfPages = useNumberOfPages();
  const [products, setProducts] = useGetProduct(nbOfPages);

  return products && products.length > 0 ? (
    <>
      <img
        src={`${getIngredientImageUrlFromCode(
          products[0].code,
          products[0].lang,
          products[0].rev,
          '400',
        )}`}
        alt="product"
      />
      <button
        onClick={() => {
          setProducts(products.slice(1));
        }}
      >
        next
      </button>
    </>
  ) : (
    <p>Loading</p>
  );
};

export default NutritionValues;
