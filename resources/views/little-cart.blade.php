<?php
	$ses=session()->get('shopping_cart_'.$vendor->id);
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
	$cart_total=0;
	$VAT=0;
	$discount=0;
?>

@if(!empty($ses)) 
	@foreach($ses as $item)
		@php
			$id=$item["id"];
			$row_price=$item["quantity"]*$item["price"];
			$quantity=number2farsi($item["quantity"]);
			$cart_total+=$row_price;
			if($vendor->VAT==true)
				$VAT=($cart_total*9)/100;
			if($vendor->discount >0)
				$discount=($cart_total * $vendor->discount)/100;
			$after_cart_total=($cart_total + $VAT) - $discount;
		@endphp
		<div class="col-md-12 col-sm-12 col-xs-12">
			<div class="little-cart-container">
				<div class="col-md-8 col-sm-9 col-xs-8 text-right food-name">{{$item["name"]}}</div>
				<div class="col-md-2 col-sm-2 col-xs-2 text-left food-quantity"><span class="badge">{{$quantity}}</span></div>
				<div class="col-md-1 col-sm-1 col-xs-1 text-right food-remove"><a onClick="cartAction('remove','{{$vendor->id}}','{{$id}}')"><i class="icon-trash"></i></a></div>
				<div class="col-md-12 col-sm-12 col-xs-12 food-price">{{number2farsi($row_price)}} ریال</div>
			</div>
		</div>
	@endforeach	
	<div class="col-md-12 col-sm-12 col-xs-12 my-calc">
		<div class="col-md-5 col-sm-6 col-xs-5 c1">مجموع سفارش</div>
		<div class="col-md-7 col-sm-6 col-xs-7 c2">{{number2farsi($cart_total)}} ریال</div>
		@if($vendor->VAT==true)
			<div class="col-md-6 col-sm-6 col-xs-6 c1">+ مالیات ({{number2farsi('9')}}%)</div>
			<div class="col-md-6 col-sm-6 col-xs-6 c2">{{number2farsi($VAT)}} ریال</div>
		@endif
		
		@if($vendor->discount >0)
			<div class="col-md-5 col-sm-6 col-xs-5 c1">- تخفیف</div>
			<div class="col-md-7 col-sm-6 col-xs-7 c2">{{number2farsi($discount)}} ریال</div>
		@endif
	</div>
	<div class="col-md-12">
		<div class="final-price">
			<div class="col-md-5 col-sm-6 col-xs-5">مبلغ نهایی</div>
			<div class="col-md-7 col-sm-6 col-xs-7 text-left" style="color:#16a085;margin-bottom:10px;">{{number2farsi($after_cart_total)}} ریال</div>
		</div>
	</div>
	<form action="{{url('cart')}}" method="get">
		{{ csrf_field() }}
		<input type="hidden" name="vendor_id" value="{{$vendor->id}}">
		@if($vendor->min_order < $cart_total)
			<center><input type="submit" class="btn btn-sm btn-success my-check" value="بررسی نهایی"></center>
		@else
			<center><h5><span class="label my-label soldout">حداقل سفارش، {{number2farsi($vendor->min_order)}} ریال</span></h5></center>
		@endif
	</form>
		
@else
	<div class="cart-empty">
		<i class="icon-shopping-cart"></i><br>
		سبد خرید شما خالی است
	</div>
@endif
