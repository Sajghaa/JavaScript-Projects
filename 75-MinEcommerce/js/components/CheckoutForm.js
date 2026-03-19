export class CheckoutForm {
    constructor(stateManager, eventBus) {
        this.stateManager = stateManager;
        this.eventBus = eventBus;
    }

    render() {
        const cart = this.stateManager.get('cart');
        const subtotal = this.stateManager.getCartTotal();
        const shipping = subtotal >= 50 ? 0 : 5.99;
        const tax = subtotal * 0.08; // 8% tax
        const total = subtotal + shipping + tax;

        return `
            <div class="checkout-form">
                <div class="order-summary">
                    <h3>Order Summary</h3>
                    
                    <div class="summary-item">
                        <span>Subtotal (${this.getCartItemCount()} items)</span>
                        <span>$${subtotal.toFixed(2)}</span>
                    </div>
                    
                    <div class="summary-item">
                        <span>Shipping</span>
                        <span>${shipping === 0 ? 'Free' : '$' + shipping.toFixed(2)}</span>
                    </div>
                    
                    <div class="summary-item">
                        <span>Tax (8%)</span>
                        <span>$${tax.toFixed(2)}</span>
                    </div>
                    
                    <div class="summary-total">
                        <span>Total</span>
                        <span>$${total.toFixed(2)}</span>
                    </div>
                </div>
                
                <form id="checkoutForm" onsubmit="event.preventDefault(); app.checkoutManager.placeOrder()">
                    <div class="form-section">
                        <h3>Contact Information</h3>
                        
                        <div class="form-group">
                            <label for="email">Email Address</label>
                            <input type="email" id="email" name="email" required 
                                   placeholder="your@email.com">
                        </div>
                        
                        <div class="form-row">
                            <div class="form-group">
                                <label for="firstName">First Name</label>
                                <input type="text" id="firstName" name="firstName" required>
                            </div>
                            
                            <div class="form-group">
                                <label for="lastName">Last Name</label>
                                <input type="text" id="lastName" name="lastName" required>
                            </div>
                        </div>
                    </div>
                    
                    <div class="form-section">
                        <h3>Shipping Address</h3>
                        
                        <div class="form-group">
                            <label for="address">Street Address</label>
                            <input type="text" id="address" name="address" required>
                        </div>
                        
                        <div class="form-group">
                            <label for="apartment">Apartment, Suite, etc. (optional)</label>
                            <input type="text" id="apartment" name="apartment">
                        </div>
                        
                        <div class="form-row">
                            <div class="form-group">
                                <label for="city">City</label>
                                <input type="text" id="city" name="city" required>
                            </div>
                            
                            <div class="form-group">
                                <label for="state">State</label>
                                <select id="state" name="state" required>
                                    <option value="">Select State</option>
                                    <option value="AL">Alabama</option>
                                    <option value="AK">Alaska</option>
                                    <option value="AZ">Arizona</option>
                                    <option value="AR">Arkansas</option>
                                    <option value="CA">California</option>
                                    <option value="CO">Colorado</option>
                                    <option value="CT">Connecticut</option>
                                    <option value="DE">Delaware</option>
                                    <option value="FL">Florida</option>
                                    <option value="GA">Georgia</option>
                                    <option value="HI">Hawaii</option>
                                    <option value="ID">Idaho</option>
                                    <option value="IL">Illinois</option>
                                    <option value="IN">Indiana</option>
                                    <option value="IA">Iowa</option>
                                    <option value="KS">Kansas</option>
                                    <option value="KY">Kentucky</option>
                                    <option value="LA">Louisiana</option>
                                    <option value="ME">Maine</option>
                                    <option value="MD">Maryland</option>
                                    <option value="MA">Massachusetts</option>
                                    <option value="MI">Michigan</option>
                                    <option value="MN">Minnesota</option>
                                    <option value="MS">Mississippi</option>
                                    <option value="MO">Missouri</option>
                                    <option value="MT">Montana</option>
                                    <option value="NE">Nebraska</option>
                                    <option value="NV">Nevada</option>
                                    <option value="NH">New Hampshire</option>
                                    <option value="NJ">New Jersey</option>
                                    <option value="NM">New Mexico</option>
                                    <option value="NY">New York</option>
                                    <option value="NC">North Carolina</option>
                                    <option value="ND">North Dakota</option>
                                    <option value="OH">Ohio</option>
                                    <option value="OK">Oklahoma</option>
                                    <option value="OR">Oregon</option>
                                    <option value="PA">Pennsylvania</option>
                                    <option value="RI">Rhode Island</option>
                                    <option value="SC">South Carolina</option>
                                    <option value="SD">South Dakota</option>
                                    <option value="TN">Tennessee</option>
                                    <option value="TX">Texas</option>
                                    <option value="UT">Utah</option>
                                    <option value="VT">Vermont</option>
                                    <option value="VA">Virginia</option>
                                    <option value="WA">Washington</option>
                                    <option value="WV">West Virginia</option>
                                    <option value="WI">Wisconsin</option>
                                    <option value="WY">Wyoming</option>
                                </select>
                            </div>
                            
                            <div class="form-group">
                                <label for="zipCode">ZIP Code</label>
                                <input type="text" id="zipCode" name="zipCode" required pattern="\d{5}">
                            </div>
                        </div>
                    </div>
                    
                    <div class="form-section">
                        <h3>Payment Method</h3>
                        
                        <div class="payment-methods">
                            <label class="payment-option">
                                <input type="radio" name="payment" value="credit" checked>
                                <i class="fas fa-credit-card"></i>
                                Credit Card
                            </label>
                            
                            <label class="payment-option">
                                <input type="radio" name="payment" value="paypal">
                                <i class="fab fa-paypal"></i>
                                PayPal
                            </label>
                            
                            <label class="payment-option">
                                <input type="radio" name="payment" value="apple">
                                <i class="fab fa-apple-pay"></i>
                                Apple Pay
                            </label>
                        </div>
                        
                        <div class="credit-card-details">
                            <div class="form-group">
                                <label for="cardNumber">Card Number</label>
                                <input type="text" id="cardNumber" name="cardNumber" 
                                       placeholder="1234 5678 9012 3456" required>
                            </div>
                            
                            <div class="form-row">
                                <div class="form-group">
                                    <label for="expiry">Expiry Date</label>
                                    <input type="text" id="expiry" name="expiry" 
                                           placeholder="MM/YY" required>
                                </div>
                                
                                <div class="form-group">
                                    <label for="cvv">CVV</label>
                                    <input type="text" id="cvv" name="cvv" 
                                           placeholder="123" required>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <button type="submit" class="btn btn-primary btn-block">
                        Place Order • $${total.toFixed(2)}
                    </button>
                </form>
            </div>
        `;
    }

    getCartItemCount() {
        const cart = this.stateManager.get('cart');
        return cart.reduce((sum, item) => sum + item.quantity, 0);
    }
}