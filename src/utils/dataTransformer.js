/* Function to convert the flat object into db insertion ready object */

const dbOrderTransformer = mappedObjForDb => {
  const ordersMap = {};
  /*   const transformedData = mappedObjForDb.map(mappedObjForDbRow => {
    let id = mappedObjForDbRow['platform_order_id'];

    if (!ordersMap[id]) {
      (ordersMap[id] = {
        platform_order_id: mappedObjForDbRow['platform_order_id'],
        sale_date: new Date(mappedObjForDbRow['sale_date']),
        buyer_username: mappedObjForDbRow['buyer_username'],
        buyer_email: mappedObjForDbRow['buyer_email'],
        recipient_name: mappedObjForDbRow['recipient_name'],
        recipient_phone_number: mappedObjForDbRow['recipient_phone_number'],
        recipient_email_address: mappedObjForDbRow['recipient_email_address'],
        recipient_ship_address1: mappedObjForDbRow['recipient_ship_address1'],
        recipient_ship_address2: mappedObjForDbRow['recipient_ship_address2'],
        recipient_ship_address3: mappedObjForDbRow['recipient_ship_address3'],
        recipient_city: mappedObjForDbRow['recipient_city'],
        recipient_state: mappedObjForDbRow['recipient_state'],
        recipient_country: mappedObjForDbRow['recipient_country'],
        recipient_post_code: mappedObjForDbRow['recipient_post_code'],
        delivery_instructions: mappedObjForDbRow['delivery_instructions'],
        order_items: [],
        data_dump: [],
      }),
        ordersMap[id].order_items.push({
          order_item_id: mappedObjForDbRow['order_item_id'],
          product_title: mappedObjForDbRow['product_title'],
          product_quantity: parseInt(mappedObjForDbRow['product_quantity']),
          product_sku: mappedObjForDbRow['product_sku'],
          unit_price: mappedObjForDbRow['unit_price'],
        });
      ordersMap[id].data_dump.push({
        platform_order_id: mappedObjForDbRow['platform_order_id'],
        raw_data: mappedObjForDbRow['raw_data'],
      });
    }
  });
  // console.log(Object.values(ordersMap));
  let prismaReadyObject = Object.values(ordersMap);
  return prismaReadyObject; */

  const transformedDataModified = mappedObjForDb.forEach(row => {
    let id = row['platform_order_id'];

    if (!id) return;

    if (!ordersMap[id]) {
      ordersMap[id] = {
        platform_order_id: id,
        sale_date: new Date(row['sale_date']),
        buyer_username: row['buyer_username'],
        buyer_email: row['buyer_email'],
        recipient_name: row['recipient_name'],
        recipient_phone_number: row['recipient_phone_number'],
        recipient_email_address: row['recipient_email_address'],
        recipient_ship_address1: row['recipient_ship_address1'],
        recipient_ship_address2: row['recipient_ship_address2'],
        recipient_ship_address3: row['recipient_ship_address3'],
        recipient_city: row['recipient_city'],
        recipient_state: row['recipient_state'],
        recipient_country: row['recipient_country'],
        recipient_post_code: row['recipient_post_code'],
        delivery_instructions: row['delivery_instructions'],
        order_items: [],
        data_dump: [],
      };
    }

    const currentOrder = ordersMap[id];
    const hasProductTitle = row['product_title'] && row['product_title'].trim() !== '';
    const hasProductSku = row['product_sku'] && row['product_sku'].trim() !== '';

    if (hasProductTitle || hasProductSku) {
      currentOrder.order_items.push({
        order_item_id: row['order_item_id'],
        product_title: row['product_title'],
        product_sku: row['product_sku'],
        product_quantity: parseInt(row['product_quantity']),
        unit_price: row['unit_price'],
      });
    }

    currentOrder.data_dump.push({
      platform_order_id: row['platform_order_id'],
      raw_data: row['raw_data'] || row,
    });
  });

  console.log(ordersMap);
  return Object.values(ordersMap);
};

module.exports = dbOrderTransformer;
