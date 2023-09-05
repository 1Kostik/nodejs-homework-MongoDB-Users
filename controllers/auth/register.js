const crypto = require("node:crypto");
require("dotenv").config();
const bcrypt = require("bcrypt");
const { BASE_URL } = process.env;
const { User } = require("../../models");
const { HttpError } = require("../../utils");
const sendEmail = require("../../utils/sendEmail");
const register = async (req, res) => {
  const { email, password, name } = req.body;
  const user = await User.findOne({ email });
  if (user) {
    throw HttpError(409, "Email already in use");
  }
  const hashPassword = await bcrypt.hash(password, 10);
  const verifyToken = crypto.randomUUID();
  const newUser = await User.create({
    ...req.body,
    password: hashPassword,
    verifyToken,
  });
  await sendEmail({
    to: email,
    subject: `Welcom on board,${name}`,
    html: `<p>To confirm your registration, please click on the link below</p>
  <a href="${BASE_URL}/api/users/verify/${verifyToken}">Click me</a>`,
    text: `To confirm your registration, please click on the link below:\n
  ${BASE_URL}/api/users/verify/${verifyToken}`,
  });
  res.status(201).json({
    email: newUser.email,
    name: newUser.name,
  });
};
module.exports = register;
