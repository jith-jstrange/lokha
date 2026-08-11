import 'package:flutter/foundation.dart';
import 'package:flutter_tts/flutter_tts.dart';

enum AudioPlayerStatus {
  stopped,
  playing,
  paused,
}

class AudioNarratorService extends ChangeNotifier {
  final FlutterTts _tts = FlutterTts();
  AudioPlayerStatus _status = AudioPlayerStatus.stopped;
  String _currentText = '';

  AudioPlayerStatus get status => _status;
  bool get isPlaying => _status == AudioPlayerStatus.playing;

  AudioNarratorService() {
    _initTts();
  }

  void _initTts() {
    _tts.setSpeechRate(0.9); // Thoughtful literary reading pace
    _tts.setPitch(1.0);

    _tts.setStartHandler(() {
      _status = AudioPlayerStatus.playing;
      notifyListeners();
    });

    _tts.setCompletionHandler(() {
      _status = AudioPlayerStatus.stopped;
      notifyListeners();
    });

    _tts.setErrorHandler((msg) {
      _status = AudioPlayerStatus.stopped;
      notifyListeners();
    });
  }

  Future<void> speak(String text) async {
    _currentText = text;
    final cleanText = _stripHtml(text);
    _status = AudioPlayerStatus.playing;
    notifyListeners();
    await _tts.speak(cleanText);
  }

  Future<void> stop() async {
    await _tts.stop();
    _status = AudioPlayerStatus.stopped;
    notifyListeners();
  }

  Future<void> pause() async {
    await _tts.pause();
    _status = AudioPlayerStatus.paused;
    notifyListeners();
  }

  String _stripHtml(String htmlString) {
    return htmlString.replaceAll(RegExp(r'<[^>]*>|&[^;]+;'), ' ');
  }

  @override
  void dispose() {
    _tts.stop();
    super.dispose();
  }
}
