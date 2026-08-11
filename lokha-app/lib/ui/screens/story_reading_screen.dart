import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:flutter_html/flutter_html.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:cached_network_image/cached_network_image.dart';
import '../../data/models/post_model.dart';
import '../../data/repositories/ghost_repository.dart';
import '../view_models/story_view_model.dart';
import '../view_models/reading_settings_view_model.dart';
import '../widgets/reading_comfort_bar.dart';
import '../widgets/creem_checkout_dialog.dart';

class StoryReadingScreen extends StatelessWidget {
  final PostModel initialPost;

  const StoryReadingScreen({
    super.key,
    required this.initialPost,
  });

  @override
  Widget build(BuildContext context) {
    return ChangeNotifierProvider(
      create: (ctx) => StoryViewModel(
        repository: ctx.read<GhostRepository>(),
        initialPost: initialPost,
      )..loadPost(initialPost.slug),
      child: const _StoryReadingBody(),
    );
  }
}

class _StoryReadingBody extends StatelessWidget {
  const _StoryReadingBody();

  @override
  Widget build(BuildContext context) {
    final storyVM = context.watch<StoryViewModel>();
    final settingsVM = context.watch<ReadingSettingsViewModel>();
    final post = storyVM.post;
    final theme = Theme.of(context);

    if (post == null) {
      return const Scaffold(
        body: Center(child: CircularProgressIndicator()),
      );
    }

    final isZen = settingsVM.zenMode;

    return Scaffold(
      appBar: isZen
          ? null
          : AppBar(
              backgroundColor: Colors.transparent,
              elevation: 0,
              leading: IconButton(
                icon: const Icon(Icons.arrow_back),
                onPressed: () => Navigator.of(context).pop(),
              ),
              actions: [
                IconButton(
                  icon: const Icon(Icons.star_border, color: Colors.amber),
                  tooltip: 'Supporter Membership',
                  onPressed: () {
                    showDialog(
                      context: context,
                      builder: (ctx) => const CreemCheckoutDialog(),
                    );
                  },
                ),
              ],
            ),
      body: Stack(
        children: [
          SingleChildScrollView(
            padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 16),
            child: Center(
              child: ConstrainedBox(
                constraints: const BoxConstraints(maxWidth: 720),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    // Reading Comfort Toolbar
                    if (!isZen)
                      ReadingComfortBar(storyHtmlContent: post.html),

                    const SizedBox(height: 16),

                    // Format Badge & Meta
                    Row(
                      children: [
                        Text(
                          post.formatType.displayName.toUpperCase(),
                          style: TextStyle(
                            color: post.formatType.accentColor,
                            fontWeight: FontWeight.bold,
                            fontSize: 11,
                            letterSpacing: 1.2,
                          ),
                        ),
                        const SizedBox(width: 8),
                        Text(
                          '•  ⏱ ${post.readingTime} min read',
                          style: TextStyle(
                            fontSize: 12,
                            color: theme.textTheme.bodySmall?.color,
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 8),

                    // Story Title
                    Text(
                      post.title,
                      style: GoogleFonts.playfairDisplay(
                        fontSize: 28 * settingsVM.fontSizeMultiplier,
                        fontWeight: FontWeight.bold,
                        height: 1.2,
                        color: theme.colorScheme.onSurface,
                      ),
                    ),
                    const SizedBox(height: 12),

                    // Feature Image if available
                    if (post.featureImage != null)
                      Padding(
                        padding: const EdgeInsets.symmetric(vertical: 16),
                        child: ClipRRect(
                          borderRadius: BorderRadius.circular(12),
                          child: CachedNetworkImage(
                            imageUrl: post.featureImage!,
                            fit: BoxFit.cover,
                          ),
                        ),
                      ),

                    // Article Content Rendered via Flutter HTML
                    if (post.html != null)
                      Html(
                        data: post.html!,
                        style: {
                          'body': Style(
                            fontSize: FontSize(16.5 * settingsVM.fontSizeMultiplier),
                            lineHeight: LineHeight.em(1.75),
                            color: theme.colorScheme.onSurface,
                            fontFamily: settingsVM.fontFamily.name,
                          ),
                          'p': Style(
                            margin: Margins.only(bottom: 18),
                          ),
                          'h2': Style(
                            fontSize: FontSize(22 * settingsVM.fontSizeMultiplier),
                            fontWeight: FontWeight.bold,
                            margin: Margins.only(top: 28, bottom: 12),
                          ),
                          'blockquote': Style(
                            border: const Border(left: BorderSide(color: Colors.amber, width: 3)),
                            padding: HtmlPaddings.only(left: 12),
                            fontStyle: FontStyle.italic,
                          ),
                        },
                      )
                    else if (storyVM.isLoading)
                      const Padding(
                        padding: EdgeInsets.all(32),
                        child: Center(child: CircularProgressIndicator()),
                      ),

                    const SizedBox(height: 32),

                    // End-of-article Quiet Supporter Prompt
                    if (!isZen)
                      Container(
                        padding: const EdgeInsets.all(20),
                        decoration: BoxDecoration(
                          color: theme.cardTheme.color,
                          border: Border.all(color: theme.dividerColor),
                          borderRadius: BorderRadius.circular(16),
                        ),
                        child: Column(
                          children: [
                            const Text('✦', style: TextStyle(color: Colors.amber, fontSize: 20)),
                            const SizedBox(height: 6),
                            const Text(
                              'Enjoyed this dispatch?',
                              style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16),
                            ),
                            const SizedBox(height: 4),
                            Text(
                              'Lokha is an independent publication. Support thoughtful writing for \$5/month.',
                              textAlign: TextAlign.center,
                              style: TextStyle(fontSize: 12.5, color: theme.textTheme.bodySmall?.color),
                            ),
                            const SizedBox(height: 12),
                            ElevatedButton(
                              style: ElevatedButton.styleFrom(
                                backgroundColor: Colors.amber,
                                foregroundColor: Colors.black87,
                                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
                              ),
                              onPressed: () {
                                showDialog(
                                  context: context,
                                  builder: (ctx) => const CreemCheckoutDialog(),
                                );
                              },
                              child: const Text('Become a Supporter', style: TextStyle(fontWeight: FontWeight.bold)),
                            ),
                          ],
                        ),
                      ),

                    const SizedBox(height: 48),
                  ],
                ),
              ),
            ),
          ),

          // Floating Exit Zen Button
          if (isZen)
            Positioned(
              bottom: 24,
              left: 0,
              right: 0,
              child: Center(
                child: FloatingActionButton.extended(
                  backgroundColor: Colors.black87,
                  foregroundColor: Colors.white,
                  icon: const Icon(Icons.fullscreen_exit),
                  label: const Text('Exit Zen Focus'),
                  onPressed: settingsVM.toggleZenMode,
                ),
              ),
            ),
        ],
      ),
    );
  }
}
