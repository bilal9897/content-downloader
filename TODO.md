# TODO: Add Support for More Video Sites and Video Playback

## Phase 1: Add yt-dlp Support for More Sites
- [ ] 1.1 Modify `/src/app/api/info/route.ts` to use yt-dlp for unsupported sites (diskwala.com, terabox, recom, etc.)
- [ ] 1.2 Modify `/src/app/api/download/route.ts` to use yt-dlp for unsupported sites
- [ ] 1.3 Test with diskwala.com, terabox URLs

## Phase 2: Add Video Player Functionality  
- [ ] 2.1 Create video player component `/src/components/features/VideoPlayer.tsx`
- [ ] 2.2 Update types in `/src/lib/types.ts` to include platform info
- [ ] 2.3 Modify `/src/components/features/Downloader.tsx` to use video player for non-YouTube videos
- [ ] 2.4 Update placeholder text to show supported sites

## Phase 3: Testing
- [ ] 3.1 Test video info extraction for diskwala.com
- [ ] 3.2 Test video info extraction for terabox
- [ ] 3.3 Test video playback in browser
- [ ] 3.4 Test video download functionality
