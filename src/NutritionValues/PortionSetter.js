import React from 'react';

const UNITS = ['g', 'kg', 'mg', 'L', 'cl', 'ml'];

const PortionSetter = ({ values, setValues }) => {
  const setValue = name => event => {
    setValues({ ...values, [name]: event.target.value });
  };
  const toogleValue = name => () => {
    setValues({ ...values, [name]: !values[name] });
  };

  return (
    <div className="portion">
      <p>
        Data per:
        <input
          type="number"
          value={values.quantity}
          onChange={setValue('quantity')}
          className="portion_value"
        />
        <select
          value={values.unit}
          onChange={setValue('unit')}
          className="portion_unit"
        >
          <option disabled selected value>
            unit
          </option>
          {UNITS.map(unit => (
            <option value={unit}>{unit}</option>
          ))}
        </select>
      </p>
      <p>
        It is a portion{' '}
        <input
          type="checkbox"
          value={values.isPortion}
          onChange={toogleValue('isPortion')}
        />
      </p>
    </div>
  );
};

export default PortionSetter;
