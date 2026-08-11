import 'package:flutter/material.dart';
import 'package:shared_preferences/shared_preferences.dart';
import '../../core/theme/app_theme.dart';
import '../../domain/models/reading_settings.dart';

class ReadingSettingsViewModel extends ChangeNotifier {
  ReadingSettings _settings = const ReadingSettings();
  SharedPreferences? _prefs;

  ReadingSettings get settings => _settings;
  PaperThemeMode get themeMode => _settings.themeMode;
  ReaderFontFamily get fontFamily => _settings.fontFamily;
  double get fontSizeMultiplier => _settings.fontSizeMultiplier;
  bool get zenMode => _settings.zenMode;

  ReadingSettingsViewModel() {
    _loadSettings();
  }

  Future<void> _loadSettings() async {
    _prefs = await SharedPreferences.getInstance();
    final themeIndex = _prefs?.getInt('paper_theme') ?? 0;
    final fontIndex = _prefs?.getInt('reader_font') ?? 0;
    final fontScale = _prefs?.getDouble('font_scale') ?? 1.0;

    _settings = ReadingSettings(
      themeMode: PaperThemeMode.values[themeIndex.clamp(0, PaperThemeMode.values.length - 1)],
      fontFamily: ReaderFontFamily.values[fontIndex.clamp(0, ReaderFontFamily.values.length - 1)],
      fontSizeMultiplier: fontScale,
      zenMode: false,
    );
    notifyListeners();
  }

  void setThemeMode(PaperThemeMode mode) {
    _settings = _settings.copyWith(themeMode: mode);
    _prefs?.setInt('paper_theme', mode.index);
    notifyListeners();
  }

  void toggleFontFamily() {
    final next = _settings.fontFamily == ReaderFontFamily.serif
        ? ReaderFontFamily.sans
        : ReaderFontFamily.serif;
    _settings = _settings.copyWith(fontFamily: next);
    _prefs?.setInt('reader_font', next.index);
    notifyListeners();
  }

  void adjustFontSize(double delta) {
    final newScale = (_settings.fontSizeMultiplier + delta).clamp(0.8, 1.4);
    _settings = _settings.copyWith(fontSizeMultiplier: newScale);
    _prefs?.setDouble('font_scale', newScale);
    notifyListeners();
  }

  void toggleZenMode() {
    _settings = _settings.copyWith(zenMode: !_settings.zenMode);
    notifyListeners();
  }
}
