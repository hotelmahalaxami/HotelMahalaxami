package com.mahalaxmi.pos.billing.service;

import com.mahalaxmi.pos.billing.dto.BillResponse;
import com.mahalaxmi.pos.billing.dto.GenerateBillRequest;
import com.mahalaxmi.pos.billing.dto.SettleBillRequest;
import com.mahalaxmi.pos.billing.entity.Bill;
import com.mahalaxmi.pos.billing.entity.BillStatus;
import com.mahalaxmi.pos.billing.entity.Payment;
import com.mahalaxmi.pos.billing.entity.PaymentStatus;
import com.mahalaxmi.pos.billing.repository.BillRepository;
import com.mahalaxmi.pos.billing.repository.PaymentRepository;
import com.mahalaxmi.pos.common.exception.ResourceNotFoundException;
import com.mahalaxmi.pos.order.entity.Order;
import com.mahalaxmi.pos.order.entity.OrderItemStatus;
import com.mahalaxmi.pos.order.entity.OrderStatus;
import com.mahalaxmi.pos.order.repository.OrderRepository;
import com.mahalaxmi.pos.user.entity.User;
import com.mahalaxmi.pos.user.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.concurrent.ThreadLocalRandom;

@Service
public class BillingServiceImpl implements BillingService {

    private static final Logger log = LoggerFactory.getLogger(BillingServiceImpl.class);
    private static final DateTimeFormatter CODE_FMT = DateTimeFormatter.ofPattern("yyyyMMdd-HHmmss");

    private final BillRepository billRepository;
    private final PaymentRepository paymentRepository;
    private final OrderRepository orderRepository;
    private final UserRepository userRepository;

    public BillingServiceImpl(BillRepository billRepository,
                              PaymentRepository paymentRepository,
                              OrderRepository orderRepository,
                              UserRepository userRepository) {
        this.billRepository = billRepository;
        this.paymentRepository = paymentRepository;
        this.orderRepository = orderRepository;
        this.userRepository = userRepository;
    }

