const idRegex = /^[a-zA-Z0-9-_]{11}$/;
const urlRegex = /(youtu\.be\/)|(youtube.com\/)/;

const ID = (id) => idRegex.test(id);

const URL = (url) => urlRegex.test(url);


module.exports = {ID, URL}