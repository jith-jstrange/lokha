import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';

enum PaperThemeMode {
  parchment,
  sepia,
  dark,
}

enum ReaderFontFamily {
  serif,
  sans,
}

class AppTheme {
  // Brand Palette
  static const Color brandTeal = Color(0xFF1F4E5B);
  static const Color brandTealDark = Color(0xFF102A36);
  static const Color brandTealLight = Color(0xFFEBF3F5);

  static const Color brandGold = Color(0xFFC5A059);
  static const Color brandGoldLight = Color(0xFFF7EFE1);

  // 5 Format Accent Colors
  static const Color colorDiary = Color(0xFF9E4747);
  static const Color colorComic = Color(0xFFD49B35);
  static const Color colorNewspaper = Color(0xFF1F4E5B);
  static const Color colorMagazine = Color(0xFF2D6A4F);
  static const Color colorScrapbook = Color(0xFF4A6B82);

  // 1. Heritage Parchment Theme
  static ThemeData get parchmentTheme {
    const bg = Color(0xFFF9F6F0);
    const cardBg = Color(0xFFFFFFFF);
    const textMain = Color(0xFF102A36);
    const textMuted = Color(0xFF6B7B83);
    const border = Color(0xFFE8E2D6);

    return ThemeData(
      useMaterial3: true,
      brightness: Brightness.light,
      scaffoldBackgroundColor: bg,
      colorScheme: const ColorScheme.light(
        primary: brandTeal,
        secondary: brandGold,
        surface: cardBg,
        onSurface: textMain,
      ),
      cardTheme: CardTheme(
        color: cardBg,
        elevation: 0,
        shape: RoundedRectangleBorder(
          side: const BorderSide(color: border, width: 1),
          borderRadius: BorderRadius.circular(12),
        ),
      ),
      textTheme: GoogleFonts.charisSilTextTheme().apply(
        bodyColor: textMain,
        displayColor: textMain,
      ),
      dividerColor: border,
    );
  }

  // 2. Library Sepia Theme
  static ThemeData get sepiaTheme {
    const bg = Color(0xFFF3ECE1);
    const cardBg = Color(0xFFF9F4EC);
    const textMain = Color(0xFF2D251E);
    const textMuted = Color(0xFF796C5F);
    const border = Color(0xFFE0D4C3);

    return ThemeData(
      useMaterial3: true,
      brightness: Brightness.light,
      scaffoldBackgroundColor: bg,
      colorScheme: const ColorScheme.light(
        primary: Color(0xFF2A534C),
        secondary: Color(0xFFB8860B),
        surface: cardBg,
        onSurface: textMain,
      ),
      cardTheme: CardTheme(
        color: cardBg,
        elevation: 0,
        shape: RoundedRectangleBorder(
          side: const BorderSide(color: border, width: 1),
          borderRadius: BorderRadius.circular(12),
        ),
      ),
      textTheme: GoogleFonts.charisSilTextTheme().apply(
        bodyColor: textMain,
        displayColor: textMain,
      ),
      dividerColor: border,
    );
  }

  // 3. Velvet Ink / Midnight Dark Theme
  static ThemeData get darkTheme {
    const bg = Color(0xFF0E1B22);
    const cardBg = Color(0xFF14252E);
    const textMain = Color(0xFFE5ECEE);
    const textMuted = Color(0xFF95A7AF);
    const border = Color(0xFF233B47);

    return ThemeData(
      useMaterial3: true,
      brightness: Brightness.dark,
      scaffoldBackgroundColor: bg,
      colorScheme: const ColorScheme.dark(
        primary: Color(0xFF4EA3B8),
        secondary: Color(0xFFD6B268),
        surface: cardBg,
        onSurface: textMain,
      ),
      cardTheme: CardTheme(
        color: cardBg,
        elevation: 0,
        shape: RoundedRectangleBorder(
          side: const BorderSide(color: border, width: 1),
          borderRadius: BorderRadius.circular(12),
        ),
      ),
      textTheme: GoogleFonts.charisSilTextTheme().apply(
        bodyColor: textMain,
        displayColor: textMain,
      ),
      dividerColor: border,
    );
  }

  static ThemeData getTheme(PaperThemeMode mode, ReaderFontFamily font) {
    ThemeData base;
    switch (mode) {
      case PaperThemeMode.sepia:
        base = sepiaTheme;
        break;
      case PaperThemeMode.dark:
        base = darkTheme;
        break;
      case PaperThemeMode.parchment:
      default:
        base = parchmentTheme;
        break;
    }

    if (font == ReaderFontFamily.sans) {
      return base.copyWith(
        textTheme: GoogleFonts.interTextTheme(base.textTheme),
      );
    }
    return base;
  }
}
