#!/bin/bash

echo "========== [convert excel to json] =========="
echo "Start converting..."

# 执行 xlsx 转 json
node ./export_excel.js --export

echo "Convert over!"

# 执行 json 格式化脚本
node ./json_format.js

echo "All done. Press any key to exit."
read -n 1 -s
