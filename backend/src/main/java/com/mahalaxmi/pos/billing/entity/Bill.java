package com.mahalaxmi.pos.billing.entity;

import com.mahalaxmi.pos.order.entity.Order;
import com.mahalaxmi.pos.user.entity.User;
import jakarta.persistence.*;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "bills")
public class Bill {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "bill_number", nullable = false, unique = true, length = 40)
    private String billNumber;

    @OneToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "order_id", nullable = false, unique = true)
    private Order order;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal subtotal = BigDecimal.ZERO;

    @Column(name = "discount_amount", nullable = false, precision = 10, scale = 2)
    private BigDecimal discountAmount = BigDecimal.ZERO;

    @Column(name = "tax_amount", nullable = false, precision = 10, scale = 2)
    private BigDecimal taxAmount = BigDecimal.ZERO;

    @Column(name = "final_amount", nullable = false, precision = 10, scale = 2)
    private BigDecimal finalAmount = BigDecimal.ZERO;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private BillStatus status = BillStatus.UNPAID;

    @Column(length = 500)
    private String notes;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "created_by")
    private User createdBy;

    @OneToMany(mappedBy = "bill", cascade = CascadeType.ALL, orphanRemoval = true)
    private java.util.Set<Payment> payments = new java.util.LinkedHashSet<>();

    @Column(name = "paid_at")
    private LocalDateTime paidAt;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }

    public Bill() {
    }

    public Bill(String billNumber, Order order, BigDecimal subtotal, BigDecimal discountAmount, BigDecimal taxAmount, User createdBy) {
        this.billNumber = billNumber;
        this.order = order;
        this.subtotal = (subtotal != null) ? subtotal.setScale(2, RoundingMode.HALF_UP) : BigDecimal.ZERO;
        this.discountAmount = (discountAmount != null) ? discountAmount.setScale(2, RoundingMode.HALF_UP) : BigDecimal.ZERO;
        this.taxAmount = (taxAmount != null) ? taxAmount.setScale(2, RoundingMode.HALF_UP) : BigDecimal.ZERO;
        this.createdBy = createdBy;
        recalculateFinalAmount();
    }

    public void recalculateFinalAmount() {
        BigDecimal sub = (this.subtotal != null) ? this.subtotal : BigDecimal.ZERO;
        BigDecimal disc = (this.discountAmount != null) ? this.discountAmount : BigDecimal.ZERO;
        BigDecimal tax = (this.taxAmount != null) ? this.taxAmount : BigDecimal.ZERO;
        this.finalAmount = sub.subtract(disc).add(tax).max(BigDecimal.ZERO).setScale(2, RoundingMode.HALF_UP);
    }

    public void addPayment(Payment payment) {
        this.payments.add(payment);
        payment.setBill(this);
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getBillNumber() {
        return billNumber;
    }

    public void setBillNumber(String billNumber) {
        this.billNumber = billNumber;
    }

    public Order getOrder() {
        return order;
    }

    public void setOrder(Order order) {
        this.order = order;
    }

    public BigDecimal getSubtotal() {
        return subtotal;
    }

    public void setSubtotal(BigDecimal subtotal) {
        this.subtotal = subtotal;
        recalculateFinalAmount();
    }

    public BigDecimal getDiscountAmount() {
        return discountAmount;
    }

    public void setDiscountAmount(BigDecimal discountAmount) {
        this.discountAmount = discountAmount;
        recalculateFinalAmount();
    }

    public BigDecimal getTaxAmount() {
        return taxAmount;
    }

    public void setTaxAmount(BigDecimal taxAmount) {
        this.taxAmount = taxAmount;
        recalculateFinalAmount();
    }

    public BigDecimal getFinalAmount() {
        return finalAmount;
    }

    public void setFinalAmount(BigDecimal finalAmount) {
        this.finalAmount = finalAmount;
    }

    public BillStatus getStatus() {
        return status;
    }

    public void setStatus(BillStatus status) {
        this.status = status;
    }

    public String getNotes() {
        return notes;
    }

    public void setNotes(String notes) {
        this.notes = notes;
    }

    public User getCreatedBy() {
        return createdBy;
    }

    public void setCreatedBy(User createdBy) {
        this.createdBy = createdBy;
    }

    public java.util.Set<Payment> getPayments() {
        return payments;
    }

    public void setPayments(java.util.Set<Payment> payments) {
        this.payments = payments;
    }

    public LocalDateTime getPaidAt() {
        return paidAt;
    }

    public void setPaidAt(LocalDateTime paidAt) {
        this.paidAt = paidAt;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }
}
