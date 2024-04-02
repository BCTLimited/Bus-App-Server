import TripCode from "../models/tripCode.js";

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

// console.log(generateCode()); // Example output: "8826-AB"

async function isCodeUnique(code) {
  // Implement logic to check if the code already exists in the database
  // You may use a database query to check if the code exists
  // For example, you can use Mongoose to query your MongoDB database
  // Return true if the code is unique, false otherwise
  const busCode = await TripCode.find({ code });
  if (!busCode) {
    return true;
  }
  false;
}

async function generateUniqueCode() {
  let code = generateCode();

  console.log(code);

  while (await isCodeUnique(code)) {
    code = generateCode();
  }
  return code;
}

export default generateUniqueCode;
