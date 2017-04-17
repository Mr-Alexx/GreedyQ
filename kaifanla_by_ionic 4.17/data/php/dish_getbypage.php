<?php
    require('init.php');
   @$start=$_REQUEST['start'];
   if(empty($start)){
    $start=1;
   }
   $count=5;
    $sql="SELECT * FROM kf_dish LIMIT $start,$count";
    $result=mysqli_query($conn,$sql);
    $row=mysqli_fetch_all($result,MYSQLI_ASSOC);
    if($row!=null){
        echo json_encode($row);
    }else{
        echo json_encode(["code"=>-1,"msg"=>"error"]);
       }