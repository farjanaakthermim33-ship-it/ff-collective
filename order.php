<?php

include "db.php";

$data = json_decode(file_get_contents("php://input"), true);

$name = $data["name"];
$email = $data["email"];
$phone = $data["phone"];
$address = $data["address"];
$items = json_encode($data["items"]);
$payment_method = $data["payment_method"];
$transaction_id = $data["transaction_id"];
$product_total = $data["product_total"];
$delivery_charge = $data["delivery_charge"];
$grand_total = $data["grand_total"];

$sql = "INSERT INTO orders 
        (name, email, phone, address, items, payment_method, transaction_id, product_total, delivery_charge, grand_total)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";

$stmt = $conn->prepare($sql);

$stmt->bind_param(
    "sssssssddd",
    $name,
    $email,
    $phone,
    $address,
    $items,
    $payment_method,
    $transaction_id,
    $product_total,
    $delivery_charge,
    $grand_total
);

if ($stmt->execute()) {

    echo json_encode([
        "success" => true,
        "message" => "Order placed successfully"
    ]);

} else {

    echo json_encode([
        "success" => false,
        "message" => "Failed to place order"
    ]);
}

$stmt->close();
$conn->close();

?>