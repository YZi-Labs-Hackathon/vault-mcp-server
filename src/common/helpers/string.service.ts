const ALPHANUMERIC = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';

const randomInt = (min: number, max: number): number =>
  Math.floor(Math.random() * (max - min + 1)) + min;

const randomElement = () => ALPHANUMERIC[randomInt(0, ALPHANUMERIC.length - 1)];

export const generateRandomString = (CODE_LENGTH: number) => {
  let codes = '';
  while (codes.length < CODE_LENGTH) {
    codes += randomElement();
  }
  return codes;
};
