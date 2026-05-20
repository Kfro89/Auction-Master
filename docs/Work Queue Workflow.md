# Work Queue Workflow

**This document outlines the process flow for the work queue module and the assoicate tasks and fields that should be available for each stage. From a UI perspective no tasks or fields should be visible unless the item is in the correct stage.**

## Stages

### 1. Won - This stage identifies items that have been won at auction but not yet paid for.

**Tasks**:

- Add lot splitting - This allows the user to split a lot into multiple items and determine the final total cost of the item or items within the lot.
- Add transactional line item to determine final total cost of the item or items within the lot. - Acquistion logic
  **Actions**
  - Mark item as paid.
  - Once paid, item moves to the paid stage.

### 2. Paid - This stage identifies items that have been paid for but not yet shipped.

**Tasks**:

- Add tracking number - This allows the user to add a tracking number to the item.
- Add shipping carrier - This allows the user to add a shipping carrier to the item.
- Add shipping cost - This allows the user to add a shipping cost to the item.
  **Actions\*\*** - Mark item as shipped. - Once shipped, item moves to the shipped stage.
  **Fields**
- This section can show the acquistion costs but they should not be editable, a PAID icon can be placed on the item card to indicate that it has been paid for.

### 3. In Transit - This stage identifies items that have been shipped but not yet received.

**Tasks**:

- No tasks for the user to take here, the application should reference the carrier and tracking number and via api show the status of this shipment while it is in transit and provide expected delivery date and eta.
  **Actions**
  - Mark item as received. Manual entry or via api webhook triggered by shipment update or via api
  - Once received, item moves to the received stage.

### 4. Received - This stage identifies items that have been received but not yet staged.

**Tasks**:

- Generate an INV-xxxx ID - This allows the user to generate an INV-xxxx ID for the item.
- Print Label - This allows the user to print a QR code label for the item.
- Storage Location - This allows the user to assign a storage location to the item.

### 5. Refurbish - This stage identifies items that have been staged but not yet listed.

**Tasks**: Repair, Cleaning & Value-Add Expense Tracking.  
**Purpose:** To isolate items requiring repair prior to listing, and to accurately capture any additional part/labor costs associated with the refurbishment.  
**Display to End User:** A staging board showing items in progress. A button to "Add Refurbishment Cost" allows the user to append line-item expenses (e.g., _"$15 \- Replacement power supply"_) directly to the item's running financial ledger.

### 6. Staging - The item is ready to be properly prepared for listing.

**Tasks** Media Intake, Anti-Tamper Capture, AI Drafting, and Automated Packaging Selection.  
**Purpose:** The final prep stage before the Selling Portal. Ensures all protective measures, shipping variables, packaging costs, and listing data are gathered efficiently.  
**Display to End User:** A comprehensive staging form containing:

- _Photo Upload:_ Drag-and-drop interface for product photos.
- _Anti-Tamper Validation:_ A specific photo upload slot/scanner to capture the applied anti-return/tamper labels and associated barcodes.
- _Item Dims & Auto-Packaging:_ Mandatory input fields for the raw item's Weight (lbs/oz) and Dimensions (L x W x H). Based on these inputs, the system will query the **Packaging Configurations Array** (defined in Module 5\) to automatically select the optimal box/package. The UI will display a tag showing the _Selected Package Configuration_ (e.g., "12x12x8 Box w/ Bubble Wrap") and append its standardized cost to the item's ledger.
- _AI Listing Generator:_ A button that utilizes an LLM to auto-draft the eBay title and description. Utilizing eBay's API, the proper taxonomy/category selection leveraging the LLM if needed, and HTML description based on the uploaded photos and user-provided condition notes.
- _Template Upload:_ The application should enable a user to provide an HTML template to be used for listings that is updated via the LLM. In the settings section, create an "Upload Description Template" area where a user can paste an HTML template to be u

### 7. Ready to List - The item is ready to be listed on eBay.

**Tasks**: Push to eBay via API
**Actions**

- Push to eBay via API
- Once pushed, item moves to the listed stage and is vieable via the selling portal. via ebay oauth.
