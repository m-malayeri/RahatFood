<?php
	function number2farsi2($string){
		$en_num = array("0" ,"1" ,"2" ,"3" ,"4" ,"5" ,"6" ,"7" ,"8" ,"9" );
		$fa_num = array("۰","۱","۲","۳","۴","۵","۶","۷","۸","۹");
		return str_replace($en_num, $fa_num, $string);
	}
	function number2farsi($string){
		$en_num = array("0" ,"1" ,"2" ,"3" ,"4" ,"5" ,"6" ,"7" ,"8" ,"9" );
		$fa_num = array("۰","۱","۲","۳","۴","۵","۶","۷","۸","۹");
		$string=number_format($string, 0, ',', ',');
		return str_replace($en_num, $fa_num, $string);
	}
	$cart_total=0;
?>
@extends('layouts.vendor-dashboard')
@section('title', '- پیگیری سفارش')
@section('content')
	@if (Session::has('error'))
		<div class="col-md-12 alert alert-danger well-sm" role="alert" style="margin-top:15px;">{{ Session::get('error') }}</div>
	@endif
	
	<div class="row">
		<div class="col-md-12 col-sm-12 hidden-xs">
			<br>
			<div class="x_panel tile">
				<div class="x_title">
					<h4>پیگیری سفارش</h4>
					<div class="clearfix"></div>
				</div>
				<div class="x_content">
					<form action="{{url('vendor/track_order')}}" method="get" class="add-rest-form form-inline">
						{{ csrf_field() }}
						<br>
						<div class="form-group {{ $errors->has('order_id') ? ' has-error' : '' }}">
							<input type="text" name="order_id" class="form-control" style="width:150px;" placeholder="کد رهگیری" required />
							@if ($errors->has('order_id'))
								<div class="auth-notifier">{{ $errors->first('order_id') }}</div>
							@endif	
						</div>
						<input type="submit" class="btn btn-sm btn-success vendor-filter" value="بگرد!" />
					</form>
				</div>
			</div>
		</div>
	</div>
	<div class="row">
		<div class="col-md-12 col-sm-12 hidden-xs">
			<br>
			<div class="x_panel tile">
				<div class="x_title">
					<h4>جزئیات سفارش</h4>
					<div class="clearfix"></div>
				</div>
				<div class="x_content">
					@if(!empty($order) and count($order)>0)
						مشخصات سفارش دهنده
						<table class="table table-hover" id="cart-table">
							<thead>
								<tr class="success">
									<th>نام و نام خانوادگی</th>
									<th>تلفن مشتری</th>
									<th>آدرس مشتری</th>
									<th>تحویل دهنده</th>
									<th>مبلغ سفارش</th>
									<th>نحوه پرداخت</th>
									<th>وضعیت</th>
								</tr>
							</thead>
							<tbody>
								<tr>
									<td>
										@if($order->customer_id==0)
											{{$order->customer_name}}<div style='color:red;'>مهمان</div>
										@else
											{{$order->customer_name}}
										@endif
									</td>
									<td>{{number2farsi2($order->customer_phone)}}</td>
									<td>{{$order->customer_address}}</td>
									<td>{{$order->vendor_name}}</td>
									<td>{{number2farsi($order->cart_total)}} ریال</td>
									@if($order->payment_method=="online")
										<td>آنلاین</td>
									@elseif($order->payment_method=="cash")
										<td>درب منزل</td>
									@endif
							
									@if($order->status==0)
										<td>ثبت اولیه</td>
									@elseif($order->status==1)
										<td>آماده ارسال</td>
									@elseif($order->status==2)
										<td>ارسال شده</td>
									@elseif($order->status==3)
										<td style="color:#2ecc71;">تحویل شده</td>
									@elseif($order->status==99)
										<td style="color:#e74c3c;">لغو شده</td>
									@endif
								</tr>
							</tbody>
						</table>
						فاکتور سفارش
						<table class="table table-hover" id="panel-table">
							<thead>
								<tr class="warning">
									<th>ردیف</th>
									<th>نام</th>
									<th>فی</th>
									<th>تعداد</th>
									<th>قیمت</th>
								</tr>
							</thead>
							<tbody>
								@php $counter=1; @endphp
								@foreach ($basket as $c)
									@php 
										$food_total_price=$c["price"]*$c["quantity"];
										$cart_total+=$food_total_price;
									@endphp
									<tr>
										<td>{{number2farsi2($counter)}}</td>
										<td>{{$c["name"]}}</td>
										<td>{{number2farsi($c["price"])}}   ریال</td>
										<td>{{number2farsi($c["quantity"])}}</td>
										<td>{{number2farsi($food_total_price)}}   ریال</td>
									</tr>
									@php $counter++; @endphp
								@endforeach
							</tbody>
						</table>
						@if($order->comment!=null)
							توضیحات اضافی<br>
							<h6><i class="icon-bell"></i>  {{$order->comment}}</h6>
						@endif
					@endif
				</div>
			</div>
		</div>
	</div>
@endsection
