#!/bin/sh
# bump the ?v= cache-busting version on every asset in index.html
cur=$(grep -o 'v=[0-9]*' index.html | head -1 | cut -d= -f2)
[ -z "$cur" ] && cur=0
next=$((cur + 1))
sed -i '' "s/v=$cur\"/v=$next\"/g" index.html
echo "assets version -> $next"
