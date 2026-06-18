#!/bin/bash
cd "c:\Users\Josiel Gois\Documents\Projetos VS Code\IASD\FormInscrição"
git config user.name "IcebergDev"
git config user.email "dev@iceberg.local"
git add config.js .gitignore script.js
git commit -m "feat: Adicionar config.js ao repositório para funcionamento no GitHub Pages"
git log --oneline -5
