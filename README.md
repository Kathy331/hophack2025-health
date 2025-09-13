# hoptest

## Get started

1. Install dependencies

   ```bash
   npm install
   ```

2. Start the app

   ```bash
   npx expo start
   ```
3. Get a Gemini API key from https://aistudio.google.com/app/apikey


## key changes/steps mades

1. create a expo app with backend and frontend folder
2. added new layout for tabs, home, inventory, add, profile, and recipes, and change _layout.tsx in the tabs folder
3. added services folder in frontend folder for api calls
4. everything in backend folder is newly created via (npm init -y)(.env file might not need ' ' around the api key)
5. 5 npm packages added in backend folder (cors, dotenv, express, multer, @google/genai)
  ### Install dependencies one by one
    ```bash
    npm install express
    npm install multer
    npm install @google/genai
    npm install dotenv
    npm install cors
    ```
6. backend connection can be tested 
    ```bash
    curl http://localhost:3000/api/health
    ```
  ### first start the backend server
    ```bash
     cd backend
    npm run start
    ```

## Setup & Usage Guide for Connecting Backend and Frontend (Curtis Changes)

### 1. Prerequisites
- Node.js (v20+ recommended)
- npm
- Expo Go app (for mobile testing)
- [ngrok](https://ngrok.com/) (for tunneling backend)
- Google Gemini API key (add to `backend/.env` as `GEMINI_API_KEY=...`)

### 2. Backend Setup
1. Install dependencies:
   ```sh
   cd backend
   npm install
   ```
2. Add your Gemini API key to `backend/.env`:
   ```
   GEMINI_API_KEY=your-google-gemini-api-key
   PORT=3000
   ```
3. Start the backend server:
   ```sh
   node server.js
   ```

### 3. Expose Backend with ngrok
1. In a new terminal, run:
   ```sh
   ngrok http 3000
   ```
2. Copy the HTTPS forwarding URL (e.g., `https://xxxxxx.ngrok-free.app`).

### 4. Frontend Setup
1. Install dependencies:
   ```sh
   cd frontend
   npm install
   ```
2. In `frontend/services/geminiService.ts`, set the backend URL to your ngrok HTTPS link:
   ```typescript
   this.baseUrl = 'https://xxxxxx.ngrok-free.app';
   ```
3. Start the Expo frontend:
   ```sh
   npx expo start --tunnel
   ```
4. Open the Expo Go app on your mobile device and scan the QR code.

### 5. Usage
- Use the app to select or take photos.
- Tap "Analyze with AI" to send images to the backend and get Gemini-powered analysis.

### 6. Troubleshooting
- **Network errors:** Make sure your frontend uses the ngrok HTTPS URL, not localhost.
- **500 errors:** Check backend logs for Gemini API errors or model name issues.
- **Module errors:** Ensure you have installed `@google/generative-ai` in the backend.

### 7. Notes
- The backend uses Express, Multer for image upload, and Google Gemini for AI analysis.
- The frontend uses Expo, React Native, and fetches results from the backend.
- You may need to update the model name in `server.js` if Google changes available models.