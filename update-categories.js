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
  })
  .catch(console.error);
