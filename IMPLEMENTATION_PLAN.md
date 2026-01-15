# Implementation Plan: Flutter to Next.js Static Site Migration

## Overview
This document outlines the step-by-step plan to make the Next.js static site exactly match the original Flutter application in terms of layout, functionality, and user experience.

## Status Legend
- ⬜ Not Started
- 🟡 In Progress
- ✅ Completed
- ⏸️ Blocked

---

## Phase 1: Critical Functionality (High Priority) ✅ COMPLETED

### 1.1 Tasbeeh Counter Functionality ✅
**Priority:** HIGH  
**Estimated Time:** 2-3 hours  
**Dependencies:** None  
**Status:** ✅ Completed

#### Tasks:
- [x] Add state management for counter (useState + localStorage)
- [x] Implement increment function on button click
- [x] Add reset button functionality
- [x] Implement counter persistence to localStorage
- [x] Add completion tracking (completed tasbeehs count)
- [x] Add completion dialog when target reached
- [x] Add target count customization
- [x] Add visual feedback (counter animation)
- [x] Test counter persistence across page refreshes

#### Files Modified:
- `web-static/app/tasbeeh/page.tsx`
- `web-static/lib/services/tasbeeh-service.ts` (new)

#### Acceptance Criteria:
- ✅ Counter increments on button click
- ✅ Counter persists across page refreshes
- ✅ Completion dialog shows when target reached
- ✅ Reset button clears counter
- ✅ Completed count tracks total completions

---

### 1.2 Surah Page AppBar and Navigation ✅
**Priority:** HIGH  
**Estimated Time:** 2-3 hours  
**Dependencies:** None  
**Status:** ✅ Completed

#### Tasks:
- [x] Add AppBar component with back button
- [x] Add Surah title in AppBar
- [x] Add share button (placeholder for now)
- [x] Add audio button (placeholder for now)
- [x] Add settings button (placeholder for now)
- [x] Add bookmarks button with state check
- [x] Implement back navigation logic
- [x] Match Flutter AppBar styling

#### Files Modified:
- `web-static/app/surah/[number]/page.tsx`
- `web-static/components/SurahAppBar.tsx` (new)
- `web-static/app/surah/[number]/verse/[verseNumber]/page.tsx`

#### Acceptance Criteria:
- ✅ AppBar displays with correct title
- ✅ Back button navigates correctly
- ✅ All action buttons present (can be placeholders)
- ✅ Styling matches Flutter AppBar

---

### 1.3 Quran Page Navigation Dialog ✅
**Priority:** HIGH  
**Estimated Time:** 1-2 hours  
**Dependencies:** None  
**Status:** ✅ Completed

#### Tasks:
- [x] Create navigation dialog component
- [x] Add surah number input field
- [x] Add verse number input field (optional)
- [x] Add validation (surah 1-114, verse valid range)
- [x] Implement navigation on submit
- [x] Add cancel button
- [x] Style dialog to match Flutter
- [x] Add error messages for invalid input

#### Files Modified:
- `web-static/app/quran/page.tsx`

#### Acceptance Criteria:
- ✅ Dialog opens on navigation button click
- ✅ Validates input correctly
- ✅ Navigates to correct surah/verse
- ✅ Shows error for invalid input
- ✅ Can be cancelled

---

### 1.4 Bookmarks Integration ✅
**Priority:** HIGH  
**Estimated Time:** 3-4 hours  
**Dependencies:** None  
**Status:** ✅ Completed

#### Tasks:
- [ ] Create bookmarks data service (localStorage-based)
- [ ] Add bookmark interface/types
- [ ] Implement bookmark/unbookmark functionality
- [ ] Add bookmark status checking
- [ ] Update Quran page to check for bookmarks
- [ ] Update Surah page to show bookmark status
- [ ] Add bookmark button to verse items
- [ ] Create bookmarks page with list
- [ ] Add delete bookmark functionality
- [ ] Add navigation from bookmark to verse

#### Files to Modify:
- `web-static/lib/data/bookmark-data.ts` (new)
- `web-static/lib/types/bookmark.ts` (new)
- `web-static/app/quran/page.tsx`
- `web-static/app/surah/[number]/page.tsx`
- `web-static/app/bookmarks/page.tsx`
- `web-static/components/BookmarkButton.tsx` (new)

#### Acceptance Criteria:
- Can bookmark/unbookmark verses
- Bookmark status persists
- Bookmarks page shows all bookmarks
- Can navigate from bookmark to verse
- Can delete bookmarks
- Bookmark icon updates correctly

---

### 1.5 Verse Actions (Share, Copy, Audio) ⬜
**Priority:** HIGH  
**Estimated Time:** 2-3 hours  
**Dependencies:** 1.4 (Bookmarks)

