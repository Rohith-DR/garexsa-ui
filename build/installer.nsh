; NSIS Script for Post-Install Actions
; Creates models folder in installation directory and shows instructions

!macro customInstall
  ; Create models folder in the installation directory
  CreateDirectory "$INSTDIR\resources\backend\models"
  
  ; Copy README to the models folder
  CopyFiles "$INSTDIR\resources\README.txt" "$INSTDIR\resources\backend\models\README.txt"
  
  ; Create a shortcut to the models folder on Desktop for easy access
  CreateShortCut "$DESKTOP\Garexsa Models Folder.lnk" "$INSTDIR\resources\backend\models" "" "$SYSDIR\shell32.dll" 4
  
  ; Show message to user about model placement
  MessageBox MB_OK|MB_ICONINFORMATION "IMPORTANT: Model Setup Required$\r$\n$\r$\nGarexsa UI does not include the AI model.$\r$\n$\r$\nPlease download the Gemma 4 model from Kaggle and place it in:$\r$\n$\r$\n$INSTDIR\resources\backend\models\$\r$\n$\r$\nA shortcut 'Garexsa Models Folder' has been created on your Desktop for easy access.$\r$\n$\r$\nSee README.txt in the models folder for detailed instructions."
!macroend

!macro customUnInstall
  ; Clean up the desktop shortcut
  Delete "$DESKTOP\Garexsa Models Folder.lnk"
!macroend
