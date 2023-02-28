function Init() {

  // Set up a scale
  let notes = ['C3', 'D3', 'E3', 'G3', 'B#3', 'C4', 'D4', 'E4'];
  // How far do we transpose it?
  let offset = 3 - Math.floor(Math.random() * 12);
  // Transpose each note in the scale ("Map" each note to a new note)
  notes = notes.map((note) => Tone.Frequency(note).transpose(offset).toNote());
  // Sort them randomly; that is, shuffle them.
  notes.sort(() => Math.random() - 0.5);

  document.getElementById('start').style.display = 'none';
  
  Tone.Transport.bpm.value = 250;

  // Create a new sine wave synth with the default envelope
  const csynth = new Tone.PolySynth(Tone.Synth).toDestination();
  csynth.volume.value = -12;

  // This function takes a number between 0 and 255 and returns an array of notes based on which bits are on
  function getNextChord(chord) {
    let whichNotes = [];
    if (chord & 1) { // If bit 0 is set
      whichNotes.push(notes[0]);
    }
    if (chord & 2) { // If bit 1 is set
      whichNotes.push(notes[1]);
    }
    if (chord & 4) { // If bit 2 is set
      whichNotes.push(notes[2]);
    }
    if (chord & 8) { // If bit 3 is set
      whichNotes.push(notes[3]);
    }
    if (chord & 16) { // If bit 4 is set
      whichNotes.push(notes[4]);
    }
    if (chord & 32) { // If bit 5 is set
      whichNotes.push(notes[5]);
    }
    if (chord & 64) { // If bit 6 is set
      whichNotes.push(notes[6]);
    }
    if (chord & 128) { // If bit 7 is set
      whichNotes.push(notes[7]);
    }
    return whichNotes;
  }

  // Call the "getNextChord" function for each number between 0 and 255 and put the results in an array called "chordList"
  let chordList = [];
  for (let i = 0; i < 256; i++) {
    chordList.push(getNextChord(i));
  }

  let chord = 0;

  // Create a loop that plays a chord every beat
  const chords = new Tone.Loop((time) => {
    chord++;
    if (chord >= chordList.length) {
      this.stop(0);
      return;
    }
    // If bit 6 if off AND bit 7 is off (the third quarter of the song), don't play the chords. "Solo time!"
    if (!((chord & 128) && !(chord & 64))) {
      // get the last three elements of chordList[chord] in a new array and shuffle them
      const thischord = chordList[chord].sort().slice(-3).sort(() => Math.random() - 0.5);
      csynth.triggerAttackRelease(thischord, '8n.', time);
      // subdivisions are given as subarrays
    }
  }, '4n');

  // Create a loop that plays an arpeggio of notes every beat
  const solo = new Tone.Sequence((time, note) => {
    if (chord >= chordList.length) {
      this.stop(0);
      return;
    }
    // This one is always an octave up
    const highNote = Tone.Frequency(note).transpose(12).toNote()
    csynth.triggerAttackRelease(highNote, '32n', time);
  }, chordList, '4n');

  Tone.Transport.start();
  chords.start(0);
  solo.start(0);
}