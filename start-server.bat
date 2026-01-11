@echo off
echo Starting WebAnimal Development Server with optimizations...
echo.
echo The server will be available at: http://localhost:3000
echo Press Ctrl+C to stop the server when finished
echo.

:: Set Node.js optimization flags
set NODE_OPTIONS=--max-old-space-size=4096

:: Set Next.js optimization flags
set NEXT_TELEMETRY_DISABLED=1
set NEXT_OPTIMIZE_FONTS=1
set NEXT_OPTIMIZE_IMAGES=1

:: Start the development server with Turbopack
npm run dev

pause 