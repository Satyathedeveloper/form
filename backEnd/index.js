const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const multer = require('multer');
const moment = require('moment');
const app = express();
const port = 5000;
app.use(express.json()); 
app.use(cors()); 

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

const db = mysql.createConnection({
  host: 'localhost',       
  user: 'root',            
  password: 'Satya@123',       
  database: 'detailsdatabase'  
});

db.connect((err) => {
  if (err) {
    console.error('Database connection failed: ', err);
    return;
  }
  console.log('Connected to MySQL database');
});

app.post("/api/user/signup", async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ message: "All fields are required!" });
  }

  try {

    // Insert into the database
    const query = `INSERT INTO detailsdatabase.userdetails (name, email, password) VALUES (?, ?, ?)`;
    db.query(query, [name, email, password], (err) => {
      if (err) {
        if (err.code === "ER_DUP_ENTRY") {
          return res.status(400).json({ message: "Email already exists!" });
        }
        console.error("Error during signup:", err);
        return res.status(500).json({ message: "Internal server error." });
      }
      res.status(201).json({ message: "User registered successfully!" });
    });
  } catch (err) {
    console.error("Error password:", err);
    res.status(500).json({ message: "Internal server error." });
  }
});

app.post("/api/user/login", (req, res) => {
  const { email, password } = req.body;

  // Validate input
  if (!email || !password) {
    return res.status(400).json({ message: "All fields are required!" });
  }

  // SQL query to find the user by email
  const query = `SELECT * FROM detailsdatabase.userdetails WHERE email = ?`;
  db.query(query, [email], (err, results) => {
    if (err) {
      console.error("Error during login:", err);
      return res.status(500).json({ message: "Internal server error." });
    }

    // Check if user exists
    if (results.length === 0) {
      return res.status(404).json({ message: "User not found!" });
    }

    const user = results[0];

    // Compare plain text password
    if (password !== user.password) {
      return res.status(401).json({ message: "Invalid credentials!" });
    }

    res.status(200).json({
      message: "Login successful!",
      name: user.name,
      uniquekey:user.uniquekey
    });
  });
});


// Check if Email is Unique
app.get("/api/user/check-email", (req, res) => {
  const { email } = req.query;

  if (!email) {
    return res.status(400).json({ message: "Email is required!" });
  }

  const query = `SELECT email FROM detailsdatabase.userdetails WHERE email = ?`;
  db.query(query, [email], (err, results) => {
    if (err) {
      console.error("Error checking email:", err);
      return res.status(500).json({ message: "Internal server error." });
    }

    if (results.length > 0) {
      return res.status(400).json({ message: "Email already exists!" });
    }

    res.status(200).json({ message: "Email is available." });
  });
});



app.get('/api/records/:uniquekey', (req, res) => {
  const uniqueKey = req.params.uniquekey;

  // Ensure uniqueKey is not empty
  if (!uniqueKey) {
    return res.status(400).json({ message: 'Unique key is required' });
  }

  const query = 'SELECT * FROM user_tables_data WHERE uniqukey = ?'; 

  db.query(query, [uniqueKey], (err, results) => {
    if (err) {
      console.error('Error fetching records: ', err);
      return res.status(500).json({ message: 'Database error' });
    }

    // Convert blob fields to base64 strings
    const formattedResults = results.map((record) => {
      if (record.photo) {
        record.photo = Buffer.from(record.photo).toString('base64');
      }
      if (record.resume) {
        record.resume = Buffer.from(record.resume).toString('base64');
      }
      return record;
    });

    res.status(200).json(formattedResults);
  });
});




app.post('/api/records', upload.fields([{ name: 'photo' }, { name: 'resume' }]), (req, res) => {
  const {
      name, surname, gender, email, phone, address, city, state, country,
      zipcode, birthdate, maritalStatus, techExperienceLevel, experienceRange,
      techSkills, softSkills, languages, projects, comments, bio, uniqukey
  } = req.body;

  // Parse techSkills, softSkills, languages, and projects to arrays if needed
  const formattedTechSkills = techSkills ? techSkills.split(',').map(skill => skill.trim()) : [];
  const formattedSoftSkills = softSkills ? softSkills.split(',').map(skill => skill.trim()) : [];
  const formattedLanguages = languages ? languages.split(',').map(language => language.trim()) : [];
  const formattedProjects = projects ? projects.split(',').map(project => project.trim()) : [];
  // console.log('Received body:', req.body);
  // Handle the education field (parse stringified JSON or use the array directly)
  let formattedEducation;


  try {
      formattedEducation = JSON.parse(req.body.education);
      console.log('Parsed education:', formattedEducation);
  } catch (error) {
      console.error('Error parsing education field:', req.body.education, error);
      return res.status(400).json({ error: 'Invalid JSON in education field.' });
  }

  const formattedBirthDate = birthdate ? moment(birthdate).format('YYYY-MM-DD') : null;

  // Handle file uploads
  let photo = req.files && req.files['photo'] ? req.files['photo'][0].buffer : null;
  let resume = req.files && req.files['resume'] ? req.files['resume'][0].buffer : null;

  // Insert into the database
  const query = 
      `INSERT INTO detailsdatabase.user_tables_data 
      (name, surname, gender, email, phone, address, city, state, country, zipcode, 
      birthdate, maritalStatus, techExperienceLevel, experienceRange, 
      techSkills, softSkills, languages, projects, comments, bio, photo, resume, education,uniqukey)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ? ,?)`
  ;

  db.query(query, [
      name, surname, gender, email, phone, address, city, state, country,
      zipcode, formattedBirthDate, maritalStatus, techExperienceLevel, experienceRange,
      JSON.stringify(formattedTechSkills), JSON.stringify(formattedSoftSkills),
      JSON.stringify(formattedLanguages), JSON.stringify(formattedProjects),
      comments, bio, photo, resume, JSON.stringify(formattedEducation),uniqukey
  ], (err, results) => {
      if (err) {
          console.error('Database insertion error:', err);
          return res.status(500).json({ error: 'Database error.', details: err });
      }

      res.status(201).json({ id: results.insertId, name, surname, gender, email, phone, address, city, state, country,
        zipcode, birthdate, maritalStatus, techExperienceLevel, experienceRange,
        techSkills, softSkills, languages, projects, comments, bio ,});
  });
});






