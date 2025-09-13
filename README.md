# hophack2025

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