    @Override
    @Transactional
    public BillResponse generateBillForOrder(Long orderId, GenerateBillRequest request, String username) {
        Order order = orderRepository.findByIdWithItems(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found with id: " + orderId));

        if (order.getStatus() == OrderStatus.CANCELLED) {
            throw new IllegalArgumentException("Cannot generate bill for a cancelled order");
        }

        boolean hasActiveItems = order.getItems().stream()
                .anyMatch(i -> i.getStatus() == OrderItemStatus.ACTIVE);
        if (!hasActiveItems) {
            throw new IllegalArgumentException("Cannot generate bill: order has no active items");
        }

        User user = null;
        if (username != null) {
            user = userRepository.findByUsernameOrEmail(username, username).orElse(null);
        }

        // Check if a bill already exists for this order
        Bill bill = billRepository.findByOrderIdWithDetails(orderId).orElse(null);

        BigDecimal discount = (request != null && request.discountAmount() != null)
                ? request.discountAmount().setScale(2, RoundingMode.HALF_UP)
                : BigDecimal.ZERO;

        BigDecimal tax = (request != null && request.taxAmount() != null)
                ? request.taxAmount().setScale(2, RoundingMode.HALF_UP)
                : BigDecimal.ZERO;

        String notes = (request != null && request.notes() != null) ? request.notes().trim() : null;

        if (bill != null) {
            if (bill.getStatus() == BillStatus.PAID) {
                return BillResponse.from(bill);
            }
            // Update existing unpaid bill with latest order subtotal and requested discount/tax
            bill.setSubtotal(order.getTotalAmount());
            bill.setDiscountAmount(discount);
            bill.setTaxAmount(tax);
            bill.setNotes(notes);
            bill.recalculateFinalAmount();
        } else {
            String billNumber = generateBillNumber();
            bill = new Bill(billNumber, order, order.getTotalAmount(), discount, tax, user);
            bill.setNotes(notes);
            order.setStatus(OrderStatus.READY_FOR_BILL);
            orderRepository.save(order);
        }

        Bill saved = billRepository.save(bill);
        log.info("Bill prepared: {} for order {} (Final amount: ₹{})", saved.getBillNumber(), order.getOrderNumber(), saved.getFinalAmount());
        return BillResponse.from(saved);
    }

    @Override
    @Transactional
    public BillResponse settleBill(Long billId, SettleBillRequest request, String username) {
        if (request == null || request.paymentMethod() == null) {
            throw new IllegalArgumentException("Payment method is required to settle bill");
        }

        // Acquire exclusive row lock to serialize concurrent settlement attempts
        billRepository.findByIdLocked(billId)
                .orElseThrow(() -> new ResourceNotFoundException("Bill not found with id: " + billId));

        Bill bill = billRepository.findByIdWithDetails(billId)
                .orElseThrow(() -> new ResourceNotFoundException("Bill not found with id: " + billId));

        if (bill.getStatus() == BillStatus.PAID) {
            throw new IllegalArgumentException("Bill " + bill.getBillNumber() + " is already paid");
        }
        if (bill.getStatus() == BillStatus.CANCELLED) {
            throw new IllegalArgumentException("Cannot settle a cancelled bill");
        }

        Order order = bill.getOrder();
        if (order.getStatus() == OrderStatus.CANCELLED) {
            throw new IllegalArgumentException("Associated order is cancelled");
        }

        User user = null;
        if (username != null) {
            user = userRepository.findByUsernameOrEmail(username, username).orElse(null);
        }

        BigDecimal paymentAmount = (request.amount() != null)
                ? request.amount().setScale(2, RoundingMode.HALF_UP)
                : bill.getFinalAmount();

        if (paymentAmount.compareTo(bill.getFinalAmount()) < 0) {
            throw new IllegalArgumentException("Payment amount (₹" + paymentAmount + ") cannot be less than bill total (₹" + bill.getFinalAmount() + ")");
        }

        // 1. Create and persist Payment
        String paymentNumber = generatePaymentNumber();
        Payment payment = new Payment(
                paymentNumber,
                bill,
                paymentAmount,
                request.paymentMethod(),
                request.transactionRef() != null ? request.transactionRef().trim() : null,
                user
        );
        payment.setStatus(PaymentStatus.SUCCESS);
        paymentRepository.save(payment);
        bill.addPayment(payment);

        // 2. Mark Bill as PAID
        bill.setStatus(BillStatus.PAID);
        bill.setPaidAt(LocalDateTime.now());
        if (request.notes() != null && !request.notes().isBlank()) {
            bill.setNotes(request.notes().trim());
        }

        // 3. Complete the Order atomically
        order.setStatus(OrderStatus.COMPLETED);
        orderRepository.save(order);

        Bill saved = billRepository.save(bill);
        log.info("Bill {} settled via {} for ₹{}. Order {} marked COMPLETED.",
                saved.getBillNumber(), request.paymentMethod(), paymentAmount, order.getOrderNumber());

        return BillResponse.from(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public BillResponse getBillById(Long billId) {
        Bill bill = billRepository.findByIdWithDetails(billId)
                .orElseThrow(() -> new ResourceNotFoundException("Bill not found with id: " + billId));
        return BillResponse.from(bill);
    }

    @Override
    @Transactional(readOnly = true)
    public BillResponse getBillByOrderId(Long orderId) {
        Bill bill = billRepository.findByOrderIdWithDetails(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Bill not found for order id: " + orderId));
        return BillResponse.from(bill);
    }

    @Override
    @Transactional(readOnly = true)
    public List<BillResponse> getBills(BillStatus status) {
        List<Bill> bills = (status != null)
                ? billRepository.findByStatusWithDetails(status)
                : billRepository.findAllWithDetails();

        return bills.stream()
                .map(BillResponse::from)
                .toList();
    }

    private String generateBillNumber() {
        int randomSuffix = ThreadLocalRandom.current().nextInt(100, 999);
        return "BILL-" + LocalDateTime.now().format(CODE_FMT) + "-" + randomSuffix;
    }

    private String generatePaymentNumber() {
        int randomSuffix = ThreadLocalRandom.current().nextInt(100, 999);
        return "PAY-" + LocalDateTime.now().format(CODE_FMT) + "-" + randomSuffix;
    }
}
