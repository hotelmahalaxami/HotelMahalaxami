package com.mahalaxmi.pos.order.service;

import com.mahalaxmi.pos.order.dto.PublicOrderSubmissionRequest;
import com.mahalaxmi.pos.order.dto.PublicOrderSubmissionResponse;
import com.mahalaxmi.pos.order.dto.PublicOrderTrackingResponse;

public interface PublicOrderService {
    PublicOrderSubmissionResponse submitPublicOrder(PublicOrderSubmissionRequest request, String clientIp);
    PublicOrderTrackingResponse trackPublicOrder(String trackingToken);
}
