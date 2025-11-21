# Wildlife Guardian AI

An intelligent system for animal health prediction and endangered species awareness using machine learning.

## Features

- **Wildlife Detection**: Identify animals in images using AI-powered object detection
- **Video Analysis**: Process video files to track animal movements and behaviors over time
- **Live Camera Integration**: Connect to webcams and CCTV for real-time wildlife monitoring
- **Health Assessment**: Analyze physical characteristics to predict animal health status
- **Endangered Species Alerts**: Get notified when endangered animals are detected
- **Conservation Support**: Contribute data to aid wildlife conservation efforts
- **Global Species Tracking**: Access real-time maps and statistics of animal sightings worldwide
- **Interactive Dashboards**: Visualize detection trends and conservation impact with real-time charts

## Technical Stack

- **Frontend**: Next.js, React, TailwindCSS
- **Machine Learning**: TensorFlow.js, COCO-SSD model
- **Real-time Database**: Firebase Realtime Database for instant data updates
- **Data Visualization**: Chart.js and Mapbox for real-time analytics
- **WebRTC**: For live camera streaming capabilities
- **API**: RESTful architecture
- **Authentication**: JWT-based auth
- **Cloud Storage**: For video file processing and storage

## How to Run the System

### Prerequisites

- Node.js (v16.x or later)
- npm (v7.x or later)
- A modern web browser (Chrome, Firefox, Edge, or Safari)

### Installation & Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/wildlife-guardian-ai.git
   cd wildlife-guardian-ai
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Create necessary directories**
   ```bash
   mkdir -p public/images/endangered
   ```

4. **Run the development server**
   ```bash
   npm run dev
   ```

5. **Access the application**
   Open your browser and navigate to [http://localhost:3000](http://localhost:3000)

### Using the Wildlife Detection Feature

1. Navigate to "Wildlife Detection" in the main menu
2. Upload an image or use one of the test images
3. Click "Detect Animals" to process the image
4. View detected animals and their confidence scores
5. If endangered species are detected, you'll receive a special alert

### Using Video Analysis

1. Go to the "Video Analysis" section
2. Upload a wildlife video file (MP4, AVI, MOV formats supported)
3. The system will process the video frame-by-frame
4. View a timeline of detected animals with timestamps
5. Export detection data as CSV or JSON for further analysis

### Setting up Live Camera Monitoring

1. Navigate to "Live Monitoring" in the dashboard
2. Select "Add Camera Source" and choose from:
   - Webcam: Direct browser access
   - IP Camera: Enter RTSP stream URL
   - CCTV System: Configure API integration
3. Set detection sensitivity and notification preferences
4. Start monitoring to receive real-time alerts

### Exploring Global Wildlife Data

1. Access the "Global Tracking" section
2. View the interactive map showing recent wildlife sightings
3. Filter by species, conservation status, or region
4. See real-time statistics on detection trends
5. Contribute your own sightings to the global database

### Real-time Analytics Dashboard

1. Go to the "Analytics" section
2. View interactive charts showing:
   - Species distribution
   - Endangered animal sightings over time
   - Conservation hotspots
   - Detection accuracy metrics
3. Set up custom alerts for specific regions or species

### Running in Production Mode

For production deployment:

1. **Build the application**
   ```bash
   npm run build
   ```

2. **Start the production server**
   ```bash
   npm start
   ```

## Troubleshooting

- **Model Loading Issues**: If the AI model fails to load, check your internet connection as it requires downloading the model files.
- **Image Detection Problems**: Ensure your images are clear and well-lit for best results.
- **Browser Compatibility**: The application works best on modern browsers with WebGL support.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the LICENSE file for details.
