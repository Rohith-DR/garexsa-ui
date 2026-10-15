================================================================================
                        GAREXSA UI - SETUP INSTRUCTIONS
================================================================================

Welcome to Garexsa UI!

This is the lightweight version that does NOT include the Gemma 4 AI model.
You need to download and place the model manually.

STEP 1: Download the Gemma 4 Model
-----------------------------------
Visit Kaggle and download: gemma-4-E2B-it.litertlm

https://www.kaggle.com/models/google/gemma-4/tfLiteGemma4/gemma-4-e2b-it

After downloading, you will have a folder named:
  gemma-4-E2B-it.litertlm

This folder should contain:
  - model.litertlm (the actual AI model file, ~3.4GB)
  - Other supporting files

STEP 2: Place Model in the Models Folder
-----------------------------------------
Copy the ENTIRE gemma-4-E2B-it.litertlm folder (not just the files inside)
to this location in your installation directory:

  [INSTALL_DIR]\resources\backend\models\

EASY WAY TO GET THERE:
1. Use the Desktop shortcut "Garexsa Models Folder" (created during install)
2. Or right-click the Garexsa UI desktop shortcut → "Open File Location"
3. Navigate to: resources\backend\models\
4. Paste the gemma-4-E2B-it.litertlm folder here

EXAMPLE (if installed in default location):
  C:\Program Files\garexsa-ui\resources\backend\models\gemma-4-E2B-it.litertlm\

STEP 3: Launch Garexsa UI
--------------------------
- Use the desktop shortcut, or
- Find it in Start Menu under "Garexsa UI"

The application will automatically detect the model and start the backend.

STEP 4: Start Chatting!
------------------------
After the backend initializes (first launch may take 10-30 seconds),
the chat interface will open automatically.

Type your questions and interact with Gemma 4 AI!

================================================================================
                            TROUBLESHOOTING
================================================================================

Backend Won't Start:
- Make sure the model folder is in the correct location
- Check that the folder name includes "litertlm"
- Verify the model.litertlm file exists inside the folder

Model Not Detected:
- Restart the application after placing the model
- Check logs at: %APPDATA%\garexsa-ui\garexsa.log

Performance Issues:
- Gemma 4 model requires at least 8GB RAM
- GPU will be used automatically if available
- First response may be slower (model loading)

For more help, check the GitHub repository or documentation.

================================================================================
