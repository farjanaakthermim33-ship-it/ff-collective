<?php

include "db.php";

$data = json_decode(file_get_contents("php://input"), true);

$id = $data["id"];
$status = $data["status"];

$sql = "UPDATE orders SET status = ? WHERE id = ?";

$stmt = $conn->prepare($sql);

$stmt->bind_param("si", $status, $id);

if ($stmt->execute()) {

    echo json_encode([
        "success" => true,
        "message" => "Order status updated successfully"
    ]);

} else {

    echo json_encode([
        "success" => false,
        "message" => "Failed to update order status"
    ]);

}

$stmt->close();
$conn->close();

?>