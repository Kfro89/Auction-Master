import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../research/widgets/item_tile.dart';
import '../../../models/item_model.dart';
import '../../../services/api_client.dart';

class WatchlistSearchQueryNotifier extends Notifier<String> {
  @override
  String build() => '';
  
  void setQuery(String query) {
    state = query;
  }
}

final watchlistSearchQueryProvider = NotifierProvider<WatchlistSearchQueryNotifier, String>(WatchlistSearchQueryNotifier.new);

final watchlistProvider = FutureProvider((ref) async {
  final api = ref.read(apiServiceProvider);
  final data = await api.getWatchlist();
  final items = data.map((json) => AuctionItem.fromJson(json)).toList();

  final query = ref.watch(watchlistSearchQueryProvider).toLowerCase();
  if (query.isEmpty) return items;
  
  return items.where((item) => 
    item.title.toLowerCase().contains(query) || 
    (item.lotNumber?.toLowerCase().contains(query) ?? false) ||
    (item.auctionHouseKey?.toLowerCase().contains(query) ?? false)
  ).toList();
});

class WatchlistScreen extends ConsumerStatefulWidget {
  const WatchlistScreen({super.key});

  @override
  ConsumerState<WatchlistScreen> createState() => _WatchlistScreenState();
}

class _WatchlistScreenState extends ConsumerState<WatchlistScreen> {
  bool _isSearching = false;
  final TextEditingController _searchController = TextEditingController();

  @override
  void dispose() {
    _searchController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final watchlistAsync = ref.watch(watchlistProvider);

    return Scaffold(
      appBar: AppBar(
        title: _isSearching
            ? TextField(
                controller: _searchController,
                autofocus: true,
                decoration: const InputDecoration(
                  hintText: 'Search watchlist...',
                  border: InputBorder.none,
                ),
                onChanged: (val) {
                  ref.read(watchlistSearchQueryProvider.notifier).setQuery(val);
                },
              )
            : const Text('Watchlist'),
        actions: [
          IconButton(
            icon: Icon(_isSearching ? Icons.close : Icons.search),
            onPressed: () {
              setState(() {
                _isSearching = !_isSearching;
                if (!_isSearching) {
                  _searchController.clear();
                  ref.read(watchlistSearchQueryProvider.notifier).setQuery('');
                }
              });
            },
          ),
          IconButton(
            icon: const Icon(Icons.refresh),
            onPressed: () => ref.refresh(watchlistProvider),
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
        child: watchlistAsync.when(
          data: (items) => items.isEmpty
              ? const Center(child: Text('No items in watchlist'))
              : ListView.builder(
                  padding: const EdgeInsets.all(16.0),
                  itemCount: items.length,
                  itemBuilder: (context, index) {
                    return ItemTile(item: items[index]);
                  },
                ),
          loading: () => const Center(child: CircularProgressIndicator()),
          error: (error, stack) => Center(child: Text('Error: $error')),
        ),
      ),
    );
  }
}
