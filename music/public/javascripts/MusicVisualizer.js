function MusicVisualizer (obj) {
    this.source = null;
    this.count = 0;

    this.analyser = MusicVisualizer.ac.createAnalyser();
    this.size = obj.size;
    this.analyser.fftSize = this.size;
}

MusicVisualizer.ac = new (window.AudioContext||window.webkitAudioContext)();