import 'package:flutter/material.dart';
import '../../core/theme/app_theme.dart';

enum FormatType {
  diary,
  comic,
  newspaper,
  magazine,
  scrapbook,
  general,
}

extension FormatTypeExtension on FormatType {
  String get displayName {
    switch (this) {
      case FormatType.diary:
        return 'Personal Diary';
      case FormatType.comic:
        return 'Comic Book';
      case FormatType.newspaper:
        return 'Newspaper';
      case FormatType.magazine:
        return 'Magazine';
      case FormatType.scrapbook:
        return 'Scrapbook';
      case FormatType.general:
      default:
        return 'Dispatch';
    }
  }

  String get icon {
    switch (this) {
      case FormatType.diary:
        return '📔';
      case FormatType.comic:
        return '💬';
      case FormatType.newspaper:
        return '📰';
      case FormatType.magazine:
        return '📖';
      case FormatType.scrapbook:
        return '💡';
      case FormatType.general:
      default:
        return '✦';
    }
  }

  String get tagSlug {
    switch (this) {
      case FormatType.diary:
        return 'diary';
      case FormatType.comic:
        return 'comic';
      case FormatType.newspaper:
        return 'newspaper';
      case FormatType.magazine:
        return 'magazine';
      case FormatType.scrapbook:
        return 'scrapbook';
      case FormatType.general:
      default:
        return 'all';
    }
  }

  Color get accentColor {
    switch (this) {
      case FormatType.diary:
        return AppTheme.colorDiary;
      case FormatType.comic:
        return AppTheme.colorComic;
      case FormatType.newspaper:
        return AppTheme.colorNewspaper;
      case FormatType.magazine:
        return AppTheme.colorMagazine;
      case FormatType.scrapbook:
        return AppTheme.colorScrapbook;
      case FormatType.general:
      default:
        return AppTheme.brandTeal;
    }
  }

  static FormatType fromSlug(String? slug) {
    if (slug == null) return FormatType.general;
    final lower = slug.toLowerCase();
    if (lower.contains('diary') || lower.contains('journal')) return FormatType.diary;
    if (lower.contains('comic')) return FormatType.comic;
    if (lower.contains('newspaper')) return FormatType.newspaper;
    if (lower.contains('magazine')) return FormatType.magazine;
    if (lower.contains('scrapbook')) return FormatType.scrapbook;
    return FormatType.general;
  }
}
