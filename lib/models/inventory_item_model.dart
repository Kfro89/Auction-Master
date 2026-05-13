class InventoryItem {
  final int id;
  final String barcode;
  final String title;
  final String? draftedTitle;
  final String? draftedDescription;
  final String? ebayCategoryId;
  final double buyPrice;
  final double estimatedPrice;
  final List<String> images;
  final String status;
  final DateTime createdAt;

  InventoryItem({
    required this.id,
    required this.barcode,
    required this.title,
    this.draftedTitle,
    this.draftedDescription,
    this.ebayCategoryId,
    required this.buyPrice,
    required this.estimatedPrice,
    required this.images,
    required this.status,
    required this.createdAt,
  });

  factory InventoryItem.fromJson(Map<String, dynamic> json) {
    double parseDouble(dynamic value) {
      if (value == null) return 0.0;
      if (value is num) return value.toDouble();
      if (value is String) return double.tryParse(value) ?? 0.0;
      return 0.0;
    }

    return InventoryItem(
      id: json['id'] as int,
      barcode: json['barcode']?.toString() ?? '',
      title: json['title']?.toString() ?? 'Unknown Title',
      draftedTitle: json['drafted_title']?.toString(),
      draftedDescription: json['drafted_description']?.toString(),
      ebayCategoryId: json['ebay_category_id']?.toString(),
      buyPrice: parseDouble(json['buy_price']),
      estimatedPrice: parseDouble(json['estimated_price']),
      images: (json['images'] as List<dynamic>?)?.map((e) => e.toString()).toList() ?? [],
      status: json['status']?.toString() ?? 'staged',
      createdAt: json['created_at'] != null ? DateTime.parse(json['created_at']) : DateTime.now(),
    );
  }
}
