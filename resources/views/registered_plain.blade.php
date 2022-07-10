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
@extends('layouts.mail')
@section('title', '- صفحه خرید مهمان')
@section('content')
	<div class="col-md-12" style="direction:rtl;">
		<h4>ثبت سفارش در وب سایت راحت فود با موفقیت انجام شد، به زودی با شما تماس گرفته خواهد شد</h4>
		<h4>نام و نام خانوادگی مشتری: {{$order["customer_name"]}}</h4>
		<h4>شماره تلفن همراه مشتری: {{number2farsi2($order["customer_phone"])}}</h4>
		<h4>آدرس مشتری: {{$order["customer_address"]}}</h4>
		<h4>مبلغ نهایی سفارش: {{number2farsi($order["cart_total"])}} ریال</h4>
		<h4>تحویل سفارش توسط: {{$vendor->name}}</h4>
		<h4>آدرس رستوران: {{$vendor->address}}
		@if($order["payment_method"]=="online")
			<h4>تسویه صورتحساب: آنلاین</h4>
		@else
			<h4>تسویه صورتحساب: درب منزل</h4>
		@endif
		<div style="color:#e74c3c;"><strong>کد رهگیری:</strong> {{number2farsi2($basket_id)}}</div>
		<h4 style="color:#e74c3c;">توجه: کد رهگیری را تا هنگام دریافت سفارش نزد خود نگهدارید</h4>
		<h5>در صورتی که به عنوان مهمان سفارش خود را ثبت نموده اید، می توانید با کمک کد رهگیری وضعیت سفارش خود را بررسی نمایید</h5>
	</div>
@endsection	