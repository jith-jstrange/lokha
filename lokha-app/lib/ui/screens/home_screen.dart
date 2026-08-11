import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../view_models/feed_view_model.dart';
import '../widgets/masthead_widget.dart';
import '../widgets/format_filter_tabs.dart';
import '../widgets/story_card_widget.dart';
import '../widgets/creem_checkout_dialog.dart';
import 'story_reading_screen.dart';

class HomeScreen extends StatelessWidget {
  const HomeScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final feedVM = context.watch<FeedViewModel>();
    final theme = Theme.of(context);

    return Scaffold(
      appBar: AppBar(
        backgroundColor: Colors.transparent,
        elevation: 0,
        centerTitle: true,
        title: const Text(
          'LOKHA.TODAY',
          style: TextStyle(letterSpacing: 2, fontWeight: FontWeight.bold, fontSize: 16),
        ),
        actions: [
          IconButton(
            icon: const Icon(Icons.star_border, color: Colors.amber),
            tooltip: 'Membership',
            onPressed: () {
              showDialog(
                context: context,
                builder: (ctx) => const CreemCheckoutDialog(),
              );
            },
          ),
        ],
      ),
      body: RefreshIndicator(
        onRefresh: () => feedVM.loadPosts(forceRefresh: true),
        child: CustomScrollView(
          slivers: [
            // 1. Brand Masthead
            const SliverToBoxAdapter(
              child: MastheadWidget(),
            ),

            // 2. Format Switcher
            SliverToBoxAdapter(
              child: FormatFilterTabs(
                selectedFormat: feedVM.selectedFormat,
                onSelect: (format) => feedVM.selectFormat(format),
              ),
            ),

            const SliverToBoxAdapter(child: SizedBox(height: 8)),

            // 3. Posts Stream
            if (feedVM.isLoading)
              const SliverFillRemaining(
                child: Center(child: CircularProgressIndicator()),
              )
            else if (feedVM.errorMessage != null)
              SliverFillRemaining(
                child: Center(
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Text(feedVM.errorMessage!, textAlign: TextAlign.center),
                      const SizedBox(height: 12),
                      ElevatedButton(
                        onPressed: () => feedVM.loadPosts(forceRefresh: true),
                        child: const Text('Try Again'),
                      ),
                    ],
                  ),
                ),
              )
            else if (feedVM.posts.isEmpty)
              const SliverFillRemaining(
                child: Center(child: Text('No dispatches found in this category.')),
              )
            else
              SliverList(
                delegate: SliverChildBuilderDelegate(
                  (context, index) {
                    final post = feedVM.posts[index];
                    return StoryCardWidget(
                      post: post,
                      onTap: () {
                        Navigator.of(context).push(
                          MaterialPageRoute(
                            builder: (ctx) => StoryReadingScreen(initialPost: post),
                          ),
                        );
                      },
                    );
                  },
                  childCount: feedVM.posts.length,
                ),
              ),

            // 4. Bottom Breathing Room
            const SliverToBoxAdapter(
              child: SizedBox(height: 48),
            ),
          ],
        ),
      ),
    );
  }
}
