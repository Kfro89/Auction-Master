Wh**Product Requirements Document (PRD): Reseller Expense, Inventory & Lifecycle Management**

## **1\. Overview & Objectives**

This document outlines the requirements for an end-to-end inventory and business management application tailored specifically for resellers who acquire inventory from public, estate, and liquidation auctions to sell on eBay.  
The application facilitates the complete business lifecycle: Post-Acquisition (Work Queue), Pre-Listing (Staging), Active Market (Selling Portal), Post-Sale (Fulfillment & Reconciliation), and overarching Business Health (Expense Management & Cost Configurations).  
**Constraints & System Integrations:**

* **eBay API Integration:** The application will utilize the user’s eBay account credentials via OAuth to access store-related APIs for listing creation, active metrics, and messaging/offers.  
* **Data Limitation Caveat:** Due to eBay API limitations, automated historical "sold" data is unavailable. The application will leverage *active* market data, dynamic calculators, and strategic workflow shortcuts to assist users in pricing strategies.

## ---

**2\. Module 1: The "Work Queue" (Post-Acquisition & Prep)**

*This module acts as a staging queue for items won via auction or external vendors, allowing the user to manage inventory costs, physical logistics, and listing preparation before posting to eBay.*

### **2.1. Stage: Won**

* **Feature / Enhancement:** Auto-Import & "Lot Splitting" Unbundling Tool.  
* **Purpose:** Serves as the initial staging area for items requiring payment. Because resellers frequently purchase pallets or "box lots" (e.g., one $50 box containing 10 distinct items), the splitting feature allows users to spawn multiple child items from a parent lot and accurately distribute the initial Cost of Goods Sold (COGS).  
* **Display to End User:** A table or Kanban view showing "Won" items. A "Split Lot" action button on the item opens a modal allowing the user to specify the number of items in the lot and choose to distribute the COGS evenly or via custom weighted percentages to newly generated child items. Includes a manual "+" button for offline purchases. If no splitting is required the user is able to continue with a singular item.

### **2.2. Stage: Paid**

* **Feature / Enhancement:** Granular Acquisition Financials.  
* **Purpose:** To capture the true cost of auction sourcing, including hidden fees that eat into margins, while awaiting vendor fulfillment.  
* **Display to End User:** An item detail form displaying specific input fields for *Hammer Price, Buyer’s Premium (%), and Taxes*. A button to "Add Transactional Line Item" allows the user to log miscellaneous processing/loading costs to the item's total base COGS.

### **2.3. Stage: Shipped / Transit**

* **Feature / Enhancement:** Dual Transit Tracking & Local Logistics.  
* **Purpose:** Tracks items that are in the mail from the vendor, or tags items the reseller must physically drive to pick up from a local estate/auction (a highly common occurrence in this niche).  
* **Display to End User:** The user must select a routing toggle: **"Awaiting Vendor Shipment"** (prompts for a carrier tracking number) or **"Awaiting Local Pickup"** (prompts for a physical address and pickup deadline date).

### **2.4. Stage: Received**

* **Feature / Enhancement:** Intake ID, QR Label Generation, and Storage Location Tracking.  
* **Purpose:** To formally log physical possession of the item, generate tracking assets, and assign a physical location so the item isn't lost in the reseller's warehouse or garage.  
* **Display to End User:** An intake screen that auto-generates an INV-xxxx ID. A prominent "Print Label" button triggers the creation of a printable QR code label. A mandatory alphanumeric input field for **"Storage Location"** (e.g., *Bin 12, Shelf A*) is required before saving and moving the item forward.

### **2.5. Stage: Refurbish (Optional Preliminary Stage)**

* **Feature / Enhancement:** Repair, Cleaning & Value-Add Expense Tracking.  
* **Purpose:** To isolate items requiring repair prior to listing, and to accurately capture any additional part/labor costs associated with the refurbishment.  
* **Display to End User:** A staging board showing items in progress. A button to "Add Refurbishment Cost" allows the user to append line-item expenses (e.g., *"$15 \- Replacement power supply"*) directly to the item's running financial ledger.

### **2.6. Stage: Staging**

