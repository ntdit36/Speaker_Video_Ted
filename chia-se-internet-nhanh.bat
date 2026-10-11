@echo off
echo ===================================================================
echo   KHOI TAO LINK INTERNET CHIA SE CHO CONG DONG (HTTPS)
echo   Yeu cau: Server local (npm run dev) dang chay o port 3000
echo ===================================================================
echo.
echo He thong dang tao duong link cong khai qua Cloudflare Tunnel...
echo Khi xuat hien link "https://....trycloudflare.com", ban chi can copy va gui cho moi nguoi!
echo.
npx -y untun@latest tunnel --port 3000
pause
