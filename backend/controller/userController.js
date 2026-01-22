const dbConnection = require("../config/dbConfig");
// dbConnection => mysql database connection (used to run sql quieries like select , insert)
const bcrypt = require("bcrypt");
// hashed password securely and Prevents storing plain-text passwords in the database
const nodemailer = require("nodemailer");

const { StatusCodes } = require("http-status-codes");
// Gives readable HTTP status codes forex. For OK its 200, for BAD_REQUEST  400, for Unauthorised its 401, etc.)

const jwt = require("jsonwebtoken");
//  used to create digital id card (token) for authentication

// 1. REGISTER FUNCTION
// handles new user Registration begins
async function register(req, res) {
  const { username, firstname, lastname, email, password } = req.body;
  // getting data from req.body meaning user input sent from frontend.

  //  if any feild is missing from below return error
  if (!username || !firstname || !lastname || !email || !password) {
    return res.status(StatusCodes.BAD_REQUEST).json({
      msg: "Please provide all required fields ",
    });
  }

  // 1.1 email validation
  // simple email validation Checks if email looks like: user@example.com if invalid return status code 400
  const emailRegex = /^\S+@\S+\.\S+$/;
  if (!emailRegex.test(email)) {
    return res
      .status(StatusCodes.BAD_REQUEST)
      .json({ msg: "Invalid email format" });
  }

  // 1.2 password length validation
  // For security purpose Enforces minimum password standard must be at least 8 character

  if (password.length < 8) {
    return res
      .status(StatusCodes.BAD_REQUEST)
      .json({ msg: "Password must be at least 8 characters" });
  }
  // Enforces minimum security standard Password must be at least 8 characters
  try {
    const [user] = await dbConnection.query(
      "SELECT username, userid FROM users Where username = ? OR email = ?",
      [username, email],
    );
    // Prevents duplicate usernames or emails
    // If found → returns:

    if (user.length > 0) {
      return res
        .status(StatusCodes.BAD_REQUEST)
        .json({ msg: " already Users registered" });
    }

    if (password.length < 8) {
      // Standard is usually < 8
      return res
        .status(StatusCodes.BAD_REQUEST)
        .json({ msg: "Password must be at least 8 characters" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    await dbConnection.query(
      `INSERT INTO users (username, firstname, lastname, email, password) VALUES (?, ?, ?, ?, ?)`,
      [username, firstname, lastname, email, hashedPassword],
    );

    return res.status(StatusCodes.CREATED).json({ msg: "User registered" });
  } catch (error) {
    console.error(error);
    return res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ msg: "Something went wrong" });
  }
}

async function login(req, res) {
  const { email, password } = req.body;
  if (!email || !password) {
    return res
      .status(StatusCodes.BAD_REQUEST)
      .json({ msg: "Please provide all required fields" });
  }
  try {
    const [user] = await dbConnection.query(
      "SELECT username, userid, password FROM users WHERE email =? ",
      [email],
    );
    if (user.length == 0) {
      return res
        .status(StatusCodes.UNAUTHORIZED)
        .json({ msg: "Invalid credentials" });
    }

    const isMatch = await bcrypt.compare(password, user[0].password);
    if (!isMatch) {
      return res
        .status(StatusCodes.UNAUTHORIZED)
        .json({ msg: "Invalid credentials" });
    }

    const username = user[0].username;
    const userid = user[0].userid;

    const token = jwt.sign(
      { username, userid },
      process.env.JWT_SECRET || "default_secret",
      { expiresIn: "1d" },
    );

    return res
      .status(StatusCodes.OK)
      .json({ msg: "user login successful", token, username });
  } catch (error) {
    return res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ msg: "Something went wrong" });
  }
}

async function checkUser(req, res) {
  // This expects the 'authMiddleware' to have already run and attached user info to req.user
  const username = req.user.username;
  const userid = req.user.userid;
  res.status(StatusCodes.OK).json({ msg: "Valid user", username, userid });
}
async function forgotPassword(req, res) {
  const { email } = req.body;

  try {
    // 1. Check if user exists in Database
    const [user] = await dbConnection.query(
      "SELECT username FROM users WHERE email = ?",
      [email],
    );

    if (user.length === 0) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        msg: "No account found with this email address.",
      });
    }

    // 2. Create a temporary token
    const token = jwt.sign({ email }, process.env.JWT_SECRET, {
      expiresIn: "15m",
    });

    // 3. Configure Nodemailer
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });
    const resetLink = `http://localhost:5173/reset-password/${token}`;

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Password Reset - Evangadi Networks",
      html: `<p>Click the link below to reset your password:</p>
             <a href="${resetLink}">${resetLink}</a>`,
    };

    // 4. Send Email
    await transporter.sendMail(mailOptions);
    return res
      .status(StatusCodes.OK)
      .json({ msg: "Reset link sent to your email!" });
  } catch (error) {
    console.error("DETAILED ERROR:", error); // Check your terminal for this!
    return res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ msg: "Email service failed. Please try again later." });
  }
}
async function resetPassword(req, res) {
  const { token } = req.params;
  const { password } = req.body;

  if (!password || password.length < 8) {
    return res
      .status(StatusCodes.BAD_REQUEST)
      .json({ msg: "Password must be at least 8 characters" });
  }

  try {
    // 1. Verify the token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const email = decoded.email;

    // 2. Hash the new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // 3. Update the database
    const [result] = await dbConnection.query(
      "UPDATE users SET password = ? WHERE email = ?",
      [hashedPassword, email],
    );

    if (result.affectedRows === 0) {
      return res
        .status(StatusCodes.BAD_REQUEST)
        .json({ msg: "User not found" });
    }

    return res
      .status(StatusCodes.OK)
      .json({ msg: "Password reset successful!" });
  } catch (error) {
    return res
      .status(StatusCodes.BAD_REQUEST)
      .json({ msg: "Invalid or expired token" });
  }
}

async function changePassword(req, res) {
  const { currentPassword, newPassword } = req.body;
  const { userid } = req.user;

  if (!currentPassword || !newPassword) {
    return res
      .status(StatusCodes.BAD_REQUEST)
      .json({ msg: "All fields are required" });
  }

  try {
    // 1. Get user from DB
    const [user] = await dbConnection.query(
      "SELECT password FROM users WHERE userid = ?",
      [userid],
    );

    // 2. Compare current password
    const isMatch = await bcrypt.compare(currentPassword, user[0].password);
    if (!isMatch) {
      return res
        .status(StatusCodes.BAD_REQUEST)
        .json({ msg: "Incorrect current password" });
    }

    // 3. Hash new password and update
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);
    await dbConnection.query("UPDATE users SET password = ? WHERE userid = ?", [
      hashedPassword,
      userid,
    ]);

    return res
      .status(StatusCodes.OK)
      .json({ msg: "Password updated successfully" });
  } catch (error) {
    return res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ msg: "Something went wrong" });
  }
}

module.exports = {
  register,
  login,
  checkUser,
  changePassword,
  forgotPassword,
  resetPassword,
};