* **Feature / Enhancement:** Media Intake, Anti-Tamper Capture, AI Drafting, and Automated Packaging Selection.  
* **Purpose:** The final prep stage before the Selling Portal. Ensures all protective measures, shipping variables, packaging costs, and listing data are gathered efficiently.  
* **Display to End User:** A comprehensive staging form containing:  
  * *Photo Upload:* Drag-and-drop interface for product photos.  
  * *Anti-Tamper Validation:* A specific photo upload slot/scanner to capture the applied anti-return/tamper labels and associated barcodes.  
  * *Item Dims & Auto-Packaging:* Mandatory input fields for the raw item's Weight (lbs/oz) and Dimensions (L x W x H). Based on these inputs, the system will query the **Packaging Configurations Array** (defined in Module 5\) to automatically select the optimal box/package. The UI will display a tag showing the *Selected Package Configuration* (e.g., "12x12x8 Box w/ Bubble Wrap") and append its standardized cost to the item's ledger.  
  * *AI Listing Generator:* A button that utilizes an LLM to auto-draft the eBay title and description. Utilizing eBay's API, the proper taxonomy/category selection leveraging the LLM if needed, and HTML description based on the uploaded photos and user-provided condition notes.  
  * *Template Upload:* The application should enable a user to provide an HTML template to be used for listings that is updated via the LLM. In the settings section, create an "Upload Description Template" area where a user can paste an HTML template to be used.

## ---

**3\. Module 2: Selling Portal (Active Management)**

*Once Staging is complete, items move to this API-driven portal. To access this section, the user will be greeted with an alert to authenticate with their eBay account via OAuth. The UI is divided into a Top Dashboard and a Dynamic Two-Pane Table.*

### **3.1. Top Section: Global Seller Dashboard**

* **Feature / Enhancement:** High-Level & Actionable Reseller KPIs.  
* **Purpose:** To give the user an immediate snapshot of their business health, capital velocity, and listing traffic.  
* **Display to End User:** A widget-based dashboard pinned to the top of the portal. It features global toggle buttons (30-Day, 60-Day, 90-Day, YTD, All-Time) that update the following:  
  * *Standard Tiles:* Total Items Listed, Total Value of Active Inventory, Total Items Sold (Qty & Rev).  
  * *Traffic Visualizations:* Line charts/tiles for Total Impressions, Clicks, Conversions, Favorites, and Added to Cart.  
  * *Velocity & Capital Widgets:* **Unlisted Inventory Value** (Warns the user of the "Death Pile" total COGS sitting unlisted in the Work Queue), **Sell-Through Rate (STR%)**, **Average Days on Market**, and a chart showing **Sourcing ROI by Vendor**.

### **3.2. Dynamic Pane 1: "Ready to List"**

*(Note: This pane only displays when staged items are awaiting final pricing and publication. If empty, the entire lower section defaults to Pane 2).*

* **Feature / Enhancement:** Pricing Strategy Workarounds & "True Net" ROI Calculator.  
* **Purpose:** Provides the user with active market context, a shortcut to sold comps, and real-time profit calculations that include material packaging costs to make informed pricing decisions.  
* **Display to End User:** A table row for each item containing:  
  * *Active Floor Gauge:* Displays the lowest 5 active listings for identical taxonomy via the active API.  
  * *Deep Market Link:* A **"Check Sold Comps"** button that dynamically opens a new browser tab to eBay, pre-searching the item's title and natively pre-filtered to "Sold/Completed Items."  
  * *True Net Calculator:* As the user types their proposed Listing Price, an adjacent text block dynamically updates: \[List Price\] \- \[Total Accumulated COGS\] \- \[Est. eBay Fees \~13.5%\] \- \[Est. Shipping\] \- \[Auto-Calculated Packaging Cost\] \= Projected True Net $.  
  * *Action:* A final **"List Item to eBay"** API trigger button.

### **3.3. Dynamic Pane 2: "Listed"**

* **Feature / Enhancement:** Active Listing Management, Aging Alerts, and Smart Offer Evaluator.  
* **Purpose:** To monitor live listing performance, adjust pricing on stagnant items, and evaluate incoming buyer offers in real-time.  
* **Display to End User:** A data-rich table displaying live API metrics:  
  * *Item Details:* Listing Title (clickable hyperlink to open the live eBay URL), Listed Price, Current Market Valuation, and Duration Listed.  
  * *Traffic Stats:* Impressions, Clicks, Quantities added to carts.  
  * *Aging Alerts:* Visual warning flags (yellow/red) highlighting items listed \>90 or \>180 days, with a quick-action checkbox to "Apply Markdown Sale" or "Send Offer to Watchers."  
  * *Smart Offer Evaluator:* If a "Best Offer" is received via the API, a notification icon appears. Clicking it displays the offer alongside the True Net Calculator: *"If accepted, after COGS/Fees/Packaging, your Net Profit will be $X.XX."* The user can Accept/Decline/Counter directly from the app.

## ---

**4\. Module 3: Post-Sale & Fulfillment (Lifecycle Completion)**

*A critical workflow module to manage the physical shipping process, finalize exact accounting, and handle return fraud.*

