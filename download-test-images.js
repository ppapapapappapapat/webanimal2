const fs = require('fs');
const path = require('path');
const https = require('https');
const { execSync } = require('child_process');

// Create public/images/test directory if it doesn't exist
const testImagesDir = path.join(__dirname, 'public', 'images', 'test');
if (!fs.existsSync(testImagesDir)) {
  console.log(`Creating directory: ${testImagesDir}`);
  fs.mkdirSync(testImagesDir, { recursive: true });
}

// List of animal images to download
const images = [
  {
    name: 'elephant.jpg',
    url: 'https://images.unsplash.com/photo-1557050543-4d5f4e07ef46?auto=format&fit=crop&w=800&q=80'
  },
  {
    name: 'tiger.jpg',
    url: 'https://images.unsplash.com/photo-1549480017-d76466a4b7e8?auto=format&fit=crop&w=800&q=80'
  },
  {
    name: 'lion.jpg',
    url: 'https://images.unsplash.com/photo-1546182990-dffeafbe841d?auto=format&fit=crop&w=800&q=80'
  },
  {
    name: 'dog.jpg',
    url: 'https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?auto=format&fit=crop&w=800&q=80'
  },
  {
    name: 'cat.jpg',
    url: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?auto=format&fit=crop&w=800&q=80'
  },
  {
    name: 'birds.jpg',
    url: 'https://images.unsplash.com/photo-1452570053594-1b985d6ea890?auto=format&fit=crop&w=800&q=80'
  },
  {
    name: 'zebra.jpg',
    url: 'https://images.unsplash.com/photo-1526095179574-86e545346ae6?auto=format&fit=crop&w=800&q=80'
  },
  {
    name: 'giraffe.jpg',
    url: 'https://images.unsplash.com/photo-1547721064-da6cfb341d50?auto=format&fit=crop&w=800&q=80'
  }
];

// Download images
async function downloadImage(url, filepath) {
  return new Promise((resolve, reject) => {
    https.get(url, (response) => {
      if (response.statusCode !== 200) {
        reject(new Error(`Failed to download ${url}, status code: ${response.statusCode}`));
        return;
      }

      const fileStream = fs.createWriteStream(filepath);
      response.pipe(fileStream);

      fileStream.on('finish', () => {
        fileStream.close();
        console.log(`Downloaded: ${filepath}`);
        resolve();
      });

      fileStream.on('error', (err) => {
        fs.unlink(filepath, () => {}); // Delete the file if error
        reject(err);
      });
    }).on('error', (err) => {
      reject(err);
    });
  });
}

// Download all images
async function downloadAllImages() {
  console.log('Downloading test animal images...');
  
  for (const image of images) {
    const filepath = path.join(testImagesDir, image.name);
    try {
      await downloadImage(image.url, filepath);
    } catch (error) {
      console.error(`Error downloading ${image.name}:`, error.message);
    }
  }
  
  console.log('All downloads completed!');
  console.log(`Images available in: ${testImagesDir}`);
}

// Run the download
downloadAllImages(); 