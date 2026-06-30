# SearchableSelect Component Guidelines

## Overview
To maintain a consistent, high-end user interface and avoid native OS styling issues (such as dark mode rendering on macOS Safari), the system uses a custom `SearchableSelect` component for all dropdown options.

## Core Rule: Dynamic Option Creation
Whenever implementing a dropdown where the user might need to add a value not present in the predefined list, you MUST use the `allowCreate={true}` property. 

This ensures that:
1. The user can type their desired option in the search bar.
2. If the option doesn't exist, a button to add it will appear automatically.
3. The custom string will be passed to the `onChange` handler.

### Example Implementation

```tsx
import { SearchableSelect } from '../components/ui/SearchableSelect';

<SearchableSelect 
  value={newTaxForm.type} 
  onChange={(value) => setNewTaxForm({...newTaxForm, type: value})} 
  options={Object.entries(taxTypeTranslations).map(([val, label]) => ({ value: val, label }))}
  allowCreate={true} // <-- CRITICAL: Allows users to add custom bands/types
/>
```

> [!IMPORTANT]
> When rendering data that might contain these dynamically created values (like in table rows), always provide a fallback to render the raw value if it doesn't exist in your translation dictionaries.
> Example: `{taxTypeTranslations[record.type] || record.type}`
