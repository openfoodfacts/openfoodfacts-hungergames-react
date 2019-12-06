import React from 'react';
import axios from 'axios';

const edit = ({
  nutritionVisible,
  nutritionValues,
  nutrimentsKey,
  portionValues,
  code,
}) => {
  const toDelete = Object.keys(nutritionVisible)
    .filter(nutrimentName => !nutritionVisible[nutrimentName])
    .map(nutrimentName => nutrimentsKey[nutrimentName]);

  const toFill = Object.keys(nutritionVisible)
    .filter(
      nutrimentName =>
        nutritionVisible[nutrimentName] &&
        nutritionValues[nutrimentName].quantity &&
        nutritionValues[nutrimentName].quantity.length > 0,
    )
    .map(nutrimentName => ({
      name: nutrimentsKey[nutrimentName],
      value: `${nutritionValues[nutrimentName].quantity}${nutritionValues[
        nutrimentName
      ].unit || ''}`,
      quantity: nutritionValues[nutrimentName].quantity,
      unit: nutritionValues[nutrimentName].unit,
    }));

  if (toFill.length > 0) {
    axios.post(
      `${process.env.REACT_APP_OFF_BASE}/cgi/product_jqm2.pl?`,
      new URLSearchParams(
        `${toFill
          .map(data => `${data.name}=${data.quantity}&`)
          .join('')}${toFill
          .map(data => (data.unit ? `${data.name}_unit=${data.unit}&` : ''))
          .join('')}code=${code}`,
      ),
    ); // The status of the response is not displayed so no need to wait the response
  }

  if (toDelete.length > 0) {
    axios.post(
      `${process.env.REACT_APP_OFF_BASE}/cgi/product_jqm2.pl?`,
      new URLSearchParams(
        `${toDelete.map(name => `${name}=""&`).join('')}code=${code}`,
      ),
    );
  }

  if (portionValues.quantity) {
    const quantity = `${portionValues.quantity}${
      portionValues.unit ? portionValues.unit : ''
    }`;
    if (portionValues.isPortion) {
      axios.post(
        `${process.env.REACT_APP_OFF_BASE}/cgi/product_jqm2.pl?`,
        new URLSearchParams(
          `nutrition_data_per=serving&serving_size=${quantity}&code=${code}`,
        ),
      );
    } else {
      axios.post(
        `${process.env.REACT_APP_OFF_BASE}/cgi/product_jqm2.pl?`,
        new URLSearchParams(`nutrition_data_per=${quantity}&code=${code}`),
      );
    }
  }
};

export default ({
  nutriments,
  nutritionValues,
  nutritionVisible,
  portionValues,
  close,
  nextProduct,
  code,
}) => {
  const toDelete = Object.keys(nutriments).filter(
    nutrimentName => !nutritionVisible[nutrimentName],
  );
  const empty = Object.keys(nutriments).filter(
    nutrimentName =>
      (nutritionVisible[nutrimentName] &&
        !nutritionValues[nutrimentName].quantity) ||
      (nutritionVisible[nutrimentName] &&
        !nutritionValues[nutrimentName].quantity.length > 0),
  );
  const filled = Object.keys(nutriments).filter(
    nutrimentName =>
      nutritionVisible[nutrimentName] &&
      nutritionValues[nutrimentName].quantity &&
      nutritionValues[nutrimentName].quantity.length > 0,
  );
  return (
    <>
      <p>
        Those are the nutrition values for {' '}
        {portionValues.quantity
          ? `${portionValues.quantity} ${
              portionValues.unit ? portionValues.unit : 'unknown unit'
            }`
          : " we don't know how much "}
        of the product
      </p>
      {portionValues.isPortion ? <p>It is a portion of the product</p> : null}
      <ol className="recap">
        {toDelete.length > 0 && (
          <div className="toDelete">
            <li className="title">Will be deleted</li>
            {toDelete.map(nutrimentName => (
              <li key={nutrimentName}>{nutrimentName}</li>
            ))}
          </div>
        )}
        {empty.length > 0 && (
          <div className="toIgnore">
            <li className="title">You skip</li>
            {empty.map(nutrimentName => (
              <li key={nutrimentName}>{nutrimentName}</li>
            ))}
          </div>
        )}
        {filled.length > 0 && (
          <div className="toSend">
            <li className="title">You fill</li>
            {filled.map(nutrimentName => (
              <li key={nutrimentName}>{`${nutrimentName} : ${
                nutritionValues[nutrimentName].quantity
              }${nutritionValues[nutrimentName].unit || ''}`}</li>
            ))}
          </div>
        )}
      </ol>
      <button
        className="validate button"
        onClick={() => {
          edit({
            nutritionVisible,
            nutritionValues,
            nutrimentsKey: nutriments,
            portionValues,
            code,
          });
          close();
          nextProduct();
        }}
      >
        Validate
      </button>
      <button
        className="button"
        onClick={() => {
          close();
        }}
      >
        Need to modify
      </button>
    </>
  );
};
