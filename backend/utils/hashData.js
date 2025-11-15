import bcrypt from "bcrypt";

export const hashData = async (data, saltRounds = 10) => {
  try {
    const hashedData = await bcrypt.hash(data, saltRounds);
    return hashedData;
  } catch (error) {
    throw new Error("Error hashing data: " + error.message);
  }
};

export const verifyHashedData = async (data, hashedData) => {
  try {
    const isMatch = await bcrypt.compare(data, hashedData);
    return isMatch;
  } catch (error) {
    throw new Error("Error verifying hashed data: " + error.message);
  }
};
