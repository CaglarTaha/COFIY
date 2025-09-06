#!/bin/bash

echo "Firma Yönetim Uygulaması başlatılıyor..."
echo ""
npm run electron:dev
echo ""
echo "Uygulama kapatıldı. Çıkmak için herhangi bir tuşa basın..."
read -n 1
