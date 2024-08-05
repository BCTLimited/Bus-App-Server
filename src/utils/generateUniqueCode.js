import Trip from "../models/trip.js";

function generateRandomString(length) {
  const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  let result = "";
  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * characters.length);
    result += characters[randomIndex];
  }
  return result;
}

function generateCode() {
  const randomNumber = Math.floor(1000 + Math.random() * 9000); // Generates a random 4-digit number
  const randomLetters = generateRandomString(2); // Generates 2 random letters
  return `${randomNumber}-${randomLetters}`;
}



async function isCodeUnique(code) {
  const busCode = await Trip.findOne({ code });
  if (!busCode) {
    return false;
  }
  true;
}

async function generateUniqueCode() {
  let code = generateCode();

  while (await isCodeUnique(code)) {
    code = generateCode();
  }
  return code;
}

export default generateUniqueCode;
