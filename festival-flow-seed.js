// Festival Flow seed — transcribed from the Figma page "02 — Festival Run of Show · GX 27 FESTIVAL FLOW"
// (https://rundowngx27anniv.figma.site/, screenshot shared on 12 Oct 2026). Edit these from the website once deployed.
window.GX27_FLOW_SEED = {
  meta: { title: 'GX 27 Festival Flow', subtitle: 'Main program dan aktivitas paralel dalam satu alur festival.', openGate: '09:00', close: '20:00', source: 'Figma · Festival Run of Show' },
  zones: [
    { id: 'Z01', kind: 'activity', order: 1, name: 'GX Fortune', time: '10:00–16:00', location: 'Lt. 3', detail: 'Tarot Reading · Lt. 3' },
    { id: 'Z02', kind: 'activity', order: 2, name: 'GX Festival Experience', time: 'Start 09:00', location: 'Basement', detail: 'Basement · 09:00–10:00 — DJ Pop-Up\nBasement · 09:00–17:00 — DIY Merch Activation · Tenant\nBasement · 09:00–19:00 — Wall of Wishes · Tin Can Ball Toss · Ring Toss' },
    { id: 'Z03', kind: 'activity', order: 3, name: 'GX Experience Zone', time: '10:00–17:00', location: 'Pak X Parking Spot', detail: 'People of GX Frame (Team Building GX Connect) · Voting: Guest Participation · Glambot Video · Photobooth · Face Painting' },
    { id: 'Z04', kind: 'activity', order: 4, name: 'GX Game Zone', time: 'Start 10:00', location: 'Lt. 3', detail: 'Lt. 3 · 10:00–19:00 — Falling Stick · Zig Zag · Axe Throwing · Counter Balance · Mini Golf · Buzzer Wire · Race Simulator\nLt. 3 · 10:00–16:00 — Scream Meter · Basketball · DingDong' },
    { id: 'Z11', kind: 'area', order: 1, name: 'GX Festival Experience', time: '', location: 'Basement', detail: 'DJ Pop-Up · DIY Merch · Tenant · Wall of Wishes Until 19:00 · Tin Can Ball Toss · Ring Toss' },
    { id: 'Z12', kind: 'area', order: 2, name: 'GX Experience Zone', time: '', location: 'Pak X Parking Spot', detail: 'People of GX Frame (Team Building GX Connect) · Voting: Guest Participation · Glambot Video · Photobooth · Face Painting' },
    { id: 'Z13', kind: 'area', order: 3, name: 'Main Stage', time: '', location: 'Lt. 1', detail: 'Main Ceremony · Performances · Awards · Guest Star' },
    { id: 'Z14', kind: 'area', order: 4, name: 'Food Booth', time: '', location: 'Lt. 1 Parking + Lt. 2', detail: 'Food Booth Lt. 1 Parking Area · Food Booth Lt. 2' },
    { id: 'Z15', kind: 'area', order: 5, name: 'GX Game Zone', time: '', location: 'Lt. 3', detail: 'GX Game Zone · Tarot Reading / GX Fortune' },
    { id: 'Z16', kind: 'area', order: 6, name: 'HYROX Challenge', time: '', location: 'Lt. 4', detail: 'HYROX Competition · Winner Podium · Open Hour' }
  ],
  items: [
    { id: 'RF01', start: '09:00', end: '10:00', segment: 'Open Gate', location: 'GX Festival Experience · Basement', flow: 'GX Access Point Arrival · Registration · Ticket · GX Festival Experience · DJ Pop-Up', concurrent: ['Only GX Festival Experience Active', 'Continues Until 17:00'] },
    { id: 'RF02', start: '10:00', end: '12:00', segment: 'GX 27 Anniversary Ceremony', location: 'Main Stage', flow: 'Opening, Ceremony, Awards, dan Lunch Bridge.', concurrent: ['GX Festival Experience', 'GX Experience Zone Until 17:00', 'GX Fortune', 'GX Game Zone'] },
    { id: 'RF03', start: '12:00', end: '13:30', segment: 'Lunch Break + Spectrum', location: 'Food Booth · Lt. 1 + Lt. 2 Parking Area', flow: 'Lunch Service · Spectrum Performance', concurrent: ['GX Festival Experience', 'GX Experience Zone Until 17:00', 'GX Fortune', 'GX Game Zone'] },
    { id: 'RF04', start: '13:30', end: '14:00', segment: 'Mini Games — Tebak Lagu', location: 'Main Stage', flow: 'Crowd Recall · Tebak Lagu · GX Got Talent Next at 14:00', concurrent: ['GX Festival Experience', 'GX Experience Zone Until 17:00', 'GX Fortune', 'GX Game Zone'] },
    { id: 'RF05', start: '14:00', end: '15:15', segment: 'GX Got Talent', location: 'Main Stage', flow: 'Talent Performances · Doorprize Session · Talent Wrap', concurrent: ['GX Festival Experience', 'GX Experience Zone Until 17:00', 'GX Fortune', 'GX Game Zone Lt. 3'] },
    { id: 'RF06', start: '15:15', end: '15:30', segment: 'Prepare HYROX', location: 'Multi Area', flow: 'MC Info: HYROX Lt. 4 · Mobile Legends Battle for 1st & 2nd Place at Main Stage', concurrent: ['HYROX Check-In', 'ML Player Standby', 'Optional Tebak Hero After ML Winner'] },
    { id: 'RF07', start: '15:30', end: '17:30', segment: 'HYROX Challenge', location: 'Lt. 4', flow: 'Challenge → Winner Podium → DJ Pop-Up', concurrent: [] },
    { id: 'RF08', start: '15:30', end: '17:30', segment: 'Mobile Legends', location: 'Main Stage', flow: 'Battle for 1st & 2nd Place → Winner → Optional Tebak Hero', concurrent: [] },
    { id: 'RF09', start: '15:30', end: '17:30', segment: 'Festival Activations', location: 'Multi Area', flow: 'GX Festival Experience · GX Experience Zone · GX Game Zone Lt. 3 · GX Fortune', concurrent: [] },
    { id: 'RF10', start: '17:30', end: '18:30', segment: 'Concurrent — HYROX Open Hour', location: 'Lt. 4', flow: 'Free Try · HYROX Participant Break', concurrent: ['HYROX Continues Normally', 'Lt. 4 TV — Main Stage Feed: Grand Doorprize · GX Connect Winners · GX Got Talent Winners'] },
    { id: 'RF11', start: '17:30', end: '18:00', segment: 'Grand Doorprize', location: 'Main Stage', flow: 'Grand Doorprize Draw · Winner Announcement · Handover', concurrent: ['HYROX Continues at Lt. 4 · Main Stage Feed on Lt. 4 TV'] },
    { id: 'RF12', start: '18:00', end: '18:20', segment: 'GX Connect + GX Got Talent Winners', location: 'Main Stage', flow: 'Winner Announcement · Handover', concurrent: ['HYROX Continues at Lt. 4 · Main Stage Feed on Lt. 4 TV'] },
    { id: 'RF13', start: '18:20', end: '18:30', segment: 'Maghrib Break', location: 'Main Stage + Prayer Area', flow: 'Prayer Break · Final Stage Check', concurrent: ['Low-Volume Ambient BGM Stays On', 'No MC, Announcements, or Loud Music', 'Resume at 18:30'] },
    { id: 'RF14', start: '18:30', end: '18:45', segment: 'Final Grand Doorprize + Closing MC', location: 'Main Stage', flow: 'Final Doorprize · Closing · Not So Koplo Welcome', concurrent: ['Final Draw · Winner Handover · Stage Clear'] },
    { id: 'RF15', start: '18:45', end: '19:45', segment: 'Not So Koplo', location: 'Main Stage', flow: 'Guest Star Performance · Final Celebration', concurrent: ['Game Zone Closes 19:00'] },
    { id: 'RF16', start: '19:45', end: '19:50', segment: 'Final Farewell', location: 'Main Stage', flow: 'Thank You · Audience Exit', concurrent: [] }
  ]
};
