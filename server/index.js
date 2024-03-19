// server.js

const express = require('express');
const multer = require('multer');
const cors = require('cors');
const path = require('path');
const Jimp = require('jimp');
const fs = require('fs');

const app = express();
app.use(cors());

// Multer configuration
const storage = multer.diskStorage({
  destination: './upload/',
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ storage });

// Upload endpoint
app.post('/upload', upload.single('image'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }

  const { filename, destination, mimetype } = req.file;
  const fileUrl = `${req.protocol}://${req.get('host')}/view/${filename}`;

  const thumbnailUrl = `${fileUrl}_thumbnail.jpg`;
  const previewUrl = `${fileUrl}_preview.jpg`;

  try {
    // Read uploaded file
    const fileData = fs.readFileSync(req.file.path);

    // Resize thumbnail
    const thumbnailPath = `./upload/${filename}_thumbnail.jpg`;
    await Jimp.read(fileData)
      .then((image) => {
        return image
          .cover(200,200)
          .write(thumbnailPath);
      })
      .catch((error) => {
        console.error(error);
        return res.status(500).json({ error: 'Failed to resize thumbnail' });
      });

    // Resize preview
    const previewPath = `./upload/${filename}_preview.jpg`;
    await Jimp.read(fileData)
      .then((image) => {
        return image
          .scale(0.5)
          .write(previewPath);
      })
      .catch((error) => {
        console.error(error);
        return res.status(500).json({ error: 'Failed to resize preview' });
      });

    const response = {
      name: filename,
      url: fileUrl,
      preview_url: previewUrl,
      thumbnail_url: thumbnailUrl,
      create_date: new Date().toISOString()
    };

    return res.status(200).json(response);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});
// View file endpoint
app.get('/view/:filename', (req, res) => {
    const { filename } = req.params;
    const filePath = path.resolve(`./upload/${filename}`);
  
    res.sendFile(filePath, (error) => {
      if (error) {
        console.error(error);
        return res.status(500).json({ error: 'Failed to view file' });
      }
    });
  });
// Download endpoint
app.get('/download/:filename', (req, res) => {
  const { filename } = req.params;
  const filePath = path.resolve(`./upload/${filename}`);

  res.download(filePath, (error) => {
    if (error) {
      console.error(error);
      return res.status(500).json({ error: 'Failed to download file' });
    }
  });
});

const port = 3001;
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});