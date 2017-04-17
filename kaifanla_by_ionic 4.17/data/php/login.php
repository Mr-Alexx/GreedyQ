<?php
//    传入username和pwd，判断数据库中是否存在该用户，
//    有则
//      判断密码是否匹配
//        匹配则返回json数据
//        不匹配则返回["code"=>-1,"msg"=>"密码不正确"]
//    没有则返回错误信息["code"=>-1,"msg"=>"该用户不存在"]

    @$userName=$_REQUEST['userName'];
    @$userPwd=$_REQUEST['userPwd'];
    $sql1="SELECT * from kf_users WHERE uname='$userName'";
    require('init.php');
    $result1=mysqli_query($conn,$sql1);
    $row1=mysqli_fetch_all($result1,MYSQLI_ASSOC);
    if($row1){
        $sql2="SELECT * FROM kf_users WHERE uname='$userName' AND pwd=$userPwd";
        $result2=mysqli_query($conn,$sql2);
        $row2=mysqli_fetch_all($result2,MYSQLI_ASSOC);
        if($row2){
            echo json_encode($row2);
        }else{
            $msg=["code"=>-2,"msg"=>"密码不正确"];
            echo json_encode($msg);
        }
    }else{
        $msg=["code"=>-1,"msg"=>"该用户不存在"];
        echo json_encode($msg);
    }
