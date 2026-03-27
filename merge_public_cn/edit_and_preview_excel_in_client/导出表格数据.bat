@echo off
title [convert excel to json]
echo start converting ....
node export_excel.js --export
echo convert over!

node json_format.js

pause
