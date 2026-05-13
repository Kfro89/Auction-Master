class AuctionItem {
  final int id;
  final String title;
  final String? lotNumber;
  final double currentBid;
  final DateTime? endTime;
  final String? status;
  final String? url;
  final String? imageUrl;
  final String? auctionHouseKey;
  final bool isWatched;
  final bool isUserBidding;
  
  // Valuation
  final double? estimatedValue;
  final double? maxBidForTargetRoi;
  final double? targetRoiPct;

  // Vehicles
  final String? vin;
  final int? vehicleYear;
  final String? vehicleMake;
  final String? vehicleModel;

  AuctionItem({
    required this.id,
    required this.title,
    this.lotNumber,
    required this.currentBid,
    this.endTime,
    this.status,
    this.url,
    this.imageUrl,
    this.auctionHouseKey,
    this.isWatched = false,
    this.isUserBidding = false,
    this.estimatedValue,
    this.maxBidForTargetRoi,
    this.targetRoiPct,
    this.vin,
    this.vehicleYear,
    this.vehicleMake,
    this.vehicleModel,
  });

  factory AuctionItem.fromJson(Map<String, dynamic> json) {
    double parseDouble(dynamic value) {
      if (value == null) return 0.0;
      if (value is num) return value.toDouble();
      if (value is String) return double.tryParse(value) ?? 0.0;
      return 0.0;
    }

    final valuation = json['valuation'] as Map<String, dynamic>?;

    return AuctionItem(
      id: json['id'] as int,
      title: json['title'] as String? ?? 'Unknown Title',
      lotNumber: json['lot_number']?.toString(),
      currentBid: parseDouble(json['current_bid']),
      endTime: json['end_time'] != null ? DateTime.parse(json['end_time']) : null,
      status: json['status']?.toString(),
      url: json['url']?.toString(),
      imageUrl: json['image_url']?.toString(),
      auctionHouseKey: json['auction_house_key']?.toString(),
      isWatched: json['is_watched'] == true,
      isUserBidding: json['is_user_bidding'] == true,
      estimatedValue: valuation != null ? parseDouble(valuation['est_market_value']) : null,
      maxBidForTargetRoi: valuation != null ? parseDouble(valuation['max_bid_for_target_roi']) : null,
      targetRoiPct: valuation != null ? parseDouble(valuation['target_roi_pct']) : null,
      vin: json['vin']?.toString(),
      vehicleYear: json['vehicle_year'] as int?,
      vehicleMake: json['vehicle_make']?.toString(),
      vehicleModel: json['vehicle_model']?.toString(),
    );
  }
}