#### Tasks:
- [ ] Create VerseActions component
- [ ] Implement share functionality (Web Share API)
- [ ] Implement copy to clipboard
- [ ] Add audio button (placeholder for now)
- [ ] Add bookmark button (integrate with 1.4)
- [ ] Style action buttons
- [ ] Add tooltips/hints
- [ ] Test share on mobile/desktop

#### Files to Modify:
- `web-static/components/VerseActions.tsx` (new)
- `web-static/app/surah/[number]/page.tsx`

#### Acceptance Criteria:
- Share button works (Web Share API or fallback)
- Copy button copies verse text
- All action buttons visible
- Actions work correctly

---

## Phase 2: Core Features (Medium Priority) ✅ COMPLETED

### 2.1 Surah Page Verse Display Enhancements ✅
**Priority:** MEDIUM  
**Estimated Time:** 4-5 hours  
**Dependencies:** 1.2, 1.5  
**Status:** ✅ Completed

#### Tasks:
- [x] Create VerseItem component matching Flutter
- [x] Add translation toggle
- [x] Add transliteration toggle
- [x] Add Arabic-only mode
- [x] Add multiple translation support (TJ2, TJ3, Farsi, Russian)
- [x] Add translation selector
- [x] Implement verse highlighting
- [x] Add scroll to initial verse functionality
- [x] Add smooth scroll animation
- [x] Style verse cards to match Flutter

#### Files Modified:
- `web-static/components/VerseItem.tsx` (new)
- `web-static/app/surah/[number]/page.tsx`
- `web-static/app/surah/[number]/verse/[verseNumber]/page.tsx`

#### Acceptance Criteria:
- ✅ Verse displays with all translations available
- ✅ Can toggle translations on/off
- ✅ Can toggle transliteration
- ✅ Can show Arabic-only mode
- ✅ Initial verse scrolls into view
- ✅ Verse cards match Flutter styling

---

### 2.2 Prayer Times Calculation ✅
**Priority:** MEDIUM  
**Estimated Time:** 3-4 hours  
**Dependencies:** None  
**Status:** ✅ Completed

#### Tasks:
- [x] Research prayer time calculation library (or implement)
- [x] Add location detection (optional, can use default)
- [x] Create prayer times service
- [x] Calculate 5 daily prayers
- [x] Update main menu prayer times section
- [x] Add time formatting
- [x] Add next prayer indicator (optional)
- [x] Style prayer times cards

#### Files Modified:
- `web-static/lib/services/prayer-times.ts` (new)
- `web-static/components/PrayerTimesSection.tsx` (new)
- `web-static/app/page.tsx`

#### Acceptance Criteria:
- ✅ Prayer times calculated correctly
- ✅ Times displayed in main menu
- ✅ Times update based on date
- ✅ Format matches Flutter

---

### 2.3 Gallery Functionality ✅
**Priority:** MEDIUM  
**Estimated Time:** 4-5 hours  
**Dependencies:** None  
**Status:** ✅ Completed

#### Tasks:
- [x] Check if image data source exists
- [x] Create image loading service
- [x] Implement image grid layout
- [x] Add image lazy loading
- [x] Add fullscreen image viewer
- [x] Add search/filter functionality
- [x] Add edge-to-edge layout
- [x] Add loading states
- [x] Add error handling
- [x] Style gallery to match Flutter

#### Files Modified:
- `web-static/app/gallery/page.tsx`
- `web-static/lib/types/gallery.ts` (new)
- `web-static/components/GalleryGrid.tsx` (new)
- `web-static/components/ImageViewer.tsx` (new)

#### Acceptance Criteria:
- ✅ Images load and display
- ✅ Gallery grid matches Flutter
- ✅ Can view images fullscreen
- ✅ Search/filter works
- ✅ Loading states shown
- ✅ Error handling works

---

### 2.4 Qaida Drill Pages ✅
**Priority:** MEDIUM  
**Estimated Time:** 5-6 hours  
**Dependencies:** None  
**Status:** ✅ Completed

#### Tasks:
- [x] Create alphabet drill page (`/qaida/lesson/1/letter/[letterId]`)
- [x] Create pronunciation drill page (`/qaida/lesson/2/letter/[letter]`)
- [x] Create vowels drill page (`/qaida/lesson/3/letter/[letter]`)
- [x] Create tanween drill page (`/qaida/lesson/4/letter/[letter]`)
- [x] Create letter forms drill page (`/qaida/lesson/5/letter/[letterId]`)
- [x] Create shadda drill page (`/qaida/lesson/6/letter/[letter]`)
- [x] Create sukun drill page (`/qaida/lesson/7/letter/[letter]`)
- [x] Create madd drill page (`/qaida/lesson/8/letter/[letter]`)
- [x] Add navigation from lesson pages
- [x] Style drill pages to match Flutter

