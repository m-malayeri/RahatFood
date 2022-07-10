<?php
	function number2farsi($string){
		$en_num = array("0" ,"1" ,"2" ,"3" ,"4" ,"5" ,"6" ,"7" ,"8" ,"9" );
		$fa_num = array("۰","۱","۲","۳","۴","۵","۶","۷","۸","۹");
		$string=number_format($string, 0, ',', ',');
		return str_replace($en_num, $fa_num, $string);
	}
	function number2farsi2($string){
		$en_num = array("0" ,"1" ,"2" ,"3" ,"4" ,"5" ,"6" ,"7" ,"8" ,"9" );
		$fa_num = array("۰","۱","۲","۳","۴","۵","۶","۷","۸","۹");
		return str_replace($en_num, $fa_num, $string);
	}	
?>
	
@extends('layouts.internal')
@section('title', '- صفحه خرید مهمان')
@section('content')
	<div class="row">
		<div class="col-md-6 col-md-offset-3">
			<div class="row guest-order">
				<div class="alert alert-success well-sm" role="alert">ثبت سفارش با موفقیت انجام شد، به زودی با شما تماس گرفته خواهد شد</div>
				@if($order["payment_method"]=="online")
					<div class="alert alert-warning well-sm" role="alert">کاربر گرامی، جهت ارسال سفارش، صورتحساب آن را از طریق این فرم پرداخت نمایید</div>
				@endif
				<div class="col-md-12">
					<div class="col-md-1 col-sm-1 hidden-xs panel-pad-sign"><i class="icon-user"></i></div>
					<div class="col-md-11 col-sm-11 col-xs-12 panel-pad-data">{{$order["customer_name"]}}</div>
				</div>
				<div class="col-md-12">
					<div class="col-md-1 col-sm-1 hidden-xs panel-pad-sign"><i class="icon-phone icon-flip-horizontal"></i></div>
					<div class="col-md-11 col-sm-11 col-xs-12 panel-pad-data">{{number2farsi2($order["customer_phone"])}}</div>
				</div>
				<div class="col-md-12">
					<div class="col-md-1 col-sm-1 hidden-xs panel-pad-sign"><i class="icon-home"></i></div>
					<div class="col-md-11 col-sm-11 col-xs-12 panel-pad-data">{{$order["customer_address"]}}</div>
				</div>
				<div class="col-md-12">
					<div class="col-md-1 col-sm-1 hidden-xs panel-pad-sign"><i class="icon-usd"></i></div>
					<div class="col-md-11 col-sm-11 col-xs-12 panel-pad-data">{{number2farsi($order["cart_total"])}} ریال</div>
				</div>
				<div class="col-md-12">
					<div class="col-md-1 col-sm-1 hidden-xs panel-pad-sign"><i class="icon-food"></i></div>
					<div class="col-md-11 col-sm-11 col-xs-12 panel-pad-data">تحویل سفارش توسط: {{$vendor->name}}</div>
				</div>
				<div class="col-md-12">
					<div class="col-md-1 col-sm-1 hidden-xs panel-pad-sign"><i class="icon-map-marker"></i></div>
					<div class="col-md-11 col-sm-11 col-xs-12 panel-pad-data">آدرس رستوران: {{$vendor->address}}</div>
				</div>
				<div class="col-md-12">
					<div class="col-md-1 col-sm-1 hidden-xs panel-pad-sign"><i class="icon-info"></i></div>
					@if($order["payment_method"]=="online")
						<div class="col-md-11 col-sm-11 col-xs-12 panel-pad-data">تسویه صورتحساب: آنلاین</div>
					@else
						<div class="col-md-11 col-sm-11 col-xs-12 panel-pad-data">تسویه صورتحساب: درب منزل</div>
					@endif
				</div>
				<div class="col-md-12">
					<div class="col-md-1 col-sm-1 hidden-xs panel-pad-sign" style="color:#e74c3c;"><i class="icon-key icon-flip-horizontal"></i></div>
					<div class="col-md-11 col-sm-11 col-xs-12 panel-pad-data" style="color:#e74c3c;"><strong>کد رهگیری:</strong> {{number2farsi2($basket_id)}}</div>
				</div>			
				<br><h6 style="color:#e74c3c; padding-right:30px;">توجه: کد رهگیری را تا هنگام دریافت سفارش نزد خود نگهدارید</h6>				
				<a href="{{url('/home')}}" style="float:left;"><button class="btn btn-md btn-danger my-checkout">خانه <i class="icon-arrow-left"></i></button></a>
			</div>
		</div>
	</div>
@endsection