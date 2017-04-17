<?php
    require('init.php');
   @$phone=$_REQUEST['phone'] or die('{"code":-1,"msg":"phone is required!"}');
    $sql="SELECT kf_order.oid,kf_order.addr,kf_order.order_time,kf_order.user_name,kf_dish.img_sm,kf_dish.did FROM kf_dish,kf_order WHERE kf_order.phone='$phone' AND kf_order.did=kf_dish.did";
    $result=mysqli_query($conn,$sql);
    $row=mysqli_fetch_all($result,MYSQLI_ASSOC);
    if($row!=null){
        echo json_encode($row);
    }else
        echo json_encode(["code"=>-1,"msg"=>"error"]);