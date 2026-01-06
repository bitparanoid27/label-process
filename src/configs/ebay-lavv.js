const ebayLavvColumnConfig = {
  platformName: 'ebay_lavv',
  headers: {
    'Order number': 'platform_order_id',
    'Item number': 'order_item_id',
    'Sale date': 'sale_date',
    'Buyer username': 'buyer_username',
    'Buyer email': 'buyer_email',
    'Custom label': 'product_sku',
    'Item title': 'product_title',
    Quantity: 'product_quantity',
    'Sold for': 'unit_price',
    'Post to name': 'recipient_name',
    'Post to phone': 'recipient_phone_number',
    'Post to address 1': 'recipient_ship_address1',
    'Post to address 2': 'recipient_ship_address2',
    'Post to address 3': 'recipient_ship_address3',
    'Post to city': 'recipient_city',
    'Post to county': 'recipient_state',
    'Post to country': 'recipient_country',
    'Post to postcode': 'recipient_post_code',
    'Buyer note': 'delivery_instructions',
  },
};

module.exports = ebayLavvColumnConfig;
