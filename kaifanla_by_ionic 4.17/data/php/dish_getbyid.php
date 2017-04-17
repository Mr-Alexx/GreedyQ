<?php
    require('init.php');
   @$id=$_REQUEST['id'] or die('{"code":-1,"msg":"id is required!"}');
    $sql="SELECT * FROM kf_dish WHERE did=$id";
    $result=mysqli_query($conn,$sql);
    $row=mysqli_fetch_all($result,MYSQLI_ASSOC);
    if($row!=null){
        echo json_encode($row);
    }else
        echo json_encode(["code"=>-1,"msg"=>"error"]);