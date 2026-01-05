# Category API Implementation - Changelog

## Tổng quan
Đã hoàn thiện việc implement Category API mới với cấu trúc phân cấp parent-child, các endpoint REST API đầy đủ theo API documentation.

## Ngày cập nhật: 5/1/2026

---

## 🔄 Thay đổi chính

### 1. **Types (category.types.ts)**

#### ✅ Thêm mới:
- `CategoryParent` interface - đại diện cho parent category reference
- `parent` field trong `Category` - tham chiếu đến parent category
- `subCategories` field trong `Category` - danh sách các subcategories
- `parentId` field trong `CreateCategoryRequest` và `UpdateCategoryRequest`

#### ✅ Cập nhật:
- Loại bỏ các field cũ: `isActive`, `isDeleted`
- Tất cả các field không required đều đánh dấu optional (`?`)
- `description` và `image` giờ là optional

---

### 2. **Services (category.service.ts)**

#### ✅ Endpoints mới:
| Method | Endpoint | Mô tả |
|--------|----------|-------|
| GET | `/api/categories/root` | Lấy tất cả root categories với subcategories |
| GET | `/api/categories/root/paged` | Lấy root categories có phân trang |
| GET | `/api/categories/{parentId}/subcategories` | Lấy subcategories theo parent ID |
| GET | `/api/categories/{parentId}/subcategories/paged` | Lấy subcategories có phân trang |
| GET | `/api/categories/search` | Tìm kiếm categories (không phân trang) |
| POST | `/api/categories` | Tạo category mới (JSON format) |
| PUT | `/api/categories/{id}` | Cập nhật category (JSON format) |
| DELETE | `/api/categories/{id}` | Xóa category |

#### ✅ Thay đổi:
- **Từ FormData sang JSON**: API giờ nhận JSON body thay vì FormData
- **Loại bỏ**: `getActiveCategories`, `softDeleteCategory`, `restoreCategory`
- **Image**: Giờ gửi URL string thay vì upload file

---

### 3. **Hooks (useCategories.ts)**

#### ✅ Hooks mới:
```typescript
useAllCategories()                    // Lấy tất cả categories (flat list)
useRootCategories()                   // Lấy root categories với subcategories
useRootCategoriesPaged(page, size)    // Root categories có phân trang
useSubCategories(parentId)            // Lấy subcategories theo parent
useSubCategoriesPaged(parentId, page, size) // Subcategories có phân trang
useSearchCategories(name)             // Tìm kiếm không phân trang
useSearchCategoriesPaged(name, page, size) // Tìm kiếm có phân trang
useDeleteCategory()                   // Xóa category
```

#### ✅ Cập nhật:
- `useCreateCategory`: Nhận `CreateCategoryRequest` object
- `useUpdateCategory`: Nhận `UpdateCategoryRequest` object
- Loại bỏ: `useActiveCategories`, `useSoftDeleteCategory`, `useRestoreCategory`

#### ✅ Query Keys:
```typescript
categoryKeys.allFlat()
categoryKeys.rootCategories()
categoryKeys.rootCategoriesPaged(page, size)
categoryKeys.subCategories(parentId)
categoryKeys.subCategoriesPaged(parentId, page, size)
categoryKeys.search(name)
categoryKeys.searchPaged(name, page, size)
```

---

### 4. **Component (Categories.tsx)**

#### ✅ UI Updates:
1. **Parent Category Selection**
   - Dropdown select để chọn parent category
   - Hiển thị hierarchy trong select options
   - Không cho phép chọn chính nó làm parent

2. **Table Columns mới**
   - **Parent Category**: Hiển thị parent name hoặc "Root"
   - **Subcategories Count**: Số lượng subcategories
   - **Icons**: Folder icon cho categories có subcategories, File icon cho leaf categories

3. **Form Fields**
   - `name` (required, 2-100 chars)
   - `parentId` (optional, select dropdown)
   - `description` (optional, max 500 chars)
   - `image` (optional URL, max 500 chars)
   - `status` (ACTIVE/INACTIVE)

4. **Data Handling**
   - Từ FormData → JSON object
   - Upload image → Image URL
   - Better error messages với validation errors từ backend

