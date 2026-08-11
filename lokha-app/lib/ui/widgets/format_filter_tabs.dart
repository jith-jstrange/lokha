import 'package:flutter/material.dart';
import '../../domain/models/format_type.dart';

class FormatFilterTabs extends StatelessWidget {
  final FormatType selectedFormat;
  final ValueChanged<FormatType> onSelect;

  const FormatFilterTabs({
    super.key,
    required this.selectedFormat,
    required this.onSelect,
  });

  @override
  Widget build(BuildContext context) {
    final formats = [
      FormatType.general,
      FormatType.diary,
      FormatType.comic,
      FormatType.newspaper,
      FormatType.magazine,
      FormatType.scrapbook,
    ];

    return SingleChildScrollView(
      scrollDirection: Axis.horizontal,
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
      child: Row(
        children: formats.map((format) {
          final isSelected = selectedFormat == format;
          final label = format == FormatType.general
              ? 'All Stories'
              : '${format.icon} ${format.displayName}';

          return Padding(
            padding: const EdgeInsets.only(right: 8),
            child: ChoiceChip(
              label: Text(label),
              selected: isSelected,
              onSelected: (_) => onSelect(format),
              backgroundColor: Theme.of(context).cardTheme.color,
              selectedColor: format == FormatType.general
                  ? Theme.of(context).colorScheme.primary
                  : format.accentColor,
              labelStyle: TextStyle(
                color: isSelected
                    ? Colors.white
                    : Theme.of(context).colorScheme.onSurface,
                fontWeight: isSelected ? FontWeight.bold : FontWeight.normal,
                fontSize: 13,
              ),
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(20),
                side: BorderSide(
                  color: isSelected
                      ? Colors.transparent
                      : Theme.of(context).dividerColor,
                ),
              ),
              showCheckmark: false,
            ),
          );
        }).toList(),
      ),
    );
  }
}