#### Files Created:
- `web-static/components/QaidaDrillPage.tsx` (new)
- `web-static/app/qaida/lesson/1/letter/[letterId]/page.tsx`
- `web-static/app/qaida/lesson/2/letter/[letter]/page.tsx`
- `web-static/app/qaida/lesson/3/letter/[letter]/page.tsx`
- `web-static/app/qaida/lesson/4/letter/[letter]/page.tsx`
- `web-static/app/qaida/lesson/5/letter/[letterId]/page.tsx`
- `web-static/app/qaida/lesson/6/letter/[letter]/page.tsx`
- `web-static/app/qaida/lesson/7/letter/[letter]/page.tsx`
- `web-static/app/qaida/lesson/8/letter/[letter]/page.tsx`

#### Acceptance Criteria:
- ✅ All drill pages accessible
- ✅ Pages display letter/pronunciation correctly
- ✅ Navigation works from lesson pages
- ✅ Styling matches Flutter

---

### 2.5 Vocabulary Quiz and Word Detail ✅
**Priority:** MEDIUM  
**Estimated Time:** 4-5 hours  
**Dependencies:** None  
**Status:** ✅ Completed

#### Tasks:
- [x] Create vocabulary quiz page (`/vocabulary/lesson/[lessonId]/quiz`)
- [x] Implement quiz logic (questions, answers, scoring)
- [x] Add quiz results display
- [x] Create word detail page (`/vocabulary/lesson/[lessonId]/word/[wordIndex]`)
- [x] Add word information display
- [x] Add navigation from lesson to quiz/word
- [x] Style pages to match Flutter

#### Files Created:
- `web-static/lib/types/vocabulary.ts` (new)
- `web-static/lib/data/vocabulary-data.ts` (new)
- `web-static/lib/data/vocabulary-data-client.ts` (new)
- `web-static/app/vocabulary/lesson/[lessonId]/quiz/page.tsx`
- `web-static/app/vocabulary/lesson/[lessonId]/word/[wordIndex]/page.tsx`

#### Acceptance Criteria:
- ✅ Quiz page functional
- ✅ Quiz tracks score
- ✅ Word detail page shows all information
- ✅ Navigation works correctly
- ✅ Styling matches Flutter

---

### 2.6 Prophet Dua Detail Page ✅
**Priority:** MEDIUM  
**Estimated Time:** 2-3 hours  
**Dependencies:** None  
**Status:** ✅ Completed

#### Tasks:
- [x] Create prophet dua detail page (`/duas/prophets/detail`)
- [x] Use query params instead of state.extra (URL-based)
- [x] Display dua information
- [x] Add navigation from prophets duas list
- [x] Style page to match Flutter

#### Files Created:
- `web-static/app/duas/prophets/detail/page.tsx`

#### Files Modified:
- `web-static/app/duas/prophets/page.tsx` (add navigation)

#### Acceptance Criteria:
- ✅ Detail page accessible via URL
- ✅ Displays all dua information
- ✅ Navigation works from list
- ✅ Styling matches Flutter

---

## Phase 3: Audio Features (Medium-High Priority)

### 3.1 Basic Audio Playback ⬜
**Priority:** MEDIUM-HIGH  
**Estimated Time:** 6-8 hours  
**Dependencies:** None

#### Tasks:
- [ ] Research audio playback options (HTML5 Audio, Howler.js, etc.)
- [ ] Create audio service
- [ ] Implement play/pause functionality
- [ ] Implement verse-by-verse playback
- [ ] Add progress tracking
- [ ] Add audio controls component
- [ ] Integrate with Surah page
- [ ] Add auto-scroll to playing verse
- [ ] Add reciter selection
- [ ] Test audio loading and playback

#### Files to Create:
- `web-static/lib/services/audio-service.ts`
- `web-static/components/AudioControls.tsx`
- `web-static/components/ReciterSelector.tsx`

#### Files to Modify:
- `web-static/app/surah/[number]/page.tsx`

#### Acceptance Criteria:
- Audio plays correctly
- Can play verse-by-verse
- Progress tracked
- Auto-scrolls to playing verse
- Reciter selection works

---

### 3.2 Audio Home Pages Enhancement ⬜
**Priority:** MEDIUM  
**Estimated Time:** 4-5 hours  
**Dependencies:** 3.1

#### Tasks:
- [ ] Review AudioHomePage layout
- [ ] Add category tabs
- [ ] Add "Last Seen" section
- [ ] Add "With Translate" section
- [ ] Add "Editors' Choice" section
- [ ] Enhance reciter playlist page
- [ ] Add play functionality to playlist
- [ ] Style pages to match Flutter

