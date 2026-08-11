import '../../core/theme/app_theme.dart';

class ReadingSettings {
  final PaperThemeMode themeMode;
  final ReaderFontFamily fontFamily;
  final double fontSizeMultiplier;
  final bool zenMode;

  const ReadingSettings({
    this.themeMode = PaperThemeMode.parchment,
    this.fontFamily = ReaderFontFamily.serif,
    this.fontSizeMultiplier = 1.0,
    this.zenMode = false,
  });

  ReadingSettings copyWith({
    PaperThemeMode? themeMode,
    ReaderFontFamily? fontFamily,
    double? fontSizeMultiplier,
    bool? zenMode,
  }) {
    return ReadingSettings(
      themeMode: themeMode ?? this.themeMode,
      fontFamily: fontFamily ?? this.fontFamily,
      fontSizeMultiplier: fontSizeMultiplier ?? this.fontSizeMultiplier,
      zenMode: zenMode ?? this.zenMode,
    );
  }
}
