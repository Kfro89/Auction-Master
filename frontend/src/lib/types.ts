export interface ValuationDetail {
  avg_asking_price: number | null
  median_asking_price: number | null
  price_range_low: number | null
  price_range_high: number | null
  sample_listings: unknown[]
}

export interface Valuation {
  est_market_value: number | null
  max_bid_for_target_roi: number | null
  target_roi_pct: number
  computed_at: string | null
  search_query?: string | null
  sample_size?: number | null
  mean?: number | null
  trimmed_median?: number | null
}

export interface ResearchItem {
  id: number
  title: string
  lot_number: string | null
  current_bid: number
  end_time: string | null
  url: string | null
  image_url: string | null
  images: string[]
  auction_house_id: number | null
  auction_house_key: string | null
  auction_house_name: string | null
  category: string | null
  product_name: string | null
  condition: string | null
  tags: string[] | null
  is_watched: boolean
  is_archived: boolean
  vin: string | null
  vehicle_year: number | null
  vehicle_make: string | null
  vehicle_model: string | null
  vehicle_trim: string | null
  valuation: Valuation | null
  valuation_detail?: ValuationDetail | null
}

export interface BidItem {
  id: number
  title: string
  lot_number: string | null
  url: string | null
  image_url: string | null
  images: string[]
  current_bid_amount: number
  user_bid_amount: number
  user_proxy_bid: number | null
  user_bid_status: "winning" | "outbid" | "won" | "lost" | null
  end_time: string | null
  is_hidden_from_active: boolean
  auction_house_id: number | null
  auction_house_key: string | null
  auction_house_name: string | null
  category: string | null
  product_name: string | null
  condition: string | null
  tags: string[] | null
  vin: string | null
  vehicle_year: number | null
  vehicle_make: string | null
  vehicle_model: string | null
  vehicle_trim: string | null
  valuation: Valuation | null
  user_bids: {
    current_bid_amount: number
    user_bid_amount: number
    user_proxy_bid: number | null
    user_bid_status: string | null
  }
}

export interface Comparable {
  title: string
  price: number
  url: string | null
  sold_at: string | null
  condition: string | null
  thumbnail: string | null
}

export interface LoginResponse {
  access_token: string
  token_type: string
}
