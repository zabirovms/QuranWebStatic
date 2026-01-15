# Pages Fix Plan - Match Original Flutter App

## Issues Identified:
1. **Main Menu Page** - Not using actual SVG images for featured surahs and prophets
2. **Main Menu Page** - Not using actual reciter images
3. **Bottom Navigation** - Not matching Flutter's CircleNavBar design
4. **Quran Page** - Missing AppBar with navigation, search, and bookmark buttons
5. **Quran Page** - TabBar implementation doesn't match Flutter exactly
6. **All Pages** - Many have placeholder content instead of actual implementations

## Priority Fixes:

### 1. Main Menu Page (`app/page.tsx`)
- ✅ Use actual SVG images for featured surahs from `/images/Featured_Surahs/`
- ⏳ Use actual SVG images for prophets from `/images/Prophet_*.svg`
- ⏳ Use actual reciter images from `/images/reciters_photo/`
- ⏳ Match exact layout, spacing, and styling from Flutter

### 2. Bottom Navigation (`components/BottomNavigation.tsx`)
- ⏳ Match Flutter's CircleNavBar design exactly
- ⏳ Use proper icons (music_note, quran icon, home, school, settings)
- ⏳ Center button should be elevated with shadow
- ⏳ Active state highlighting

### 3. Quran Page (`app/quran/page.tsx`)
- ⏳ Add AppBar with:
  - Back button
  - Title "Қуръон"
  - Navigation button (opens dialog)
  - Search button
  - Bookmark button
- ⏳ Match TabBar styling exactly
- ⏳ Add FloatingActionButton for sorting
- ⏳ Match SurahListItem, JuzListItem, PageListItem styling

### 4. Other Pages
- ⏳ Replace all placeholder content
- ⏳ Use actual data and images
- ⏳ Match Flutter layouts exactly

## Next Steps:
1. Continue fixing Main Menu Page (prophets, reciters)
2. Fix Bottom Navigation component
3. Fix Quran Page AppBar and styling
4. Review and fix all other pages systematically


