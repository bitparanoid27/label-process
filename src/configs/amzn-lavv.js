const amznLavvColumnConfig = {
  platformName: 'amzn_lavv',
  headers: {
    'order-id': 'platform_order_id',
    'order-item-id': 'order_item_id',
    'purchase-date': 'sale_date',
    'buyer-name': 'buyer_username',
    'buyer-email': 'buyer_email',
    sku: 'product_sku',
    'product-name': 'product_title',
    'quantity-purchased': 'product_quantity',
    'item-price': 'unit_price',
    'recipient-name': 'recipient_name',
    'ship-phone-number': 'recipient_phone_number',
    'ship-address-1': 'recipient_ship_address1',
    'ship-address-2': 'recipient_ship_address2',
    'ship-address-3': 'recipient_ship_address3',
    'ship-city': 'recipient_city',
    'ship-state': 'recipient_state',
    'ship-country': 'recipient_country',
    'ship-postal-code': 'recipient_post_code',
    'delivery-Instructions': 'delivery_instructions',
  },
};

module.exports = amznLavvColumnConfig;
