# Gamified course — validation

- Six levels, each with three slides, three A/B comparisons and one self-assessed laboratory.
- 60 minutes is estimated learning time: about 3 minutes of slides/review, 3 of comparisons/feedback and 4 of practice per level. Not 60 minutes of audio; learner timing remains unvalidated.
- Five automated tests passed: prerequisites and locked modules; duplicate rewards and complete 600 XP journey; consecutive-day streak behavior; persistence sanitization and stable earned rewards; content coverage and answer balance.
- The course overview now reports 42 tracked activities, percentage completion, XP, unlocked achievements, next milestone and local study streak.
- TypeScript no-emit check and production build passed. Local route returned HTTP 200.
- Browser visual/interaction QA was not performed (not requested).
- SpeechSynthesis uses available Italian browser voices; pause, resume, stop, voice selection, cancellation and startup-error fallback are implemented. Actual audible playback has not been verified on the learner's device. All narration text is visible.
- Browser-only local progress and notes are explicitly disclosed. No paid API calls or AI accounts required for activities. Published preview remains owner-private.
- The read_course_progress WebMCP surface is feature-detected. No supported WebMCP validation context is available; registration and runtime contract remain unverified.
- Documentation consulted: https://developer.mozilla.org/en-US/docs/Web/API/SpeechSynthesis and https://developer.mozilla.org/en-US/docs/Web/API/SpeechSynthesisUtterance