---

## 📊 Feature Highlights

### ✅ Hierarchical Categories
- Root categories (parent = null)
- Multiple levels of subcategories
- Parent-child relationships
- Circular reference prevention

### ✅ Complete CRUD
- Create category với optional parent
- Read categories (all, root, subcategories)
- Update category (có thể move sang parent khác)
- Delete category (validate subcategories và products)

### ✅ Search & Pagination
- Client-side instant filter
- Server-side search với pagination
- Flexible page size (10, 20, 50, 100)
- Total count và navigation

### ✅ Validation
- Frontend: Ant Design Form validation
- Backend: Jakarta Bean Validation
- Error messages: Formatted array of errors
- Business rules: No circular reference, protect delete

---

## 🎯 API Response Format

### Success Response:
```json
{
  "success": true,
  "message": "Category created successfully",
  "data": {
    "id": "uuid",
    "name": "Electronics",
    "description": "...",
    "image": "https://...",
    "status": "ACTIVE",
    "parent": {
      "id": "parent-uuid",
      "name": "Parent Name"
    },
    "subCategories": [...],
    "productCount": 0,
    "createdAt": "2026-01-05T10:30:00",
    "updatedAt": "2026-01-05T10:30:00"
  }
}
```

### Error Response:
```json
{
  "status": 400,
  "errors": [
    "name: Category name is required",
    "name: Category name must be between 2 and 100 characters"
  ],
  "reasonPhrase": "Bad Request"
}
```

---

## 🚀 Usage Examples

### Tạo Root Category:
```typescript
const createMutation = useCreateCategory();

await createMutation.mutateAsync({
  name: "Electronics",
  description: "Electronic devices",
  image: "https://example.com/electronics.jpg",
  status: "ACTIVE"
});
```

### Tạo Subcategory:
```typescript
await createMutation.mutateAsync({
  name: "Smartphones",
  description: "Mobile phones",
  parentId: "electronics-uuid",
  status: "ACTIVE"
});
```

### Update Category (Move to different parent):
```typescript
const updateMutation = useUpdateCategory();

await updateMutation.mutateAsync({
  id: "category-uuid",
  data: {
    parentId: "new-parent-uuid"
  }
});
```

### Delete Category:
```typescript
const deleteMutation = useDeleteCategory();

await deleteMutation.mutateAsync("category-uuid");
```

---

## ⚠️ Breaking Changes

### 1. API Format Change
- **Before**: FormData with file upload
- **After**: JSON with image URL

### 2. Removed Endpoints
- ❌ `/api/categories/active/paged`
- ❌ `/api/categories/{id}/soft`
- ❌ `/api/categories/{id}/restore`
- ❌ `/api/categories/create` (giờ dùng `/api/categories`)

### 3. Field Changes
- ❌ Removed: `isActive`, `isDeleted`
- ✅ Added: `parent`, `subCategories`, `parentId`

---

## 📝 Migration Notes

### Nếu có code cũ sử dụng:
1. **FormData upload**: Chuyển sang URL string
2. **Soft delete**: Dùng `useDeleteCategory` (hard delete)
3. **Active filter**: Filter client-side hoặc dùng `status === 'ACTIVE'`

---

## 🧪 Testing Checklist

- [x] Create root category
- [x] Create subcategory
- [x] Update category name/description
- [x] Move category to different parent
- [x] Change category status
- [x] Delete category (validation check)
- [x] Search categories
- [x] Pagination navigation
- [x] Parent dropdown populated correctly
- [x] Table displays hierarchy

---

## 📚 Related Files

| File | Changes |
|------|---------|
| `category.types.ts` | Added parent/subCategories types |
| `category.service.ts` | Updated all endpoints to match API docs |
| `useCategories.ts` | Added new hooks, updated mutations |
| `Categories.tsx` | Complete UI overhaul with parent selection |

---

## 🔗 References

- API Documentation: [CATEGORY_API_README.md](./CATEGORY_API_README.md)
- Backend Repo: (link to backend repo)
- API Base URL: `http://localhost:8080/api/categories`

---

**Status**: ✅ **COMPLETED**  
**Version**: 2.0  
**Date**: January 5, 2026
