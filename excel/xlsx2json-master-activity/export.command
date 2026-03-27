#!/bin/sh

cd `dirname $0`

chmod u+x ./export.sh

node index.js --export

node json_format.js

echo convert over!

