@echo off
echo Installing project dependencies...
npm install
if %errorlevel% neq 0 (
    echo Failed to install dependencies with npm.
    echo Trying with yarn...
    yarn install
    if %errorlevel% neq 0 (
        echo Failed to install dependencies with yarn as well.
        echo Please check your npm/yarn setup and package.json.
        pause
        exit /b 1
    )
)
echo Dependencies installed successfully.
pause
