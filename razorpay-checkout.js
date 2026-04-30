// ===== RAZORPAY CHECKOUT — Grail Plug Supply =====
// Handles order creation → payment modal → verification flow.

const RazorpayCheckout = {

  /**
   * Start the full Razorpay payment flow.
   * @param {Object} opts
   * @param {number} opts.amount   — Total in ₹ (rupees, NOT paise)
   * @param {string} opts.name     — Customer name
   * @param {string} opts.email    — Customer email
   * @param {Array}  opts.items    — Cart items array
   * @param {Function} opts.onSuccess — Called with { paymentId, orderId } on verified payment
   * @param {Function} opts.onFailure — Called with error message string
   */
  async startPayment({ amount, name, email, items, onSuccess, onFailure }) {
    const amountPaise = Math.round(amount * 100);

    if (amountPaise < 100) {
      onFailure && onFailure('Minimum payable amount is ₹1.');
      return;
    }

    // ── Step 1: Create order on backend ──────────────────────────────────
    let orderData;
    try {
      const res = await fetch('/api/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: amountPaise,
          currency: 'INR',
          receipt: `grail_${Date.now()}`
        })
      });

      orderData = await res.json();

      if (!res.ok) {
        throw new Error(orderData.error || 'Failed to create order.');
      }
    } catch (err) {
      console.error('Create order error:', err);
      onFailure && onFailure(err.message || 'Could not initiate payment. Please try again.');
      return;
    }

    // ── Step 2: Open Razorpay modal ──────────────────────────────────────
    const options = {
      key: orderData.key_id,
      amount: orderData.amount,
      currency: orderData.currency,
      order_id: orderData.order_id,
      name: 'Grail Plug Supply',
      description: `${items.length} item${items.length > 1 ? 's' : ''} — Archive Grails`,
      image: 'images/logo.png',
      prefill: {
        name: name || '',
        email: email || ''
      },
      config: {
        display: {
          blocks: {
            upi: {
              name: 'Pay via UPI',
              instruments: [
                { method: 'upi', flows: ['collect', 'intent'] }
              ]
            }
          },
          sequence: ['block.upi', 'block.other'],
          preferences: { show_default_blocks: true }
        }
      },
      theme: {
        color: '#000000',
        backdrop_color: 'rgba(0,0,0,0.85)'
      },
      modal: {
        ondismiss: function () {
          console.log('Payment cancelled by user.');
          onFailure && onFailure('Payment cancelled.');
        }
      },
      handler: async function (response) {
        // ── Step 3: Verify signature on backend ──────────────────────────
        try {
          const verifyRes = await fetch('/api/verify-payment', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature
            })
          });

          const result = await verifyRes.json();

          if (verifyRes.ok && result.verified) {
            onSuccess && onSuccess({
              paymentId: result.payment_id,
              orderId: result.order_id
            });
          } else {
            throw new Error(result.error || 'Signature verification failed.');
          }
        } catch (err) {
          console.error('Verify payment error:', err);
          onFailure && onFailure('Payment received but verification failed. Please contact support.');
        }
      }
    };

    // Handle payment.failed event
    const rzp = new Razorpay(options);
    rzp.on('payment.failed', function (response) {
      console.error('Payment failed:', response.error);
      const msg = response.error?.description || 'Payment failed. Please try again.';
      onFailure && onFailure(msg);
    });

    rzp.open();
  }
};
