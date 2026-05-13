import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../widgets/kpi_card.dart';
import '../widgets/item_tile.dart';
import '../../../models/item_model.dart';
import '../../../services/api_client.dart';

class SearchQueryNotifier extends Notifier<String> {
  @override
  String build() => '';
  
  void setQuery(String query) {
    state = query;
  }
}

final searchQueryProvider = NotifierProvider<SearchQueryNotifier, String>(SearchQueryNotifier.new);

final itemsProvider = FutureProvider<List<AuctionItem>>((ref) async {
  final api = ref.read(apiServiceProvider);
  final data = await api.getItems();
  final items = data.map((json) => AuctionItem.fromJson(json)).toList();
  
  final query = ref.watch(searchQueryProvider).toLowerCase();
  if (query.isEmpty) return items;
  
  return items.where((item) => 
    item.title.toLowerCase().contains(query) || 
    (item.lotNumber?.toLowerCase().contains(query) ?? false) ||
    (item.auctionHouseKey?.toLowerCase().contains(query) ?? false)
  ).toList();
});

class ResearchScreen extends ConsumerStatefulWidget {
  const ResearchScreen({super.key});

  @override
  ConsumerState<ResearchScreen> createState() => _ResearchScreenState();
}

class _ResearchScreenState extends ConsumerState<ResearchScreen> {
  bool _isSearching = false;
  final TextEditingController _searchController = TextEditingController();

  @override
  void dispose() {
    _searchController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final itemsAsync = ref.watch(itemsProvider);

    return Scaffold(
      appBar: AppBar(
        title: _isSearching
            ? TextField(
                controller: _searchController,
                autofocus: true,
                decoration: const InputDecoration(
                  hintText: 'Search items...',
                  border: InputBorder.none,
                ),
                onChanged: (val) {
                  ref.read(searchQueryProvider.notifier).setQuery(val);
                },
              )
            : const Text('Research'),
        actions: [
          IconButton(
            icon: Icon(_isSearching ? Icons.close : Icons.search),
            onPressed: () {
              setState(() {
                _isSearching = !_isSearching;
                if (!_isSearching) {
                  _searchController.clear();
                  ref.read(searchQueryProvider.notifier).setQuery('');
                }
              });
            },
          ),
          IconButton(
            icon: const Icon(Icons.refresh),
            onPressed: () => ref.refresh(itemsProvider),
          ),
          IconButton(
            icon: const Icon(Icons.filter_list),
            onPressed: () {
              // Stub for advanced filtering / auction house scanning
              ScaffoldMessenger.of(context).showSnackBar(
                const SnackBar(content: Text('Advanced filters and scanning coming soon.')),
              );
            },
          ),
        ],
      ),
      body: Container(
        decoration: const BoxDecoration(
          gradient: RadialGradient(
            center: Alignment.topCenter,
            radius: 1.5,
            colors: [Color(0xFFFFFFFF), Color(0xFFF3F4F6)],
          ),
        ),
        child: itemsAsync.when(
          data: (items) => CustomScrollView(
            slivers: [
              SliverToBoxAdapter(
                child: Padding(
                  padding: const EdgeInsets.all(16.0),
                  child: Row(
                    children: [
                      Expanded(
                        child: KpiCard(
                          title: 'Total Items',
                          value: items.length.toString(),
                          icon: Icons.timer,
                          color: const Color(0xFFF59E0B),
                        ),
                      ),
                      const SizedBox(width: 12),
                      Expanded(
                        child: KpiCard(
                          title: 'High ROI',
                          value: items.where((i) => (i.estimatedValue ?? 0) > i.currentBid * 2).length.toString(),
                          icon: Icons.trending_up,
                          color: const Color(0xFF10B981),
                        ),
                      ),
                    ],
                  ),
                ),
              ),
              SliverPadding(
                padding: const EdgeInsets.symmetric(horizontal: 16.0),
                sliver: SliverList(
                  delegate: SliverChildBuilderDelegate(
                    (context, index) {
                      final item = items[index];
                      return ItemTile(item: item);
                    },
                    childCount: items.length,
                  ),
                ),
              ),
            ],
          ),
          loading: () => const Center(child: CircularProgressIndicator()),
          error: (error, stack) => Center(
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                const Icon(Icons.error_outline, color: Colors.red, size: 60),
                const SizedBox(height: 16),
                Text('Failed to load data: $error'),
                ElevatedButton(
                  onPressed: () => ref.refresh(itemsProvider),
                  child: const Text('Retry'),
                )
              ],
            ),
          ),
        ),
      ),
    );
  }
}
