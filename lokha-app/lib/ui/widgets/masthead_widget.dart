import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import '../../core/theme/app_theme.dart';

class MastheadWidget extends StatelessWidget {
  const MastheadWidget({super.key});

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    return Container(
      padding: const EdgeInsets.symmetric(vertical: 24, horizontal: 16),
      child: Column(
        children: [
          // Medallion Emblem Circle
          Container(
            width: 72,
            height: 72,
            decoration: BoxDecoration(
              shape: BoxShape.circle,
              color: AppTheme.brandTealDark,
              border: Border.all(color: AppTheme.brandGold, width: 2),
              boxShadow: [
                BoxShadow(
                  color: Colors.black.withOpacity(0.08),
                  blurRadius: 16,
                  offset: const Offset(0, 4),
                ),
              ],
            ),
            child: const Center(
              child: Text(
                '✦',
                style: TextStyle(
                  color: AppTheme.brandGold,
                  fontSize: 28,
                  fontWeight: FontWeight.bold,
                ),
              ),
            ),
          ),
          const SizedBox(height: 12),

          // LOKHA Title
          Text(
            'LOKHA',
            style: GoogleFonts.inter(
              fontSize: 28,
              fontWeight: FontWeight.w900,
              letterSpacing: 4.0,
              color: theme.colorScheme.onSurface,
            ),
          ),
          const SizedBox(height: 6),

          // Quiet Motto
          Text(
            'Teach simply, about human ways, accurised writing.',
            textAlign: TextAlign.center,
            style: GoogleFonts.playfairDisplay(
              fontSize: 14.5,
              fontStyle: FontStyle.italic,
              color: theme.textTheme.bodyMedium?.color?.withOpacity(0.7),
            ),
          ),
        ],
      ),
    );
  }
}
