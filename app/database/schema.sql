-- Create Users table
CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(255) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL DEFAULT 'user',
    profile_image VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    preferences JSON
);

-- Create Animals table
CREATE TABLE IF NOT EXISTS animals (
    id VARCHAR(255) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    species VARCHAR(255) NOT NULL,
    breed VARCHAR(255),
    age INT NOT NULL,
    color VARCHAR(100),
    weight DECIMAL(10, 2) NOT NULL,
    health_status VARCHAR(50) CHECK (health_status IN ('healthy', 'sick', 'recovering', 'unknown')) DEFAULT 'unknown',
    last_checkup DATE,
    medical_history TEXT[],
    image_url VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create Detections table
CREATE TABLE IF NOT EXISTS detections (
    id VARCHAR(255) PRIMARY KEY,
    user_id VARCHAR(255) NOT NULL,
    animal_id VARCHAR(255),
    timestamp TIMESTAMP NOT NULL,
    image_url VARCHAR(255),
    detections JSON,
    notes TEXT,
    location JSON,
    observer_name VARCHAR(255),
    mode VARCHAR(50),
    device_info JSON,
    metadata JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (animal_id) REFERENCES animals(id)
);

-- Create Detection Reports table
CREATE TABLE IF NOT EXISTS detection_reports (
    id VARCHAR(255) PRIMARY KEY,
    user_id VARCHAR(255) NOT NULL,
    timestamp TIMESTAMP NOT NULL,
    image_source VARCHAR(255),
    detected_animals JSON,
    summary JSON,
    environment_data JSON,
    detection_mode VARCHAR(50),
    detection_id VARCHAR(255),
    sql_saved BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (detection_id) REFERENCES detections(id)
);

-- Create Diagnoses table
CREATE TABLE IF NOT EXISTS diagnoses (
    id VARCHAR(255) PRIMARY KEY,
    user_id VARCHAR(255) NOT NULL,
    animal_type VARCHAR(255) NOT NULL,
    symptoms TEXT NOT NULL,
    diagnosis TEXT NOT NULL,
    date TIMESTAMP NOT NULL,
    image_url VARCHAR(255),
    recommendation TEXT,
    severity VARCHAR(50) CHECK (severity IN ('low', 'medium', 'high')),
    follow_up_recommended BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Create Pet Lifespan table
CREATE TABLE IF NOT EXISTS pet_lifespan (
    id VARCHAR(255) PRIMARY KEY,
    pet_name VARCHAR(255) NOT NULL,
    pet_type VARCHAR(50) NOT NULL,
    breed VARCHAR(255),
    age INT NOT NULL,
    weight DECIMAL(10, 2) NOT NULL,
    has_known_health_issues BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert mock users data
INSERT INTO users (id, name, email, password, role, profile_image, created_at, updated_at, preferences) VALUES
('user_1', 'John Doe', 'john@example.com', 'password123', 'user', 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80', '2025-01-15 10:30:00', '2025-01-15 10:30:00', '{"theme": "light", "notifications": true, "language": "en"}'::json),
('user_2', 'Jane Smith', 'jane@example.com', 'admin123', 'admin', 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80', '2025-02-20 14:45:00', '2025-02-20 14:45:00', '{"theme": "dark", "notifications": true, "language": "en"}'::json),
('default_admin', 'Admin User', 'admin@animalcare.com', 'admin123456', 'admin', 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=150&q=80', '2025-01-01 08:00:00', '2025-01-01 08:00:00', '{"theme": "dark", "notifications": true, "language": "en"}'::json),
('default_user', 'Regular User', 'user@animalcare.com', 'user123456', 'user', 'https://images.unsplash.com/photo-1607746882042-944635dfe10e?auto=format&fit=crop&w=150&q=80', '2025-01-01 09:00:00', '2025-01-01 09:00:00', '{"theme": "light", "notifications": true, "language": "en"}'::json);

-- Insert mock animals data (first few entries as example)
INSERT INTO animals (id, name, species, breed, age, color, weight, health_status, last_checkup, medical_history, image_url, created_at) VALUES
('animal_1', 'Whiskers', 'Cat', 'Siamese', 3, 'Cream', 4.5, 'healthy', '2025-05-10', ARRAY['Vaccinated', 'Neutered'], 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?auto=format&fit=crop&w=400&q=80', '2022-01-15'),
('animal_2', 'Buddy', 'Dog', 'Golden Retriever', 5, 'Golden', 30.0, 'healthy', '2025-06-15', ARRAY['Vaccinated', 'Microchipped'], 'https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?auto=format&fit=crop&w=400&q=80', '2020-03-10'),
('animal_3', 'Dumbo', 'Elephant', NULL, 10, 'Grey', 2000.0, 'recovering', '2025-06-01', ARRAY['Treated for foot injury'], 'https://images.unsplash.com/photo-1557050543-4d5f4e07ef46?auto=format&fit=crop&w=400&q=80', '2018-05-20');

-- Insert mock detections data
INSERT INTO detections (id, user_id, animal_id, timestamp, image_url, detections, notes, location, created_at) VALUES
('detection_1', 'user_1', 'animal_1', '2025-06-10 14:30:00', 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?auto=format&fit=crop&w=400&q=80',
 '[{"class": "cat", "score": 0.97, "bbox": [120, 80, 200, 180], "taxonomy": "Chordata:Mammalia:Carnivora:Felidae"}]'::json,
 'Whiskers in the backyard',
 '{"latitude": 37.7749, "longitude": -122.4194}'::json,
 '2025-06-10 14:30:00');

-- Insert mock detection reports data
INSERT INTO detection_reports (id, user_id, timestamp, image_source, detected_animals, summary, environment_data, detection_mode, detection_id, created_at) VALUES
('report_1', 'user_1', '2025-06-10 14:35:00', 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?auto=format&fit=crop&w=400&q=80',
 '[{"type": "cat", "confidence": 0.97, "isEndangered": false, "taxonomy": "Chordata:Mammalia:Carnivora:Felidae"}]'::json,
 '{"totalAnimals": 1, "endangeredCount": 0, "highestConfidence": 0.97, "averageConfidence": 0.97}'::json,
 '{"browser": "Chrome", "screenResolution": "1920x1080", "timeZone": "America/Los_Angeles"}'::json,
 'image', 'detection_1', '2025-06-10 14:35:00');

-- Insert mock diagnoses data
INSERT INTO diagnoses (id, user_id, animal_type, symptoms, diagnosis, date, image_url, recommendation, severity, follow_up_recommended, created_at) VALUES
('diag_1', 'user_1', 'Dog', 'Coughing and sneezing', 'Upper Respiratory Infection', '2025-03-15 10:30:00',
 'https://images.unsplash.com/photo-1530281700549-e82e7bf110d6?auto=format&fit=crop&w=500&q=80',
 'Rest, hydration, and antibiotics', 'medium', true, '2025-03-15 10:30:00');