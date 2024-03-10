const express = require("express");
const Joi = require("joi");
const router = express.Router();
const axios = require("axios");
var jwt = require("jsonwebtoken");
const multer = require("multer");
const userSchema = Joi.object({
  name: Joi.string().required(),
  mail: Joi.string().email().required(),
});

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

const upload = multer({ storage: storage });

const imageStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/image/");
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

const imageUpload = multer({ storage: imageStorage });

router.post("/upload", upload.single("file"), (req, res) => {
  console.log(req.file, req.body.name);
  res.status(200).json("ok");
});
router.post("/upload-image", imageUpload.single("file"), (req, res) => {
  console.log(req.file, req.body.name);
  res.status(200).json({ success: "ok" });
});

router.get("/sample", (req, res) => {
  const db = req.db;
  db.query("SELECT * FROM users", (err, results) => {
    if (err) {
      console.error("Error querying database:", err);
      res.status(500).send("Internal Server Error");
      return;
    }
    res.send(results);
  });
});
router.get("/use-sample", async (req, res) => {
  try {
    const response = await axios.get("http://localhost:3000/crud/sample");

    res.send(response.data);
  } catch (error) {
    console.error("Error:", error);
    res.status(500).send("Internal Server Error");
  }
});
router.post("/post", (req, res) => {
  const validationResult = userSchema.validate(req.body);
  if (validationResult.error) {
    res.status(400).send(validationResult.error.details[0].message);
    return;
  }
  const db = req.db;
  db.query(
    `INSERT INTO users (name, email) VALUES (?,?)`,
    [req.body.name, req.body.mail],
    (err, results) => {
      if (err) {
        console.error("Error querying database:", err);
        res.status(500).send("Internal Server Error");
        return;
      }
      console.log("Inserted successfully");
      res.status(201).send("Inserted successfully");
    }
  );
});
router.put("/update/:id", (req, res) => {
  const validationResult = userSchema.validate(req.body);
  if (validationResult.error) {
    res.status(400).send(validationResult.error.details[0].message);
    return;
  }
  const db = req.db;
  db.query(
    "UPDATE users SET name = ?, email = ? WHERE id = ?",
    [req.body.name, req.body.mail, req.params.id],
    (err, results) => {
      if (err) {
        console.error("Error querying database:", err);
        res.status(500).send("Internal Server Error");
        return;
      }
      console.log("Updated successfully", results);
      res.status(201).send("Updated successfully");
    }
  );
});
router.delete("/delete/:id", (req, res) => {
  const db = req.db;
  db.query("DELETE FROM users where id=?", [req.params.id], (err, results) => {
    if (err) {
      console.error("Error querying database:", err);
      res.status(500).send("Internal Server Error");
      return;
    }
    console.log("Deleted successfully", results);
    res.status(201).send("Deleted successfully");
  });
});

router.get("/token-gen", (req, res) => {
  const db = req.db;
  const name = req.body.name; // Assuming name is passed as a query parameter
  const email = req.body.mail; // Assuming email is passed as a query parameter

  if (!name || !email) {
    res.status(400).send("Name and email parameters are required");
    return;
  }

  db.query(
    "SELECT * FROM users WHERE name=? AND email=?",
    [name, email],
    (err, results) => {
      if (err) {
        console.error("Error querying database:", err);
        res.status(500).send("Internal Server Error");
        return;
      }
      // Check if user data exists
      if (results.length === 0) {
        res.status(404).send("User not found");
        return;
      }

      // User found, generate JWT token
      const user = results[0];
      const token = jwt.sign(
        user,
        "7h3r3_1$_@_5tr0ng_5ecr3t_k3y_f0r_y0ur_pr0j3c7",
        { expiresIn: "5m" }
      );

      // Send the token as response
      res.json({ token });
    }
  );
});

router.post("/insert-phone-number", verifyToken, (req, res) => {
  const { name, mail, phone } = req.body;

  // Verify user information
  const db = req.db;

  // Update user's phone number
  db.query(
    "UPDATE users2 SET phone=? WHERE name=? AND email=?",
    [phone, name, mail],
    (err, updateResults) => {
      if (err) {
        console.error("Error updating phone number:", err);
        res.status(500).send("Internal Server Error");
        return;
      }

      // Send success response

      res.status(200).json({
        message: "Phone number inserted successfully",
        updateResults: updateResults,
      });
    }
  );
});

// Middleware to verify JWT token
function verifyToken(req, res, next) {
  const token = req.headers.authorization;
  console.log(token);
  if (!token || !token.startsWith("Bearer ")) {
    return res.status(401).send("Unauthorized: No token provided");
  }

  const tokenValue = token.split(" ")[1]; // Extract token value without "Bearer " prefix
  jwt.verify(
    tokenValue,
    "7h3r3_1$_@_5tr0ng_5ecr3t_k3y_f0r_y0ur_pr0j3c7",
    (err, decoded) => {
      if (err) {
        return res.status(403).send("Unauthorized: Invalid token");
      }

      if (decoded.name !== req.body.name || decoded.email !== req.body.mail) {
        console.log(decoded.name !== req.body.name);
        console.log(decoded.email !== req.body.mail);
        return res.status(403).send("Unauthorized: Name/email mismatch");
      }

      next();
    }
  );
}

module.exports = router;
