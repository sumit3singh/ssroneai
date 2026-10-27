@echo off
title M.Sc. Computer Science Academic Portal Launcher (JGND PSOU)
echo ========================================================
echo   JAGAT GURU NANAK DEV PUNJAB STATE OPEN UNIVERSITY
echo   M.Sc. (Computer Science) Semester IV Academic Portal
echo ========================================================
echo.
echo Starting secure local academic web server...

set PORT=5050
set PYTHON_EXE="%~dp0..\.venv\Scripts\python.exe"
if not exist %PYTHON_EXE% set PYTHON_EXE=python

cd /d "%~dp0app"
start /b "" %PYTHON_EXE% -m http.server %PORT% >nul 2>&1
timeout /t 1 >nul

echo.
echo Opening portal in your browser at http://localhost:%PORT% ...
start "" "http://localhost:%PORT%"

echo.
echo ========================================================
echo  Academic Portal is active!
echo  URL: http://localhost:%PORT%
echo.
echo  - 1-Click download PPTX files with real .pptx extensions
echo  - 1-Click download all 11 PDFs with real .pdf extensions
echo  - Fullscreen Viva Voce Presentation with Speech Scripts
echo  - Technical Terms Dictionary in Hindi + English
echo.
echo  All generated files are also available directly on disk at:
echo  %~dp0app\downloads\
echo ========================================================
echo.
echo Keep this window open while using the portal.
echo Press any key to stop server and exit.
pause >nul
taskkill /f /im python.exe >nul 2>&1
