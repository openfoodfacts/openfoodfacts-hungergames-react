const fs = require('fs');
const axios = require('axios');

axios('https://static.openfoodfacts.org/data/taxonomies/countries.json')
  .then(({ data }) => {
    fs.writeFile(
      './src/countries.json',
      JSON.stringify(
        Object.entries(data)
          .map(([key, value]) => ({
            id: key,
            label: value.name.en,
          }))
          .sort((a, b) => a.label.localeCompare(b.label))
          .reduce((acc, cur) => {
            if (cur.id === 'en:world') return acc;
            acc[cur.id] = cur.label;
            return acc;
          }, {}),
      ),
      () => console.log('Countries updated'),
    );
  })
  .catch(console.error);
