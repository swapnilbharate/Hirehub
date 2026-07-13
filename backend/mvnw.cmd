@echo off
set MVN_VERSION=3.9.6
set DIST_DIR=%USERPROFILE%\.m2\wrapper\dists
set MVN_DIR=%DIST_DIR%\apache-maven-%MVN_VERSION%

if not exist "%MVN_DIR%" (
    echo [HireHub Maven Wrapper] Maven %MVN_VERSION% not found. Downloading...
    if not exist "%DIST_DIR%" mkdir "%DIST_DIR%"
    powershell -Command "[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12; Invoke-WebRequest -Uri 'https://archive.apache.org/dist/maven/maven-3/%MVN_VERSION%/binaries/apache-maven-%MVN_VERSION%-bin.zip' -OutFile '%TEMP%\maven-%MVN_VERSION%.zip'"
    if errorlevel 1 (
        echo [ERROR] Failed to download Maven. Please verify your internet connection.
        exit /b 1
    )
    echo [HireHub Maven Wrapper] Extracting Maven...
    powershell -Command "Expand-Archive -Path '%TEMP%\maven-%MVN_VERSION%.zip' -DestinationPath '%DIST_DIR%'"
    del "%TEMP%\maven-%MVN_VERSION%.zip"
    echo [HireHub Maven Wrapper] Maven configured successfully.
)

set MVN_BIN=%MVN_DIR%\bin\mvn.cmd
if not exist "%MVN_BIN%" (
    echo [ERROR] Maven binary not found at %MVN_BIN%.
    exit /b 1
)

"%MVN_BIN%" %*
