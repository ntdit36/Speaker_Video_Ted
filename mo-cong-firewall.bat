@echo off
echo ========================================================
echo DANG MO CONG PORT 3000 CHO WINDOWS DEFENDER FIREWALL...
echo ========================================================
netsh advfirewall firewall add rule name="YouGlish TED Port 3000" dir=in action=allow protocol=TCP localport=3000
echo.
echo HOAN TAT! Cac may khac trong cong ty / Wi-Fi da co the truy cap.
pause
