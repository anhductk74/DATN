http://localhost:8080/api/v1/notifications?page=0&size=20

```json

{
    "data": {
        "hasNext": false,
        "totalPages": 1,
        "totalElements": 1,
        "pageSize": 20,
        "hasPrevious": false,
        "currentPage": 0,
        "content": [
            {
                "id": "6ecaf4cb-3daf-45ab-8b95-c39569972580",
                "userId": "8dad2009-aa75-455f-91ef-fcfbf830a0bf",
                "type": "ORDER_CREATED",
                "title": "Đơn hàng mới",
                "message": "Bạn có đơn hàng mới #102dbc88 từ OLDG YUGI. Giá trị: 913,000 đ",
                "status": "UNREAD",
                "referenceId": "102dbc88-11bb-4586-b94a-22a55567d1a1",
                "referenceType": "ORDER",
                "metadata": null,
                "imageUrl": "/dadr6xuhc/image/upload/v1760171919/image/wbxa27fqyrldxznbrs41.jpg",
                "deepLink": "/shop/orders/102dbc88-11bb-4586-b94a-22a55567d1a1",
                "createdAt": "2026-01-09T12:58:36.540142",
                "updatedAt": "2026-01-09T12:58:36.540142"
            }
        ]
    },
    "success": true,
    "message": "Notifications retrieved successfully"
}


