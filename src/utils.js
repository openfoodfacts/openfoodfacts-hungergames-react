export const getSubDomain = () => {
  const matches = /^https:\/\/((world|\w{2})(?:-(\w{2}))?)\.openfoodfacts\.org/.exec(
    window.location.href,
  );
  return matches && matches[1] ? matches[1] : 'world';
};
