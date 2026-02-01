// Polyfill for fs in the browser
export const createReadStream = () => {
  throw new Error('fs.createReadStream is not supported in the browser');
};
export const createWriteStream = () => {
  throw new Error('fs.createWriteStream is not supported in the browser');
};
export const readFileSync = () => {
  throw new Error('fs.readFileSync is not supported in the browser');
};
export const writeFileSync = () => {
  throw new Error('fs.writeFileSync is not supported in the browser');
};
export const stat = () => {
    throw new Error('fs.stat is not supported in the browser');
};
export const statSync = () => {
    throw new Error('fs.statSync is not supported in the browser');
};
export const existsSync = () => {
    return false;
};
export const promises = {
    readFile: async () => { throw new Error('fs.promises.readFile is not supported in the browser'); },
    stat: async () => { throw new Error('fs.promises.stat is not supported in the browser'); },
};
export default {
  createReadStream,
  createWriteStream,
  readFileSync,
  writeFileSync,
  stat,
  existsSync,
  promises
};