#### Files to Modify:
- `web-static/app/audio-home/page.tsx`
- `web-static/app/audio-home/reciter/[reciterId]/page.tsx`

#### Acceptance Criteria:
- All sections display correctly
- Navigation works
- Play functionality integrated
- Styling matches Flutter

---

### 3.3 Full Player Page ⬜
**Priority:** MEDIUM  
**Estimated Time:** 4-5 hours  
**Dependencies:** 3.1

#### Tasks:
- [ ] Create full player page layout
- [ ] Add large album art/image
- [ ] Add progress bar with time
- [ ] Add playback controls (prev, play/pause, next)
- [ ] Add speed control
- [ ] Add repeat control
- [ ] Add shuffle control
- [ ] Add favorite/bookmark button
- [ ] Integrate with audio service
- [ ] Style to match Flutter

#### Files to Modify:
- `web-static/app/audio-home/player/page.tsx`

#### Acceptance Criteria:
- Full player displays correctly
- All controls functional
- Progress updates in real-time
- Styling matches Flutter

---

## Phase 4: Advanced Features (Low-Medium Priority)

### 4.1 Word-by-Word Mode ⬜
**Priority:** LOW-MEDIUM  
**Estimated Time:** 5-6 hours  
**Dependencies:** None

#### Tasks:
- [ ] Check if word-by-word data exists
- [ ] Create word-by-word data loader
- [ ] Create WordByWord component
- [ ] Add word highlighting
- [ ] Add word meaning display
- [ ] Integrate with verse display
- [ ] Add toggle in settings
- [ ] Style word-by-word display

#### Files to Create:
- `web-static/lib/data/word-by-word-data.ts`
- `web-static/components/WordByWord.tsx`

#### Files to Modify:
- `web-static/components/VerseItem.tsx`
- `web-static/app/surah/[number]/page.tsx`

#### Acceptance Criteria:
- Word-by-word data loads
- Words highlight correctly
- Meanings display
- Toggle works
- Styling matches Flutter

---

### 4.2 Tafsir Display ✅
**Priority:** LOW-MEDIUM  
**Estimated Time:** 3-4 hours  
**Dependencies:** None  
**Status:** ✅ Completed

#### Tasks:
- [x] Check if tafsir data exists
- [x] Create tafsir data loader
- [x] Create Tafsir component
- [x] Add expand/collapse functionality
- [x] Integrate with verse display
- [x] Style tafsir display

#### Files Created:
- `web-static/components/Tafsir.tsx`

#### Files Modified:
- `web-static/components/VerseItem.tsx`

#### Acceptance Criteria:
- ✅ Tafsir data loads (from verse data)
- ✅ Can expand/collapse tafsir
- ✅ Displays correctly
- ✅ Styling matches Flutter

---

### 4.3 Settings Page Functionality ✅
**Priority:** MEDIUM  
**Estimated Time:** 4-5 hours  
**Dependencies:** None  
**Status:** ✅ Completed

#### Tasks:
- [x] Review all Flutter settings
- [x] Create settings service (localStorage)
- [x] Implement theme selection
- [x] Implement translation language selection
- [x] Implement audio edition selection
- [x] Implement display preferences
- [x] Add settings persistence
- [x] Integrate settings with pages
- [x] Style settings page

#### Files Created:
- `web-static/lib/services/settings-service.ts`

#### Files Modified:
- `web-static/app/settings/page.tsx`
- `web-static/components/VerseItem.tsx`

#### Acceptance Criteria:
- ✅ All settings save correctly
- ✅ Settings persist across sessions
- ✅ Settings affect app behavior
- ✅ Styling matches Flutter

---

### 4.4 Search Functionality Enhancement ✅
**Priority:** MEDIUM  
**Estimated Time:** 3-4 hours  
**Dependencies:** None  
**Status:** ✅ Completed

#### Tasks:
- [x] Review current search implementation
- [x] Enhance search algorithm
- [x] Add search in Arabic text
- [x] Add search in translations
- [x] Add search in surah names
- [x] Improve search results display
- [x] Add search highlighting
- [x] Test search performance

#### Files Created:
- `web-static/lib/services/search-service.ts`

#### Files Modified:
- `web-static/app/search/page.tsx`

#### Acceptance Criteria:
- ✅ Search works in all text fields
- ✅ Results display correctly
- ✅ Search is performant
- ✅ Styling matches Flutter

---

### 4.5 Scheduler Functionality ⬜
**Priority:** LOW-MEDIUM  
**Estimated Time:** 4-5 hours  
**Dependencies:** 2.2 (Prayer Times)

