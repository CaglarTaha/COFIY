#!/bin/bash

echo "Firma Yönetim Uygulaması başlatılıyor..."
echo ""
echo "1. Vite dev server başlatılıyor..."
npm run dev &
VITE_PID=$!
echo ""
echo "2. 3 saniye bekleniyor..."
sleep 3
echo ""
echo "3. Electron uygulaması başlatılıyor..."
npm run electron
echo ""
echo "Uygulama kapatıldı. Çıkmak için herhangi bir tuşa basın..."
kill $VITE_PID 2>/dev/null
read -n 1
