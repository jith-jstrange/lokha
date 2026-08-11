import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../core/theme/app_theme.dart';
import '../view_models/reading_settings_view_model.dart';
import '../../data/services/audio_narrator_service.dart';

class ReadingComfortBar extends StatelessWidget {
  final String? storyHtmlContent;

  const ReadingComfortBar({
    super.key,
    this.storyHtmlContent,
  });

  @override
  Widget build(BuildContext context) {
    final settingsVM = context.watch<ReadingSettingsViewModel>();
    final audioService = context.watch<AudioNarratorService>();
    final theme = Theme.of(context);

    return Container(
      margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
      decoration: BoxDecoration(
        color: theme.cardTheme.color,
        borderRadius: BorderRadius.circular(30),
        border: Border.all(color: theme.dividerColor),
      ),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          // Paper Theme Switcher
          Row(
            children: [
              _ThemePill(
                label: '📜 Parchment',
                isSelected: settingsVM.themeMode == PaperThemeMode.parchment,
                onTap: () => settingsVM.setThemeMode(PaperThemeMode.parchment),
              ),
              const SizedBox(width: 4),
              _ThemePill(
                label: '☕ Sepia',
                isSelected: settingsVM.themeMode == PaperThemeMode.sepia,
                onTap: () => settingsVM.setThemeMode(PaperThemeMode.sepia),
              ),
              const SizedBox(width: 4),
              _ThemePill(
                label: '🌙 Dark',
                isSelected: settingsVM.themeMode == PaperThemeMode.dark,
                onTap: () => settingsVM.setThemeMode(PaperThemeMode.dark),
              ),
            ],
          ),

          // Tools: Scale, Audio, Zen
          Row(
            children: [
              // Font Scaler
              IconButton(
                icon: const Text('A-', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 12)),
                onPressed: () => settingsVM.adjustFontSize(-0.1),
                tooltip: 'Decrease text size',
              ),
              IconButton(
                icon: const Text('A+', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 13)),
                onPressed: () => settingsVM.adjustFontSize(0.1),
                tooltip: 'Increase text size',
              ),

              // Audio Narrator
              if (storyHtmlContent != null)
                IconButton(
                  icon: Icon(
                    audioService.isPlaying ? Icons.pause_circle : Icons.headphones,
                    color: audioService.isPlaying ? AppTheme.brandGold : theme.colorScheme.primary,
                    size: 20,
                  ),
                  onPressed: () {
                    if (audioService.isPlaying) {
                      audioService.pause();
                    } else {
                      audioService.speak(storyHtmlContent!);
                    }
                  },
                  tooltip: audioService.isPlaying ? 'Pause narration' : 'Listen aloud',
                ),

              // Zen Focus Mode
              IconButton(
                icon: Icon(
                  settingsVM.zenMode ? Icons.fullscreen_exit : Icons.auto_awesome,
                  color: AppTheme.brandGold,
                  size: 18,
                ),
                onPressed: settingsVM.toggleZenMode,
                tooltip: 'Zen Focus Mode',
              ),
            ],
          ),
        ],
      ),
    );
  }
}

class _ThemePill extends StatelessWidget {
  final String label;
  final bool isSelected;
  final VoidCallback onTap;

  const _ThemePill({
    required this.label,
    required this.isSelected,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(16),
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
        decoration: BoxDecoration(
          color: isSelected ? theme.colorScheme.primary : Colors.transparent,
          borderRadius: BorderRadius.circular(16),
        ),
        child: Text(
          label,
          style: TextStyle(
            fontSize: 11,
            fontWeight: isSelected ? FontWeight.bold : FontWeight.normal,
            color: isSelected ? Colors.white : theme.colorScheme.onSurface,
          ),
        ),
      ),
    );
  }
}