app.put('/api/records/:id', upload.fields([{ name: 'photo' }, { name: 'resume' }]), (req, res) => {
  const {
      name, surname, gender, email, phone, address, city, state, country,
      zipcode, birthdate, maritalStatus, techExperienceLevel, experienceRange,
      techSkills, softSkills, languages, projects, comments, bio
  } = req.body;
  
console.log('65',req.body);
  if (req.files) {
    if (req.files['photo']) {
      console.log('Photo details:', req.files['photo']);
    }
    if (req.files['resume']) {
      console.log('Resume details:', req.files['resume']);
    }
  } else {
    console.log('No files uploaded.');
  }
  // Parse techSkills, softSkills, languages, and projects to arrays if needed
  const formattedTechSkills = techSkills ? techSkills.split(',').map(skill => skill.trim()) : [];
  const formattedSoftSkills = softSkills ? softSkills.split(',').map(skill => skill.trim()) : [];
  const formattedLanguages = languages ? languages.split(',').map(language => language.trim()) : [];
  const formattedProjects = projects ? projects.split(',').map(project => project.trim()) : [];
  console.log('Received body:', req.body);

  // Handle the education field (parse stringified JSON or use the array directly)
  let formattedEducation;
  try {
      formattedEducation = JSON.parse(req.body.education);
      console.log('Parsed education:', formattedEducation);
  } catch (error) {
      console.error('Error parsing education field:', req.body.education, error);
      return res.status(400).json({ error: 'Invalid JSON in education field.' });
  }

  // Format birthdate
  const formattedBirthDate = birthdate ? moment(birthdate).format('YYYY-MM-DD') : null;

  let photo = req.files && req.files['photo'] ? req.files['photo'][0].buffer : existingRecord.photo;
  let resume = req.files && req.files['resume'] ? req.files['resume'][0].buffer : existingRecord.resume;
  

  // Prepare the update query
  const query = `
      UPDATE detailsdatabase.user_tables_data
      SET 
          name = ?, surname = ?, gender = ?, email = ?, phone = ?, address = ?, city = ?, state = ?, country = ?, 
          zipcode = ?, birthdate = ?, maritalStatus = ?, techExperienceLevel = ?, experienceRange = ?, 
          techSkills = ?, softSkills = ?, languages = ?, projects = ?, comments = ?, bio = ?, photo = ?, resume = ?, education = ?
      WHERE user_id = ?
  `;

  // Update the database with the provided data
  db.query(query, [
      name, surname, gender, email, phone, address, city, state, country,
      zipcode, formattedBirthDate, maritalStatus, techExperienceLevel, experienceRange,
      JSON.stringify(formattedTechSkills), JSON.stringify(formattedSoftSkills),
      JSON.stringify(formattedLanguages), JSON.stringify(formattedProjects),
      comments, bio, photo, resume, JSON.stringify(formattedEducation),
      req.params.id
  ], (err) => {
      if (err) {
          console.error('Database update error:', err);
          return res.status(500).json({ error: 'Database error.', details: err });
      }

      res.status(200).json({ message: 'Record updated successfully' });
  });
});

// Delete a record
app.delete('/api/records/:id', (req, res) => {
  const query = 'DELETE FROM detailsdatabase.user_tables_data WHERE user_id = ?';
  db.query(query, [req.params.id], (err, result) => {
    if (err) {
      console.log(err);
      
      return res.status(500).send({ error: 'Failed to delete record' });
    }

    if (result.affectedRows === 0) {
      return res.status(404).send({ error: 'Record not found' });
    }

    res.send({ message: 'Record deleted successfully' });
  });
});

 // search 

// app.get('/api/records/:id', (req, res) => {
//   const query = 'SELECT * FROM user_tables_data WHERE uniquekey = ?';

//   db.query(query, [req.params.id], (err, results) => {
//     if (err) {
//       console.error('Error fetching record: ', err);
//       return res.status(500).json({ message: 'Database error' });
//     }

//     if (results.length === 0) {
//       return res.status(404).json({ message: 'Record not found' });
//     }

//     const record = results[0];

//     if (record.photo) {
//       record.photo = Buffer.from(record.photo).toString('base64');
//     }
//     if (record.resume) {
//       record.resume = Buffer.from(record.resume).toString('base64');
//     }

//     res.status(200).json(record);
//   });
// });




// Start the server
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
