/**
 * Video Provider Interface
 * Abstraction layer for swapping between Jitsi, 100ms, Daily, etc.
 * 
 * Every provider must implement:
 * - VideoComponent: React component that renders the video call
 * - generateRoomName(sessionId): creates a unique room identifier
 * 
 * Switch providers by changing the export at the bottom of this file.
 */

// Active provider — change this ONE line to switch
export { HundredMsProvider as VideoProvider } from './hundredms.provider.jsx';
// export { JitsiProvider as VideoProvider } from './jitsi.provider.jsx';
// export { DailyProvider as VideoProvider } from './daily.provider.jsx';
