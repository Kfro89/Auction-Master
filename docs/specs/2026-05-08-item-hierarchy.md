# Item Hierarchy Specification

This document defines the structured hierarchy for classifying auction items. This hierarchy is used by the LLM to tag items during ingestion, enabling precise filtering and searching in the ERP dashboard.

## Hierarchy Structure

The hierarchy consists of **15 Categories**, each containing approximately **13 Types**.

### 1. Consumer Electronics
- Audio & Hi-Fi
- Cameras & Photo
- Cell Phones & Accessories
- E-Readers
- Home Audio & Theater
- Portable Audio & Video
- Smart Home Devices
- Smartwatches
- Tablets & E-Readers
- TVs & Video Gear
- Video Games & Consoles
- Vintage Electronics
- Wearable Technology

### 2. Computers & IT
- Components & Parts
- Desktops & All-In-Ones
- Drives, Storage & Media
- Enterprise Networking
- Home Networking
- Laptops & Netbooks
- Monitors
- Printers, Scanners & Supplies
- Software
- Tablets
- Workstations
- IT Accessories
- Servers

### 3. Industrial & Business
- Agriculture & Forestry
- Construction Equipment
- Electrical Equipment
- Facility Maintenance
- Healthcare, Lab & Dental
- Heavy Equipment
- HVAC Systems
- Hydraulics & Pneumatics
- Industrial Automation
- Light Equipment & Tools
- Material Handling
- Metalworking & Manufacturing
- Printing & Graphic Arts
- Restaurant & Food Service
- Test & Measurement

### 4. Tools & Hardware
- Air Tools
- Hand Tools
- Measuring & Layout
- Power Tools
- Shop Equipment
- Tool Boxes & Storage
- Welding & Soldering
- Woodworking Tools
- Hardware & Fasteners
- Ladders & Scaffolding
- Pressure Washers
- Generators
- Electrical Supplies

### 5. Home & Kitchen
- Bath & Body
- Bedding
- Cleaning Supplies
- Furniture
- Home Decor
- Kitchen & Dining
- Lighting & Fans
- Major Appliances
- Small Appliances
- Storage & Organization
- Vacuum Cleaners
- Yard & Garden
- Window Treatments

### 6. Medical & Laboratory
- Dental Equipment
- Diagnostic Equipment
- Hospital Beds & Furniture
- Laboratory Equipment
- Laboratory Glassware
- Medical Instruments
- Mobility Equipment
- Monitoring Systems
- Ophthalmic Equipment
- Oxygen Equipment
- Physical Therapy Gear
- Surgical Equipment
- Teaching & Training

### 7. Musical Instruments
- Amplifiers
- Brass Instruments
- DJ & Lighting Gear
- Drums & Percussion
- Guitars & Basses
- Keyboards & Pianos
- Microphones
- P.A. Systems
- Recording & Studio Gear
- String Instruments
- Woodwind Instruments
- Sheet Music
- Musical Accessories

### 8. Sporting Goods
- Cycling
- Exercise & Fitness
- Fishing
- Golf
- Hunting
- Indoor Games
- Outdoor Recreation
- Team Sports
- Tennis & Racquet Sports
- Water Sports
- Winter Sports
- Sports Memorabilia
- Camping Gear

### 9. Automotive & Parts
- Apparel & Merchandise
- Car & Truck Parts
- In-Car Tech & GPS
- Interior Accessories
- Motorcycle Parts
- Off-Road Parts
- Performance Parts
- Salvage Parts
- Tires & Wheels
- Tools & Equipment
- Vintage Car Parts
- Exterior Accessories
- Oils & Fluids

### 10. Collectibles & Art
- Antiques
- Autographs
- Coins & Currency
- Comic Books
- Historical Memorabilia
- Militaria
- Photography
- Postcards
- Sports Cards
- Stamps
- Vintage Toys
- Fine Art
- Pottery & Glass

### 11. Toys & Hobbies
- Action Figures
- Board Games
- Building Toys (Lego)
- Diecast & Toy Vehicles
- Dolls & Teddy Bears
- Educational Toys
- Models & Kits
- Outdoor Toys
- Puzzles
- Radio Control (RC)
- Slot Cars
- Trading Card Games
- Classic Toys

### 12. Office Supplies
- Binding & Laminating
- Filing & Storage
- Mailing & Shipping
- Office Electronics
- Office Furniture
- Paper Products
- Presentation Equipment
- School Supplies
- Writing Instruments
- Ink & Toner
- Desk Accessories
- Shredders
- Safes

### 13. Jewelry & Watches
- Bracelets
- Cufflinks
- Earrings
- Engagement & Wedding
- Fashion Jewelry
- Fine Jewelry
- Loose Diamonds & Gems
- Necklaces & Pendants
- Rings
- Vintage Jewelry
- Watches, Parts & Accessories
- Jewelry Design & Repair
- Men's Jewelry

### 14. Clothing & Accessories
- Baby & Kids
- Costumes
- Handbags & Wallets
- Hats & Caps
- Men's Accessories
- Men's Clothing
- Men's Shoes
- Sunglasses
- Umbrellas
- Vintage Clothing
- Women's Accessories
- Women's Clothing
- Women's Shoes

### 15. Media & Books
- Audiobooks
- Blu-ray Discs
- Books
- Cassette Tapes
- CDs
- DVDs
- Magazines
- Records (Vinyl)
- Sheet Music
- VHS Tapes
- Video Games
- Comic Books
- Educational Media

## Implementation Strategy

1. **Backend Storage:** Save the hierarchy as a JSON file in `backend/app/services/hierarchy.json`.
2. **LLM Prompting:** Update `generate_tags_for_item` (or create a new `classify_item` function) to include the hierarchy in the system prompt. Instruct the LLM to choose exactly one Category and one Type from the list.
3. **Database Schema:** Consider splitting the current `category` field into `category` and `sub_type`, or use a delimiter like `Category > Type`.
4. **Frontend Filtering:**
   - Update `ResearchView.tsx` to provide a Category dropdown.
   - Dynamically populate a Type dropdown based on the selected Category.
   - Use these values to filter the item list.