#### Tasks:
- [ ] Review scheduler requirements
- [ ] Create scheduler service
- [ ] Implement prayer time scheduling
- [ ] Add notification setup (web notifications)
- [ ] Add scheduler UI
- [ ] Add enable/disable functionality
- [ ] Test notifications

#### Files to Modify:
- `web-static/app/scheduler/page.tsx`
- `web-static/lib/services/scheduler-service.ts` (new)

#### Acceptance Criteria:
- Can schedule prayer times
- Notifications work (if browser supports)
- Scheduler UI functional
- Styling matches Flutter

---

## Phase 5: UI/UX Polish (Low Priority)

### 5.1 Story Viewer for Reciters ✅
**Priority:** LOW  
**Estimated Time:** 6-8 hours  
**Dependencies:** None  
**Status:** ✅ Completed

#### Tasks:
- [x] Research story viewer implementation
- [x] Create story data structure
- [x] Create StoryViewer component
- [x] Add story navigation
- [x] Add swipe gestures
- [x] Integrate with reciter profiles
- [x] Style story viewer

#### Files Created:
- `web-static/components/StoryViewer.tsx`
- `web-static/lib/data/story-data-client.ts`
- `web-static/lib/types/story.ts`

#### Files Modified:
- `web-static/components/ReciterProfileItem.tsx`

#### Acceptance Criteria:
- ✅ Story viewer opens on reciter tap
- ✅ Can navigate between stories
- ✅ Swipe gestures work
- ✅ Styling matches Flutter

---

### 5.2 App Rating/Share Dialog ⬜
**Priority:** LOW  
**Estimated Time:** 2-3 hours  
**Dependencies:** None

#### Tasks:
- [ ] Create rating dialog component
- [ ] Implement session tracking (localStorage)
- [ ] Add rating prompt logic
- [ ] Add share functionality
- [ ] Integrate with main menu
- [ ] Style dialog

#### Files to Create:
- `web-static/components/RatingDialog.tsx`
- `web-static/lib/services/rating-service.ts`

#### Files to Modify:
- `web-static/app/page.tsx`

#### Acceptance Criteria:
- Dialog shows at appropriate times
- Rating prompt works
- Share functionality works
- Styling matches Flutter

---

### 5.3 Live Stream Video Player ✅
**Priority:** LOW-MEDIUM  
**Estimated Time:** 3-4 hours  
**Dependencies:** None  
**Status:** ✅ Completed

#### Tasks:
- [x] Review current live stream page
- [x] Implement HLS video player (hls.js)
- [x] Add video controls
- [x] Add fullscreen support
- [x] Add error handling
- [x] Test with live streams

#### Files Modified:
- `web-static/app/live/[streamId]/page.tsx`

#### Dependencies Added:
- `hls.js` package

#### Acceptance Criteria:
- ✅ Video plays correctly
- ✅ Controls work
- ✅ Fullscreen works
- ✅ Error handling works

---

### 5.4 YouTube Video Player ✅
**Priority:** LOW-MEDIUM  
**Estimated Time:** 2-3 hours  
**Dependencies:** None  
**Status:** ✅ Completed

#### Tasks:
- [x] Review current YouTube page
- [x] Implement YouTube embed
- [x] Add video controls
- [x] Add fullscreen support
- [x] Test video playback

#### Files Modified:
- `web-static/app/youtube/[videoId]/page.tsx`

#### Acceptance Criteria:
- ✅ Video embeds correctly
- ✅ Controls work
- ✅ Fullscreen works

---

### 5.5 UI Component Styling Match ⬜
**Priority:** MEDIUM  
**Estimated Time:** 12-15 hours  
**Dependencies:** All previous phases  
**Status:** ⬜ Pending

#### Overview:
This task requires comprehensive UI/UX polish to match the Flutter app's Material Design implementation. Each component needs detailed styling review and refinement.

---

#### 5.5.1 AppBar Styling ⬜
**Estimated Time:** 1-2 hours

##### Tasks:
- [ ] Review Flutter AppBar implementation
- [ ] Match elevation/shadow
- [ ] Match height and padding
- [ ] Match back button styling
- [ ] Match title typography
- [ ] Match action buttons (search, bookmark, etc.)
- [ ] Add proper responsive behavior

##### Files to Modify:
- `web-static/components/SurahAppBar.tsx`
- All pages with AppBar

##### Acceptance Criteria:
- AppBar matches Flutter elevation (4dp)
- Height matches Flutter (56dp)
- Typography matches exactly
- Buttons styled correctly
- Responsive on mobile

---

#### 5.5.2 Card Component Styling ⬜
**Estimated Time:** 2-3 hours

