/**
 * Created by bjwsl-001 on 2017/4/13.
 */
var app = angular.module('kaifanla', ['ionic']);
//配置路由
app.config(function($stateProvider,$urlRouterProvider){
    $stateProvider
        .state('commen',{
            templateUrl:'tpl/commen.html',
            url:'/commen',
            controller:'commenCtrl'
        })
        .state('start',{
            templateUrl:'tpl/start.html',
            url:'/start'
        })
        .state('commen.main',{
            templateUrl:'tpl/main.html',
            url:'/main',
            controller:'mainCtrl'
        })
        .state('commen.detail',{
            templateUrl:'tpl/detail.html',
            url:'/detail/:id',
            controller:'detailCtrl'
        })
        .state('commen.order',{
            templateUrl:'tpl/order.html',
            url:'/order/:cartDetail',
            controller:'orderCtrl'
        })
        .state('commen.myorder',{
            templateUrl:'tpl/myorder.html',
            url:'/myorder',
            controller:'myorderCtrl'
        })
        .state('commen.cart',{
            templateUrl:'tpl/cart.html',
            url:'/cart',
            controller:'cartCtrl'
        })
        .state('login',{
            templateUrl:'tpl/login.html',
            url:'/login',
            controller:'loginCtrl'
        })
    $urlRouterProvider.otherwise('/start');//重定向

});
app.controller('myCtrl',['$scope','$ionicModal','$state','$http','$ionicSideMenuDelegate',function($scope,$ionicModal,$state,$http,$ionicSideMenuDelegate){
        //跳转方法,要发送数据，需要添加argument参数
        $scope.jump=function(state,argument){
            $state.go(state,argument);
        }

    $scope.num=9;
    //go back方法
    $scope.goBack=function(){//go back function
        //$ionicHistory.goBack();//it can not work;
        //window.history.back();//it works;
        window.history.go(-1);//it works;
        //$ionicHistory.backView().back();it can not work;
    }

    //footer下menu按钮方法
    $scope.menu=function(){
        $ionicSideMenuDelegate.toggleLeft();

    }

    //封装自定义弹窗方法
    $ionicModal.fromTemplateUrl('tpl/aboutUsModal.html',{
        scope:$scope//把$scope传进$ionicModal中
    })
    .then(function(modal){
        $scope.modal1=modal
    })

    $ionicModal.fromTemplateUrl('tpl/exitModal.html',{
        scope:$scope//把$scope传进$ionicModal中
    })
        .then(function(modal){
            $scope.modal2=modal
        })

    //调用自定义弹窗方法
    $scope.aboutUsModal=function(){
        $ionicSideMenuDelegate.toggleLeft();
        $scope.modal1.show();
    }
    //关闭自定义弹窗方法
    $scope.closeAboutUsModal=function(){
        $scope.modal1.hide();
    }
    //调用弹窗exit
    $scope.exitModal=function(){
        $ionicSideMenuDelegate.toggleLeft();
        $scope.modal2.show();
    }
    $scope.closeExitModal=function(){
        $scope.modal2.hide();
        $scope.jump('commen.main')
    }

}])

//commenCtrl
app.controller('commenCtrl',['$scope',function($scope){
    //购物车的数量
    $scope.cartNum={cartTotalNum:0};
}])

//很多地方都用到的，可以封装成服务，注入服务去使用
app.service('$customHttp',['$http','$ionicLoading',function($http,$ionicLoading){
    this.get=function(url,handleSucc){
        $ionicLoading.show({
            template:'loading...',
            duration:500
        });
        $http
            .get(url)
            .success(function(data){
               $ionicLoading.hide();
                handleSucc(data);//处理返回data的方法
            })
    }
}]);
//主页面控制器
app.controller('mainCtrl',['$scope','$customHttp',function($scope,$customHttp){
    $scope.dishList=[];//用于存放获取数据
    $scope.hasMore=true;
    $scope.canSearchMore=false;
    //初始化方法
   function init(){
       $customHttp.get('data/php/dish_getbypage.php',function(data){
           $scope.dishList=data;
       });
   }
    init();
    //封装加载更多方法 判断canSearchMore的值决定请求的url
    $scope.loadMore=function() {
        if($scope.canSearchMore==true) {
            var url = 'data/php/dish_getbypage.php?start=' + $scope.dishList.length;
        }else{
            var url='data/php/dish_getbykw.php?kw='+$scope.inputTxt.kw+'&start='+$scope.dishList.length;
        }
        $customHttp.get(url, function (data) {
            if (data.length < 5) {
                $scope.hasMore = false;
            } else {
                $scope.hasMore = true;
            }
            $scope.dishList = $scope.dishList.concat(data);
            $scope.$broadcast('scroll.infiniteScrollComplete')
        })
    };

    //监听kw的变化，与ng有些变化，kw放在对象inputTxt中
    $scope.inputTxt={kw:''};
    $scope.$watch('inputTxt.kw',function(){
        if($scope.inputTxt.kw){
            $scope.canSearchMore=false;
            $customHttp.get('data/php/dish_getbykw.php?kw='+$scope.inputTxt.kw,function(data){
                $scope.dishList=data;
            })
        }else{
            $scope.canSearchMore=true;
            init();
        }
    })
}])

