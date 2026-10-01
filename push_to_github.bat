@echo off
TITLE Galaxy Striker 3D - Git Push Helper
echo ========================================================
echo   GALAXY STRIKER 3D // GITHUB PUSH SCRIPT
echo ========================================================
echo.
cd /d "%~dp0"

set "GIT_CMD=..\tools\git\cmd\git.exe"
if not exist "%GIT_CMD%" set "GIT_CMD=git"

echo Checking git status...
%GIT_CMD% status
echo.
set /p commit_msg="Enter commit message (or press ENTER for default 'Update Galaxy Striker 3D'): "
if "%commit_msg%"=="" set commit_msg=Update Galaxy Striker 3D

%GIT_CMD% add .
%GIT_CMD% commit -m "%commit_msg%"
echo.
echo Pushing to repository...
%GIT_CMD% push origin main || %GIT_CMD% push origin master

echo.
echo Done!
pause