### **4.1. Stage: Sold / Awaiting Shipment**

* **Feature / Enhancement:** Warehouse Pick-List & Fulfillment Guidelines.  
* **Purpose:** To easily locate the sold item in the physical workspace and provide the packer with the exact shipping materials required.  
* **Display to End User:** A queue of paid/sold items prominently displaying the **Storage Location** (e.g., *Bin 12*) recorded during the *Received* stage, the **Packaging Configuration** required (e.g., *Use Config: 8x8x8 Box \+ Void Fill*), alongside the buyer's shipping information and the INV-xxxx ID.

### **4.2. Stage: Completed / Archived**

* **Feature / Enhancement:** Final Financial Reconciliation.  
* **Purpose:** To overwrite *estimated* fees and shipping costs with *actual* finalized costs to ensure accounting/tax data is perfectly accurate.  
* **Display to End User:** A historical ledger view. Once a transaction clears, the system pulls the exact final fee from the eBay API, and prompts the user to input (or auto-imports) the final purchased shipping label cost, permanently locking the item's "Final True Net Profit" and "Final ROI %."

### **4.3. Exception Stage: Returns & RMA**

* **Feature / Enhancement:** Anti-Tamper & Return Fraud Prevention Workflow.  
* **Purpose:** To protect the reseller from "parts harvesting" or fraudulent item-swapping by buyers before a refund is issued.  
* **Display to End User:** If an item is returned via the eBay API, it drops into this queue. Upon physical receipt of the returned box, the app forces a split-screen UI: The left side shows the original Anti-Tamper Label and condition photos taken during *Staging*. The right side prompts the user to activate their camera, scan the returned QR tag, and verify its integrity. The user must check a box confirming the item has not been tampered with before the app reveals the final "Issue Refund" button.

## ---

**5\. Module 4: Business Expense Management (General Ledger)**

*A dedicated, standalone module allowing the user to manage the "macro" finances of their business beyond individual inventory purchases.*

### **5.1. Expense Logging & Categorization**

* **Feature / Enhancement:** Non-Inventory Expense Tracking.  
* **Purpose:** To capture all operational overhead required to run the reselling business (e.g., software subscriptions, fuel/mileage, shipping tape, storage unit rent, marketing).  
* **Display to End User:** An input ledger where users can log new expenses. Inputs require a Date, Amount, Payee, and a Category Dropdown (e.g., Auto/Travel, Supplies, Rent/Lease, Software/Tech, Legal/Professional). Users can attach/upload a photo of the receipt to each line item for tax compliance.

### **5.2. Recurring Expense Automation**

* **Feature / Enhancement:** Subscription & Lease Management.  
* **Purpose:** To prevent the manual daily logging of predictable, repeating costs.  
* **Display to End User:** A toggle on the expense creation form labeled "Make Recurring." Users can set the frequency (Weekly, Monthly, Annually) so that items like an eBay Store Subscription or standard monthly rent automatically populate in the ledger on the specified dates.

### **5.3. Macro Business Health Dashboard**

* **Feature / Enhancement:** True Net Business Income Analysis.  
* **Purpose:** To reconcile the gross inventory profit (generated in Module 3\) against the operational expenses logged in this module to show the user their actual take-home profit.  
* **Display to End User:** A simplified Profit & Loss (P\&L) dashboard. It pulls the **Total True Net Profit** from sold items (Module 3\) and subtracts the **Total Operational Expenses** (Module 4\) for a selected timeframe (e.g., Current Month, Q1, YTD). Displays a final **"Total Business Net Income"** metric.

## ---

**6\. Module 5: Global Settings & Cost Configurations**

*The administrative backbone where the user defines standardized costs that automate calculations throughout the rest of the platform.*

### **6.1. Packaging & Supplies Configurator**

* **Feature / Enhancement:** Standardized Box & Material Arrays.  
* **Purpose:** To build the database of packaging options that the system will automatically select from during the *Staging* phase to ensure packaging costs are factored into every item's ROI.  
* **Display to End User:** A management table displaying all active package configurations. A "Create New Configuration" button opens a builder form requiring:  
  * *Configuration Name:* (e.g., "Standard Shoe Box Pack")  
  * *Box Dimensions:* Outer Length, Width, Height.  
  * *Box/Mailer Cost:* ($)  
  * *Protection/Void Fill Cost:* Estimated cost of bubble wrap, paper, or peanuts required for this specific box size ($).  
  * *Add-on Costs:* Standardized costs for anti-tamper labels, thank you cards, or specialized inserts ($).  
  * *Total Config Cost:* A locked, auto-summed field combining the above variables. This is the exact number that will be pushed to the item ledger when this configuration is selected by the system.