##### Tasks:
- [ ] Review Flutter Card implementation
- [ ] Match elevation (1dp, 2dp, 4dp, 8dp variants)
- [ ] Match border radius (4dp, 8dp, 12dp, 16dp)
- [ ] Match shadows (Material Design elevation)
- [ ] Match padding (16dp standard)
- [ ] Match hover states
- [ ] Match ripple effects (if applicable)

##### Components to Update:
- FeaturedSurahCard
- FeaturedProphetCard
- VerseItem container
- Bookmark cards
- Gallery cards
- All list item cards

##### Files to Modify:
- `web-static/components/FeaturedSurahCard.tsx`
- `web-static/components/FeaturedProphetCard.tsx`
- `web-static/components/VerseItem.tsx`
- `web-static/app/bookmarks/page.tsx`
- `web-static/app/gallery/page.tsx`
- All card-based components

##### Acceptance Criteria:
- Cards have correct elevation
- Border radius matches Flutter
- Shadows match Material Design spec
- Hover states work
- Consistent across all cards

---

#### 5.5.3 Button Styling ⬜
**Estimated Time:** 1-2 hours

##### Tasks:
- [ ] Review Flutter Button implementations
- [ ] Match ElevatedButton styling
- [ ] Match TextButton styling
- [ ] Match IconButton styling
- [ ] Match FAB (FloatingActionButton) styling
- [ ] Match button colors (primary, secondary)
- [ ] Match button sizes (small, medium, large)
- [ ] Match disabled states
- [ ] Add ripple effects (CSS animations)

##### Button Types to Style:
- Primary buttons
- Secondary buttons
- Icon buttons
- FAB buttons
- Text buttons
- Toggle buttons

##### Files to Modify:
- `web-static/app/globals.css`
- All components with buttons
- `web-static/components/BookmarkButton.tsx`
- `web-static/components/VerseActions.tsx`

##### Acceptance Criteria:
- Buttons match Flutter colors
- Sizes match Flutter
- Elevation matches Flutter
- Disabled states visible
- Ripple effects work

---

#### 5.5.4 Typography System ⬜
**Estimated Time:** 2-3 hours

##### Tasks:
- [ ] Review Flutter TextTheme
- [ ] Match font families (Roboto, Amiri for Arabic)
- [ ] Match font sizes (10sp, 12sp, 14sp, 16sp, 20sp, 24sp, 32sp, 48sp)
- [ ] Match font weights (400, 500, 600, 700)
- [ ] Match line heights
- [ ] Match letter spacing
- [ ] Match text colors (primary, secondary, disabled)
- [ ] Create typography utility classes

##### Typography Variants:
- Display Large (48sp)
- Display Medium (32sp)
- Display Small (24sp)
- Headline Large (20sp)
- Headline Medium (18sp)
- Headline Small (16sp)
- Title Large (16sp)
- Title Medium (14sp)
- Title Small (14sp)
- Body Large (16sp)
- Body Medium (14sp)
- Body Small (12sp)
- Label Large (14sp)
- Label Medium (12sp)
- Label Small (11sp)

##### Files to Modify:
- `web-static/app/globals.css`
- All component files

##### Acceptance Criteria:
- All text sizes match Flutter
- Font weights match Flutter
- Line heights match Flutter
- Colors match Flutter theme
- Arabic text uses Amiri font

---

#### 5.5.5 Spacing System ⬜
**Estimated Time:** 1-2 hours

##### Tasks:
- [ ] Review Flutter spacing constants
- [ ] Match padding values (4dp, 8dp, 12dp, 16dp, 24dp, 32dp)
- [ ] Match margin values
- [ ] Match gap values (for flex layouts)
- [ ] Create spacing utility classes
- [ ] Apply consistent spacing across components

##### Spacing Scale:
- 4dp (xs)
- 8dp (sm)
- 12dp (md)
- 16dp (lg)
- 24dp (xl)
- 32dp (2xl)
- 48dp (3xl)

##### Files to Modify:
- `web-static/app/globals.css`
- All component files

##### Acceptance Criteria:
- Spacing matches Flutter exactly
- Consistent across all components
- Responsive spacing on mobile

---

#### 5.5.6 Color System & Theme ⬜
**Estimated Time:** 2-3 hours

