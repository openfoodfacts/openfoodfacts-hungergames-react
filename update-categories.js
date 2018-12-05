const fs = require('fs');
const axios = require('axios');

axios('https://static.openfoodfacts.org/data/taxonomies/categories.json')
  .then(({ data }) => {
    fs.writeFile(
      './src/categories.json',
      JSON.stringify(
        Object.entries(data).map(([key, value]) => ({
          category: key,
          ...value.name,
        })),
      ),
      () => console.log('Categories updated'),
    );
    fs.writeFile(
      './src/keys.json',
      JSON.stringify(
        Array.from(
          new Set(
            Object.values(data)
              .map(value => Object.keys(value.name))
              .reduce((acc, val) => acc.concat(val), []),
          ),
        ),
      ),
      () => console.log('Keys updated'),
    );
  })
  .catch(console.error);
