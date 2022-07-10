<?php
	use Carbon\Carbon;
	if(url()->current()==url('vendor/orders/filter_date')){
		$start=to_j2($start);
		$end=to_j2($end);
	}else{
		$today=Carbon::now()->toDateString();
		$start=to_j2($today);
		$end=to_j2($today);
	}
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
	function to_j($date){
		$date=Carbon::parse($date);
		$year=$date->year;$month=$date->month;$day=$date->day;
		$date=\Morilog\Jalali\jDateTime::toJalali($year, $month, $day);
		$date=\Morilog\Jalali\jDateTime::convertNumbers($date);
		$date=$date[0]."/".$date[1]."/".$date[2];
		return $date;
	}
	function to_j2($date){
		$date=Carbon::parse($date);
		$year=$date->year;$month=$date->month;$day=$date->day;
		$date=\Morilog\Jalali\jDateTime::toJalali($year, $month, $day);
		return $date;
	}
	$cart_total=0;
?>

@extends('layouts.vendor-dashboard')
@section('title', '- داشبورد مدیریت- سفارشها')
@section('content')
	@if (Session::has('message'))
		<div class="col-md-12 alert alert-success well-sm" role="alert" style="margin-top:15px;">{{ Session::get('message') }}</div>
	@endif
	@if (Session::has('error'))
		<div class="col-md-12 alert alert-danger well-sm" role="alert" style="margin-top:15px;">{{ Session::get('error') }}</div>
	@endif
	<br>
	<div class="row">
		<div class="col-md-12 col-sm-12 col-xs-12">
			<div class="x_panel tile">
				<div class="x_title">
					<h4>آمار سفارشها در مدت تعیین شده</h4>
					<div class="clearfix"></div>
				</div>
				<div class="x_content">
					<div class="tile_count">
						<div class="col-md-4 col-sm-4 col-xs-12 tile_stats_count">
							<h4>تعداد</h4>
							<h5><u>{{number2farsi2($reports["orders"])}}</u> سفارش</h5>
						</div>
						<div class="col-md-4 col-sm-4 col-xs-12 tile_stats_count">
							<h4>درآمد (تحویل شده)</h4>
							<h5>{{number2farsi($reports["income"])}}  ریال</h5>
						</div>
					</div>
				</div>
			</div>
		</div>
	</div>
	<div class="row">
		<div class="col-md-12 col-sm-12 col-xs-12">	
			<div class="x_panel tile">
				<div class="x_title">
					<h4>جزئیات سفارشها در مدت تعیین شده</h4>
					<div class="clearfix"></div>
				</div>
				<div class="x_content">
					<div class="tile_count">
						<div class="col-md-2 col-sm-2 col-xs-6 tile_stats_count">
							<h4>کل</h4>
							<h5><u>{{number2farsi2($reports["orders"])}}</u> سفارش</h5>
						</div>
						<div class="col-md-2 col-sm-2 col-xs-6 tile_stats_count">
							<h4>ثبت اولیه</h4>
							<h5><u>{{number2farsi2($reports["orders_init"])}}</u> سفارش</h5>
						</div>
						<div class="col-md-2 col-sm-2 col-xs-6 tile_stats_count">
							<h4>آماده ارسال</h4>
							<h5><u>{{number2farsi2($reports["orders_ready"])}}</u> سفارش</h5>
						</div>
						<div class="col-md-2 col-sm-2 col-xs-6 tile_stats_count blue">
							<h4>ارسال شده</h4>
							<h5><u>{{number2farsi2($reports["orders_sent"])}}</u> سفارش</h5>
						</div>
						<div class="col-md-2 col-sm-2 col-xs-6 tile_stats_count green">
							<h4>تحویل شده</h4>
							<h5><u>{{number2farsi2($reports["orders_delivered"])}}</u> سفارش</h5>
						</div>
						<div class="col-md-2 col-sm-2 col-xs-6 tile_stats_count red">
							<h4>منقضی شده</h4>
							<h5><u>{{number2farsi2($reports["orders_expired"])}}</u> سفارش</h5>
						</div>
					</div>
				</div>
			</div>
		</div>
	</div>
	<div class="row">
		<div class="col-md-12 col-sm-12 col-xs-12">
			<div class="x_panel tile">
				<div class="x_title">
					<h4>لیست سفارشها</h4>
					<div class="clearfix"></div>
				</div>
				<div class="x_content">
					<form action="{{url('/vendor/orders/filter_date')}}" method="post" class="form-inline">
						{{ csrf_field() }}
						فیلتر سفارشها بر اساس تاریخ:  <br>	
						<div class="form-group">
							<label>شروع</label>
							<input type="number" name="start_day" style="width:70px;" maxlength="2" min="1" max="31" class="form-control" value="{{$start[2]}}"/>
							@if ($errors->has('start_day'))
								<div class="auth-notifier">{{ $errors->first('start_day') }}</div>
							@endif	
							<input type="number" name="start_month" style="width:70px;" maxlength="2" min="1"  max="12" class="form-control" value="{{$start[1]}}"/>
							@if ($errors->has('start_month'))
								<div class="auth-notifier">{{ $errors->first('start_month') }}</div>
							@endif	
							<input type="number" name="start_year" style="width:90px;" maxlength="4" min="1395"  max="1396" class="form-control" value="{{$start[0]}}"/>
							@if ($errors->has('start_year'))
								<div class="auth-notifier">{{ $errors->first('start_year') }}</div>
							@endif	
						</div>
						<div class="form-group">
							<label>پایان</label>
							<input type="number" name="end_day" style="width:70px;" maxlength="2" min="1" max="31" class="form-control" value="{{$end[2]}}"/>
							@if ($errors->has('end_day'))
								<div class="auth-notifier">{{ $errors->first('end_day') }}</div>
							@endif	
							<input type="number" name="end_month" style="width:70px;" maxlength="2" min="1"  max="12" class="form-control" value="{{$end[1]}}"/>
							@if ($errors->has('end_month'))
								<div class="auth-notifier">{{ $errors->first('end_month') }}</div>
							@endif	
							<input type="number" name="end_year" style="width:90px;" maxlength="4" min="1395"  max="1396" class="form-control" value="{{$end[0]}}"/>
							@if ($errors->has('end_year'))
								<div class="auth-notifier">{{ $errors->first('end_year') }}</div>
							@endif		
						</div>
						<input type="submit" class="btn btn-sm btn-success vendor-filter" value="فیلتر کن" />
					</form>
					<br>
					<ul class="nav nav-tabs" role="tablist" style="margin-bottom:10px;">
						<li role="presentation" class="active"><a data-toggle="tab" href="#list">نمایش لیست</a></li>
						<li role="presentation"><a data-toggle="tab" href="#details">نمایش جزئیات</a></li>
					</ul>
					<div class="tab-content">	
						<div id="list" class="tab-pane fade in active">
							@if(!empty($orders))				
								<table class="table table-hover" id="cart-table">
									<thead>
										<tr class="success">
											<th>ردیف</th>
											<th>تاریخ</th>
											<th>ساعت</th>
											<th>نام و نام خانوادگی</th>
											<th>تلفن مشتری</th>
											<th>آدرس مشتری</th>
											<th>مبلغ سفارش</th>
											<th>نحوه پرداخت</th>
											<th>وضعیت</th>
										</tr>
									</thead>	
									<tbody>	
										@php $i=1; @endphp
										@foreach($orders as $order)	
											<tr>
												<td>{{number2farsi2($i)}}</td>
												<td>{{to_j($order["order_date"])}}</td>
												<td>{{number2farsi2($order["order_time"])}}</td>
												<td>
													@if($order["customer_id"]==0)
														{{$order["customer_name"]}}<span style='color:red;'> مهمان</span>
													@else
														{{$order["customer_name"]}}
													@endif
												</td>
												<td>{{number2farsi2($order["customer_phone"])}}</td>
												<td>{{$order["customer_address"]}}</td>
												<td>{{number2farsi($order["cart_total"])}} ریال</td>
												@if($order["payment_method"]=="online")
													<td>آنلاین</td>
												@elseif($order["payment_method"]=="cash")
													<td>درب منزل</td>
												@endif
															
												@if($order["status"]==0)
													<td>ثبت اولیه</td>
												@elseif($order["status"]==1)
													<td>آماده ارسال</td>
												@elseif($order["status"]==2)
													<td>ارسال شده</td>
												@elseif($order["status"]==3)
													<td style="color:#2ecc71;">تحویل شده</td>
												@elseif($order["status"]==99)
													<td style="color:#e74c3c;">لغو شده</td>
												@endif
											</tr>
											@php $i++; @endphp
										@endforeach
									</tbody>	
								</table>
							@else
								<div class="alert alert-warning well-sm" role="alert" style="margin-top:15px;">در تاریخ تعیین شده هیچگونه سفارشی ثبت نشده است</div>
							@endif
						</div>
						<div id="details" class="tab-pane fade">
							@if(!empty($orders))
								@php $i=0; @endphp
								<div class="panel-group" id="accordion" role="tablist" aria-multiselectable="true">
									@foreach($orders as $order)						
										<div class="panel panel-info">
											<div class="panel-heading" role="tab" id="heading{{$i}}">
												<div class="panel-title">
													<a class="collapsed" role="button" data-toggle="collapse" data-parent="#accordion" href="#collapse{{$i}}" aria-expanded="false" aria-controls="collapse{{$i}}">
														<div style="font-size:12px;"><i style="font-size:15px;" class="icon-chevron-down"></i> {{"    ".$order["customer_name"]." - ".to_j($order["order_date"])." - ".number2farsi2($order["order_time"])}}</div>
													</a>
												</div>
											</div>
																
											<div id="collapse{{$i}}" class="panel-collapse collapse" role="tabpanel" aria-labelledby="heading{{$i}}">
												<div class="panel-body">
													مشخصات سفارش دهنده
													<table class="table table-hover" id="cart-table">
														<thead>
															<tr class="success">
																<th>نام و نام خانوادگی</th>
																<th>تلفن مشتری</th>
																<th>آدرس مشتری</th>
																<th>مبلغ سفارش</th>
																<th>نحوه پرداخت</th>
																<th>وضعیت</th>
																<th>عملیات</th>
															</tr>
														</thead>
														<tbody>
															<tr>
																<td>
																	@if($order["customer_id"]==0)
																		{{$order["customer_name"]}}<div style='color:red;'>مهمان</div>
																	@else
																		{{$order["customer_name"]}}
																	@endif
																</td>
																<td>{{number2farsi2($order["customer_phone"])}}</td>
																<td>{{$order["customer_address"]}}</td>
																<td>{{number2farsi($order["cart_total"])}} ریال</td>
																@if($order["payment_method"]=="online")
																	<td>آنلاین</td>
																@elseif($order["payment_method"]=="cash")
																	<td>درب منزل</td>
																@endif
																
																@if($order["status"]==0)
																	<td>ثبت اولیه</td>
																@elseif($order["status"]==1)
																	<td>آماده ارسال</td>
																@elseif($order["status"]==2)
																	<td>ارسال شده</td>
																@elseif($order["status"]==3)
																	<td style="color:#2ecc71;">تحویل شده</td>
																@elseif($order["status"]==99)
																	<td style="color:#e74c3c;">لغو شده</td>
																@endif
																<td>
																	@if($order["status"]==1)
																		<a href="{{url('vendor/orders/sent/'.$order['basket_id'])}}"><button class="btn btn-md btn-primary my-update"><i class="icon-ok"> </i>ارسال شد</button></a>
																	@elseif($order["status"]==2)
																		<a href="{{url('vendor/orders/delivered/'.$order['basket_id'])}}"><button class="btn btn-md btn-success my-update"><i class="icon-ok"> </i>تحویل شد</button></a>
																	@endif
																</td>
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
															@foreach ($baskets[$i] as $c)
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
													@if($order["order_comment"]!=null)
														توضیحات اضافی<br>
														<h6><i class="icon-bell"></i>  {{$order["order_comment"]}}</h6>
													@endif
												</div>
											</div>
										</div>
										@php $i++; @endphp
									@endforeach
								</div>
							@else
								<div class="alert alert-warning well-sm" role="alert" style="margin-top:15px;">در تاریخ تعیین شده هیچگونه سفارشی ثبت نشده است</div>
							@endif
						</div>
					</div>	
				</div>
			</div>
		</div>
	</div>
@endsection
