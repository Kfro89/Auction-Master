import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../research/widgets/item_tile.dart';
import '../../../models/item_model.dart';
import '../../../services/api_client.dart';

class CarSearchQueryNotifier extends Notifier<String> {
  @override
  String build() => '';
  
  void setQuery(String query) {
    state = query;
  }
}

final carSearchQueryProvider = NotifierProvider<CarSearchQueryNotifier, String>(CarSearchQueryNotifier.new);

final carsProvider = FutureProvider((ref) async {
  final api = ref.read(apiServiceProvider);
  final data = await api.getItems();
  final items = data
      .map((json) => AuctionItem.fromJson(json))
      .where((item) => item.vin != null || item.vehicleMake != null)
      .toList();
      
  final query = ref.watch(carSearchQueryProvider).toLowerCase();
  if (query.isEmpty) return items;
  
  return items.where((item) => 
    item.title.toLowerCase().contains(query) || 
    (item.vehicleMake?.toLowerCase().contains(query) ?? false) ||
    (item.vehicleModel?.toLowerCase().contains(query) ?? false) ||
    (item.vin?.toLowerCase().contains(query) ?? false)
  ).toList();
});

class CarsScreen extends ConsumerStatefulWidget {
  const CarsScreen({super.key});

  @override
  ConsumerState<CarsScreen> createState() => _CarsScreenState();
}

class _CarsScreenState extends ConsumerState<CarsScreen> {
  bool _isSearching = false;
  final TextEditingController _searchController = TextEditingController();

  @override
  void dispose() {
    _searchController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final carsAsync = ref.watch(carsProvider);

    return Scaffold(
      appBar: AppBar(
        title: _isSearching
            ? TextField(
                controller: _searchController,
                autofocus: true,
                decoration: const InputDecoration(
                  hintText: 'Search cars...',
                  border: InputBorder.none,
                ),
                onChanged: (val) {
                  ref.read(carSearchQueryProvider.notifier).setQuery(val);
                },
              )
            : const Text('Cars'),
        actions: [
          IconButton(
            icon: Icon(_isSearching ? Icons.close : Icons.search),
            onPressed: () {
              setState(() {
                _isSearching = !_isSearching;
                if (!_isSearching) {
                  _searchController.clear();
                  ref.read(carSearchQueryProvider.notifier).setQuery('');
                }
              });
            },
          ),
          IconButton(
            icon: const Icon(Icons.refresh),
            onPressed: () => ref.refresh(carsProvider),
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
        child: carsAsync.when(
          data: (items) => items.isEmpty
              ? const Center(child: Text('No vehicles found'))
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
