@echo off
REM Creates the virtual environment and installs requirements.txt
cd /d "%~dp0"
where python >nul 2>nul || (echo Python not found on PATH. & exit /b 1)
if not exist .venv python -m venv .venv || exit /b 1
call .venv\Scripts\activate.bat
python -m pip install --upgrade pip
pip install -r requirements.txt || exit /b 1
echo.
echo Environment ready. Activate it with:  .venv\Scripts\Activate.ps1
