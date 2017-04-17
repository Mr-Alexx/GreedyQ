<?php
    header('content-type:application/json;charset=utf-8');
    $conn=mysqli_connect('localhost','root','','kaifanla_new');
    mysqli_query($conn,'set names utf8');