//detail页面控制器
app.controller('detailCtrl',['$scope','$stateParams','$customHttp','$ionicPopup',function($scope,$stateParams,$customHttp,$ionicPopup){
    $customHttp.get('data/php/dish_getbyid.php?id='+$stateParams.id,function(data){
        $scope.dish=data[0];
    })
    console.log($scope.cartNum)
    //发送uid给购物车页面方法,先判断用户是否登录
    $scope.addToCart=function(){
       if(sessionStorage.getItem('userid')){//存在用户则可以加入购物车
           $customHttp.get('data/php/cart_update.php?uid=1&did='+$scope.dish.did+'&count=-1',function(data){
               //console.log(data)
               if(data.msg=='succ'){
                   $scope.cartNum.cartTotalNum++;
                   $ionicPopup.alert({
                       template:'添加成功!'
                   })
               }
           })
       }else{
           $ionicPopup.alert({
               template:'您还没登录，请先登录'
           })
               .then(function(){
                   $scope.jump('login')
               })
       }
    }
}]);

//order页面控制器
app.controller('orderCtrl',['$scope','$stateParams','$customHttp','$httpParamSerializerJQLike','$interval',function($scope,$stateParams,$customHttp,$httpParamSerializerJQLike,$interval){

    //console.log($stateParams.cartDetail);
    var totalPrice=0;
    //解码json格式数据再遍历拿数据，计算价格
    angular.forEach(angular.fromJson($stateParams.cartDetail),function(value,key){
        totalPrice+=value.price*value.dishCount;
    })
    //console.log(totalPrice)
    $scope.order={userid:1,cartDetail:$stateParams.cartDetail,
    totalPrice:totalPrice};
    //id存在sessionStorage中
    sessionStorage.setItem('userid',1);
    console.log($scope.order);
    $scope.submitOrder=function(){
        var result=$httpParamSerializerJQLike($scope.order);
        //console.log(result)
        $customHttp.get('data/php/order_add.php?'+result,function(data){
            console.log(data)
            if(data.length>0){//如果返回的数据不为空
                if(data[0].msg=='succ'){//如果返回的是成功的数据
                    $scope.msgSucc='恭喜您，下单成功。订单编号为：'+data[0].oid;
                    $scope.cartNum.cartTotalNum=0;//清空购物车
                    //console.log($scope.msgSucc);
                    //3秒后跳转到个人主页
                    $scope.second=3;
                    $interval(function(){
                        $scope.second--;
                        if($scope.second==0)
                            $scope.jump('commen.myorder')
                    },1000)
                    sessionStorage.setItem('phone',$scope.order.phone)
                }
                else{
                    $scope.msgErr='下单失败！'
                }
            }
        })
    }
}]);

//myorder页面控制器
app.controller('myorderCtrl',['$scope','$customHttp','$interval',function($scope,$customHttp,$interval){
    //console.log(phone);
    var userid=sessionStorage.getItem('userid');
    $scope.hasUser=true;
    $scope.seconds=3;
    if(userid==null){//如果用户没登录
        $scope.hasUser=false;
        var timer2=$interval(function(){
            $scope.seconds--;
            if($scope.seconds==0){
                $interval.cancel(timer2);
                $scope.jump('login');
            }
        },1000);

    }else{
        $scope.hasUser=true;
        $customHttp.get('data/php/order_getbyuserid.php?userid='+userid,function(data){
            //console.log(data)
            $scope.orderList=data.data;
        });
    }

}]);

