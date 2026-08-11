import 'package:flutter/material.dart';
import 'package:url_launcher/url_launcher.dart';
import '../../core/constants/api_constants.dart';
import '../../core/theme/app_theme.dart';

class CreemCheckoutDialog extends StatelessWidget {
  const CreemCheckoutDialog({super.key});

  Future<void> _launchCheckout(String url) async {
    final uri = Uri.parse(url);
    if (await canLaunchUrl(uri)) {
      await launchUrl(uri, mode: LaunchMode.externalApplication);
    }
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    return Dialog(
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
      backgroundColor: theme.scaffoldBackgroundColor,
      child: Padding(
        padding: const EdgeInsets.all(24),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            const Text(
              '✦',
              style: TextStyle(color: AppTheme.brandGold, fontSize: 28),
            ),
            const SizedBox(height: 8),
            Text(
              'Lokha Supporter Membership',
              textAlign: TextAlign.center,
              style: theme.textTheme.headlineSmall?.copyWith(
                fontWeight: FontWeight.bold,
              ),
            ),
            const SizedBox(height: 8),
            Text(
              'Full access to all deep essays, comic dispatches, and archives. Handled globally via Creem Merchant of Record with multi-currency and VAT compliance.',
              textAlign: TextAlign.center,
              style: TextStyle(fontSize: 13, color: theme.textTheme.bodyMedium?.color?.withOpacity(0.8)),
            ),
            const SizedBox(height: 20),

            // Monthly Card
            _PlanCard(
              title: 'Monthly Supporter',
              price: '\$5.00 / month',
              description: 'Full archival access and all premium dispatches.',
              buttonLabel: 'Subscribe Monthly (\$5)',
              buttonColor: AppTheme.brandGold,
              onTap: () => _launchCheckout(ApiConstants.creemMonthlyCheckoutUrl),
            ),
            const SizedBox(height: 12),

            // Yearly Card
            _PlanCard(
              title: 'Annual Supporter (Save 17%)',
              price: '\$50.00 / year',
              description: 'Two months free + priority reader discussions.',
              buttonLabel: 'Subscribe Annually (\$50)',
              buttonColor: AppTheme.brandTeal,
              onTap: () => _launchCheckout(ApiConstants.creemYearlyCheckoutUrl),
            ),
            const SizedBox(height: 16),

            TextButton(
              onPressed: () => Navigator.of(context).pop(),
              child: const Text('Close'),
            ),
          ],
        ),
      ),
    );
  }
}

class _PlanCard extends StatelessWidget {
  final String title;
  final String price;
  final String description;
  final String buttonLabel;
  final Color buttonColor;
  final VoidCallback onTap;

  const _PlanCard({
    required this.title,
    required this.price,
    required this.description,
    required this.buttonLabel,
    required this.buttonColor,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: Theme.of(context).cardTheme.color,
        border: Border.all(color: Theme.of(context).dividerColor),
        borderRadius: BorderRadius.circular(14),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(title, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 14)),
          Text(price, style: TextStyle(color: buttonColor, fontWeight: FontWeight.bold, fontSize: 16)),
          const SizedBox(height: 4),
          Text(description, style: const TextStyle(fontSize: 12, color: Colors.grey)),
          const SizedBox(height: 10),
          SizedBox(
            width: double.infinity,
            child: ElevatedButton(
              style: ElevatedButton.styleFrom(
                backgroundColor: buttonColor,
                foregroundColor: Colors.white,
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
              ),
              onPressed: onTap,
              child: Text(buttonLabel, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 13)),
            ),
          ),
        ],
      ),
    );
  }
}
