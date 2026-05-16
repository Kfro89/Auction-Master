# **Product Requirements Document (PRD): Auction Manager Enhancements**

## **1\. Overview**

This document outlines the technical and functional requirements for expanding the existing Auction Manager module. The goal is to evolve the application from a barebones tracking dashboard into a comprehensive auction management system. The system will synthesize market data, provide in-depth valuation analysis, retain robust bidding histories, and empower users with actionable intelligence to make well-educated bids. In addition to the requirements outlined below, provide any additional features or information that you think would be beneficial to the user. Note that sold listings from ebay are NOT AVAILBLE.

## **2\. Dashboard Scope & Bid Data Management**

**Epic:** Provide a comprehensive view of all user bidding activity with precise running totals and clear data structuring.

### **REQ-2.1: Bid History Retention (Active & Non-Winning)**

- **Description:** In addition to current total active bids, the Auction Manager section must include and retain items the user has bid on but is currently not the winning bidder on.
- **Acceptance Criteria:** Outbid items do not disappear from the dashboard; they remain visible with their respective status indicators until the auction completely closes.

### **REQ-2.2: Bid Data Structure & Display**

- **Description:** The UI must display specific, distinct financial data points for every tracked item to prevent user confusion regarding their exposure.
- **Data Requirements:** Each bid row/card must expose the following fields:
  - **Current Bid Amount:** The current bid amount shown publicly on the auction (this may be less than the user's proxy bid amount).
  - **User's Bid Amount:** The specific amount the user has bid on the item. This may be less than, equal to, or greater than the current bid amount depending on the auction state.
  - **User's Proxy/Top Bid:** The maximum amount the user has authorized the system to bid on their behalf.

### **REQ-2.3: Running Totals Display**

- **Description:** Provide an accurate running total of all active bids on the dashboard.
- **Acceptance Criteria:** The dashboard must feature a header or sticky widget that aggregates the totals of the fields defined in REQ-2.2 (e.g., "Total Current Bids," "Total User Bids").

## **3\. Valuation Analysis & Data Aggregation**

**Epic:** Enable more in-depth valuation analysis of items, going beyond basic research section data, utilizing an expanded table view.

### **REQ-3.1: Expanded Valuation Table & eBay Integration**

- **Description:** Users must be able to expand any item in the list view to reveal a detailed valuation table.
- **Logic:** This expanded view must fetch and display a list of 20 current, comparable eBay listings to provide immediate market context.
- **Methods:** Utilize the ai provided end point to review the images capturing model numbers, serial numbers, specs, anything that may not be available in the standard listing that would prove useful for derive a valuation.
- **Acceptance Criteria:** The 20 eBay listings are displayed in a clean table format within the expanded row. Each listing in the table must be clickable, routing the user to view more details about that specific external listing.

### **REQ-3.2: Condition-Matched API Querying**

- **Description:** When fetching the 20 current active eBay listings for REQ-3.1, the query must enforce strict condition matching.
- **Logic:** The request parameters must map the source auction item's condition to the eBay condition ID (e.g., if the source item is 'Used', the query must exclude 'New in Box').

### **REQ-3.3: Automated Price Aggregation ("Estimated Value")**

- **Description:** The system must automatically calculate baseline metrics from the 20 fetched eBay listings.
- **Logic:** Extract asking prices to calculate and display the **Average Asking Price**, **Median Asking Price**, and **Price Range (Low-High)**.

### **REQ-3.4: Total Landed Cost Calculation**

- **Description:** The valuation table must display the true cost of the item.
- **Logic:** Total Landed Cost \= Current Bid (or Proxy Bid) \+ Estimated Shipping Cost \+ Auction House Buyer's Premium.

## **4\. Advanced Bid Management & Risk Mitigation**

**Epic:** Enable users to visualize their total financial liability and quickly assess the health of their active bids.

### **REQ-4.1: Total Maximum Exposure Calculation**

- **Description:** Total Maximum Exposure \= SUM(All Active Highest Proxy Bids across all items). This protects the user from over-committing funds if all proxy bids are won simultaneously.
- **Acceptance Criteria:** Real-time widget visible on the main dashboard.

### **REQ-4.2: UI Bid Status Indicators (Color-Coding)**

- **Description:** The dashboard list view must implement a color-coded status system.
  - 🟩 **Green:** Winning (Current bid is yours).
  - 🟥 **Red:** Outbid (Your max proxy was exceeded).
  - 🟨 **Yellow:** Winning, but Reserve Not Met.
  - 🟧 **Orange:** Outbid, but within 10% of current winning bid.

## **5\. Asset Visualization & Inspection**

**Epic:** Provide a unified and thorough visual inspection tool for all auction items.

### **REQ-5.1: Global Image Gallery Modal**

- **Description:** All pictures associated with an item must be accessible for deep visual inspection.
- **Logic:** When a user clicks an item's image thumbnail, a modal must appear.
- **Acceptance Criteria:**
  - The modal component must be exactly the same UI component used for "Watch List" items and "Research" items to ensure consistency.
  - The modal must include left and right navigational arrows, allowing the user to seamlessly scroll through each available picture for that item without closing the modal.

## **6\. ROI and Reseller Tools**

**Epic:** Equip users who purchase for resale with tools to calculate potential profitability.

### **REQ-6.1: Margin/Profit Calculator Component**

- **Description:** A client-side calculator integrated into the expanded valuation view.
- **Logic:** Takes the "Average Asking Price", applies a user-defined discount, subtracts desired profit margin and estimated selling fees (\~13-15%), and outputs a **Maximum Recommended Bid**.

### **REQ-6.2: Market Saturation Indicator**

- **Description:** Visual indicator of market supply based on the total volume of active listings (e.g., High Saturation warning vs. High Scarcity badge).

## **7\. Implementation Phases (Developer Next Steps)**

1. **Core Data & UI Updates:** Implement the updated bid data schema (REQ-2.2), historical retention logic (REQ-2.1), and running totals (REQ-2.3). Implement the image modal (REQ-5.1).
2. **API & Valuation Engine:** Update the listing fetch service to pull the 20 comparable listings into the expanded table (REQ-3.1), handle condition-matching (REQ-3.2), and implement price aggregation utilities (REQ-3.3).
3. **Analytics & Risk Tools:** Build out the Total Exposure calculation (REQ-4.1), color-coded indicators (REQ-4.2), and ROI/Margin Calculator (REQ-6.1).
