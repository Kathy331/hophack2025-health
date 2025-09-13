# hophack2025-health

## Get started 

1. Install dependencies
   ```bash
   cd frontend
   npm install
   ```

2. ngrok is used to expose the backend server to the internet so that the expo app can access it. set up ngrok account from https://dashboard.ngrok.com/signup and after logging in, go to https://dashboard.ngrok.com/get-started/your-authtoken and copy your authtoken.
    ```bash
    npm install -g ngrok
    ```
    ```bash
    ngrok config add-authtoken <your-authtoken>
    ```
3. Copy .env.example to .env and fill in your:
    - GEMINI_API_KEY from https://aistudio.google.com/app/apikey
    ```bash
    cd backend
    cp .env.example .env
    ```
    ```bash
    GEMINI_API_KEY=your_gemini_api_key
    ```

    - NGROK_FORWARDING (the https forwarding url you get from ngrok)
    ```bash
    cd frontend
    cp .env.example .env
    ```
    ```bash
    NGROK_FORWARDING=your_ngrok_url
    ```

4. start ngrok in a new terminal window
    ```bash
    cd backend
    ngrok http 3000
    ```
5. setting up backend ennvironment: command + p to open a python interpreter and make an environment
    ```bash
    cd backend
    python3 -m venv venv
    source venv/bin/activate  # On Windows use `venv\Scripts\activate`
    pip install -r requirements.txt
    ```
    use `deactivate` command to exit the virtual environment
6. !!!adding const backendUrl =
    -add your ngrok url in the frontend/app/(tabs)/(recipes)/index.tsx file
    -add your ngrok url in geminiService in the frontend/app/services
7. OVERVIEW (dev-start): start the expo app with tunnel option
    ### nrgrok command in terminal A
    ```bash
    ngrok http 3000
    ```
    put the forwarding https url in .env file in the frontend folder

    ### start the backend server in terminal B
    ```bash
    cd backend
    uvicorn app.main:app --host 0.0.0.0 --port 3000 --reload
    ```
    ### then start the expo app with tunnel option in terminal C
    ```bash
    cd frontend
    npx expo start --tunnel
    ```
## others
1. 5 npm packages added in backend folder (cors, dotenv, express, multer, @google/genai)
  ### Install dependencies one by one if necessary (we are using python so npm install might not work)
    ```bash
    npm install express
    npm install multer
    npm install @google/genai
    npm install dotenv
    npm install cors
    ```