@echo off
title [convert excel to json]
echo start converting ....
if exist "excel" rmdir /S /Q "excel"
xcopy "..\activities" "excel" /E /Y /I
node index.js --export
echo convert over!
if exist "..\activities_json" rmdir /S /Q "..\activities_json"
xcopy "json" "..\activities_json" /E /Y /I
pause