##### Tasks:
- [ ] Review Flutter ColorScheme
- [ ] Match primary colors (#4a90e2)
- [ ] Match secondary colors
- [ ] Match surface colors
- [ ] Match background colors
- [ ] Match error colors
- [ ] Match text colors (onSurface, onPrimary, etc.)
- [ ] Implement light theme
- [ ] Implement dark theme (if applicable)
- [ ] Add CSS custom properties for theming

##### Color Palette:
- Primary: #4a90e2
- Primary Variant: (darker/lighter)
- Secondary: (if applicable)
- Surface: #ffffff (light), #1a1a1a (dark)
- Background: #f8f8f8 (light), #000000 (dark)
- Error: #b00020
- On Primary: #ffffff
- On Surface: #1a1a1a (light), #ffffff (dark)
- On Background: #1a1a1a (light), #ffffff (dark)

##### Files to Modify:
- `web-static/app/globals.css`
- `web-static/lib/services/settings-service.ts`

##### Acceptance Criteria:
- Colors match Flutter exactly
- Theme switching works
- CSS variables used for theming
- Contrast ratios meet WCAG AA

---

#### 5.5.7 Animations & Transitions ⬜
**Estimated Time:** 2-3 hours

##### Tasks:
- [ ] Review Flutter animations
- [ ] Add page transitions (fade, slide)
- [ ] Add button press animations
- [ ] Add card hover animations
- [ ] Add loading spinner animations
- [ ] Add skeleton loading animations
- [ ] Match animation durations (200ms, 300ms, 400ms)
- [ ] Match easing curves (ease-in-out, ease-out)

##### Animation Types:
- Page transitions (300ms)
- Button press (200ms)
- Card hover (200ms)
- Loading spinner (continuous)
- Skeleton pulse (1.5s)
- Fade in/out (300ms)
- Slide in/out (300ms)

##### Files to Modify:
- `web-static/app/globals.css`
- All component files

##### Acceptance Criteria:
- Animations smooth (60fps)
- Durations match Flutter
- Easing curves match Flutter
- No janky animations

---

#### 5.5.8 Loading States ⬜
**Estimated Time:** 1-2 hours

##### Tasks:
- [ ] Review Flutter loading indicators
- [ ] Create CircularProgressIndicator component
- [ ] Create LinearProgressIndicator component
- [ ] Create skeleton loaders
- [ ] Match loading colors
- [ ] Match loading sizes
- [ ] Add loading states to all data-fetching components

##### Loading Components:
- CircularProgressIndicator (spinner)
- LinearProgressIndicator (progress bar)
- SkeletonLoader (for cards, lists)
- Shimmer effect

##### Files to Create:
- `web-static/components/LoadingSpinner.tsx`
- `web-static/components/SkeletonLoader.tsx`

##### Files to Modify:
- All pages with data loading

##### Acceptance Criteria:
- Loading indicators match Flutter
- Skeleton loaders match content shape
- Loading states on all async operations
- Smooth transitions

---

#### 5.5.9 Error States ⬜
**Estimated Time:** 1-2 hours

##### Tasks:
- [ ] Review Flutter error displays
- [ ] Create ErrorDisplay component
- [ ] Match error message styling
- [ ] Match error icon styling
- [ ] Add retry buttons
- [ ] Add error states to all data-fetching components

##### Error Components:
- ErrorDisplay (with icon, message, retry)
- NetworkError
- NotFoundError
- GenericError

##### Files to Create:
- `web-static/components/ErrorDisplay.tsx`

##### Files to Modify:
- All pages with error handling

##### Acceptance Criteria:
- Error messages clear
- Retry buttons work
- Error states consistent
- Styling matches Flutter

---

#### 5.5.10 Empty States ⬜
**Estimated Time:** 1-2 hours

##### Tasks:
- [ ] Review Flutter empty state displays
- [ ] Create EmptyState component
- [ ] Match empty state icon styling
- [ ] Match empty state message styling
- [ ] Add empty states to lists (bookmarks, search results, etc.)

##### Empty State Scenarios:
- No bookmarks
- No search results
- No items in list
- No data available

##### Files to Create:
- `web-static/components/EmptyState.tsx`

##### Files to Modify:
- `web-static/app/bookmarks/page.tsx`
- `web-static/app/search/page.tsx`
- All list pages

##### Acceptance Criteria:
- Empty states informative
- Icons match Flutter
- Messages helpful
- Styling matches Flutter

---

#### 5.5.11 Responsive Design ⬜
**Estimated Time:** 2-3 hours

##### Tasks:
- [ ] Review Flutter responsive breakpoints
- [ ] Match mobile layouts (< 600px)
- [ ] Match tablet layouts (600px - 960px)
- [ ] Match desktop layouts (> 960px)
- [ ] Test on various screen sizes
- [ ] Fix layout issues on mobile
- [ ] Fix layout issues on tablet
- [ ] Fix layout issues on desktop

##### Breakpoints:
- Mobile: < 600px
- Tablet: 600px - 960px
- Desktop: > 960px

##### Files to Modify:
- All component files
- `web-static/app/globals.css`

##### Acceptance Criteria:
- Layouts work on all screen sizes
- Text readable on all devices
- Touch targets adequate (48dp minimum)
- No horizontal scrolling

---

#### Files to Modify:
- All component files
- `web-static/app/globals.css`
- `web-static/lib/services/settings-service.ts`

#### Acceptance Criteria:
- ✅ All components match Flutter styling exactly
- ✅ Animations smooth (60fps)
- ✅ Loading states present on all async operations
- ✅ Error states present with retry functionality
- ✅ Empty states present with helpful messages
- ✅ Responsive on all screen sizes
- ✅ Theme switching works
- ✅ Accessibility standards met (WCAG AA)

---

## Phase 6: Testing and Refinement

### 6.1 Cross-Browser Testing ⬜
**Priority:** HIGH  
**Estimated Time:** 4-5 hours

#### Tasks:
- [ ] Test in Chrome
- [ ] Test in Firefox
- [ ] Test in Safari
- [ ] Test in Edge
- [ ] Test on mobile browsers
- [ ] Fix browser-specific issues

---

### 6.2 Responsive Design Testing ⬜
**Priority:** HIGH  
**Estimated Time:** 3-4 hours

#### Tasks:
- [ ] Test mobile layout (320px - 768px)
- [ ] Test tablet layout (768px - 1024px)
- [ ] Test desktop layout (1024px+)
- [ ] Fix responsive issues
- [ ] Test touch interactions

---

### 6.3 Performance Optimization ⬜
**Priority:** MEDIUM  
**Estimated Time:** 4-5 hours

#### Tasks:
- [ ] Optimize image loading
- [ ] Optimize data loading
- [ ] Add code splitting
- [ ] Optimize bundle size
- [ ] Add caching strategies
- [ ] Test page load times

---

### 6.4 Accessibility Testing ⬜
**Priority:** MEDIUM  
**Estimated Time:** 3-4 hours

#### Tasks:
- [ ] Test keyboard navigation
- [ ] Test screen reader compatibility
- [ ] Add ARIA labels
- [ ] Test color contrast
- [ ] Test focus indicators

---

## Implementation Order

### Week 1: Critical Functionality
1. Tasbeeh Counter (1.1)
2. Surah Page AppBar (1.2)
3. Navigation Dialog (1.3)
4. Bookmarks Integration (1.4)
5. Verse Actions (1.5)

### Week 2: Core Features
6. Verse Display Enhancements (2.1)
7. Prayer Times (2.2)
8. Gallery Functionality (2.3)
9. Qaida Drill Pages (2.4)
10. Vocabulary Quiz/Word Detail (2.5)

### Week 3: Audio and Advanced
11. Basic Audio Playback (3.1)
12. Audio Home Enhancement (3.2)
13. Full Player Page (3.3)
14. Settings Functionality (4.3)
15. Search Enhancement (4.4)

### Week 4: Polish and Testing
16. UI Component Styling (5.5)
17. Cross-Browser Testing (6.1)
18. Responsive Testing (6.2)
19. Performance Optimization (6.3)
20. Accessibility Testing (6.4)

### Week 5: Remaining Features
21. Word-by-Word Mode (4.1)
22. Tafsir Display (4.2)
23. Scheduler (4.5)
24. Story Viewer (5.1)
25. Rating Dialog (5.2)
26. Video Players (5.3, 5.4)

---

## Notes

### Data Sources
- Verify all data files are copied to `public/data/`
- Check all JSON.gz files are accessible
- Verify image assets are in `public/`
- Check SVG files are in `public/surah-names-svg/`

### Dependencies
- Some features depend on others (noted in each section)
- Audio features can be implemented independently
- UI polish should be done after core functionality

### Testing Strategy
- Test each feature as it's implemented
- Test on multiple devices/browsers
- Test with actual data
- Test edge cases

### Performance Considerations
- Use client-side data loading where appropriate
- Implement caching for frequently accessed data
- Lazy load images and components
- Optimize bundle size

---

## Progress Tracking

### Completed: 11/26 Major Tasks (42.3%)

### Current Phase: Phase 2 - Core Features ✅ COMPLETED

### Completed Phases:
- ✅ **Phase 1: Critical Functionality** - All 5 tasks completed
- ✅ **Phase 2: Core Features** - All 6 tasks completed

### Next Steps:
1. Continue with Phase 3: Audio Features
2. Start with Basic Audio Playback (3.1)
3. Then Audio Home Enhancement (3.2)
4. Continue in order of priority

---

## Questions/Issues to Resolve

1. Audio playback library choice (HTML5 Audio vs Howler.js vs other)
2. Story viewer implementation approach
3. Notification API support in browsers
4. Word-by-word data availability
5. Tafsir data availability
6. Image gallery data source

---

*Last Updated: [Current Date]*
*Status: Planning Phase Complete - Ready for Implementation*

