#!/bin/bash

# Create public/data directory if it doesn't exist
mkdir -p public/data

# Verify required data files exist
echo "Checking for required data files in public/data/..."

# List of required files
files=(
  "alquran_cloud_complete_quran.json.gz"
  "quran_mirror_with_translations.json.gz"
  "quran_tj_2_AbuAlomuddin.json.gz"
  "quran_tj_3_PioneersTranslationCenter.json.gz"
  "quran_farsi_Farsi.json.gz"
  "quran_ru.json.gz"
  "quranic_duas.json.gz"
  "tasbeehs.json.gz"
  "Prophets.json.gz"
  "most_quoted_verses.json.gz"
  "99_Names_Of_Allah.json.gz"
)

missing_files=0
for file in "${files[@]}"; do
  if [ -f "public/data/$file" ]; then
    echo "✓ Found $file"
  else
    echo "⚠ Missing: $file"
    missing_files=$((missing_files + 1))
  fi
done

if [ $missing_files -eq 0 ]; then
  echo "All required data files are present!"
else
  echo "Warning: $missing_files file(s) are missing. Please add them to public/data/"
fi

