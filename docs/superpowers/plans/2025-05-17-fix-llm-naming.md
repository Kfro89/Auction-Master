# LLM Naming Improvement Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Improve item naming by making the LLM extraction more descriptive and the frontend display more robust, specifically ensuring brand, model, and key specs are visible.

**Architecture:** 
- Modify the LLM system prompt to include model numbers and key specs in the `product_name` field.
- Enhance backend post-processing to clean up list-style strings (e.g., `['Brand']`) and ensure `brand` and `product_name` are properly populated.
- Update the frontend `formatItemName` utility to intelligently combine brand, model (from tags), and product name for a complete display.

**Tech Stack:** Python (FastAPI), TypeScript (React), SQLAlchemy.

---

### Task 1: Update LLM Prompt for More Descriptive Product Names

**Files:**
- Modify: `backend/app/services/llm.py`

- [ ] **Step 1: Modify the system prompt in `generate_valuation_data`**

Change instruction #4 to include model numbers and specs.

```python
# In backend/app/services/llm.py

# Old:
# 4. Extract a clean, standardized "product_name". This should be the core name of the item (e.g., "Flexbreeze Fan") EXCLUDING the brand name.

# New:
# 4. Extract a clean, standardized "product_name". This should be the full descriptive name of the item including its model series and key technical specifications (e.g., "Z2 Mini G9 Workstation i7-12700", "iPhone 15 Pro 256GB") but EXCLUDING the brand name.
```

- [ ] **Step 2: Improve post-processing of `brand` and `product_name`**

Ensure that if the LLM returns a stringified list for brand, we clean it up.

```python
# In backend/app/services/llm.py, around line 178

            brand_val = raw_tags.get("Brand", "")
            if isinstance(brand_val, list):
                brand = ", ".join([str(b) for b in brand_val if b])
            else:
                brand = str(brand_val)
            
            # Add cleanup for stringified lists like "['Dell']"
            if brand.startswith("[") and brand.endswith("]"):
                try:
                    import ast
                    brand_list = ast.literal_eval(brand)
                    if isinstance(brand_list, list):
                        brand = ", ".join([str(b) for b in brand_list if b])
                except:
                    brand = brand.strip("[]'\"")
```

- [ ] **Step 3: Deploy and verify with a test script**

Use the existing `backend/test_llm_tags.py` if available, or a new one to verify the prompt change.

### Task 2: Enhance Frontend Item Name Formatter

**Files:**
- Modify: `frontend/src/utils/formatters.ts`

- [ ] **Step 1: Update `formatItemName` to include model from tags**

If `product_name` is generic or missing the model, try to find it in tags.

```typescript
// In frontend/src/utils/formatters.ts

export const formatItemName = (item: any) => {
  const brand = item.brand || "";
  let productName = item.product_name || "";
  
  // If product_name is missing or very generic, fallback to title
  if (!productName || productName.length < 3) {
      return item.title || `Item #${item.id}`;
  }

  // Ensure brand is not a stringified list like "['Dell']"
  let cleanBrand = brand;
  if (typeof brand === 'string' && brand.startsWith('[') && brand.endsWith(']')) {
      cleanBrand = brand.replace(/[\[\]'"]/g, '');
  }

  // Extract model from tags if present and not already in product_name
  const tags = item.tags || {};
  const model = tags["Model Name / Number"] || tags["Model"];
  
  let displayName = productName;
  if (model && !productName.toLowerCase().includes(String(model).toLowerCase())) {
      displayName = `${model} ${productName}`;
  }

  // Prepend brand if not already present
  if (cleanBrand && !displayName.toLowerCase().includes(cleanBrand.toLowerCase())) {
      return `${cleanBrand} ${displayName}`;
  }
  
  return displayName;
};
```

- [ ] **Step 2: Verify in the browser (Visual check)**

Check items like "HP Workstation" to see if they now show "HP Z2 Mini G9 Workstation".

### Task 3: Re-enrich Generic Items (Optional/Scripted)

**Files:**
- Create: `backend/scripts/reenrich_generic_items.py`

- [ ] **Step 1: Create a script to find items with generic product names and reset their status**

```python
# backend/scripts/reenrich_generic_items.py
import sqlalchemy as sa
from sqlalchemy.orm import Session
from app.models import Item
from app.database import SessionLocal

def main():
    db = SessionLocal()
    # Find items that were likely over-aggressively renamed
    generic_names = ['Workstation', 'Laptop', 'Computer', 'Monitor', 'Server']
    items = db.query(Item).filter(
        sa.or_(
            Item.product_name.in_(generic_names),
            Item.product_name.is_(None)
        )
    ).all()
    
    print(f"Found {len(items)} items to re-enrich")
    for item in items:
        item.processing_status = "pending_enrichment"
    
    db.commit()
    print("Done. Enrichment service will pick them up on next run.")

if __name__ == "__main__":
    main()
```

- [ ] **Step 2: Run the script on the remote**

```bash
./backend/deploy_rsync.exp
./backend/run_cmd_remote.exp "python3 scripts/reenrich_generic_items.py"
```
