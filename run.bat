@echo off
echo Starting Al-Waseet Pro...
echo.
echo Choose an option:
echo 1. Run Development Server (for web browser)
echo 2. Build Project (for production)
echo.
set /p choice="Enter your choice (1 or 2): "

if "%choice%"=="1" (
    echo Starting development server...
    npm run dev
) else if "%choice%"=="2" (
    echo Building project...
    npm run build
    echo Build complete. You can now start the production server with 'npm start'.
) else (
    echo Invalid choice. Exiting.
)
pause