//购物车控制器
app.controller('cartCtrl',['$scope','$customHttp','$ionicPopup',function($scope,$customHttp,$ionicPopup){
    console.log('购物车')
    $customHttp.get('data/php/cart_select.php?uid=1',function(data){
        //console.log(data)
        $scope.cartList=data.data;//由于返回的是对象，对象的data里面存着我们的数据数组
        //进入购物车是，将服务器返回的所有数据的数量累加
        //赋值给cartTotalNum
        angular.forEach($scope.cartList,function(value,key){
            $scope.cartNum.cartTotalNum+=parseFloat(value.dishCount);
        })
    })

    //总计函数
    $scope.sumAll=function(){
        var sum=0;
        angular.forEach($scope.cartList,function(value,key){
            sum+=value.price*value.dishCount;
        })
        return  sum;
    }

    //编辑按钮
    $scope.editTxt='编辑';
    $scope.editEnable=false;
    $scope.edit=function(){
        $scope.editEnable=!$scope.editEnable;
        if($scope.editEnable){
            $scope.editTxt='完成';
        }else{
            $scope.editTxt='编辑';
        }
    }

    //删除按钮
    $scope.cartDelete=function(index){
        $ionicPopup.confirm({
            template:'确定删除该商品？'
        }).then(function(returnMsg){
            if(returnMsg){
                //console.log($scope.cartList)
                $customHttp.get('data/php/cart_update.php?uid='+sessionStorage.getItem('userid')+'&did='+$scope.cartList[index].did+'&count=-2',function(data){//服务器请求成功才删除页面中的
                    console.log(data)
                    $scope.cartList.splice(index,1);
                })
            }
        })
    }

    //添加方法
    $scope.add=function(index){
        $scope.cartList[index].dishCount++;
        $customHttp.get('data/php/cart_update.php?uid=1&did='+$scope.cartList[index].did+'&count='+$scope.cartList[index].dishCount,function(data){
            //console.log(data)
        })
    }
    //减少方法
    $scope.minus=function(index){
        $scope.cartList[index].dishCount--;
        if($scope.cartList[index].dishCount<1){
            return $scope.cartList[index].dishCount=1;
        }else{//否则添加到数据库中
            $customHttp.get('data/php/cart_update.php?uid=1&did='+$scope.cartList[index].did+'&count='+$scope.cartList[index].dishCount,function(data){
                //console.log(data)
            })
        }
    }

    //跳转到order页面方法
    $scope.jumpToOrder=function(){
        //将购物车返回的数据转换成json格式数据发送给order页面
        var result=angular.toJson($scope.cartList)
        $scope.jump('commen.order',{cartDetail:result})
    }
}])

//登录控制器
app.controller('loginCtrl',['$scope','$ionicHistory','$customHttp','$ionicPopup',function($scope,$ionicHistory,$customHttp,$ionicPopup){
    //$scope.goBack=function(){//go back function
    //    //$ionicHistory.goBack();//it can not work;
    //    //window.history.back();//it works;
    //    window.history.go(-1);//it works;
    //    //$ionicHistory.backView().back();it can not work;
    //}
    $scope.cancelLogin=function(){//cancel login
        $scope.jump('commen.main');
    }

    //login verify
    $scope.inputTxt={};//先给其定义一个空对象，必须
    $scope.loginSubmit=function(){
        //console.log($scope.inputTxt)
        //$scope.$watch('inputTxt.userName',function(){
        //    console.log($scope.inputTxt.userName);
        //})
        //判断用户名或者密码是否为空
        if($scope.inputTxt.userName=='' || $scope.inputTxt.userPwd==undefined || $scope.inputTxt.userPwd=='' || $scope.inputTxt.userPwd==undefined){
            $ionicPopup.alert({
                template:'用户名和密码不能为空'
            })
            return;
        }else{
            $customHttp.get('data/php/login.php?userName='+$scope.inputTxt.userName+'&userPwd='+$scope.inputTxt.userPwd,function(data){
                console.log(data)
                if(data.code){
                    $scope.errMsg=data.msg;
                }else{
                    sessionStorage.setItem('userid',data[0].userid);
                    console.log(data[0].userid)
                    $scope.jump('commen.myorder');
                }
            })
        }
    }
}])
