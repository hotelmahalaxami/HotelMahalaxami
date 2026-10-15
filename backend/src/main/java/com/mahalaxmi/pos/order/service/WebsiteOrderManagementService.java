package com.mahalaxmi.pos.order.service;

import com.mahalaxmi.pos.order.dto.OrderResponse;
import com.mahalaxmi.pos.order.entity.AcceptanceStatus;

import java.util.List;

public interface WebsiteOrderManagementService {
    List<OrderResponse> getWebsiteOrders(AcceptanceStatus acceptanceStatus);
    long getPendingWebsiteOrderCount();
    OrderResponse acceptWebsiteOrder(Long orderId, String username);
    OrderResponse rejectWebsiteOrder(Long orderId, String reason, String username);
}
