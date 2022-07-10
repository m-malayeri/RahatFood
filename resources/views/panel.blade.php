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
	use Carbon\Carbon;
	$today=Carbon::now()->toDateString();
?>

@extends('layouts.internal')
@section('title', '- پنل کاربری')

@section('seo')
	<meta name="description" content="پنل کاربری راحت فود">
@endsection

@section('content')
	<div class="col-md-12 hidden-xs">
		<ol class="breadcrumb">
			<li><a href="{{url('/home')}}"><i class="icon-home"></i></a></li>
			<li class="active">پنل کاربری</li>
		</ol>
	</div>
	<div class="col-md-12">
		<ul class="nav nav-tabs" role="tablist" style="margin-bottom:10px;">
			<li role="presentation" class="active">
				<a data-toggle="tab" href="#orders">
					<div class="hidden visible-xs"><i class="icon-list"></i></div>
					<div class="hidden-xs">سفارشها</div>
				</a>
			</li>
			<li role="presentation" class="hidden">
				<a data-toggle="tab" href="#scores">
					<div class="hidden visible-xs"><i class="icon-list"></i></div>
					<div class="hidden-xs">امتیازات</div>
				</a>
			</li>
			<li role="presentation">
				<a data-toggle="tab" href="#edit">
					<div class="hidden visible-xs"><i class="icon-edit"></i></div>
					<div class="hidden-xs">ویرایش اطلاعات</div>
				</a>
			</li>
		</ul>
		<div class="tab-content">	
			<div id="orders" class="tab-pane fade in active">
				@if (Session::has('message'))
					<div class="alert alert-success well-sm" role="alert">{{ Session::get('message') }}</div>
				@endif
				@if (Session::has('error'))
					<div class="col-md-12 alert alert-danger well-sm" role="alert">{{ Session::get('error') }}</div>
				@endif
				@if(count($orders)>0)
					@php $i=0; @endphp
					<div class="panel-group" id="accordion" role="tablist" aria-multiselectable="true">
						@foreach($orders as $order)
							@php 
								if($i==0) $first="in"; else $first=null;
								$cart_total=0;
								$date=Carbon::parse($order->order_date);
								$year="$date->year";
								$month="$date->month";
								$day="$date->day";
								$order_date=\Morilog\Jalali\jDateTime::toJalali($year, $month, $day);
								$order_date=\Morilog\Jalali\jDateTime::convertNumbers($order_date);
							@endphp
							<div class="panel panel-info">
								<div class="panel-heading" role="tab" id="heading{{$i}}">
									<div class="panel-title">
										<a class="collapsed" role="button" data-toggle="collapse" data-parent="#accordion" href="#collapse{{$i}}" aria-expanded="false" aria-controls="collapse{{$i}}">
											<div style="font-size:12px;"><i style="font-size:15px;" class="icon-chevron-down"></i>    سفارش در تاریخ  {{$order_date[0]."/".$order_date[1]."/".$order_date[2]}}</div>
										</a>
									</div>
								</div>
								<div id="collapse{{$i}}" class="panel-collapse collapse {{$first}}" role="tabpanel" aria-labelledby="heading{{$i}}">
									<div class="panel-body">
										@if($order->status==0 and $today==$order->order_date)
											<div class="col-md-12"><div class="alert alert-warning well-sm" role="alert">صورتحساب این فاکتور پرداخت نشده است، جهت ارسال سفارش، صورتحساب را پرداخت نمایید</div></div>
										@elseif($order->status==0 or $order->status==99)
											<div class="col-md-12"><div class="alert alert-danger well-sm" role="alert">کاربر گرامی، به علت عدم پرداخت صورتحساب در موعد مقرر، سفارش شما منقضی شده است</div></div>
										@endif
										<div class="col-md-5">
											<div class="col-md-12">
												<div class="col-md-1 col-sm-1 hidden-xs panel-pad-sign" style="color:#e74c3c;"><i class="icon-key icon-flip-horizontal"></i></div>
												<div class="col-md-11 col-sm-11 col-xs-12 panel-pad-data" style="color:#e74c3c;"><strong>کد رهگیری:</strong> {{number2farsi2($order->basket_id)}}</div>
											</div>	
											<div class="col-md-12">
												<div class="col-md-1 col-sm-1 hidden-xs panel-pad-sign"><i class="icon-info-sign"></i></div>
												@if($order->status==0)
													<div class="col-md-11 col-sm-11 col-xs-12 panel-pad-data">وضعیت سفارش: <span class="label my-label status">ثبت اولیه</span></div>
												@elseif($order->status==1)
													<div class="col-md-11 col-sm-11 col-xs-12 panel-pad-data">وضعیت سفارش: <span class="label my-label status">آماده ارسال</span></div>
												@elseif($order->status==2)
													<div class="col-md-11 col-sm-11 col-xs-12 panel-pad-data">وضعیت سفارش: <span class="label my-label status">ارسال شد</span></div>
												@elseif($order->status==3)
													<div class="col-md-11 col-sm-11 col-xs-12 panel-pad-data">وضعیت سفارش: <span class="label my-label status">تحویل شد</span></div>
												@elseif($order->status==99)
													<div class="col-md-11 col-sm-11 col-xs-12 panel-pad-data">وضعیت سفارش: <span class="label my-label expired">منقضی شده</span></div>
												@endif
											</div>
											<div class="col-md-12">
												<div class="col-md-1 col-sm-1 hidden-xs panel-pad-sign"><i class="icon-th-large"></i></div>
												@if($order->payment_method=="online")
													<div class="col-md-11 col-sm-11 col-xs-12 panel-pad-data">تسویه صورتحساب: <span class="label my-label online">آنلاین</span></div>
												@else
													<div class="col-md-11 col-sm-11 col-xs-12 panel-pad-data">تسویه صورتحساب: <span class="label my-label cash">درب منزل</span></div>
												@endif
											</div>															
											<div class="col-md-12">
												<div class="col-md-1 col-sm-1 hidden-xs panel-pad-sign"><i class="icon-food"></i></div>
												<div class="col-md-11 col-sm-11 col-xs-12 panel-pad-data">ارسال توسط: {{$restaurants[$i]->name}}</div>
											</div>
											<div class="col-md-12">
												<div class="col-md-1 col-sm-1 hidden-xs panel-pad-sign"><i class="icon-usd"></i></div>
												<div class="col-md-11 col-sm-11 col-xs-12 panel-pad-data">مبلغ قابل پرداخت: {{number2farsi($order->cart_total)}}  ریال</div>
											</div>
											<div class="col-md-12">
												<div class="col-md-1 col-sm-1 hidden-xs panel-pad-sign"><i class="icon-home"></i></div>
												<div class="col-md-11 col-sm-11 col-xs-12 panel-pad-data">{{$order->customer_address}}</div>
											</div>
											<div class="col-md-12">
												<div class="col-md-1 col-sm-1 hidden-xs panel-pad-sign"><i class="icon-phone icon-flip-horizontal"></i></div>
												<div class="col-md-11 col-sm-11 col-xs-12 panel-pad-data">{{number2farsi2($user->phone)}}</div>
											</div>
										</div>
										<div class="col-md-7">
											<table class="table table-hover" id="panel-table">
												<thead>
													<tr class="info">
														<th>نام</th>
														<th class="hidden-xs">فی</th>
														<th>تعداد</th>
														<th>قیمت</th>
													</tr>
												</thead>
												<tbody>
													@php $n=0; @endphp
													@foreach ($baskets[$i] as $c)
														@php 
															$product_total_price=$c["price"]*$c["quantity"];
															$n++; 
															$cart_total+=$product_total_price;
														@endphp
														<tr>
															<td>{{$c["name"]}}</td>
															<td class="hidden-xs">{{number2farsi($c["price"])}}   ریال</td>
															<td>{{number2farsi($c["quantity"])}}</td>
															<td>{{number2farsi($product_total_price)}}   ریال</td>
														</tr>
													@endforeach
												</tbody>
											</table>
											<div class="col-md-4 col-sm-6 c1 text-right hidden-xs"><h6>مبلغ نهایی + مالیات - تخفیف</h6></div>
											<div class="c1 text-right visible-xs col-xs-6"><h6>مبلغ نهایی</h6></div>
											<div class="col-md-8 col-sm-6 col-xs-6 c2 text-left" style="margin-bottom:10px;"><h6>{{number2farsi($order->cart_total)}} ریال</h6></div>
											@if($order->status==0 and $today==$order->order_date)
												<form action="{{url('payment')}}" method="post">
													{{ csrf_field() }}
													<input type="hidden" name="order_id" value="{{$order->basket_id}}">
													<input type="hidden" name="order_amount" value="{{$order->cart_total}}">
													<input type="submit" class="btn btn-sm btn-success my-checkout" value="پرداخت صورتحساب">
												</form>
											@endif
										</div>
									</div>
								</div>
							</div>
							@php $i++; @endphp
						@endforeach
					</div>
				@else
					<div class="alert alert-warning well-sm" role="alert">کاربر گرامی، تا کنون هیچ سفارشی ثبت نکرده اید.</div>
				@endif
			</div>
			<div id="edit" class="tab-pane fade">
				<div class="col-md-5">
					<form action="{{url('panel/update')}}" method="post" class="user-edit-form">
						{{ csrf_field() }}
						<div class="form-group {{ $errors->has('name') ? ' has-error' : '' }}">
							<label for="name">نام و نام خانوادگی</label>
							<input type="text" class="form-control input-lg" name="name" value="{{$user->name}}">
							@if ($errors->has('email'))
								<div class="auth-notifier">{{ $errors->first('email') }}</div>
							@endif	
						</div>
						<div class="form-group {{ $errors->has('phone') ? ' has-error' : '' }}">
							<label for="phone">شماره تلفن همراه</label>
							<input type="text" dir="ltr" class="form-control input-lg" name="phone" value="{{$user->phone}}">
							@if ($errors->has('phone'))
								<div class="auth-notifier">{{ $errors->first('phone') }}</div>
							@endif	
						</div>
						<div class="form-group {{ $errors->has('address') ? ' has-error' : '' }}">
							<label for="address">آدرس</label>
							<textarea class="form-control" name="address">{{$user->address}}</textarea>
							@if ($errors->has('address'))
								<div class="auth-notifier">{{ $errors->first('address') }}</div>
							@endif	
						</div>
						<input type="submit" class="btn btn-md btn-success my-checkout" value="بروزرسانی">
					</form>
				</div>
			</div>
			<div id="scores" class="tab-pane fade">
				امتیازات
			</div>
		</div>
	</div>		
@endsection